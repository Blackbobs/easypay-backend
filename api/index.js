let app;

try {
  console.log('Attempting to load built server...');
  const module = await import('../dist/server.js');
  app = module.default;
  console.log('Successfully loaded built server');
} catch (error) {
  console.error('Failed to load built server:', error);
  console.error('Error details:', error.message);
  console.error('Error stack:', error.stack);
  
  // Fallback to a simple Express app with error details
  const express = (await import('express')).default;
  app = express();
  app.use(express.json());
  
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      message: 'Server is running (fallback mode)',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  });
  
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Welcome to EasePay API (fallback mode)',
      error: error.message
    });
  });
}

export default app;