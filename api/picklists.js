const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Get Salesforce access token using JWT Bearer Flow
async function getSalesforceToken(environment) {
    const isProduction = environment === 'production';
    
    const clientKey = process.env.CLIENT_KEY;
    const username = isProduction ? process.env.PRODUCTION_USERNAME : process.env.TEST_USERNAME;
    const tokenUrl = isProduction ? process.env.PRODUCTION_URL : process.env.TEST_URL;
    
    // Read private key
    const keyEnvVar = isProduction ? process.env.SF_JWT_PRIVATE_PRODUCTION_KEY : process.env.SF_JWT_PRIVATE_TEST_KEY;
    let privateKey;
    
    try {
        if (keyEnvVar.includes('-----BEGIN')) {
            privateKey = keyEnvVar.replace(/\\n/g, '\n').trim();
        } else {
            const keyPath = path.resolve(keyEnvVar);
            privateKey = fs.readFileSync(keyPath, 'utf8');
        }
    } catch (err) {
        throw new Error('Failed to read private key: ' + err.message);
    }

    // Create JWT
    const jwtPayload = {
        iss: clientKey,
        sub: username,
        aud: tokenUrl,
        exp: Math.floor(Date.now() / 1000) + (60 * 5) // 5 minutes
    };

    let token;
    try {
        token = jwt.sign(jwtPayload, privateKey, { algorithm: 'RS256' });
    } catch (err) {
        throw new Error('Failed to sign JWT: ' + err.message);
    }

    // Exchange JWT for access token
    const params = new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: token
    });

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Salesforce token error (${response.status}): ${errorText}`);
    }

    return await response.json();
}

// Fetch picklist values using UI API
async function getPicklistValues(accessToken, instanceUrl, apiVersion, objectApiName, fieldApiName) {
    const picklistUrl = `${instanceUrl}/services/data/v${apiVersion}/ui-api/object-info/${objectApiName}/picklist-values/012000000000000AAA/${fieldApiName}`;
    
    const response = await fetch(picklistUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Salesforce UI API error (${response.status}): ${errorText}`);
    }

    return await response.json();
}

module.exports = async (req, res) => {
    // Set CORS headers
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
        
        // Get Salesforce access token
        const tokenResponse = await getSalesforceToken(environment);
        const { access_token, instance_url } = tokenResponse;

        // Fetch Tipo_de_Negocio__c picklist values (desde Lead)
        const tipoNegocioData = await getPicklistValues(
            access_token,
            instance_url,
            apiVersion,
            'Lead',
            'Tipo_de_Negocio__c'
        );

        const values = (tipoNegocioData.values || []).map(v => ({
            label: v.label,
            value: v.value
        }));

        return res.status(200).json({ values });
        
    } catch (error) {
        console.error('Picklist fetch error:', error);
        return res.status(500).json({ 
            error: 'Failed to fetch picklists', 
            message: error.message 
        });
    }
};
