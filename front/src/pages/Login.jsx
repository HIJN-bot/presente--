//Importamos userState
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config'
import { leerMensajeDeError } from '../errores'

export default function Login() {
    const navigate = useNavigate()
    //Definimos como constantes los endpoints del registro
    const registroEstudiante = `${API_BASE_URL}/api/estudiantes/login`
    const registroDocente = `${API_BASE_URL}/api/docentes/login`
    //Definimos el estado sobre el tipo de usuario
    const [esDocente, setEsDocente] = useState(false)
    //Definimos los valores iniciales de los datos necesarios para el login
    const [email, setEmail] = useState('')
    const [contrasena, setContrasena] = useState('')
    //Mensaje de error que se muestra sobre el formulario cuando el login falla
    const [error, setError] = useState('')
    //Declaramos las funciones para consumir la API de registro dependiendo si es del docente o el estudiante
    // Devolvemos siempre un objeto: { datos } si salio bien, { error } si no.
    const registroUsuario = async (url, datosParaEnviar) => {
        try {
            const respuesta = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datosParaEnviar)
            });

            if (!respuesta.ok) {
                return { error: await leerMensajeDeError(respuesta) }
            }

            return { datos: await respuesta.json() }

        } catch (error) {
            // Aqui solo caen los fallos de red: el servidor no respondio
            console.error("Error al enviar los datos:", error.message)
            return { error: 'No se pudo conectar con el servidor. Revisa tu conexión.' }
        }
    }

    //Declaramos la funcion para manejar el envio del formulario
    const handleSubmit = async (e) => {
        e.preventDefault()
        //Creamos el objeto con los datos del formulario
        const datosUsuario = {
            "email": email,
            "contrasena": contrasena
        }
        //Limpiamos el error anterior antes de volver a intentarlo
        setError('')

        //Validamos el estado de 'esDocente'
        const url = esDocente ? registroDocente : registroEstudiante
        const { datos, error } = await registroUsuario(url, datosUsuario)

        //Si el inicio de sesion fallo mostramos el motivo y no seguimos
        if (error) {
            setError(error)
            return
        }

        localStorage.setItem('token', datos.token)
        localStorage.setItem('role', datos.role)
        localStorage.setItem('user', JSON.stringify(datos.user))

        const idClase = localStorage.getItem('idClase')
        if (idClase != null) {
            localStorage.removeItem('idClase')
            navigate(`/asistencia?clase_id=${idClase}`)
        } else if (datos.role === 'teacher') {
            navigate('/docente')
        } else {
            navigate('/estudiante')
        }
    }
    return (
        <div className='min-h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900'>
            {/*Header de la pagina, contiene el boton para regresar al menu principal y el titulo*/}
            <header className='flex justify-between items-center px-8 py-6 border-b border-slate-700'>
                <h1 className='text-4xl font-bold text-white'>
                    Login
                    <span className='text-teal-400 ml-2'></span>
                </h1>
                <Link to='/'><button className='px-6 py-2 border-2 border-slate-600 text-slate-300 rounded-lg font-semibold hover:bg-slate-700 hover:border-slate-500 transition-all duration-300'>← Volver</button></Link>
            </header>

            {/*Body: Contiene el formulario para el login*/}
            <section className='min-h-screen flex items-center justify-center px-4 py-12'>
                <div className='w-full max-w-md'>
                    {/* Titulo del formulario */}
                    <div className='mb-8 text-center'>
                        <h2 className='text-3xl font-bold text-white mb-2'>Iniciar Sesion</h2>
                        <p className='text-gray-400'>Inicia sesion para usar Presente</p>
                    </div>

                    {/*Toggle Docente/Estudiante*/}
                    <div className='flex gap-3 mb-8 bg-slate-800 p-2 rounded-lg border border-slate-700'>
                        <button
                            onClick={() => setEsDocente(false)}
                            className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-300 ${!esDocente
                                    ? 'bg-teal-500 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Estudiante
                        </button>
                        <button
                            onClick={() => setEsDocente(true)}
                            className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all duration-300 ${esDocente
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Docente
                        </button>
                    </div>

                    {/*Aviso de error: aparece solo cuando el inicio de sesion falla*/}
                    {error && (
                        <div
                            role='alert'
                            className='mb-4 px-4 py-3 bg-red-900/40 border border-red-500/50 rounded-lg text-red-200 text-sm'
                        >
                            {error}
                        </div>
                    )}

                    {/*Formulario de login*/}
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        {/* Email */}
                        <div>
                            <label className='block text-sm font-semibold text-gray-300 mb-2'>Correo Electrónico</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@correo.com"
                                required
                                className='w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-opacity-20 transition-all'
                            />
                        </div>

                        {/* Contraseña */}
                        <div>
                            <label className='block text-sm font-semibold text-gray-300 mb-2'>Contraseña</label>
                            <input
                                type="password"
                                value={contrasena}
                                onChange={(e) => setContrasena(e.target.value)}
                                placeholder="••••••••"
                                required
                                className='w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-opacity-20 transition-all'
                            />
                        </div>

                        {/* Boton de envio del formulario */}
                        <button
                            type='submit'
                            className='w-full py-3 mt-6 bg-linear-to-r from-teal-500 to-teal-600 text-white font-bold rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl'
                        >
                            Iniciar Sesion
                        </button>

                        {/* Link a login */}
                        <p className='text-center text-gray-400 text-sm mt-4'>
                            ¿No tienes cuenta todavia? <Link to='/registro' className='text-teal-400 hover:text-teal-300 font-semibold'>Registrate aquí</Link>
                        </p>
                    </form>
                </div>
            </section>
        </div>
    )
}