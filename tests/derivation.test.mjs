import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadDomain, readYaml, repositoryRoot, resolveProduct } from '../scripts/lib/domain.mjs';
import { materializeProduct } from '../scripts/lib/derive.mjs';

test('materializa un producto independiente con solo los activos seleccionados', () => {
  const domain = loadDomain();
  const product = readYaml('products/producto-minimo.yml');
  const { plan, errors } = resolveProduct(product, domain);
  assert.deepEqual(errors, []);

  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'academico-product-'));
  try {
    materializeProduct(
      plan,
      path.join(repositoryRoot, 'products', 'producto-minimo.yml'),
      temporaryRoot
    );

    assert.ok(fs.existsSync(path.join(temporaryRoot, 'product-manifest.json')));
    assert.ok(fs.existsSync(path.join(temporaryRoot, 'compose.product.yaml')));
    assert.ok(fs.existsSync(path.join(temporaryRoot, 'scripts', 'start.ps1')));
    assert.ok(fs.existsSync(path.join(temporaryRoot, 'tests', 'verification-plan.json')));
    assert.ok(fs.existsSync(path.join(temporaryRoot, 'services', 'academico-login')));
    assert.ok(fs.existsSync(path.join(temporaryRoot, 'services', 'academico-gateway')));
    assert.equal(fs.existsSync(path.join(temporaryRoot, 'services', 'academico-usuarios')), false);
    assert.equal(fs.existsSync(path.join(temporaryRoot, 'services', 'academico-login', '.git')), false);
  } finally {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  }
});
