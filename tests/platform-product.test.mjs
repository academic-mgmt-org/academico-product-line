import test from 'node:test';
import assert from 'node:assert/strict';
import { loadDomain, readYaml, resolveProduct } from '../scripts/lib/domain.mjs';

test('la plataforma completa integra servicios, portal y observabilidad', () => {
  const result = resolveProduct(
    readYaml('products/producto-plataforma-completa.yml'),
    loadDomain()
  );

  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.plan.assets.map((asset) => asset.name), [
    'database',
    'login',
    'gateway',
    'usuarios',
    'matriculas',
    'calificaciones',
    'notificaciones',
    'web',
    'quality_gates'
  ]);
  assert.ok(result.plan.compose_files.includes('compose.web.yaml'));
  assert.ok(result.plan.compose_files.includes('compose.quality-gates.yaml'));
  const checks = result.plan.assets.flatMap((asset) => asset.verification ?? []);
  assert.ok(checks.includes('browser_smoke'));
  assert.ok(checks.includes('metrics_available'));
});