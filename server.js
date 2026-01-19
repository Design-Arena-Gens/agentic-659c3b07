const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'YouTube Faceless Video Generator' });
});

// Main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start n8n in the background
let n8nProcess;

function startN8n() {
  console.log('Starting n8n...');

  n8nProcess = spawn('npx', ['n8n', 'start'], {
    env: {
      ...process.env,
      N8N_PORT: '5678',
      N8N_PROTOCOL: 'http',
      N8N_HOST: '0.0.0.0',
      WEBHOOK_URL: `https://agentic-659c3b07.vercel.app`,
      N8N_EDITOR_BASE_URL: `https://agentic-659c3b07.vercel.app`,
      N8N_BASIC_AUTH_ACTIVE: 'false',
      N8N_DIAGNOSTICS_ENABLED: 'false',
      N8N_PERSONALIZATION_ENABLED: 'false'
    },
    stdio: 'inherit'
  });

  n8nProcess.on('error', (err) => {
    console.error('Failed to start n8n:', err);
  });

  n8nProcess.on('exit', (code) => {
    console.log(`n8n exited with code ${code}`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  if (n8nProcess) {
    n8nProcess.kill();
  }
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  startN8n();
});
