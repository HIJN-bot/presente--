import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config'

export default function PanelDocente() {
    const consultarClase = `${API_BASE_URL}/api/clases/consultar`
    const consultarAsistencia = `${API_BASE_URL}/api/asistencia/consulta`
    const crearClase = `${API_BASE_URL}/api/clases/creacion`

    const [activeView, setActiveView] = useState('clases')
    const [claseSeleccionada, setClaseSeleccionada] = useState(null)
    const [asistencia, setAsistencia] = useState([])
    const [clases, setClases] = useState([])
    const [materia, setMateria] = useState('')
    const [horario, setHorario] = useState('')

    const usuario = JSON.parse(localStorage.getItem('user'))
    const nombre = usuario.nombre
    const navigate = useNavigate()

    const obtenerDatos = async (url) => {
        try {
            const response = await fetch(url + '?email_docente=' + usuario.email);
            if (!response.ok) {
                throw new Error('Error al obtener los datos');
            }
            const data = await response.json();
            return data
        } catch (error) {
            console.error('Error:', error);
            return null
        }
    }

    const registrarClase = async (url, materia, horario) => {
        try {
            const response = await fetch(url + '?email_docente=' + usuario.email, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    'materia': materia,
                    'horario': horario
                })
            });

            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status}`);
            }

            const resultado = await response.json();
            setMateria('')
            setHorario('')
            const nuevasClases = await obtenerDatos(consultarClase)
            setClases(nuevasClases)
            alert('Clase creada exitosamente')
            return resultado;
        } catch (error) {
            console.error('Hubo un problema con la petición:', error);
            alert('Error al crear la clase')
        }
    }

    const cerrarSesion = () => {
        localStorage.clear()
        navigate('/')
    }

    const registroAsistencia = async (idClase) => {
        try {
            const url = consultarAsistencia + '?id_clase=' + idClase + '&email_docente=' + usuario.email
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error('Error al obtener asistencia')
            }
            const data = await response.json()
            if (!data || !data.asistencia_estudiantes) {
                console.error("Ha ocurrido un error a la hora de consultar la asistencia de la clase")
                return
            }
            setAsistencia(data)
            setClaseSeleccionada(idClase)
        } catch (error) {
            console.error("Error:", error)
        }
    }

    useEffect(() => {
        const cargarClases = async () => {
            const response = await obtenerDatos(consultarClase)
            if (response && Array.isArray(response)) {
                setClases(response)
            }
        }
        cargarClases()
    }, [])

    return (
        <div className='min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900'>
            {/* Header */}
            <header className='flex justify-between items-center px-8 py-6 border-b border-slate-700'>
                <h1 className='text-4xl font-bold text-white'>Presente <span className='text-teal-400'>Docente</span></h1>
                <button onClick={() => cerrarSesion()} className='px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-300'>Cerrar Sesión</button>
            </header>

            <div className='flex h-[calc(100vh-120px)]'>
                {/* Sidebar */}
                <aside className='w-64 bg-slate-800 border-r border-slate-700 p-6 flex flex-col'>
                    <h2 className='text-xl font-bold text-white mb-8'>Bienvenido, <span className='text-teal-400'>{nombre}</span></h2>

                    <nav className='space-y-3 flex-1'>
                        <button
                            onClick={() => setActiveView('clases')}
                            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                                activeView === 'clases'
                                    ? 'bg-teal-500 text-white shadow-lg'
                                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                            }`}
                        >
                            Clases programadas
                        </button>
                        <button
                            onClick={() => setActiveView('registro')}
                            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                                activeView === 'registro'
                                    ? 'bg-teal-500 text-white shadow-lg'
                                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                            }`}
                        >
                            Registro de clases
                        </button>
                        <button
                            onClick={() => setActiveView('crear')}
                            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 ${
                                activeView === 'crear'
                                    ? 'bg-teal-500 text-white shadow-lg'
                                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                            }`}
                        >
                            Crear clase
                        </button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className='flex-1 p-8 overflow-y-auto'>
                    {/* Vista: Clases programadas */}
                    {activeView === 'clases' && (
                        <div>
                            <h2 className='text-3xl font-bold text-white mb-8'>Tus Clases</h2>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                {clases && clases.length > 0 ? (
                                    clases.map((clase) => (
                                        <div key={clase.id} className='bg-slate-700 rounded-lg p-6 border border-slate-600 hover:border-teal-500 transition-all duration-300'>
                                            <h3 className='text-xl font-bold text-teal-400 mb-2'>{clase.materia}</h3>
                                            <p className='text-gray-300 mb-1'>{new Date(clase.horario).toLocaleString('es-ES')}</p>
                                            <p className='text-gray-400 text-sm mb-4'>{clase.student_count} estudiantes</p>
                                            <div className='bg-slate-600 p-4 rounded-lg flex justify-center'>
                                                <img src={`data:image/png;base64,${clase.qr}`} alt="QR" className='w-40 h-40' />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className='text-gray-400 col-span-full'>No hay clases aún. ¡Crea una!</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Vista: Registro de asistencia */}
                    {activeView === 'registro' && (
                        <div>
                            {claseSeleccionada === null ? (
                                <>
                                    <h2 className='text-3xl font-bold text-white mb-8'>Registro de Asistencia</h2>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                        {clases && clases.length > 0 ? (
                                            clases.map((clase) => (
                                                <div key={clase.id} className='bg-slate-700 rounded-lg p-6 border border-slate-600 hover:border-teal-500 transition-all duration-300'>
                                                    <h3 className='text-xl font-bold text-teal-400 mb-4'>{clase.materia}</h3>
                                                    <button
                                                        onClick={() => registroAsistencia(clase.id)}
                                                        className='w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300'
                                                    >
                                                        Ver Asistencia
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className='text-gray-400'>No hay clases aún.</p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className='flex items-center gap-4 mb-8'>
                                        <button
                                            onClick={() => setClaseSeleccionada(null)}
                                            className='px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all duration-300'
                                        >
                                            ← Volver
                                        </button>
                                        <h2 className='text-3xl font-bold text-white'>Asistencia de la Clase</h2>
                                    </div>

                                    <div className='space-y-3'>
                                        {asistencia.asistencia_estudiantes && asistencia.asistencia_estudiantes.length > 0 ? (
                                            asistencia.asistencia_estudiantes.map((estudiante) => (
                                                <div key={estudiante.id} className='bg-slate-700 rounded-lg p-4 border border-slate-600 hover:border-teal-500 transition-all duration-300'>
                                                    <p className='text-teal-400 font-semibold'>{estudiante.nombre} {estudiante.apellido}</p>
                                                    <p className='text-gray-400 text-sm'>{estudiante.email}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className='text-gray-400'>No hay estudiantes registrados en esta clase.</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Vista: Crear clase */}
                    {activeView === 'crear' && (
                        <div>
                            <h2 className='text-3xl font-bold text-white mb-8'>Crear Nueva Clase</h2>
                            <form className='max-w-md bg-slate-700 rounded-lg p-8 border border-slate-600'>
                                <div className='mb-6'>
                                    <label className='block text-sm font-semibold text-gray-300 mb-3'>Nombre de la Materia</label>
                                    <input
                                        type='text'
                                        value={materia}
                                        onChange={(e) => setMateria(e.target.value)}
                                        placeholder='Ej: Matemáticas'
                                        required
                                        className='w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-opacity-20 transition-all'
                                    />
                                </div>

                                <div className='mb-6'>
                                    <label className='block text-sm font-semibold text-gray-300 mb-3'>Horario de la Clase</label>
                                    <input
                                        type='datetime-local'
                                        value={horario}
                                        onChange={(e) => setHorario(e.target.value)}
                                        required
                                        className='w-full px-4 py-3 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-opacity-20 transition-all'
                                    />
                                </div>

                                <button
                                    type='button'
                                    onClick={() => registrarClase(crearClase, materia, horario)}
                                    className='w-full py-3 bg-linear-to-r from-teal-500 to-teal-600 text-white font-bold rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl'
                                >
                                    Crear Clase
                                </button>
                            </form>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}