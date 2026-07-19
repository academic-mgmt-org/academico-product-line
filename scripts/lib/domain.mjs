import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

export const repositoryRoot = path.resolve(import.meta.dirname, '..', '..');

export function readYaml(relativePath) {
  const absolutePath = path.resolve(repositoryRoot, relativePath);
  const content = fs.readFileSync(absolutePath, 'utf8');
  return parse(content);
}

export function loadDomain() {
  return {
    featureModel: readYaml('domain/feature-model.yml'),
    coreAssets: readYaml('domain/core-assets.yml'),
    configurationKnowledge: readYaml('domain/configuration-knowledge.yml'),
    variationPoints: readYaml('domain/variation-points.yml'),
    traceability: readYaml('traceability/feature-asset-matrix.yml')
  };
}

export function validateDomain(domain) {
  const errors = [];
  const features = domain.featureModel?.features ?? {};
  const assets = domain.coreAssets?.assets ?? {};
  const rules = domain.configurationKnowledge?.rules ?? [];
  const constraints = domain.featureModel?.constraints ?? [];
  const mappings = domain.traceability?.mappings ?? [];
  const root = domain.featureModel?.model?.root;

  if (!root || !features[root] || features[root].type !== 'root') {
    errors.push('El modelo debe declarar una feature raiz valida.');
  }

  const selectableFeatures = Object.entries(features)
    .filter(([, definition]) => definition.type !== 'root')
    .map(([feature]) => feature);

  for (const feature of selectableFeatures) {
    const definition = features[feature];
    if (!['mandatory', 'optional'].includes(definition.type)) {
      errors.push(`La feature '${feature}' tiene un tipo no soportado: '${definition.type}'.`);
    }
    if (!assets[feature]) {
      errors.push(`La feature '${feature}' no tiene un core asset en el catalogo.`);
    }
    if (!rules.some((rule) => rule.when === feature && rule.asset === feature)) {
      errors.push(`La feature '${feature}' no tiene conocimiento de configuracion.`);
    }
    if (!mappings.some((mapping) => mapping.feature === feature && mapping.asset === feature)) {
      errors.push(`La feature '${feature}' no tiene trazabilidad.`);
    }
  }

  for (const constraint of constraints) {
    if (!features[constraint.source] && !isGroupMember(domain, constraint.source)) {
      errors.push(`La restriccion '${constraint.id}' usa un origen inexistente.`);
    }
    if (!features[constraint.target] && !isGroupMember(domain, constraint.target)) {
      errors.push(`La restriccion '${constraint.id}' usa un destino inexistente.`);
    }
    if (!['requires', 'excludes'].includes(constraint.type)) {
      errors.push(`La restriccion '${constraint.id}' tiene un tipo invalido.`);
    }
  }

  for (const rule of rules) {
    if (!features[rule.when]) {
      errors.push(`La regla '${rule.id}' referencia la feature inexistente '${rule.when}'.`);
    }
    if (!assets[rule.asset]) {
      errors.push(`La regla '${rule.id}' referencia el activo inexistente '${rule.asset}'.`);
    }
  }

  for (const [asset, definition] of Object.entries(assets)) {
    if (!definition.repository || !definition.revision || !definition.local_path) {
      errors.push(`El activo '${asset}' no tiene repositorio, revision y ruta local.`);
    }
  }

  return errors;
}

function isGroupMember(domain, candidate) {
  return Object.values(domain.featureModel?.groups ?? {})
    .some((group) => (group.members ?? []).includes(candidate));
}

export function resolveProduct(product, domain) {
  const errors = [];
  const modelFeatures = domain.featureModel.features;
  const selections = product.features ?? {};
  const selected = new Set();

  for (const [feature, definition] of Object.entries(modelFeatures)) {
    if (definition.type === 'root') continue;
    const value = selections[feature];
    if (value !== undefined && typeof value !== 'boolean') {
      errors.push(`La feature '${feature}' debe ser true o false.`);
      continue;
    }
    if (definition.type === 'mandatory' || value === true) selected.add(feature);
  }

  for (const configuredFeature of Object.keys(selections)) {
    if (!modelFeatures[configuredFeature]) {
      errors.push(`La configuracion contiene la feature desconocida '${configuredFeature}'.`);
    }
  }

  const variants = {};
  for (const [groupName, group] of Object.entries(domain.featureModel.groups ?? {})) {
    const configured = product.variants?.[groupName];
    const values = configured === undefined
      ? (group.default ? [group.default] : [])
      : (Array.isArray(configured) ? configured : [configured]);
    const unknown = values.filter((value) => !(group.members ?? []).includes(value));
    if (unknown.length > 0) errors.push(`El grupo '${groupName}' contiene variantes desconocidas: ${unknown.join(', ')}.`);
    if (group.type === 'xor' && values.length !== 1) errors.push(`El grupo XOR '${groupName}' exige exactamente una variante.`);
    if (group.type === 'or' && selected.has(group.parent) && values.length < 1) errors.push(`El grupo OR '${groupName}' exige al menos una variante.`);
    if (group.parent && !selected.has(group.parent) && values.length > 0) errors.push(`El grupo '${groupName}' solo puede configurarse cuando '${group.parent}' esta activo.`);
    variants[groupName] = values;
  }

  const allSelections = new Set([...selected, ...Object.values(variants).flat()]);
  for (const constraint of domain.featureModel.constraints ?? []) {
    if (!allSelections.has(constraint.source)) continue;
    if (constraint.type === 'requires' && !allSelections.has(constraint.target)) {
      errors.push(`'${constraint.source}' requiere '${constraint.target}'.`);
    }
    if (constraint.type === 'excludes' && allSelections.has(constraint.target)) {
      errors.push(`'${constraint.source}' excluye '${constraint.target}'.`);
    }
  }

  const rules = (domain.configurationKnowledge.rules ?? [])
    .filter((rule) => selected.has(rule.when));
  const planned = rules.filter((rule) => rule.status === 'planned').map((rule) => rule.when);
  if (planned.length > 0) errors.push(`Caracteristicas aun no integradas: ${planned.join(', ')}.`);

  if (errors.length > 0) return { errors };

  const assetNames = [...new Set(rules.map((rule) => rule.asset))];
  const assets = assetNames.map((name) => ({ name, ...domain.coreAssets.assets[name] }));
  const composeFiles = [...new Set(assets.flatMap((asset) => asset.compose_files ?? []))];
  const traceability = (domain.traceability.mappings ?? [])
    .filter((mapping) => selected.has(mapping.feature));

  return {
    errors,
    plan: {
      schema_version: '1.0',
      product: product.product,
      selected_features: [...selected],
      selected_variants: variants,
      assets,
      compose_files: composeFiles,
      traceability
    }
  };
}
