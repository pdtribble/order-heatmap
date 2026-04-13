import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, '..')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const port = process.env.PORT || 3737;
app.listen(port, () => {
  console.log(`🌎 Order Heatmap running at http://localhost:${port}`);
  console.log('📊 Client-side processing enabled (zero API invocations)');
});
