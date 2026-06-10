/**
 * Local development server for testing API endpoints
 * Run: node server.js
 * Requires: npm install express dotenv
 */

const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Import the API handler logic
const leadsHandler = require('./api/leads');
const picklistsHandler = require('./api/picklists');
const classificationsHandler = require('./api/classifications');
const usersHandler = require('./api/users');
const leadsReadHandler = require('./api/leads-read');
const rubrosHandler = require('./api/rubros');
const subrubrosHandler = require('./api/subrubros');
const divisionsHandler = require('./api/divisions');
const sucursalesHandler = require('./api/sucursales');
const productsHandler = require('./api/products');

// Helper function to convert Express req/res to Vercel-style handler
function createVercelAdapter(handler) {
  return async (req, res) => {
    const vercelReq = {
      method: req.method,
      body: req.body,
      query: req.query,
    };
    
    let statusCode = 200;
    let headers = {};
    
    const vercelRes = {
      status: (code) => {
        statusCode = code;
        return vercelRes;
      },
      setHeader: (key, value) => {
        headers[key] = value;
        return vercelRes;
      },
      json: (data) => {
        Object.entries(headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
        res.status(statusCode).json(data);
      },
      end: () => {
        Object.entries(headers).forEach(([key, value]) => {
          res.setHeader(key, value);
        });
        res.status(statusCode).end();
      }
    };

    try {
      await handler(vercelReq, vercelRes);
    } catch (err) {
      console.error('API error:', err);
      res.status(500).json({ error: err.message });
    }
  };
}

// Proxy the API endpoints
app.all('/api/leads', createVercelAdapter(leadsHandler));
app.all('/api/picklists', createVercelAdapter(picklistsHandler));
app.all('/api/classifications', createVercelAdapter(classificationsHandler));
app.all('/api/users', createVercelAdapter(usersHandler));
app.all('/api/leads-read', createVercelAdapter(leadsReadHandler));
app.all('/api/rubros', createVercelAdapter(rubrosHandler));
app.all('/api/subrubros', createVercelAdapter(subrubrosHandler));
app.all('/api/divisions', createVercelAdapter(divisionsHandler));
app.all('/api/sucursales', createVercelAdapter(sucursalesHandler));
app.all('/api/products', createVercelAdapter(productsHandler));

// Serve index.html for all routes (SPA-style)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  - http://localhost:${PORT}/api/leads`);
  console.log(`  - http://localhost:${PORT}/api/picklists`);
  console.log(`  - http://localhost:${PORT}/api/classifications`);
  console.log(`  - http://localhost:${PORT}/api/users`);
  console.log(`  - http://localhost:${PORT}/api/leads-read`);
  console.log(`  - http://localhost:${PORT}/api/rubros`);
  console.log(`  - http://localhost:${PORT}/api/subrubros`);
  console.log(`  - http://localhost:${PORT}/api/divisions`);
  console.log(`  - http://localhost:${PORT}/api/sucursales`);
  console.log(`  - http://localhost:${PORT}/api/products`);
});
