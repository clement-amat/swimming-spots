import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine, isMainModule } from '@angular/ssr/node';
import express from 'express';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';
import { SERVER_RESPONSE } from './app/shared/seo/server-response.token';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');

const app = express();
const commonEngine = new CommonEngine();

const codeToSlug = loadCodeToSlugMap();

function loadCodeToSlugMap(): Map<string, string> {
  try {
    const raw = readFileSync(join(browserDistFolder, 'geojson.json'), 'utf-8');
    const geo = JSON.parse(raw) as {
      features: Array<{ properties: { code: string; slug: string } }>;
    };
    const map = new Map<string, string>();
    for (const f of geo.features) {
      if (f.properties.code && f.properties.slug) {
        map.set(f.properties.code, f.properties.slug);
      }
    }
    return map;
  } catch {
    return new Map();
  }
}

app.get(/^\/spot\/([^/]+)(\/gallery)?\/?$/, (req, res, next) => {
  const param = req.params[0];
  const tail = req.params[1] || '';
  const slug = codeToSlug.get(param);
  if (slug && slug !== param) {
    return res.redirect(301, `/spot/${slug}${tail}`);
  }
  next();
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/**', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.get(
  '**',
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html'
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.get('**', (req, res, next) => {
  const { protocol, originalUrl, baseUrl, headers } = req;

  commonEngine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: `${protocol}://${headers.host}${originalUrl}`,
      publicPath: browserDistFolder,
      providers: [
        { provide: APP_BASE_HREF, useValue: baseUrl },
        { provide: SERVER_RESPONSE, useValue: res },
      ],
    })
    .then((html) => res.send(html))
    .catch((err) => next(err));
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export { app as reqHandler };

export default app;
