import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('el chart implementa resiliencia, escalado y configuración segura', () => {
  const workloads = fs.readFileSync('k8s/chart/academico-product/templates/workloads.yaml', 'utf8');
  const values = fs.readFileSync('k8s/chart/academico-product/values.yaml', 'utf8');

  assert.match(workloads, /type: RollingUpdate/);
  assert.match(workloads, /readinessProbe:/);
  assert.match(workloads, /livenessProbe:/);
  assert.match(workloads, /kind: HorizontalPodAutoscaler/);
  assert.match(workloads, /kind: PodDisruptionBudget/);
  assert.match(values, /minReplicas: 2/);
  assert.match(values, /maxReplicas: 10/);
  assert.match(values, /name: solicitudes/);
  assert.match(values, /requests:/);
  assert.match(values, /limits:/);
});

test('la plataforma declara IaC, SLO, DORA y promoción de ambientes', () => {
  for (const file of [
    'infrastructure/terraform/main.tf',
    'infrastructure/terraform/.terraform.lock.hcl',
    'observability/slo.yml',
    'observability/dora-metrics.yml',
    '.github/workflows/deploy.yml'
  ]) assert.equal(fs.existsSync(file), true, `${file} debe existir`);

  const deploy = fs.readFileSync('.github/workflows/deploy.yml', 'utf8');
  assert.match(deploy, /environment: staging/);
  assert.match(deploy, /environment: production/);
  assert.match(deploy, /--atomic --wait/);
});
