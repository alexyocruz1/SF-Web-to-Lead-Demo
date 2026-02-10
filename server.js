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
const apiHandler = require('./api/leads');

// Proxy the API endpoint
app.all('/api/leads', async (req, res) => {
  // Convert Express req/res to Vercel-style handler
  const vercelReq = {
    method: req.method,
    body: req.body,
    query: req.query,
  };
  
  let statusCode = 200;
  const vercelRes = {
    status: (code) => {
      statusCode = code;
      return vercelRes;
    },
    json: (data) => {
      res.status(statusCode).json(data);
    },
  };

  try {
    await apiHandler(vercelReq, vercelRes);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Serve index.html for all routes (SPA-style)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/leads`);
});
