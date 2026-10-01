//Importamos userState
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config'
import { leerMensajeDeError } from '../errores'
import PaginaPublica from '../components/PaginaPublica'
import Tarjeta from '../components/Tarjeta'
import CampoTexto from '../components/CampoTexto'
import SelectorRol from '../components/SelectorRol'
import Boton from '../components/Boton'
import Aviso from '../components/Aviso'

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
        <PaginaPublica>
            {/*Body: Contiene el formulario para el login*/}
            <main className='flex justify-center px-4 py-10 sm:py-16'>
                <Tarjeta className='w-full max-w-md'>
                    {/* Titulo del formulario */}
                    <div className='mb-6 text-center'>
                        <h2 className='font-display text-3xl font-bold'>Iniciar sesión</h2>
                        <p className='mt-2 text-texto-suave'>Inicia sesión para usar Presente</p>
                    </div>

                    {/*Toggle Docente/Estudiante*/}
                    <SelectorRol esDocente={esDocente} onCambiar={setEsDocente} />

                    {/*Formulario de login*/}
                    <form onSubmit={handleSubmit} className='mt-6 flex flex-col gap-4'>
                        {/*Aviso de error: aparece solo cuando el inicio de sesion falla*/}
                        <Aviso>{error}</Aviso>

                        <CampoTexto
                            etiqueta='Correo electrónico'
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='tu@correo.com'
                            autoComplete='email'
                            required
                        />

                        <CampoTexto
                            etiqueta='Contraseña'
                            type='password'
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            placeholder='••••••••'
                            autoComplete='current-password'
                            required
                        />

                        {/* Boton de envio del formulario */}
                        <Boton type='submit' className='mt-2 w-full py-3'>Iniciar sesión</Boton>

                        {/* Link a registro */}
                        <p className='text-center text-sm text-texto-suave'>
                            ¿No tienes cuenta todavía? <Link to='/registro' className='font-semibold text-texto underline underline-offset-4'>Regístrate aquí</Link>
                        </p>
                    </form>
                </Tarjeta>
            </main>
        </PaginaPublica>
    )
}
