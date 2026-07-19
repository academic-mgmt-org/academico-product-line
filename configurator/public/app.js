const state = { catalog: null };
const featureGrid = document.querySelector('#feature-grid');
const variantGrid = document.querySelector('#variant-grid');
const result = document.querySelector('#validation-result');
const form = document.querySelector('#factory-form');

init().catch((error) => showErrors([error.message]));

async function init() {
  state.catalog = await request('/api/catalog');
  document.querySelector('#asset-count').textContent = Object.keys(state.catalog.assets).length;
  renderFeatures();
  renderVariants();
  updateSummary();
  document.querySelector('#validate-button').addEventListener('click', validate);
  form.addEventListener('submit', derive);
  form.addEventListener('change', updateSummary);
  observeSections();
}

function renderFeatures() {
  const entries = Object.entries(state.catalog.features).filter(([, item]) => item.type !== 'root');
  featureGrid.innerHTML = entries.map(([name, item]) => {
    const mandatory = item.type === 'mandatory';
    const description = descriptions[name] ?? 'Capacidad reutilizable del sistema académico.';
    return `<label class="feature-card ${mandatory ? 'selected' : ''}" data-feature="${name}">
      <input type="checkbox" name="feature" value="${name}" ${mandatory ? 'checked disabled' : ''}>
      <span class="feature-icon">${name.slice(0, 2)}</span>
      <span class="feature-copy"><strong>${pretty(name)}</strong><small>${description}</small>${mandatory ? '<span class="badge">OBLIGATORIO</span>' : ''}</span>
      <span class="checkmark">✓</span>
    </label>`;
  }).join('');

  featureGrid.addEventListener('change', (event) => {
    if (event.target.name !== 'feature') return;
    event.target.closest('.feature-card').classList.toggle('selected', event.target.checked);
    if (event.target.checked) selectRequirements(event.target.value);
    renderVariants();
    updateSummary();
  });
}

function selectRequirements(feature) {
  for (const rule of state.catalog.constraints.filter((item) => item.type === 'requires' && item.source === feature)) {
    const input = featureGrid.querySelector(`[value="${rule.target}"]`);
    if (input && !input.checked) {
      input.checked = true;
      input.closest('.feature-card').classList.add('selected');
      selectRequirements(rule.target);
    }
  }
}

function renderVariants() {
  const selected = selectedFeatures();
  variantGrid.innerHTML = Object.entries(state.catalog.groups).map(([name, group]) => {
    const enabled = !group.parent || selected.includes(group.parent);
    const type = group.type === 'xor' ? 'radio' : 'checkbox';
    return `<div class="variant-card" data-group="${name}" ${enabled ? '' : 'hidden'}>
      <h3>${pretty(name)}</h3><p>${group.type.toUpperCase()} · ${group.parent ? `Disponible con ${pretty(group.parent)}` : 'Selección global'}</p>
      <div class="options">${group.members.map((member, index) => `<label class="option"><input type="${type}" name="variant-${name}" value="${member}" ${(member === group.default || (group.type === 'or' && index === 0)) ? 'checked' : ''}>${pretty(member)}</label>`).join('')}</div>
    </div>`;
  }).join('');
}

function productConfiguration() {
  const features = {};
  for (const name of Object.keys(state.catalog.features)) {
    if (name === state.catalog.model.root) continue;
    features[name] = selectedFeatures().includes(name);
  }
  const variants = {};
  for (const [name, group] of Object.entries(state.catalog.groups)) {
    const inputs = [...document.querySelectorAll(`[name="variant-${name}"]:checked`)];
    if (group.parent && !features[group.parent]) continue;
    variants[name] = group.type === 'or' ? inputs.map((input) => input.value) : inputs[0]?.value;
  }
  return {
    product: {
      id: document.querySelector('#product-id').value.trim(),
      name: document.querySelector('#product-name').value.trim(),
      description: document.querySelector('#product-description').value.trim()
    },
    features,
    variants
  };
}

async function validate() {
  setBusy(true);
  try {
    const response = await request('/api/validate', productConfiguration());
    if (response.errors.length) return showErrors(response.errors);
    result.className = 'validation success';
    result.innerHTML = `<strong>Configuración válida</strong><span>${response.plan.assets.length} activos y ${response.plan.traceability.length} requisitos trazables listos para ensamblar.</span>`;
  } catch (error) { showErrors([error.message]); } finally { setBusy(false); }
}

async function derive(event) {
  event.preventDefault();
  if (!form.reportValidity()) return;
  setBusy(true);
  try {
    const response = await request('/api/derive', productConfiguration());
    if (response.errors?.length) return showErrors(response.errors);
    result.className = 'validation success';
    result.innerHTML = `<strong>Producto derivado correctamente</strong><span>Destino: ${response.destination}</span><span>${response.plan.assets.length} core assets ensamblados con trazabilidad.</span>`;
  } catch (error) { showErrors([error.message]); } finally { setBusy(false); }
}

function updateSummary() {
  const selected = selectedFeatures();
  document.querySelector('#selection-summary').innerHTML = `<h3>${selected.length} capacidades seleccionadas</h3><div class="chips">${selected.map((name) => `<span class="chip">${pretty(name)}</span>`).join('')}</div>`;
  result.className = 'validation neutral';
  result.textContent = 'Configuración modificada. Valídala antes de derivar.';
}

function selectedFeatures() {
  return [...document.querySelectorAll('[name="feature"]:checked')].map((input) => input.value);
}

function showErrors(errors) {
  result.className = 'validation error';
  result.innerHTML = `<strong>La configuración necesita ajustes</strong><ul>${errors.map((error) => `<li>${escapeHtml(error)}</li>`).join('')}</ul>`;
}

function setBusy(busy) {
  document.querySelectorAll('.button').forEach((button) => { button.disabled = busy; });
}

async function request(url, payload) {
  const response = await fetch(url, payload ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) } : {});
  const data = await response.json();
  if (!response.ok && !data.errors) throw new Error(`Error HTTP ${response.status}`);
  return data;
}

function pretty(value) { return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function escapeHtml(value) { const span = document.createElement('span'); span.textContent = value; return span.innerHTML; }
function observeSections() { const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { document.querySelectorAll('.step').forEach((step) => step.classList.toggle('active', step.hash === `#${entry.target.id}`)); } }), { rootMargin: '-25% 0px -65%' }); document.querySelectorAll('.panel-section').forEach((section) => observer.observe(section)); }

const descriptions = {
  database: 'Esquema PostgreSQL, migraciones versionadas y persistencia.',
  login: 'Autenticación, sesiones, JWT y recuperación de contraseña.',
  gateway: 'Punto de entrada gRPC para enrutar capacidades del producto.',
  usuarios: 'Administración de perfiles, roles y permisos.',
  matriculas: 'Flujo de inscripción y gestión de matrículas.',
  calificaciones: 'Registro, reglas y consulta de notas académicas.',
  notificaciones: 'Mensajes por correo y dentro de la aplicación.',
  solicitudes: 'Trámites académicos, seguimiento, documentos y resolución administrativa.',
  web: 'Portal Laravel para interacción de estudiantes y operadores.',
  quality_gates: 'Prometheus, Grafana y tablero de calidad continua.'
};
