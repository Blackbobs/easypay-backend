// Use dynamic import for ES modules
let app;

try {
  // Dynamically import the ES module
  const module = await import('../dist/server.js');
  app = module.default;
} catch (error) {
  console.error('Failed to load server:', error);
  // Fallback to a simple Express app
  const express = (await import('express')).default;
  app = express();
  app.use(express.json());
  
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      message: 'Server is running (fallback mode)',
      timestamp: new Date().toISOString()
    });
  });
  
  app.get('/', (req, res) => {
    res.json({ message: 'Welcome to EasePay API (fallback mode)' });
  });
}

export default app;