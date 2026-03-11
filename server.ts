import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Music Proxy Routes
app.get('/api/music/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) return res.status(400).json({ error: 'Query required' });
    
    // Try primary API (jiosaavn-api.vercel.app)
    try {
      const response = await fetch(`https://jiosaavn-api.vercel.app/search?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        return res.json(data);
      }
    } catch (e) {
      console.error('Primary API failed, trying backup...');
    }

    // Try backup API (saavn.dev)
    try {
      const response = await fetch(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        return res.json(data);
      }
    } catch (e) {
      console.error('Backup API failed');
    }

    res.status(500).json({ error: 'All APIs failed' });
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch music' });
  }
});

app.get('/api/music/songs/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: 'ID required' });

    // Try primary API (jiosaavn-api.vercel.app)
    try {
      const response = await fetch(`https://jiosaavn-api.vercel.app/song?id=${id}`);
      if (response.ok) {
        const data = await response.json();
        return res.json(data);
      }
    } catch (e) {
      console.error('Primary API failed, trying backup...');
    }

    // Try backup API (saavn.dev)
    try {
      const response = await fetch(`https://saavn.dev/api/songs/${id}`);
      if (response.ok) {
        const data = await response.json();
        return res.json(data);
      }
    } catch (e) {
      console.error('Backup API failed');
    }

    res.status(500).json({ error: 'All APIs failed' });
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch song details' });
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

// Web Proxy Route
app.get('/api/proxy', async (req, res) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).send('URL is required');
  }

  try {
    let finalUrl = targetUrl;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = 'https://' + finalUrl;
    }

    const response = await axios.get(finalUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      validateStatus: () => true,
      maxRedirects: 5,
    });

    const contentType = response.headers['content-type'] || '';
    res.set('Content-Type', contentType);

    const headersToOmit = [
      'x-frame-options',
      'content-security-policy',
      'strict-transport-security',
      'transfer-encoding',
      'content-encoding',
      'access-control-allow-origin'
    ];

    for (const [key, value] of Object.entries(response.headers)) {
      if (!headersToOmit.includes(key.toLowerCase())) {
        res.setHeader(key, value as string);
      }
    }
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (contentType.includes('text/html')) {
      const html = response.data.toString('utf-8');
      const $ = cheerio.load(html);

      const rewriteUrl = (url: string) => {
        if (!url) return url;
        if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('javascript:') || url.startsWith('#')) {
          return url;
        }
        try {
          const absoluteUrl = new URL(url, finalUrl).href;
          return `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
        } catch (e) {
          return url;
        }
      };

      $('[href]').each((_, el) => {
        $(el).attr('href', rewriteUrl($(el).attr('href')!));
      });
      $('[src]').each((_, el) => {
        $(el).attr('src', rewriteUrl($(el).attr('src')!));
      });
      $('[action]').each((_, el) => {
        $(el).attr('action', rewriteUrl($(el).attr('action')!));
      });

      $('head').prepend(`<base href="/api/proxy?url=${encodeURIComponent(finalUrl)}/" />`);

      res.send($.html());
    } else {
      res.send(response.data);
    }
  } catch (error: any) {
    res.status(500).send(`Proxy Error: ${error.message}`);
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  console.log(`Starting server in ${isProd ? 'production' : 'development'} mode...`);

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static('dist'));
    // Catch-all for SPA in production
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
