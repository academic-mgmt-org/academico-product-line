import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { loadDomain, readYaml, repositoryRoot, resolveProduct, validateDomain } from './lib/domain.mjs';
import { materializeProduct } from './lib/derive.mjs';

const [productArgument, action = 'plan'] = process.argv.slice(2);
if (!productArgument || !['plan', 'derive', 'up', 'down'].includes(action)) {
  console.error('Uso: node scripts/generate-product.mjs <producto.yml> [plan|derive|up|down]');
  process.exit(2);
}

const domain = loadDomain();
const domainErrors = validateDomain(domain);
if (domainErrors.length > 0) fail(domainErrors);

const productSource = path.resolve(productArgument);
const relativeProductPath = path.relative(repositoryRoot, productSource);
const product = readYaml(relativeProductPath);
const resolution = resolveProduct(product, domain);
if (resolution.errors.length > 0) fail(resolution.errors);

const plan = {
  ...resolution.plan,
  source: relativeProductPath.replaceAll('\\', '/'),
  generated_at: new Date().toISOString()
};
const productId = plan.product?.id;
if (!productId) fail(['La definicion no contiene product.id.']);

for (const composeFile of plan.compose_files) {
  if (!fs.existsSync(path.join(repositoryRoot, composeFile))) fail([`No existe '${composeFile}'.`]);
}

const generatedDirectory = path.join(repositoryRoot, 'generated', productId);
fs.mkdirSync(generatedDirectory, { recursive: true });
fs.writeFileSync(path.join(generatedDirectory, 'selection.json'), `${JSON.stringify(plan, null, 2)}\n`);
printPlan(plan);

const composeArguments = ['compose', '-p', productId, ...plan.compose_files.flatMap((file) => ['-f', file])];
run('docker', [...composeArguments, 'config', '--quiet'], repositoryRoot);

if (action === 'derive' || action === 'up') {
  for (const asset of plan.assets) acquire(asset);
  materializeProduct(plan, productSource, generatedDirectory);
  console.log(`Producto derivado: generated/${productId}`);
}

if (action === 'up') {
  const derivedCompose = ['compose', ...[...plan.compose_files, 'compose.product.yaml'].flatMap((file) => ['-f', file])];
  run('docker', [...derivedCompose, 'up', '--build', '-d'], generatedDirectory);
} else if (action === 'down') {
  if (!fs.existsSync(path.join(generatedDirectory, 'compose.product.yaml'))) {
    fail([`El producto '${productId}' no ha sido derivado. Ejecute la accion derive o up.`]);
  }
  const derivedCompose = ['compose', ...[...plan.compose_files, 'compose.product.yaml'].flatMap((file) => ['-f', file])];
  run('docker', [...derivedCompose, 'down'], generatedDirectory);
} else if (action === 'plan') {
  console.log(`Plan: generated/${productId}/selection.json`);
}

function acquire(asset) {
  const target = path.join(repositoryRoot, asset.local_path);
  if (fs.existsSync(path.join(target, '.git'))) {
    run('git', ['-C', target, 'pull', '--ff-only'], repositoryRoot);
    return;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  run('git', ['clone', '--branch', asset.revision, '--single-branch', asset.repository, target], repositoryRoot);
}

function printPlan(currentPlan) {
  console.log(`Producto: ${currentPlan.product.id}`);
  console.log(`Features: ${currentPlan.selected_features.join(', ')}`);
  console.log(`Variantes: ${Object.entries(currentPlan.selected_variants).map(([key, values]) => `${key}=${values.join('+') || 'ninguna'}`).join(', ')}`);
  console.log(`Activos: ${currentPlan.assets.map((asset) => asset.name).join(', ')}`);
  console.log(`Compose: ${currentPlan.compose_files.join(' + ')}`);
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function fail(errors) {
  console.error('Configuracion invalida:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
