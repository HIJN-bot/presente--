/* =====================================================
   PRESENTE — attendance.js
   Maneja el flujo de asistencia vía QR:
     1. Lee el token de la URL
     2. Si no está logueado → redirige a login preservando la URL
     3. Si está logueado → llama al endpoint y redirige al éxito
   ===================================================== */

document.addEventListener('DOMContentLoaded', async () => {

  /* ── 1. Leer el token de la URL ──────────────────── */
  const params = new URLSearchParams(window.location.search);
  const classToken = params.get('token');

  if (!classToken) {
    showError('El código QR no es válido o ha expirado.');
    return;
  }

  /* ── 2. Verificar sesión del estudiante ─────────── */
  if (!Auth.isLoggedIn()) {
    const redirect = encodeURIComponent(`/attendance.html?token=${classToken}`);
    window.location.href = `/login.html?redirect=${decodeURIComponent(redirect)}`;
    return;
  }

  /* ── 3. Registrar asistencia ─────────────────────── */
  const statusEl = document.getElementById('attendance-status');
  if (statusEl) statusEl.textContent = 'Registrando asistencia…';

  try {
    /* TODO: confirmar endpoint con el Back.
       Se espera POST /api/attendance con { token: classToken }
       Respuesta esperada: { ok: true } o { message: '...' }   */
    const res = await Auth.authFetch('/api/attendance', {
      method: 'POST',
      body: JSON.stringify({ token: classToken }),
    });

    if (!res) return; // Auth.authFetch ya manejó el 401

    if (res.ok) {
      window.location.href = '/attendance-success.html';
    } else {
      const data = await res.json();
      showError(data.message || 'No se pudo registrar la asistencia.');
    }

  } catch (err) {
    showError('Error de conexión. Intenta de nuevo.');
    console.error('[Attendance]', err);
  }

  /* ── Helper: mostrar error en pantalla ─────────── */
  function showError(msg) {
    const el = document.getElementById('attendance-status');
    if (el) {
      el.textContent = msg;
      el.classList.add('alert', 'alert-error');
    }
  }

});
