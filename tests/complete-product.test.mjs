import test from 'node:test';
import assert from 'node:assert/strict';
import { loadDomain, readYaml, resolveProduct } from '../scripts/lib/domain.mjs';

test('la variante completa selecciona los ocho activos de backend', () => {
  const result = resolveProduct(
    readYaml('products/producto-academico-completo.yml'),
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
    'solicitudes',
  ]);
  assert.ok(result.plan.compose_files.includes('compose.matriculas.yaml'));
  assert.ok(result.plan.compose_files.includes('compose.calificaciones.yaml'));
  assert.ok(result.plan.compose_files.includes('compose.notificaciones.yaml'));
  assert.ok(result.plan.compose_files.includes('compose.solicitudes.yaml'));
  assert.deepEqual(result.plan.selected_variants.notification_channel, ['email', 'in_app']);
});
