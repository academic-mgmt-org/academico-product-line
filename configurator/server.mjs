import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stringify } from 'yaml';
import { loadDomain, repositoryRoot, resolveProduct } from '../scripts/lib/domain.mjs';
import { materializeProduct } from '../scripts/lib/derive.mjs';

const publicRoot = fileURLToPath(new URL('./public/', import.meta.url));
const domain = loadDomain();
const port = Number(process.env.PORT ?? 4173);

export const server = http.createServer(async (request, response) => {
  try {
    if (request.method === 'GET' && request.url === '/api/catalog') {
      return json(response, 200, catalog(domain));
    }
    if (request.method === 'POST' && request.url === '/api/validate') {
      const product = await body(request);
      return json(response, 200, resolveProduct(product, domain));
    }
    if (request.method === 'POST' && request.url === '/api/derive') {
      const product = await body(request);
      const id = product?.product?.id;
      if (!id || !/^[a-z0-9][a-z0-9-]{2,62}$/.test(id)) {
        return json(response, 400, { errors: ['El identificador debe usar minúsculas, números y guiones.'] });
      }
      const result = resolveProduct(product, domain);
      if (result.errors.length > 0) return json(response, 422, result);

      const temporary = path.join(os.tmpdir(), `${id}-${Date.now()}.yml`);
      const destination = path.join(repositoryRoot, 'generated', id);
      fs.writeFileSync(temporary, stringify(product));
      try {
        materializeProduct(result.plan, temporary, destination);
      } finally {
        fs.rmSync(temporary, { force: true });
      }
      return json(response, 201, {
        errors: [],
        product: id,
        destination: path.relative(repositoryRoot, destination).replaceAll('\\', '/'),
        plan: result.plan
      });
    }
    if (request.method === 'GET') return staticFile(request, response);
    json(response, 404, { errors: ['Ruta no encontrada.'] });
  } catch (error) {
    json(response, 500, { errors: [error.message] });
  }
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(port, '127.0.0.1', () => {
    console.log(`Configurador disponible en http://127.0.0.1:${port}`);
  });
}

function catalog(source) {
  return {
    model: source.featureModel.model,
    features: source.featureModel.features,
    groups: source.featureModel.groups,
    constraints: source.featureModel.constraints,
    assets: source.coreAssets.assets,
    variationPoints: source.variationPoints
  };
}

function body(request) {
  return new Promise((resolve, reject) => {
    let raw = '';
    request.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) request.destroy(new Error('Solicitud demasiado grande.'));
    });
    request.on('end', () => {
      try { resolve(JSON.parse(raw)); } catch { reject(new Error('JSON inválido.')); }
    });
    request.on('error', reject);
  });
}

function json(response, status, payload) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

function staticFile(request, response) {
  const requested = request.url === '/' ? 'index.html' : request.url.slice(1);
  const clean = path.normalize(requested).replace(/^(\.\.[/\\])+/, '');
  const absolute = path.join(publicRoot, clean);
  if (!absolute.startsWith(publicRoot) || !fs.existsSync(absolute) || fs.statSync(absolute).isDirectory()) {
    return json(response, 404, { errors: ['Recurso no encontrado.'] });
  }
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
  response.writeHead(200, { 'content-type': `${types[path.extname(absolute)] ?? 'application/octet-stream'}; charset=utf-8` });
  fs.createReadStream(absolute).pipe(response);
}
