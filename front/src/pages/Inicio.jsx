//Importamos Link para establecer la conexion con otros componentes
import { Link } from 'react-router-dom'

export default function Inicio() {
    return (
        //Estructura del HTML del componente de inicio
        <div className='min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900'>
            {/*Header de la pagina: Contiene el titulo y los botones de navegacion*/}
            <header className='flex justify-between items-center px-8 py-6 border-b border-slate-700'>
                <div>
                    <h1 className='text-4xl font-bold text-white'>
                        Presente
                        <span className='text-teal-400 ml-2'></span>
                    </h1>
                </div>
                <div className='flex gap-4'>
                    <Link to="/login">
                        <button className='px-6 py-2 border-2 border-blue-600 text-blue-400 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300'>
                            Inicia Sesion
                        </button>
                    </Link>
                    <Link to="/registro">
                        <button className='px-6 py-2 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 transition-all duration-300'>
                            Registrate
                        </button>
                    </Link>
                </div>
            </header>

            {/*Hero Section: Presentacion principal del sistema*/}
            <section className='flex flex-col items-center justify-center py-24 px-4 text-center'>
                <h2 className='text-6xl font-bold text-white mb-6 leading-tight'>
                    Sistema de Asistencia <br />
                    <span className='text-teal-400'>Inteligente y Simple</span>
                </h2>
                <p className='text-xl text-gray-300 mb-12 max-w-2xl'>
                    Controla la asistencia de tus clases de forma rápida, segura y sin complicaciones.
                    Perfecto para docentes y estudiantes.
                </p>
                <div className='flex gap-6'>
                    <Link to="/registro">
                        <button className='px-8 py-4 bg-teal-500 text-white text-lg rounded-lg font-bold hover:bg-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl'>
                            Comienza Ahora
                        </button>
                    </Link>
                </div>
            </section>

            {/*Body de la pagina: Contiene la informacion acerca del sistema y una guia rapida de uso*/}
            <section className='px-8 py-16 bg-slate-800 bg-opacity-50'>
                <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12'>
                    {/*Que es Presente*/}
                    <div className='p-8 bg-slate-700 rounded-lg border border-slate-600 hover:border-teal-400 transition-colors duration-300'>
                        <h3 className='text-2xl font-bold text-white mb-4'>
                            Que es Presente
                        </h3>
                        <p className='text-gray-300 leading-relaxed'>
                            Presente es una plataforma diseñada para facilitar el control de asistencia en
                            clases. Los docentes pueden crear clases y generar códigos QR, mientras que los
                            estudiantes se registran escaneando el código. Simple, rápido y confiable.
                        </p>
                    </div>

                    {/*Guia de Uso*/}
                    <div className='p-8 bg-slate-700 rounded-lg border border-slate-600 hover:border-teal-400 transition-colors duration-300'>
                        <h3 className='text-2xl font-bold text-white mb-4'>
                            Como Usar
                        </h3>
                        <ol className='text-gray-300 space-y-2'>
                            <li><span className='text-teal-400 font-bold'>1.</span> Crea tu cuenta (Docente o Estudiante)</li>
                            <li><span className='text-teal-400 font-bold'>2.</span> Docentes: Crea una clase y genera QR</li>
                            <li><span className='text-teal-400 font-bold'>3.</span> Estudiantes: Escanea el QR para registrarte</li>
                            <li><span className='text-teal-400 font-bold'>4.</span> ¡Listo! Tu asistencia quedó registrada</li>
                        </ol>
                    </div>
                </div>
            </section>

            {/*Footer: Minimalista*/}
            <footer className='text-center py-8 border-t border-slate-700 text-gray-400'>
                <p>Presente © 2026 | Sistema de Asistencia Inteligente</p>
            </footer>
        </div>
    )
}