const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

function getTokenUrl(environment) {
  if (process.env.SALESFORCE_TOKEN_URL) return process.env.SALESFORCE_TOKEN_URL;
  const useProd = environment === 'production' || process.env.USE_PRODUCTION === 'true' || process.env.USE_PRODUCTION === '1';
  const url = useProd ? process.env.PRODUCTION_URL : process.env.TEST_URL;
  if (!url) throw new Error('Set TEST_URL and PRODUCTION_URL (or SALESFORCE_TOKEN_URL) in env');
  return url;
}

async function getSalesforceToken(environment) {
  const useProd = environment === 'production' || process.env.USE_PRODUCTION === 'true' || process.env.USE_PRODUCTION === '1';
  const clientId = useProd ? process.env.CLIENT_KEY_PROD : process.env.CLIENT_KEY;
  const tokenUrl = getTokenUrl(environment);
  const username = useProd ? process.env.PRODUCTION_USERNAME : process.env.TEST_USERNAME;
  const privateKeyOrPath = useProd ? process.env.SF_JWT_PRIVATE_PRODUCTION_KEY : process.env.SF_JWT_PRIVATE_TEST_KEY;
  if (!clientId) throw new Error(`${useProd ? 'CLIENT_KEY_PROD' : 'CLIENT_KEY'} must be set in env`);
  if (!username) throw new Error(`${useProd ? 'PRODUCTION_USERNAME' : 'TEST_USERNAME'} must be set in env`);
  if (!privateKeyOrPath) throw new Error(`${useProd ? 'SF_JWT_PRIVATE_PRODUCTION_KEY' : 'SF_JWT_PRIVATE_TEST_KEY'} must be set in env`);

  let privateKey;
  if (privateKeyOrPath.includes('BEGIN PRIVATE KEY') || privateKeyOrPath.includes('BEGIN RSA PRIVATE KEY')) {
    privateKey = privateKeyOrPath.replace(/\\n/g, '\n').trim();
  } else {
    const keyPath = path.isAbsolute(privateKeyOrPath) ? privateKeyOrPath : path.join(process.cwd(), privateKeyOrPath);
    privateKey = fs.readFileSync(keyPath, 'utf8').trim();
  }

  const assertion = jwt.sign({
    iss: clientId,
    sub: username,
    aud: tokenUrl.includes('test.salesforce.com') ? 'https://test.salesforce.com' : 'https://login.salesforce.com',
    exp: Math.floor(Date.now() / 1000) + 300,
    sc: 'api',
  }, privateKey, { algorithm: 'RS256' });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }).toString(),
  });
  if (!res.ok) throw new Error(`Salesforce token error (${res.status}): ${await res.text()}`);
  return await res.json();
}

function getSuggestedEndpoints(options) {
  const environment = options?.environment || 'test';
  const kind = options?.kind || 'product';
  const useProd = environment === 'production' || process.env.USE_PRODUCTION === 'true' || process.env.USE_PRODUCTION === '1';
  const instance = useProd ? process.env.PRODUCTION_INSTANCE : process.env.TEST_INSTANCE;
  const apiVersion = process.env.SF_API_VERSION || '65.0';
  const localEndpoint = kind === 'inventario'
    ? `/api/inventarios?environment=${environment}`
    : `/api/products?environment=${environment}`;
  if (!instance) return { create: localEndpoint, update: localEndpoint, localEndpoint };
  return {
    create: `https://${instance}/services/data/v${apiVersion}/sobjects/${kind === 'inventario' ? 'Inventario__c' : 'Product2'}`,
    updateExternalId: `https://${instance}/services/data/v${apiVersion}/sobjects/${kind === 'inventario' ? 'Inventario__c' : 'Product2'}/External_ID__c/{External_ID__c}`,
    updateSalesforceId: `https://${instance}/services/data/v${apiVersion}/sobjects/${kind === 'inventario' ? 'Inventario__c' : 'Product2'}/{Id}`,
    localEndpoint,
  };
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const environment = req.query?.environment || 'test';
    return res.status(200).json({ environment, endpoints: getSuggestedEndpoints({ ...req.query, environment }) });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { endpoint, body, environment, method = 'POST' } = req.body || {};
    if (!endpoint || typeof endpoint !== 'string') return res.status(400).json({ error: 'endpoint is required' });

    const isSalesforce = /salesforce\.com|force\.com/i.test(endpoint);
    let actualEndpoint = endpoint;
    const headers = { 'Content-Type': 'application/json' };

    if (isSalesforce) {
      const tokenData = await getSalesforceToken(environment || 'test');
      headers.Authorization = `Bearer ${tokenData.access_token}`;
      const match = endpoint.match(/(\/services\/data\/.+)$/);
      if (match) actualEndpoint = tokenData.instance_url + match[1];
    }

    const proxyRes = await fetch(actualEndpoint, {
      method,
      headers,
      body: method === 'GET' ? undefined : JSON.stringify(body || {}),
    });

    const text = await proxyRes.text();
    const json = text ? JSON.parse(text) : {};
    if (!proxyRes.ok) {
      return res.status(proxyRes.status).json({ error: json.message || json[0]?.message || text, details: json });
    }
    return res.status(200).json(json);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
