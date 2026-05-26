/* =====================================================
   PRESENTE — student.js
   Lógica para las páginas del panel de estudiante:
     - dashboard/student.html       → listado de clases
     - dashboard/student-class.html → detalle de clase
   ===================================================== */

document.addEventListener('DOMContentLoaded', async () => {

  /* Guard: solo estudiantes autenticados */
  if (!Auth.requireAuth()) return;
  if (Auth.getRole() !== 'student') {
    window.location.href = '/dashboard/teacher.html';
    return;
  }

  const page = document.body.dataset.page;

  if (page === 'student-dashboard') await initDashboard();
  if (page === 'student-class')     await initClassDetail();

});

/* ── Panel principal: listado de clases recientes ─── */
async function initDashboard() {
  const listEl = document.getElementById('classes-list');
  if (!listEl) return;

  listEl.innerHTML = renderSkeleton(3);

  try {
    /* TODO: confirmar endpoint con el Back.
       GET /api/students/me/classes
       Respuesta esperada: [{ id, name, date, time_entered, teacher_name }] */
    const res = await Auth.authFetch('/api/students/me/classes');
    const classes = await res.json();

    if (!Array.isArray(classes) || classes.length === 0) {
      listEl.innerHTML = renderEmptyState(
        'Aún no tienes clases registradas',
        'Escanea el QR de tu docente para registrarte.'
      );
      return;
    }

    listEl.innerHTML = classes.map(cls => renderClassCard(cls)).join('');

  } catch (err) {
    listEl.innerHTML = renderError('No se pudo cargar el listado de clases.');
    console.error('[Student]', err);
  }
}

/* ── Detalle de una clase ────────────────────────── */
async function initClassDetail() {
  const params = new URLSearchParams(window.location.search);
  const classId = params.get('id');

  if (!classId) {
    window.location.href = '/dashboard/student.html';
    return;
  }

  const detailEl = document.getElementById('class-detail');
  if (!detailEl) return;

  try {
    /* TODO: GET /api/students/me/classes/:id
       Respuesta esperada: { id, name, date, time_entered, teacher_name, description } */
    const res = await Auth.authFetch(`/api/students/me/classes/${classId}`);
    const cls  = await res.json();

    if (!res.ok) throw new Error(cls.message);

    // Rellenar campos en el DOM (usa data-field en los elementos HTML)
    fillField('class-name',     cls.name);
    fillField('class-teacher',  cls.teacher_name);
    fillField('class-date',     formatDate(cls.date));
    fillField('class-time',     cls.time_entered);

  } catch (err) {
    detailEl.innerHTML = renderError('No se pudo cargar el detalle de la clase.');
    console.error('[Student]', err);
  }
}

/* ── Helpers de renderizado ──────────────────────── */
function renderClassCard({ id, name, date, time_entered }) {
  return `
    <a href="/dashboard/student-class.html?id=${id}" class="class-card">
      <div class="class-card-header">
        <div>
          <p class="class-card-title">${escHtml(name)}</p>
          <p class="class-card-sub">${formatDate(date)}</p>
        </div>
        <span class="badge badge-blue">Asistido</span>
      </div>
      <p class="class-card-meta">Entraste a las ${escHtml(time_entered)}</p>
    </a>`;
}

function renderEmptyState(title, desc) {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">📋</div>
      <p class="empty-state-title">${title}</p>
      <p class="t-meta mt-sm">${desc}</p>
    </div>`;
}

function renderError(msg) {
  return `<div class="alert alert-error">${msg}</div>`;
}

function renderSkeleton(n) {
  return Array.from({ length: n }, () => `
    <div class="class-card" style="pointer-events:none; opacity:0.4; height:72px; background:var(--p-gray-100);"></div>
  `).join('');
}

/* ── Utilidades ──────────────────────────────────── */
function fillField(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? '—';
}

function formatDate(isoStr) {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
