/* =====================================================
   PRESENTE — auth.js
   Maneja: sesión en localStorage, guards de ruta,
   helpers de fetch autenticado, logout.
   ===================================================== */

const Auth = (() => {

  /* ── Claves de localStorage ── */
  const KEYS = {
    TOKEN:   'presente_token',
    ROLE:    'presente_role',    // 'teacher' | 'student'
    USER:    'presente_user',    // objeto JSON con datos del usuario
  };

  /* ── Leer / escribir sesión ── */
  function getToken()  { return localStorage.getItem(KEYS.TOKEN); }
  function getRole()   { return localStorage.getItem(KEYS.ROLE); }
  function getUser()   {
    try { return JSON.parse(localStorage.getItem(KEYS.USER)); }
    catch { return null; }
  }

  function saveSession({ token, role, user }) {
    localStorage.setItem(KEYS.TOKEN, token);
    localStorage.setItem(KEYS.ROLE,  role);
    localStorage.setItem(KEYS.USER,  JSON.stringify(user));
  }

  function clearSession() {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  }

  function isLoggedIn() { return !!getToken(); }

  /* ── Guard: redirige al login si no hay sesión ── */
  function requireAuth() {
    if (!isLoggedIn()) {
      const here = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `/login.html?redirect=${here}`;
      return false;
    }
    return true;
  }

  /* ── Guard: redirige al dashboard si ya hay sesión ── */
  function requireGuest() {
    if (isLoggedIn()) {
      redirectToDashboard();
      return false;
    }
    return true;
  }

  /* ── Redirigir al dashboard según rol ── */
  function redirectToDashboard() {
    const role = getRole();
    window.location.href = role === 'teacher'
      ? '/dashboard/teacher.html'
      : '/dashboard/student.html';
  }

  /* ── Logout ── */
  function logout() {
    clearSession();
    window.location.href = '/index.html';
  }

  /* ── Fetch autenticado ──
     Wrapper sobre fetch que inyecta el token en el header.
     Uso: Auth.fetch('/api/endpoint', { method, body })
  ── */
  async function authFetch(url, options = {}) {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    const response = await fetch(url, { ...options, headers });

    // Si el servidor devuelve 401, la sesión caducó
    if (response.status === 401) {
      clearSession();
      window.location.href = '/login.html';
      return null;
    }

    return response;
  }

  /* ── Login ──
     Llama al endpoint de login según el rol seleccionado.
     TODO: reemplazar las URLs cuando el Back confirme los endpoints.
  ── */
  const ENDPOINTS = {
    teacher: {
      login:    '/api/teachers/login',      // POST { email, password }
      register: '/api/teachers/register',   // POST { name, last_name, email, password }
    },
    student: {
      login:    '/api/students/login',
      register: '/api/students/register',
    },
  };

  async function login({ email, password, role }) {
    const url = ENDPOINTS[role].login;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, message: data.message || 'Credenciales incorrectas.' };
    }

    // Se espera: { token, user: { id, name, last_name, email, ... } }
    saveSession({ token: data.token, role, user: data.user });
    return { ok: true };
  }

  async function register({ role, ...fields }) {
    const url = ENDPOINTS[role].register;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fields),
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, message: data.message || 'Error al registrarse.' };
    }

    saveSession({ token: data.token, role, user: data.user });
    return { ok: true };
  }

  /* ── Leer el redirect guardado en la URL ── */
  function getRedirectParam() {
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect') || null;
  }

  /* ── Inicializar logout buttons en la página ── */
  function initLogoutButtons() {
    document.querySelectorAll('[data-logout]').forEach(btn => {
      btn.addEventListener('click', logout);
    });
  }

  /* ── Rellenar nombre de usuario en navbar ── */
  function fillNavbarUser() {
    const user = getUser();
    const el = document.getElementById('navbar-username');
    if (el && user) {
      el.textContent = `${user.name} ${user.last_name || ''}`.trim();
    }
  }

  /* ── Auto-inicializar logout + navbar en cualquier página ── */
  document.addEventListener('DOMContentLoaded', () => {
    initLogoutButtons();
    fillNavbarUser();
  });

  /* ── Exportar API pública ── */
  return {
    getToken,
    getRole,
    getUser,
    isLoggedIn,
    requireAuth,
    requireGuest,
    redirectToDashboard,
    logout,
    login,
    register,
    authFetch,
    getRedirectParam,
    initLogoutButtons,
    fillNavbarUser,
    ENDPOINTS,
  };

})();
