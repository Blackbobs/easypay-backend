// api/index.js - Simple handler
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load environment variables first
import('dotenv/config').catch(() => {});

let app;

try {
  // Try to load the built app
  const module = require('../dist/server.js');
  app = module.default || module;
} catch (error) {
  console.error('Failed to load built app:', error);
  // Fallback: create a simple app
  const express = require('express');
  app = express();
  app.get('*', (req, res) => {
    res.json({ 
      message: 'App is building...', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  });
}

export default app;