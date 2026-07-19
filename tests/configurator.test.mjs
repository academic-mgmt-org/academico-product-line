import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { server } from '../configurator/server.mjs';
import { repositoryRoot } from '../scripts/lib/domain.mjs';

let baseUrl;

before(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(path.join(repositoryRoot, 'generated', 'api-test-product'), { recursive: true, force: true });
});

test('el configurador expone el modelo como catálogo', async () => {
  const response = await fetch(`${baseUrl}/api/catalog`);
  const catalog = await response.json();
  assert.equal(response.status, 200);
  assert.equal(catalog.model.root, 'academic_management');
  assert.ok(catalog.assets.login);
  assert.ok(catalog.constraints.some((rule) => rule.type === 'requires'));
});

test('el configurador valida y deriva mediante el motor común', async () => {
  const product = {
    product: { id: 'api-test-product', name: 'API Test Product', description: 'Prueba' },
    features: { database: true, login: true, gateway: true },
    variants: { deployment_target: 'docker_compose', quality_platform: 'local_quality_gates' }
  };
  const validation = await post('/api/validate', product);
  assert.equal(validation.response.status, 200);
  assert.deepEqual(validation.data.errors, []);

  const derivation = await post('/api/derive', product);
  assert.equal(derivation.response.status, 201);
  assert.equal(derivation.data.destination, 'generated/api-test-product');
  assert.equal(fs.existsSync(path.join(repositoryRoot, derivation.data.destination, 'product-manifest.json')), true);
});

async function post(route, payload) {
  const response = await fetch(`${baseUrl}${route}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return { response, data: await response.json() };
}
