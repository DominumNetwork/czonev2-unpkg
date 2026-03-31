import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// GA4 Proxy Route
app.get('/api/analytics/data', async (req, res) => {
  console.log('Received request for /api/analytics/data');
  try {
    const propertyId = '527976762'; // From the URL
    if (!process.env.GA4_SERVICE_ACCOUNT_JSON) {
        console.error('GA4 credentials not configured');
        return res.status(500).json({ error: 'GA4 credentials not configured' });
    }
    const analyticsDataClient = new BetaAnalyticsDataClient({
        credentials: JSON.parse(process.env.GA4_SERVICE_ACCOUNT_JSON)
    });

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }],
      dimensions: [{ name: 'date' }],
    });

    res.json(response);
  } catch (error) {
    console.error('GA4 error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Music Proxy Routes
const MONOCHROME_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Referer': 'https://monochrome.tf/',
  'Origin': 'https://monochrome.tf',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

app.get('/api/music/monochrome/search', async (req, res) => {
  try {
    const query = req.query.s as string;
    if (!query) return res.status(400).json({ error: 'Query required' });
    
    console.log(`Monochrome search for: ${query}`);

    const monochromeMirrors = [
      `https://api.monochrome.tf/search?s=${encodeURIComponent(query)}`,
      `https://monochrome.tf/api/search?s=${encodeURIComponent(query)}`
    ];

    let lastError = null;

    for (const url of monochromeMirrors) {
      let retries = 2;
      while (retries > 0) {
        try {
          console.log(`Trying Monochrome mirror (Retries left: ${retries}): ${url}`);
          const response = await axios.get(url, { 
            headers: MONOCHROME_HEADERS,
            timeout: 8000,
            validateStatus: (status) => status < 500
          });

          const contentType = response.headers['content-type'] || '';
          if (response.status === 200 && contentType.includes('application/json')) {
            console.log('Monochrome search success');
            return res.json(response.data);
          }
          
          console.warn(`Monochrome mirror ${url} returned status ${response.status} with content-type ${contentType}`);
          break; // Don't retry if it's not a 5xx error
        } catch (e: any) {
          lastError = e;
          console.error(`Monochrome mirror attempt failed: ${url}. Error: ${e.message}`);
          retries--;
          if (retries > 0) await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
        }
      }
    }

    // SILENT FALLBACK TO SAAVN IF MONOCHROME FAILS
    console.warn('All Monochrome mirrors failed, falling back to Saavn mirrors...');
    const saavnMirrors = [
      `https://jiosaavn-api.vercel.app/search?query=${encodeURIComponent(query)}`,
      `https://jiosaavn-api-v3.vercel.app/search?query=${encodeURIComponent(query)}`,
      `https://jiosaavn-api-beta.vercel.app/search?query=${encodeURIComponent(query)}`,
      `https://saavn.me/api/search/songs?query=${encodeURIComponent(query)}`,
      `https://music-api-v2.vercel.app/search?query=${encodeURIComponent(query)}`
    ];

    for (const url of saavnMirrors) {
      try {
        console.log(`Trying Saavn fallback mirror: ${url}`);
        const response = await axios.get(url, { timeout: 5000 });
        if (response.data) {
          console.log(`Success with Saavn fallback: ${url}`);
          // Transform Saavn response to a format the client can understand if needed, 
          // but the client already has logic for both. 
          // Actually, let's just return it and let the client handle it.
          return res.json(response.data);
        }
      } catch (e: any) {
        console.error(`Saavn fallback failed: ${url}. Error: ${e.message}`);
      }
    }

    res.status(503).json({ 
      error: 'All music search APIs failed', 
      details: lastError?.message || 'Service Unavailable' 
    });
  } catch (error) {
    console.error('Music search proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch music' });
  }
});

app.get('/api/music/monochrome/track/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const quality = req.query.quality || 'HIGH';
    
    const monochromeTrackMirrors = [
      `https://api.monochrome.tf/track?id=${id}&quality=${quality}`,
      `https://monochrome.tf/api/track?id=${id}&quality=${quality}`
    ];

    for (const url of monochromeTrackMirrors) {
      let retries = 2;
      while (retries > 0) {
        try {
          console.log(`Trying Monochrome track mirror (Retries left: ${retries}): ${url}`);
          const response = await axios.get(url, { 
            headers: MONOCHROME_HEADERS,
            timeout: 8000,
            validateStatus: (status) => status < 500
          });
          
          const contentType = response.headers['content-type'] || '';
          if (response.status === 200 && contentType.includes('application/json')) {
            return res.json(response.data);
          }
          
          console.warn(`Monochrome track mirror ${url} returned status ${response.status} with content-type ${contentType}`);
          break;
        } catch (e: any) {
          console.error(`Monochrome track mirror attempt failed: ${url}. Error: ${e.message}`);
          retries--;
          if (retries > 0) await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // If it's a Saavn ID (numeric or alphanumeric from Saavn), we might need a different endpoint
    // but the client usually knows which one to call. 
    // For now, let's try a Saavn fallback for track details too.
    const saavnTrackMirrors = [
      `https://jiosaavn-api.vercel.app/song?id=${id}`,
      `https://saavn.me/api/songs/${id}`
    ];

    for (const url of saavnTrackMirrors) {
      try {
        const response = await axios.get(url, { timeout: 5000 });
        if (response.data) return res.json(response.data);
      } catch (e) {
        // ignore
      }
    }

    res.status(503).json({ error: 'Failed to fetch track details from all sources' });
  } catch (error) {
    console.error('Track proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch track details' });
  }
});

// Session configuration for iframe compatibility
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    sameSite: 'none',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));


// Web Proxy Route removed


async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  console.log(`Starting server in ${isProd ? 'production' : 'development'} mode...`);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static('dist'));
    // Catch-all for SPA in production
    app.get('*all', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
