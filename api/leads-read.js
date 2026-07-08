const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const MAX_SOQL_LIMIT = 200;
const MAX_IDS_PER_QUERY = 200;
const DEFAULT_BY_IDS_FIELDS =
  'Id, Name, Company, Email, Status, LeadSource, CreatedDate';

function getTokenUrl(environment) {
  if (process.env.SALESFORCE_TOKEN_URL) return process.env.SALESFORCE_TOKEN_URL;

  const useProd =
    environment === 'production' ||
    process.env.USE_PRODUCTION === 'true' ||
    process.env.USE_PRODUCTION === '1';

  const url = useProd ? process.env.PRODUCTION_URL : process.env.TEST_URL;
  if (!url) {
    throw new Error('Set TEST_URL and PRODUCTION_URL (or SALESFORCE_TOKEN_URL) in env');
  }
  return url;
}

function getApiVersion() {
  return process.env.SF_API_VERSION || '65.0';
}

function getInstanceHost(environment) {
  const useProd =
    environment === 'production' ||
    process.env.USE_PRODUCTION === 'true' ||
    process.env.USE_PRODUCTION === '1';

  return useProd ? process.env.PRODUCTION_INSTANCE : process.env.TEST_INSTANCE;
}

async function getSalesforceToken(environment) {
  const useProd =
    environment === 'production' ||
    process.env.USE_PRODUCTION === 'true' ||
    process.env.USE_PRODUCTION === '1';
  const clientId = useProd ? process.env.CLIENT_KEY_PROD : process.env.CLIENT_KEY;
  const tokenUrl = getTokenUrl(environment);
  const username = useProd ? process.env.PRODUCTION_USERNAME : process.env.TEST_USERNAME;
  let privateKeyOrPath = useProd
    ? process.env.SF_JWT_PRIVATE_PRODUCTION_KEY
    : process.env.SF_JWT_PRIVATE_TEST_KEY;

  if (!clientId) throw new Error(`${useProd ? 'CLIENT_KEY_PROD' : 'CLIENT_KEY'} must be set in env`);
  if (!privateKeyOrPath) {
    throw new Error(
      `${useProd ? 'SF_JWT_PRIVATE_PRODUCTION_KEY' : 'SF_JWT_PRIVATE_TEST_KEY'} must be set in env`
    );
  }
  if (!username) {
    throw new Error(`${useProd ? 'PRODUCTION_USERNAME' : 'TEST_USERNAME'} must be set in env`);
  }

  let privateKey;
  if (privateKeyOrPath.includes('BEGIN PRIVATE KEY') || privateKeyOrPath.includes('BEGIN RSA PRIVATE KEY')) {
    privateKey = privateKeyOrPath.replace(/\\n/g, '\n').trim();
  } else {
    const keyPath = path.isAbsolute(privateKeyOrPath)
      ? privateKeyOrPath
      : path.join(process.cwd(), privateKeyOrPath);
    privateKey = fs.readFileSync(keyPath, 'utf8').trim();
  }

  const audience = tokenUrl.includes('test.salesforce.com')
    ? 'https://test.salesforce.com'
    : 'https://login.salesforce.com';

  const claims = {
    iss: clientId,
    sub: username,
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 5 * 60,
    sc: 'api',
  };

  const assertion = jwt.sign(claims, privateKey, { algorithm: 'RS256' });

  const params = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Salesforce token error (${res.status}): ${text}`);
  }

  const data = await res.json();
  if (!data.access_token || !data.instance_url) {
    throw new Error('Invalid token response from Salesforce');
  }

  return {
    access_token: data.access_token,
    instance_url: data.instance_url,
  };
}

function isValidLeadId(id) {
  if (!id || typeof id !== 'string') return false;
  const trimmed = id.trim();
  return /^00Q[a-zA-Z0-9]{12,15}$/.test(trimmed);
}

function validateSoql(soql) {
  if (!soql || typeof soql !== 'string') {
    throw new Error('soql is required');
  }

  const normalized = soql.trim();
  const upper = normalized.toUpperCase();

  if (!/^\s*SELECT\s+/i.test(normalized)) {
    throw new Error('SOQL must start with SELECT');
  }
  if (!/\bFROM\s+LEAD\b/i.test(normalized)) {
    throw new Error('SOQL must query FROM Lead');
  }
  if (/[;]|--|\/\*|\b(DELETE|UPDATE|INSERT|UPSERT|MERGE)\b/i.test(normalized)) {
    throw new Error('SOQL contains disallowed keywords or characters');
  }

  if (!/\bLIMIT\s+\d+/i.test(normalized)) {
    return `${normalized} LIMIT ${MAX_SOQL_LIMIT}`;
  }

  const limitMatch = normalized.match(/\bLIMIT\s+(\d+)\b/i);
  if (limitMatch && parseInt(limitMatch[1], 10) > MAX_SOQL_LIMIT) {
    throw new Error(`SOQL LIMIT cannot exceed ${MAX_SOQL_LIMIT}`);
  }

  return normalized;
}

function buildByIdsSoql(leadIds) {
  if (!Array.isArray(leadIds) || !leadIds.length) {
    throw new Error('leadIds must be a non-empty array');
  }
  if (leadIds.length > MAX_IDS_PER_QUERY) {
    throw new Error(`Maximum ${MAX_IDS_PER_QUERY} lead IDs per request`);
  }

  const ids = leadIds.map((id) => {
    const trimmed = String(id).trim();
    if (!isValidLeadId(trimmed)) {
      throw new Error(`Invalid Lead Id: ${trimmed}`);
    }
    return `'${trimmed}'`;
  });

  return `SELECT ${DEFAULT_BY_IDS_FIELDS} FROM Lead WHERE Id IN (${ids.join(',')})`;
}

function getSuggestedEndpoint(environment, mode, options = {}) {
  const host = getInstanceHost(environment);
  const apiVersion = getApiVersion();
  if (!host) return null;

  const base = `https://${host}/services/data/v${apiVersion}`;

  if (mode === 'byId') {
    const leadId = options.leadId || '00Qxxxxxxxxxxxxxxx';
    return `${base}/sobjects/Lead/${leadId}`;
  }

  const defaultSoql =
    mode === 'byIds'
      ? buildByIdsSoql(['00Qxxxxxxxxxxxxxxx', '00Qyyyyyyyyyyyyyyy'])
      : "SELECT Id, Name, Company, Email, Status, LeadSource, CreatedDate FROM Lead WHERE LeadSource = 'OLGA' ORDER BY CreatedDate DESC LIMIT 20";

  return `${base}/query?q=${encodeURIComponent(defaultSoql)}`;
}

