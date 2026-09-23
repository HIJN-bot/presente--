import { Link } from 'react-router-dom'

const features = [
  ['01','Crear clases','El docente registra una clase con materia y horario desde su panel.'],
  ['02','Generar QR','Cada clase tiene un código QR para abrir el registro de asistencia.'],
  ['03','Registrar asistencia','El estudiante escanea el QR y registra su asistencia.'],
  ['04','Consultar registros','El docente consulta los estudiantes registrados en cada clase.']
]

export default function Inicio() {
  return <main className="landing">
    <header className="landing-nav">
      <Link to="/" className="brand"><b>P</b><span>Presente</span></Link>
      <nav><a href="#funciones">Funciones</a><a href="#flujo">Cómo funciona</a><a href="#tecnologia">Tecnología</a></nav>
      <div className="nav-actions"><Link to="/login" className="btn ghost">Iniciar sesión</Link><Link to="/registro" className="btn primary">Crear cuenta</Link></div>
    </header>

    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">● ASISTENCIA DIGITAL PARA CLASES</span>
        <h1>Pasa lista.<br/><em>Más rápido.</em></h1>
        <p>Presente permite gestionar clases y registrar asistencia mediante códigos QR. Una experiencia sencilla para docentes y estudiantes.</p>
        <div className="actions"><Link to="/registro" className="btn primary big">Empezar ahora →</Link><a href="#flujo" className="underlined">Ver cómo funciona ↓</a></div>
        <small>✓ Docentes y estudiantes en una misma plataforma</small>
      </div>

      <div className="preview">
        <div className="preview-card">
          <div className="preview-head"><div><small>CLASE ACTIVA</small><h3>Matemáticas</h3></div><label>● Activa</label></div>
          <div className="qr-box"><div className="qr"><i/><i/><i/><span/></div><p>Escanea para registrar tu asistencia</p></div>
          <div className="summary"><div><strong>24</strong><small>Presentes</small></div><div><strong>3</strong><small>Pendientes</small></div><div><strong>27</strong><small>Estudiantes</small></div></div>
        </div>
      </div>
    </section>

    <section id="funciones" className="section features">
      <div className="section-title"><div><span>FUNCIONES</span><h2>Todo lo necesario para<br/><em>tomar asistencia.</em></h2></div><p>Presente reúne el flujo completo: crear una clase, generar su QR, registrar estudiantes y consultar la asistencia.</p></div>
      <div className="feature-grid">{features.map(([n,t,d])=><article key={n}><small>{n}</small><div className="icon">+</div><h3>{t}</h3><p>{d}</p></article>)}</div>
    </section>

    <section id="flujo" className="flow">
      <div><span>FLUJO SIMPLE</span><h2>Del QR a la<br/><em>asistencia registrada.</em></h2><p>El flujo principal conecta al docente, la clase y el estudiante sin pasos innecesarios.</p></div>
      <div className="steps">
        <div><b>01</b><section><h3>Docente</h3><p>Crea una clase y obtiene el QR asociado.</p></section></div>
        <div><b>02</b><section><h3>Estudiante</h3><p>Escanea el código y llega al registro.</p></section></div>
        <div><b>03</b><section><h3>Registro</h3><p>La asistencia queda asociada a la clase y al estudiante.</p></section></div>
      </div>
    </section>

    <section className="roles">
      <article className="role dark"><span>PARA DOCENTES</span><h2>Controla tus<br/>clases desde tu panel.</h2><ul><li>Crear y consultar clases</li><li>Obtener el QR de cada clase</li><li>Consultar asistencia registrada</li><li>Eliminar clases</li></ul><Link to="/registro">Crear cuenta docente →</Link></article>
      <article className="role purple"><span>PARA ESTUDIANTES</span><h2>Registra tu asistencia<br/>en pocos pasos.</h2><ul><li>Crear cuenta de estudiante</li><li>Escanear el QR de la clase</li><li>Registrar asistencia</li><li>Consultar historial desde tu panel</li></ul><Link to="/registro">Crear cuenta estudiante →</Link></article>
    </section>

    <section id="tecnologia" className="section tech">
      <div><span>TECNOLOGÍA</span><h2>Una base clara para<br/><em>el sistema Presente.</em></h2></div>
      <div className="tech-list"><div><b>React + Vite</b><small>Frontend</small></div><div><b>FastAPI</b><small>Backend</small></div><div><b>PostgreSQL</b><small>Base de datos</small></div><div><b>SQLAlchemy + Alembic</b><small>ORM y migraciones</small></div><div><b>Render</b><small>Despliegue</small></div></div>
    </section>

    <section className="cta"><span>PRESENTE</span><h2>La asistencia de tu clase,<br/><em>en un solo lugar.</em></h2><p>Gestiona tus clases con un flujo de asistencia basado en códigos QR.</p><Link to="/registro" className="btn light big">Crear una cuenta →</Link></section>

    <footer><div className="brand"><b>P</b><span>Presente</span></div><p>Sistema de registro de asistencia mediante códigos QR.</p><div><Link to="/login">Iniciar sesión</Link><Link to="/registro">Registrarse</Link></div><small>© 2026 Presente</small></footer>
  </main>
}