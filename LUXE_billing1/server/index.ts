import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import authRoutes from './routes/auth.ts';
import productRoutes from './routes/products.ts';
import customerRoutes from './routes/customers.ts';
import billRoutes from './routes/bills.ts';
import settingsRoutes from './routes/settings.ts';
import reportRoutes from './routes/reports.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(cors());
  app.use(morgan('dev'));
  app.use(express.json());

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/bills', billRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/reports', reportRoutes);

  if (!isProd) {
    // Create Vite server in middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    // Use vite's connect instance as middleware
    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;

      try {
        // Read index.html
        let template = await vite.transformIndexHtml(url, `
          <!doctype html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Industrial POS</title>
            </head>
            <body>
              <div id="root"></div>
              <script type="module" src="/src/main.tsx"></script>
            </body>
          </html>
        `);

        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    // Serve static files from the React app
    const distPath = path.join(__dirname, '../dist');
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (${isProd ? 'PRODUCTION' : 'DEVELOPMENT'})`);
  });
}

startServer().catch(console.error);
