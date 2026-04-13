import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import { parse } from 'csv-parse/sync';
import XLSX from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// ── Load zip lookup
let ZIP_DB = {};

async function loadZipDB() {
  try {
    const data = await fs.readFile(path.join(__dirname, '..', 'zips.json'), 'utf-8');
    ZIP_DB = JSON.parse(data);
  } catch (err) {
    console.error('Failed to load zip database:', err.message);
  }
}

// ── Column detection
const ZIP_KEYWORDS = ['zip', 'postal', 'post code', 'postcode'];
const CITY_KEYWORDS = ['city', 'town'];
const STATE_KEYWORDS = ['state', 'province'];

function findCol(headers, keywords, hardDefault = null) {
  const lower = headers.map(h => String(h).toLowerCase());
  for (const kw of keywords) {
    for (let i = 0; i < lower.length; i++) {
      if (lower[i].includes(kw)) return i;
    }
  }
  return hardDefault !== null ? hardDefault : -1;
}

function cleanZip(raw) {
  const digits = String(raw).replace(/\D/g, '').slice(0, 5);
  return digits.length > 0 ? digits.padStart(5, '0') : null;
}

function geocodeZip(z) {
  const entry = ZIP_DB[z];
  if (entry) {
    return [entry[0], entry[1], `${entry[2]}, ${entry[3]} ${z}`];
  }
  return [null, null, null];
}

function geocodeCityState(city, state) {
  const cityL = city.trim().toLowerCase();
  const stateU = state.trim().toUpperCase().slice(0, 2);

  for (const [z, entry] of Object.entries(ZIP_DB)) {
    if (entry[3] === stateU && entry[2].toLowerCase() === cityL) {
      return [entry[0], entry[1], `${entry[2]}, ${entry[3]}`];
    }
  }
  return [null, null, null];
}

// ── Parse file
function parseFile(data, filename) {
  const ext = path.extname(filename).toLowerCase();
  let rows = [];

  if (ext === '.xlsx' || ext === '.xls') {
    const wb = XLSX.read(data);
    const ws = wb.Sheets[wb.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  } else if (ext === '.csv') {
    const text = data.toString('utf-8');
    rows = parse(text, { skip_empty_lines: true });
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }

  if (rows.length < 2) {
    return {
      points: [],
      meta: {
        total: 0,
        geocoded: 0,
        skipped: 0,
        zipCol: null,
        cityCol: null,
        stateCol: null,
      },
    };
  }

  const headers = rows[0].map(h => String(h || ''));
  const zipCol = findCol(headers, ZIP_KEYWORDS, 16);
  const cityCol = findCol(headers, CITY_KEYWORDS, 14);
  const stateCol = findCol(headers, STATE_KEYWORDS, 15);

  const points = [];
  let skipped = 0;

  for (const row of rows.slice(1)) {
    let lat, lng, label;

    // Try zip code first
    if (zipCol >= 0 && zipCol < row.length) {
      const z = cleanZip(row[zipCol]);
      if (z && z !== '00000') {
        [lat, lng, label] = geocodeZip(z);
      }
    }

    // Fallback to city + state
    if (lat === undefined && cityCol >= 0 && stateCol >= 0 && cityCol < row.length && stateCol < row.length) {
      [lat, lng, label] = geocodeCityState(row[cityCol], row[stateCol]);
    }

    if (lat !== null && lat !== undefined) {
      points.push([lat, lng, 1, label]);
    } else {
      skipped++;
    }
  }

  return {
    points,
    meta: {
      total: rows.length - 1,
      geocoded: points.length,
      skipped,
      zipCol: zipCol >= 0 && zipCol < headers.length ? headers[zipCol] : null,
      cityCol: cityCol >= 0 && cityCol < headers.length ? headers[cityCol] : null,
      stateCol: stateCol >= 0 && stateCol < headers.length ? headers[stateCol] : null,
    },
  };
}

// ── Routes
app.use(express.static(path.join(__dirname, '..')));

app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const result = parseFile(req.file.buffer, req.file.originalname);
    res.json(result);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Parse error' });
  }
});

// ── Start server
(async () => {
  await loadZipDB();
  const port = process.env.PORT || 3737;
  app.listen(port, () => {
    console.log(`🌎 Geospatial Order Heatmap running at http://localhost:${port}`);
  });
})();
