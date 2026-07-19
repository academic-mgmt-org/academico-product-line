import test from 'node:test';
import assert from 'node:assert/strict';
import { loadDomain, readYaml, resolveProduct, validateDomain } from '../scripts/lib/domain.mjs';

const domain = loadDomain();

test('los artefactos de dominio son coherentes', () => {
  assert.deepEqual(validateDomain(domain), []);
});

test('el producto minimo selecciona solo los activos obligatorios', () => {
  const result = resolveProduct(readYaml('products/producto-minimo.yml'), domain);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.plan.assets.map((asset) => asset.name), ['database', 'login', 'gateway']);
  assert.ok(!result.plan.compose_files.includes('compose.usuarios.yaml'));
});

test('el producto de usuarios incorpora el activo y la trazabilidad de usuarios', () => {
  const result = resolveProduct(readYaml('products/producto-usuarios.yml'), domain);
  assert.deepEqual(result.errors, []);
  assert.ok(result.plan.assets.some((asset) => asset.name === 'usuarios'));
  assert.ok(result.plan.compose_files.includes('compose.usuarios.yaml'));
  assert.ok(result.plan.traceability.some((mapping) => mapping.feature === 'usuarios'));
});

test('matriculas requiere usuarios', () => {
  const product = readYaml('products/producto-minimo.yml');
  product.features.matriculas = true;
  const result = resolveProduct(product, domain);
  assert.ok(result.errors.some((error) => error.includes("requiere 'usuarios'")));
});

test('un grupo XOR rechaza selecciones multiples', () => {
  const product = readYaml('products/producto-minimo.yml');
  product.variants = { deployment_target: ['docker_compose', 'kubernetes'] };
  const result = resolveProduct(product, domain);
  assert.ok(result.errors.some((error) => error.includes("grupo XOR 'deployment_target'")));
});
