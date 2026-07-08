const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

function getTokenUrl(environment) {
  if (process.env.SALESFORCE_TOKEN_URL) return process.env.SALESFORCE_TOKEN_URL;

  const useProd =
    environment === "production" ||
    process.env.USE_PRODUCTION === "true" ||
    process.env.USE_PRODUCTION === "1";

  const url = useProd ? process.env.PRODUCTION_URL : process.env.TEST_URL;
  if (!url) {
    throw new Error("Set TEST_URL and PRODUCTION_URL (or SALESFORCE_TOKEN_URL) in env");
  }
  return url;
}

function getSuggestedLeadUrl(environment, mode = 'single') {
  const useProd =
    environment === "production" ||
    process.env.USE_PRODUCTION === "true" ||
    process.env.USE_PRODUCTION === "1";

  const instance = useProd
    ? process.env.PRODUCTION_INSTANCE
    : process.env.TEST_INSTANCE;

  if (!instance) return null;

  const apiVersion = process.env.SF_API_VERSION;
  if (!apiVersion) {
    throw new Error("SF_API_VERSION must be set");
  }

  // Single mode: /sobjects/Lead
  // Bulk mode: /composite/sobjects (SObject Collections - up to 200 leads)
  const endpoint = mode === 'bulk' 
    ? `/services/data/v${apiVersion}/composite/sobjects`
    : `/services/data/v${apiVersion}/sobjects/Lead`;

  return `https://${instance}${endpoint}`;
}

async function getSalesforceToken(environment) {
  const clientId = (environment === 'production' || process.env.USE_PRODUCTION === "true" || process.env.USE_PRODUCTION === "1") ? process.env.CLIENT_KEY_PROD : process.env.CLIENT_KEY;
  const tokenUrl = getTokenUrl(environment);
  
  const useProd = environment === 'production' || process.env.USE_PRODUCTION === "true" || process.env.USE_PRODUCTION === "1";
  const username = useProd ? process.env.PRODUCTION_USERNAME : process.env.TEST_USERNAME;
  let privateKeyOrPath = useProd ? process.env.SF_JWT_PRIVATE_PRODUCTION_KEY : process.env.SF_JWT_PRIVATE_TEST_KEY;

  if (!clientId) {
    throw new Error(`${useProd ? 'CLIENT_KEY_PROD' : 'CLIENT_KEY'} must be set in env`);
  }
  if (!privateKeyOrPath) {
    throw new Error(`${useProd ? 'SF_JWT_PRIVATE_PRODUCTION_KEY' : 'SF_JWT_PRIVATE_TEST_KEY'} (private key or path) must be set in env`);
  }
  if (!username) {
    throw new Error(`${useProd ? 'PRODUCTION_USERNAME' : 'TEST_USERNAME'} must be set in env`);
  }

  let privateKey;
  if (privateKeyOrPath.includes('BEGIN PRIVATE KEY') || privateKeyOrPath.includes('BEGIN RSA PRIVATE KEY')) {
    privateKey = privateKeyOrPath.replace(/\\n/g, '\n').trim();
  } else {
    try {
      const keyPath = path.isAbsolute(privateKeyOrPath) 
        ? privateKeyOrPath 
        : path.join(process.cwd(), privateKeyOrPath);
      
      console.log(`[DEBUG] Reading private key from file: ${keyPath}`);
      privateKey = fs.readFileSync(keyPath, 'utf8').trim();
    } catch (err) {
      throw new Error(`Failed to read private key file: ${err.message}`);
    }
  }

  console.log(`[DEBUG] Getting Salesforce token using JWT Bearer Flow for ${environment}`);
  console.log(`[DEBUG] Token URL: ${tokenUrl}`);
  console.log(`[DEBUG] Username: ${username}`);
  console.log(`[DEBUG] Private key starts with: ${privateKey.substring(0, 30)}...`);
  console.log(`[DEBUG] Private key ends with: ...${privateKey.substring(privateKey.length - 30)}`);
  console.log(`[DEBUG] Private key length: ${privateKey.length} characters`);

  const audience = tokenUrl.includes('test.salesforce.com') ? 'https://test.salesforce.com' : 'https://login.salesforce.com';

  const claims = {
    iss: clientId,
    sub: username,
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + (5 * 60),
    sc: 'api',
  };

  console.log(`[DEBUG] JWT Audience: ${audience}`);

  let assertion;
  try {
    assertion = jwt.sign(claims, privateKey, { algorithm: 'RS256' });
    console.log(`[DEBUG] JWT signed successfully`);
  } catch (err) {
    console.error(`[DEBUG] JWT signing error details:`, err.message);
    console.error(`[DEBUG] Key preview (first 100 chars):`, privateKey.substring(0, 100));
    throw new Error(`Failed to sign JWT: ${err.message}. Check that the private key is complete and in PEM format.`);
  }

  const params = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: assertion,
  });

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Salesforce token error (${res.status}): ${text}`);
  }

  const data = await res.json();
  console.log(`[DEBUG] Token obtained successfully via JWT Bearer Flow`);
  console.log(`[DEBUG] Instance URL from Salesforce:`, data.instance_url);

  if (!data.access_token || !data.instance_url) {
    throw new Error("Invalid token response from Salesforce");
  }

  return {
    access_token: data.access_token,
    instance_url: data.instance_url,
  };
}

module.exports = async function handler(req, res) {
  if (req.method === "GET") {
    const environment = req.query?.environment || "test";
    const mode = req.query?.mode || "single";

    if (req.query.diagnose === "versions") {
      try {
        const tokenData = await getSalesforceToken(environment);
        const versionsRes = await fetch(
          `${tokenData.instance_url}/services/data/`,
          { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
        );

        const text = await versionsRes.text();
        return res.status(versionsRes.status).json(
          versionsRes.ok ? JSON.parse(text) : { error: text }
        );
      } catch (e) {
        return res.status(500).json({ error: e.message });
      }
    }

    return res.status(200).json({
      suggestedLeadUrl: getSuggestedLeadUrl(environment, mode),
      tokenUrl: getTokenUrl(environment),
      apiVersion: process.env.SF_API_VERSION,
      environment,
      mode,
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { endpoint, body, environment } = req.body || {};
    if (!endpoint || typeof endpoint !== "string") {
      return res.status(400).json({ error: "endpoint is required" });
    }

    const isSalesforce =
      /salesforce\.com|force\.com/i.test(endpoint);

    let headers = { "Content-Type": "application/json" };
    let actualEndpoint = endpoint;

    if (isSalesforce) {
      const tokenData = await getSalesforceToken(environment || "test");
      headers.Authorization = `Bearer ${tokenData.access_token}`;

      if (endpoint.includes("/services/data/")) {
        const path = endpoint.match(/(\/services\/data\/.+)$/);
        if (path) {
          actualEndpoint = tokenData.instance_url + path[1];
        }
      }
    }

    const proxyRes = await fetch(actualEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body || {}),
    });

    const text = await proxyRes.text();
    const json = text ? JSON.parse(text) : {};

    if (!proxyRes.ok) {
      return res.status(proxyRes.status).json({
        error: json.message || json[0]?.message || text,
        details: json,
      });
    }

    return res.status(200).json(json);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};