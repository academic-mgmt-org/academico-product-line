import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { loadDomain, readYaml, repositoryRoot, resolveProduct, validateDomain } from './lib/domain.mjs';

const [productArgument, action = 'plan'] = process.argv.slice(2);
if (!productArgument || !['plan', 'up', 'down'].includes(action)) {
  console.error('Uso: node scripts/generate-product.mjs <producto.yml> [plan|up|down]');
  process.exit(2);
}

const domain = loadDomain();
const domainErrors = validateDomain(domain);
if (domainErrors.length > 0) fail(domainErrors);

const relativeProductPath = path.relative(repositoryRoot, path.resolve(productArgument));
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

console.log(`Producto: ${productId}`);
console.log(`Features: ${plan.selected_features.join(', ')}`);
console.log(`Variantes: ${Object.entries(plan.selected_variants).map(([key, values]) => `${key}=${values.join('+') || 'ninguna'}`).join(', ')}`);
console.log(`Activos: ${plan.assets.map((asset) => asset.name).join(', ')}`);
console.log(`Compose: ${plan.compose_files.join(' + ')}`);

const composeArguments = plan.compose_files.flatMap((file) => ['-f', file]);
run('docker', ['compose', ...composeArguments, 'config', '--quiet']);

if (action === 'up') {
  for (const asset of plan.assets) acquire(asset);
  run('docker', ['compose', ...composeArguments, 'up', '--build', '-d']);
} else if (action === 'down') {
  run('docker', ['compose', ...composeArguments, 'down']);
} else {
  console.log(`Plan: generated/${productId}/selection.json`);
}

function acquire(asset) {
  const target = path.join(repositoryRoot, asset.local_path);
  if (fs.existsSync(path.join(target, '.git'))) {
    run('git', ['-C', target, 'pull', '--ff-only']);
    return;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  run('git', ['clone', '--branch', asset.revision, '--single-branch', asset.repository, target]);
}

function run(command, args) {
  const result = spawnSync(command, args, { cwd: repositoryRoot, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function fail(errors) {
  console.error('Configuracion invalida:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