function buildReadUrl(instanceUrl, apiVersion, mode, body) {
  const base = `${instanceUrl}/services/data/v${apiVersion}`;

  if (mode === 'byId') {
    const leadId = String(body.leadId || '').trim();
    if (!isValidLeadId(leadId)) {
      throw new Error('leadId must be a valid Salesforce Lead Id (00Q...)');
    }
    return `${base}/sobjects/Lead/${leadId}`;
  }

  let soql;
  if (mode === 'byIds') {
    soql = buildByIdsSoql(body.leadIds);
  } else if (mode === 'query') {
    soql = validateSoql(body.soql);
  } else {
    throw new Error('mode must be byId, query, or byIds');
  }

  return `${base}/query?q=${encodeURIComponent(soql)}`;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const environment = req.query?.environment || 'test';
    const mode = req.query?.mode || 'query';

    return res.status(200).json({
      suggestedEndpoint: getSuggestedEndpoint(environment, mode, {
        leadId: req.query?.leadId,
      }),
      apiVersion: getApiVersion(),
      environment,
      mode,
      maxSoqlLimit: MAX_SOQL_LIMIT,
      maxIdsPerQuery: MAX_IDS_PER_QUERY,
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { environment = 'test', mode, leadId, soql, leadIds } = req.body || {};
    if (!mode) {
      return res.status(400).json({ error: 'mode is required (byId, query, or byIds)' });
    }

    const tokenData = await getSalesforceToken(environment);
    const apiVersion = getApiVersion();
    const readUrl = buildReadUrl(tokenData.instance_url, apiVersion, mode, {
      leadId,
      soql,
      leadIds,
    });

    const sfRes = await fetch(readUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    const text = await sfRes.text();
    let json = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      json = { raw: text };
    }

    if (!sfRes.ok) {
      return res.status(sfRes.status).json({
        error: json.message || json[0]?.message || text || 'Salesforce read failed',
        details: json,
        requestUrl: readUrl,
      });
    }

    return res.status(200).json({
      mode,
      requestUrl: readUrl,
      data: json,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
