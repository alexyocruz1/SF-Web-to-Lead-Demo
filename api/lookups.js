const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

async function getSalesforceToken(environment) {
  const isProduction = environment === 'production';
  const clientKey = isProduction ? process.env.CLIENT_KEY_PROD : process.env.CLIENT_KEY;
  const username = isProduction ? process.env.PRODUCTION_USERNAME : process.env.TEST_USERNAME;
  const tokenUrl = isProduction ? process.env.PRODUCTION_URL : process.env.TEST_URL;
  const keyEnvVar = isProduction ? process.env.SF_JWT_PRIVATE_PRODUCTION_KEY : process.env.SF_JWT_PRIVATE_TEST_KEY;
  if (!clientKey) throw new Error(`${isProduction ? 'CLIENT_KEY_PROD' : 'CLIENT_KEY'} must be set`);
  if (!username) throw new Error(`${isProduction ? 'PRODUCTION_USERNAME' : 'TEST_USERNAME'} must be set`);
  if (!keyEnvVar) throw new Error(`${isProduction ? 'SF_JWT_PRIVATE_PRODUCTION_KEY' : 'SF_JWT_PRIVATE_TEST_KEY'} must be set`);
  let privateKey;
  if (keyEnvVar.includes('-----BEGIN')) privateKey = keyEnvVar.replace(/\\n/g, '\n').trim();
  else privateKey = fs.readFileSync(path.resolve(keyEnvVar), 'utf8').trim();
  const jwtPayload = { iss: clientKey, sub: username, aud: tokenUrl.includes('test.salesforce.com') ? 'https://test.salesforce.com' : 'https://login.salesforce.com', exp: Math.floor(Date.now() / 1000) + 300, sc: 'api' };
  const assertion = jwt.sign(jwtPayload, privateKey, { algorithm: 'RS256' });
  const params = new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion });
  const response = await fetch(tokenUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString() });
  if (!response.ok) throw new Error(`Salesforce token error (${response.status}): ${await response.text()}`);
  return await response.json();
}

async function querySalesforce(accessToken, instanceUrl, apiVersion, soql) {
  const url = `${instanceUrl}/services/data/v${apiVersion}/query?q=${encodeURIComponent(soql)}`;
  const res = await fetch(url, { method: 'GET', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' } });
  if (!res.ok) throw new Error(`Salesforce query error (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.records || [];
}

async function getPicklistValues(accessToken, instanceUrl, apiVersion, objectApiName, fieldApiName) {
  const picklistUrl = `${instanceUrl}/services/data/v${apiVersion}/ui-api/object-info/${objectApiName}/picklist-values/012000000000000AAA/${fieldApiName}`;
  const response = await fetch(picklistUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error(`Salesforce UI API error (${response.status}): ${await response.text()}`);
  return await response.json();
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { environment = 'test' } = req.query;
    const apiVersion = process.env.SF_API_VERSION || '65.0';
    const { access_token, instance_url } = await getSalesforceToken(environment);
    const kind = req.query?.kind || 'picklists';

    if (kind === 'classifications') {
      const rubroRecords = await querySalesforce(access_token, instance_url, apiVersion, 'SELECT Id, Name, Tipo_de_Negocio__c FROM Rubro__c');
      const subrubroRecords = await querySalesforce(access_token, instance_url, apiVersion, 'SELECT Id, Name, Rubro__c FROM Subrubro__c');
      const divisionRecords = await querySalesforce(access_token, instance_url, apiVersion, 'SELECT Id, Name FROM Division__c');
      const sucursalRecords = await querySalesforce(access_token, instance_url, apiVersion, 'SELECT Id, Name, Codigo_Sucursal__c, Division__c FROM Sucursal__c');
      return res.status(200).json({
        rubros: rubroRecords.map(r => ({ id: r.Id, name: r.Name, tipoDeNegocio: r.Tipo_de_Negocio__c || null })),
        subrubros: subrubroRecords.map(s => ({ id: s.Id, name: s.Name, rubroId: s.Rubro__c || null })),
        divisiones: divisionRecords.map(d => ({ id: d.Id, name: d.Name })),
        sucursales: sucursalRecords.map(s => ({ id: s.Id, name: s.Name, codigo: s.Codigo_Sucursal__c || null, divisionId: s.Division__c || null })),
      });
    }

    const tipoNegocioData = await getPicklistValues(access_token, instance_url, apiVersion, 'Lead', 'Tipo_de_Negocio__c');
    return res.status(200).json({
      values: (tipoNegocioData.values || []).map(v => ({ label: v.label, value: v.value })),
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch lookups', message: error.message });
  }
};
