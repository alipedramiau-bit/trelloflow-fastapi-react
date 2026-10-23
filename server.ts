import express from 'express';
import { spawn, type ChildProcess } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const PYTHON_PORT = 6000;

// Spawn Python backend process
let pythonProc: ChildProcess | null = null;

function startPythonBackend() {
  const pythonScript = path.join(__dirname, 'main.py');
  console.log(`[FullStack] Spawning Python backend at ${pythonScript} on port ${PYTHON_PORT}...`);
  pythonProc = spawn('python3', [pythonScript, '--backend-port=6000', '--backend-only'], {
    stdio: 'inherit',
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
  });

  pythonProc.on('exit', (code, signal) => {
    console.log(`[FullStack] Python backend exited with code ${code}, signal ${signal}`);
  });
}

startPythonBackend();

// Graceful cleanup
function cleanup() {
  if (pythonProc) {
    try {
      pythonProc.kill('SIGTERM');
    } catch {
      // Ignore
    }
  }
}
process.on('SIGINT', () => { cleanup(); process.exit(0); });
process.on('SIGTERM', () => { cleanup(); process.exit(0); });
process.on('exit', cleanup);

// Forward all /api requests to Python backend
app.use('/api', (req, res) => {
  const options: http.RequestOptions = {
    hostname: '127.0.0.1',
    port: PYTHON_PORT,
    path: `/api${req.url}`,
    method: req.method,
    headers: {
      ...req.headers,
      host: `127.0.0.1:${PYTHON_PORT}`,
    },
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('[Proxy Error to Python]', err.message);
    if (!res.headersSent) {
      res.status(502).json({
        error: 'Python backend is initializing or unavailable',
        details: err.message
      });
    }
  });

  req.pipe(proxyReq);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Full-stack TrelloFlow running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
