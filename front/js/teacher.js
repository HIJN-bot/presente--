/* =====================================================
   PRESENTE — teacher.js
   Lógica para las páginas del panel de docente:
     - dashboard/teacher.html              → panel principal
     - dashboard/teacher-classes.html      → listado de clases
     - dashboard/teacher-class-detail.html → detalle + asistentes
     - dashboard/teacher-class-qr.html     → vista del QR
     - dashboard/teacher-create.html       → formulario nueva clase
   ===================================================== */

document.addEventListener('DOMContentLoaded', async () => {

  /* Guard: solo docentes autenticados */
  if (!Auth.requireAuth()) return;
  if (Auth.getRole() !== 'teacher') {
    window.location.href = '/dashboard/student.html';
    return;
  }

  const page = document.body.dataset.page;

  if (page === 'teacher-dashboard')     initDashboard();
  if (page === 'teacher-classes')       await initClassesList();
  if (page === 'teacher-class-detail')  await initClassDetail();
  if (page === 'teacher-class-qr')      await initQRView();
  if (page === 'teacher-create')        initCreateForm();

});

/* ── Panel principal ─────────────────────────────── */
function initDashboard() {
  // Nada que cargar — solo navegación con botones estáticos
}

/* ── Listado de clases ───────────────────────────── */
async function initClassesList() {
  const listEl = document.getElementById('classes-list');
  if (!listEl) return;

  listEl.innerHTML = renderSkeleton(4);

  try {
    /* TODO: GET /api/teachers/me/classes
       Respuesta esperada: [{ id, name, date, schedule, status: 'active'|'expired'|'upcoming', student_count }] */
    const res     = await Auth.authFetch('/api/teachers/me/classes');
    const classes = await res.json();

    if (!Array.isArray(classes) || classes.length === 0) {
      listEl.innerHTML = renderEmptyState(
        'Aún no tienes clases creadas',
        'Crea tu primera clase para generar el código QR.'
      );
      return;
    }

    listEl.innerHTML = classes.map(cls => renderClassCard(cls)).join('');

  } catch (err) {
    listEl.innerHTML = renderError('No se pudo cargar el listado de clases.');
    console.error('[Teacher]', err);
  }
}

/* ── Detalle de clase + tabla de asistentes ──────── */
async function initClassDetail() {
  const params  = new URLSearchParams(window.location.search);
  const classId = params.get('id');
  if (!classId) { window.location.href = '/dashboard/teacher-classes.html'; return; }

  // Enlace al QR
  const qrBtn = document.getElementById('btn-view-qr');
  if (qrBtn) qrBtn.href = `/dashboard/teacher-class-qr.html?id=${classId}`;

  try {
    /* TODO: GET /api/teachers/me/classes/:id
       Respuesta esperada: {
         id, name, date, schedule, status, description,
         students: [{ id, name, last_name, time_entered }]
       } */
    const res = await Auth.authFetch(`/api/teachers/me/classes/${classId}`);
    const cls = await res.json();
    if (!res.ok) throw new Error(cls.message);

    fillField('class-name',        cls.name);
    fillField('class-date',        formatDate(cls.date));
    fillField('class-schedule',    cls.schedule);
    fillField('class-description', cls.description);
    fillField('class-count',       `${cls.students?.length ?? 0} estudiantes`);

    const badgeEl = document.getElementById('class-status-badge');
    if (badgeEl) badgeEl.outerHTML = renderStatusBadge(cls.status);

    const tableEl = document.getElementById('attendance-body');
    if (tableEl) {
      tableEl.innerHTML = cls.students?.length
        ? cls.students.map(s => renderStudentRow(s)).join('')
        : `<tr><td colspan="3" class="empty-state">Sin estudiantes registrados aún.</td></tr>`;
    }

  } catch (err) {
    console.error('[Teacher]', err);
  }
}

