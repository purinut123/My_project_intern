const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

// Proxy all /api requests to backend
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:8000',
  changeOrigin: true,   
  logLevel: 'debug',  // Add this to see proxy logs
  onProxyReq: (proxyReq, req, res) => {
    console.log('Proxying:', req.method, req.url, '→', 'http://localhost:8000' + req.url);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
  } 
}));

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

app.listen(PORT, async () => {
  console.log(`Frontend server running at http://localhost:${PORT}`);
  const open = (await import('open')).default;  
  open(`http://localhost:${PORT}`);
});