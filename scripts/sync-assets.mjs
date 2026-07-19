import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { loadDomain, readYaml, repositoryRoot, resolveProduct } from './lib/domain.mjs';

const productPath = process.argv[2] ?? 'products/producto-plataforma-completa.yml';
const product = readYaml(productPath);
const { plan, errors } = resolveProduct(product, loadDomain());

if (errors.length > 0) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}

fs.mkdirSync(path.join(repositoryRoot, 'services'), { recursive: true });

for (const asset of plan.assets) {
  const destination = path.join(repositoryRoot, asset.local_path);
  const gitDirectory = path.join(destination, '.git');

  if (fs.existsSync(gitDirectory)) {
    runGit(['-C', destination, 'fetch', '--depth', '1', 'origin', asset.revision]);
    runGit(['-C', destination, 'checkout', '--detach', 'FETCH_HEAD']);
  } else if (fs.existsSync(destination)) {
    throw new Error(`${destination} existe, pero no es un repositorio Git.`);
  } else {
    runGit(['clone', '--depth', '1', '--branch', asset.revision, asset.repository, destination]);
  }

  console.log(`OK ${asset.name}: ${asset.repository}@${asset.revision}`);
}

function runGit(args) {
  const result = spawnSync('git', args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
