import { useNavigate } from 'react-router-dom'

export default function PanelEstudiante() {
    const navigate = useNavigate()
    const usuarioString = localStorage.getItem('user')
    const usuario = usuarioString ? JSON.parse(usuarioString) : null
    const nombre = usuario?.nombre || 'Estudiante'

    const cerrarSesion = () => {
        localStorage.clear()
        navigate('/')
    }

    return (
        <div className='min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900'>
            <header className='flex justify-between items-center px-8 py-6 border-b border-slate-700'>
                <h1 className='text-4xl font-bold text-white'>Presente <span className='text-teal-400'>Estudiante</span></h1>
                <button onClick={() => cerrarSesion()} className='px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-300'>Cerrar Sesión</button>
            </header>

            <main className='p-8'>
                <div className='max-w-6xl mx-auto'>
                    <div className='mb-12'>
                        <h2 className='text-3xl font-bold text-white mb-2'>Bienvenido, <span className='text-teal-400'>{nombre}</span></h2>
                        <p className='text-gray-400'>Gestiona tu asistencia y consulta tu información</p>
                    </div>
                </div>
            </main>
        </div>
    )
}
