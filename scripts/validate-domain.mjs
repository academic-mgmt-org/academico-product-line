import { loadDomain, validateDomain } from './lib/domain.mjs';

const errors = validateDomain(loadDomain());
if (errors.length > 0) {
  console.error('Modelo de dominio invalido:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('OK: modelo de dominio, catalogo, reglas y trazabilidad coherentes.');
