import fs from 'node:fs';
import path from 'node:path';
import { repositoryRoot } from './domain.mjs';

const ignoredNames = new Set(['.git', 'node_modules', 'coverage', 'dist']);

export function materializeProduct(plan, productSource, destination) {
  fs.rmSync(destination, { recursive: true, force: true });
  fs.mkdirSync(path.join(destination, 'services'), { recursive: true });
  fs.mkdirSync(path.join(destination, 'tests'), { recursive: true });
  fs.mkdirSync(path.join(destination, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(destination, '.github', 'workflows'), { recursive: true });

  for (const asset of plan.assets) {
    const source = path.join(repositoryRoot, asset.local_path);
    const target = path.join(destination, asset.local_path);
    if (!fs.existsSync(source)) throw new Error(`El activo '${asset.name}' no fue adquirido en '${asset.local_path}'.`);
    fs.cpSync(source, target, { recursive: true, filter: copyFilter });
  }

  for (const composeFile of plan.compose_files) {
    fs.copyFileSync(path.join(repositoryRoot, composeFile), path.join(destination, composeFile));
  }
  fs.cpSync(path.join(repositoryRoot, 'docker'), path.join(destination, 'docker'), { recursive: true, filter: copyFilter });
  copyDirectoryIfPresent('k8s', destination);
  copyDirectoryIfPresent('infrastructure', destination);
  copyDirectoryIfPresent('observability', destination);
  copyIfPresent('.env.example', destination);

  fs.copyFileSync(productSource, path.join(destination, 'product.yml'));
  fs.writeFileSync(path.join(destination, 'product-manifest.json'), `${JSON.stringify(plan, null, 2)}\n`);
  fs.writeFileSync(path.join(destination, '.gitignore'), '.env\nnode_modules/\ncoverage/\n');
  fs.writeFileSync(path.join(destination, 'compose.product.yaml'), `name: ${plan.product.id}\n`);
  fs.writeFileSync(path.join(destination, 'README.md'), productReadme(plan));
  fs.writeFileSync(path.join(destination, 'tests', 'verification-plan.json'), `${JSON.stringify(verificationPlan(plan), null, 2)}\n`);
  fs.writeFileSync(path.join(destination, 'scripts', 'start.ps1'), lifecycleScript(plan, 'up --build -d'));
  fs.writeFileSync(path.join(destination, 'scripts', 'stop.ps1'), lifecycleScript(plan, 'down'));
  fs.writeFileSync(path.join(destination, 'scripts', 'status.ps1'), lifecycleScript(plan, 'ps'));
  fs.writeFileSync(path.join(destination, '.github', 'workflows', 'product-ci.yml'), productWorkflow(plan));

  return destination;
}

function copyFilter(source) {
  return !ignoredNames.has(path.basename(source));
}

function copyIfPresent(relativePath, destination) {
  const source = path.join(repositoryRoot, relativePath);
  if (fs.existsSync(source)) fs.copyFileSync(source, path.join(destination, relativePath));
}

function copyDirectoryIfPresent(relativePath, destination) {
  const source = path.join(repositoryRoot, relativePath);
  if (fs.existsSync(source)) fs.cpSync(source, path.join(destination, relativePath), { recursive: true, filter: copyFilter });
}

function composeArguments(plan) {
  return [...plan.compose_files, 'compose.product.yaml']
    .map((file) => `-f ${file}`)
    .join(' ');
}

function lifecycleScript(plan, command) {
  return [
    "$ErrorActionPreference = 'Stop'",
    '$root = Split-Path -Parent $PSScriptRoot',
    'Push-Location $root',
    'try {',
    `    docker compose ${composeArguments(plan)} ${command}`,
    '    exit $LASTEXITCODE',
    '}',
    'finally {',
    '    Pop-Location',
    '}',
    ''
  ].join('\n');
}

function verificationPlan(plan) {
  return {
    product: plan.product.id,
    checks: plan.assets.flatMap((asset) =>
      (asset.verification ?? []).map((check) => ({ feature: asset.name, check })))
  };
}

function productReadme(plan) {
  const features = plan.selected_features.map((feature) => `- ${feature}`).join('\n');
  const assets = plan.assets.map((asset) => `- ${asset.name}: ${asset.repository}@${asset.revision}`).join('\n');
  return `# ${plan.product.name}\n\nProducto derivado automaticamente por academico-product-line.\n\n## Features\n\n${features}\n\n## Core assets\n\n${assets}\n\n## Uso\n\n\`\`\`powershell\nCopy-Item .env.example .env\n.\\scripts\\start.ps1\n.\\scripts\\status.ps1\n.\\scripts\\stop.ps1\n\`\`\`\n\nLa seleccion completa y su trazabilidad estan registradas en \`product-manifest.json\`.\n`;
}
function productWorkflow(plan) {
  const compose = composeArguments(plan);
  return [
    'name: Product CI',
    '',
    'on:',
    '  push:',
    '  pull_request:',
    '',
    'permissions:',
    '  contents: read',
    '  security-events: write',
    '',
    'jobs:',
    '  verify:',
    '    runs-on: ubuntu-latest',
    '    steps:',
    '      - uses: actions/checkout@v4',
    '      - run: docker compose ' + compose + ' config --quiet',
    '      - run: docker compose ' + compose + ' build',
    '      - uses: aquasecurity/trivy-action@0.28.0',
    '        with:',
    '          scan-type: fs',
    '          scan-ref: .',
    '          severity: HIGH,CRITICAL',
    "          exit-code: '1'",
    ''
  ].join(String.fromCharCode(10));
}
