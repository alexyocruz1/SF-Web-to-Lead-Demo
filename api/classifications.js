const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

async function getSalesforceToken(environment) {
  const isProduction = environment === 'production';

  const clientKey = process.env.CLIENT_KEY;
  const username = isProduction ? process.env.PRODUCTION_USERNAME : process.env.TEST_USERNAME;
  const tokenUrl = isProduction ? process.env.PRODUCTION_URL : process.env.TEST_URL;

  if (!clientKey) {
    throw new Error('CLIENT_KEY must be set');
  }
  if (!username) {
    throw new Error(`${isProduction ? 'PRODUCTION_USERNAME' : 'TEST_USERNAME'} must be set`);
  }

  const keyEnvVar = isProduction ? process.env.SF_JWT_PRIVATE_PRODUCTION_KEY : process.env.SF_JWT_PRIVATE_TEST_KEY;
  if (!keyEnvVar) {
    throw new Error(`${isProduction ? 'SF_JWT_PRIVATE_PRODUCTION_KEY' : 'SF_JWT_PRIVATE_TEST_KEY'} must be set`);
  }

  let privateKey;
  try {
    if (keyEnvVar.includes('-----BEGIN')) {
      privateKey = keyEnvVar.replace(/\\n/g, '\n').trim();
    } else {
      const keyPath = path.resolve(keyEnvVar);
      privateKey = fs.readFileSync(keyPath, 'utf8').trim();
    }
  } catch (err) {
    throw new Error('Failed to read private key: ' + err.message);
  }

  const jwtPayload = {
    iss: clientKey,
    sub: username,
    aud: tokenUrl.includes('test.salesforce.com') ? 'https://test.salesforce.com' : 'https://login.salesforce.com',
    exp: Math.floor(Date.now() / 1000) + 60 * 5,
  };

  let assertion;
  try {
    assertion = jwt.sign(jwtPayload, privateKey, { algorithm: 'RS256' });
  } catch (err) {
    throw new Error('Failed to sign JWT: ' + err.message);
  }

  const params = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Salesforce token error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

async function querySalesforce(accessToken, instanceUrl, apiVersion, soql) {
  const url = `${instanceUrl}/services/data/v${apiVersion}/query?q=${encodeURIComponent(soql)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Salesforce query error (${res.status}): ${text}`);
  }

  const data = await res.json();
  return data.records || [];
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { environment = 'test' } = req.query;
    const apiVersion = process.env.SF_API_VERSION || '65.0';

    const tokenResponse = await getSalesforceToken(environment);
    const { access_token, instance_url } = tokenResponse;

    // Rubros con Tipo_de_Negocio__c
    const rubroRecords = await querySalesforce(
      access_token,
      instance_url,
      apiVersion,
      'SELECT Id, Name, Tipo_de_Negocio__c FROM Rubro__c'
    );

    // Subrubros con lookup a Rubro__c
    const subrubroRecords = await querySalesforce(
      access_token,
      instance_url,
      apiVersion,
      'SELECT Id, Name, Rubro__c FROM Subrubro__c'
    );

    // Divisiones (solo Id y Name)
    const divisionRecords = await querySalesforce(
      access_token,
      instance_url,
      apiVersion,
      'SELECT Id, Name FROM Division__c'
    );

    const rubros = rubroRecords.map(r => ({
      id: r.Id,
      name: r.Name,
      tipoDeNegocio: r.Tipo_de_Negocio__c || null,
    }));

    const subrubros = subrubroRecords.map(s => ({
      id: s.Id,
      name: s.Name,
      rubroId: s.Rubro__c || null,
    }));

    const divisiones = divisionRecords.map(d => ({
      id: d.Id,
      name: d.Name,
    }));

    return res.status(200).json({
      rubros,
      subrubros,
      divisiones,
    });
  } catch (error) {
    console.error('Classifications fetch error:', error);
    return res.status(500).json({
      error: 'Failed to fetch classifications',
      message: error.message,
    });
  }
};