/* ── Vista del QR ────────────────────────────────── */
async function initQRView() {
  const params  = new URLSearchParams(window.location.search);
  const classId = params.get('id');
  if (!classId) { window.location.href = '/dashboard/teacher-classes.html'; return; }

  try {
    /* TODO: GET /api/teachers/me/classes/:id/qr
       Respuesta esperada: { name, status, qr_url, token }
       qr_url: URL de imagen del QR ya generado en el Back,
       O token para generarlo en el Front con una librería. */
    const res  = await Auth.authFetch(`/api/teachers/me/classes/${classId}/qr`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    fillField('qr-class-name', data.name);

    const badgeEl = document.getElementById('qr-status-badge');
    if (badgeEl) badgeEl.outerHTML = renderStatusBadge(data.status);

    // Si el Back devuelve una imagen del QR
    if (data.qr_url) {
      const imgEl = document.getElementById('qr-image');
      if (imgEl) imgEl.src = data.qr_url;
    }

    // Actualización en tiempo real del estado (polling cada 30 s)
    setInterval(async () => {
      const r = await Auth.authFetch(`/api/teachers/me/classes/${classId}/qr`);
      const d = await r.json();
      const badge = document.getElementById('qr-status-badge');
      if (badge) badge.outerHTML = renderStatusBadge(d.status);
    }, 30_000);

  } catch (err) {
    console.error('[Teacher QR]', err);
  }
}

/* ── Formulario de creación de clase ─────────────── */
function initCreateForm() {
  const form = document.getElementById('create-class-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('[type=submit]');
    const errorEl   = document.getElementById('form-error');

    setLoading(submitBtn, true);
    if (errorEl) errorEl.classList.add('hidden');

    // Recoger todos los campos del formulario
    const formData = Object.fromEntries(new FormData(form).entries());

    try {
      /* TODO: POST /api/teachers/me/classes
         Body: campos del modelo de Clase (pendiente de push del Back) */
      const res  = await Auth.authFetch('/api/teachers/me/classes', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Error al crear la clase.');

      window.location.href = '/dashboard/teacher-classes.html';

    } catch (err) {
      if (errorEl) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
      }
      setLoading(submitBtn, false);
      console.error('[Create Class]', err);
    }
  });
}

/* ── Helpers de renderizado ──────────────────────── */
function renderClassCard({ id, name, date, schedule, status, student_count }) {
  return `
    <a href="/dashboard/teacher-class-detail.html?id=${id}" class="class-card">
      <div class="class-card-header">
        <div>
          <p class="class-card-title">${escHtml(name)}</p>
          <p class="class-card-sub">${formatDate(date)} · ${escHtml(schedule)}</p>
        </div>
        ${renderStatusBadge(status)}
      </div>
      <p class="class-card-meta">${student_count ?? 0} estudiantes registrados</p>
    </a>`;
}

function renderStudentRow({ name, last_name, time_entered }) {
  const initials = `${name[0]}${last_name?.[0] ?? ''}`.toUpperCase();
  return `
    <tr>
      <td>
        <div class="student-cell">
          <div class="avatar">${initials}</div>
          ${escHtml(name)} ${escHtml(last_name ?? '')}
        </div>
      </td>
      <td>${escHtml(time_entered)}</td>
    </tr>`;
}

function renderStatusBadge(status) {
  const map = {
    active:   ['badge-active',   'status-dot', 'Activa'],
    expired:  ['badge-expired',  'status-dot', 'Caducada'],
    upcoming: ['badge-upcoming', 'status-dot', 'Próxima'],
  };
  const [cls, dot, label] = map[status] ?? ['badge-neutral', '', 'Sin estado'];
  return `<span id="qr-status-badge" class="badge ${cls} ${dot}">${label}</span>`;
}

function renderEmptyState(title, desc) {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">🗂</div>
      <p class="empty-state-title">${title}</p>
      <p class="t-meta mt-sm">${desc}</p>
    </div>`;
}

function renderError(msg) {
  return `<div class="alert alert-error">${msg}</div>`;
}

function renderSkeleton(n) {
  return Array.from({ length: n }, () =>
    `<div class="class-card" style="pointer-events:none; opacity:0.35; height:72px; background:var(--p-gray-100);"></div>`
  ).join('');
}

/* ── Utilidades ──────────────────────────────────── */
function fillField(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? '—';
}

function setLoading(btn, loading) {
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Cargando…' : btn.dataset.label ?? btn.textContent;
}

function formatDate(isoStr) {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleDateString('es-CO', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}
