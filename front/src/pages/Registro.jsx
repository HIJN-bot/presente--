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

export default function Registro() {
    const navigate = useNavigate()
    //Definimos como constantes los endpoints del registro
    const registroEstudiante = `${API_BASE_URL}/api/estudiantes/registro`
    const registroDocente = `${API_BASE_URL}/api/docentes/registro`
    //Definimos el estado sobre el tipo de usuario
    const [esDocente, setEsDocente] = useState(false)
    //Definimos los valores iniciales de los datos necesarios para el registro
    const [nombre, setNombre] = useState('')
    const [apellido, setApellido] = useState('')
    const [email, setEmail] = useState('')
    const [contrasena, setContrasena] = useState('')
    //Mensaje de error que se muestra sobre el formulario cuando el registro falla
    const [error, setError] = useState('')
    //Declaramos las funciones para consumir la API de registro dependiendo si es del docente o el estudiante
    // Devolvemos siempre un objeto: { datos } si salio bien, { error } si no.
    // Asi el motivo real del fallo llega hasta el usuario en lugar de perderse
    // en la consola.
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
            "nombre": nombre,
            "apellido": apellido,
            "email": email,
            "contrasena": contrasena
        }
        //Limpiamos el error anterior antes de volver a intentarlo
        setError('')

        //Validamos el estado de 'esDocente'
        const url = esDocente ? registroDocente : registroEstudiante
        const { datos, error } = await registroUsuario(url, datosUsuario)

        //Si el registro fallo mostramos el motivo concreto y no seguimos
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
            {/*Body: Contiene el formulario para el registro*/}
            <main className='flex justify-center px-4 py-10 sm:py-16'>
                <Tarjeta className='w-full max-w-md'>
                    {/* Titulo del formulario */}
                    <div className='mb-6 text-center'>
                        <h2 className='font-display text-3xl font-bold'>Crea tu cuenta</h2>
                        <p className='mt-2 text-texto-suave'>Únete a Presente y controla tu asistencia</p>
                    </div>

                    {/*Toggle Docente/Estudiante*/}
                    <SelectorRol esDocente={esDocente} onCambiar={setEsDocente} />

                    {/*Formulario de registro*/}
                    <form onSubmit={handleSubmit} className='mt-6 flex flex-col gap-4'>
                        {/*Aviso de error: aparece solo cuando el registro falla*/}
                        <Aviso>{error}</Aviso>

                        <div className='grid gap-4 sm:grid-cols-2'>
                            <CampoTexto
                                etiqueta='Nombre'
                                type='text'
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder='Tu nombre'
                                autoComplete='given-name'
                                required
                            />
                            <CampoTexto
                                etiqueta='Apellido'
                                type='text'
                                value={apellido}
                                onChange={(e) => setApellido(e.target.value)}
                                placeholder='Tu apellido'
                                autoComplete='family-name'
                                required
                            />
                        </div>

                        <CampoTexto
                            etiqueta='Correo electrónico'
                            type='email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='tu@correo.com'
                            autoComplete='email'
                            required
                        />

                        {/* Mismos limites que valida el Back-End, para que el
                            navegador avise antes de enviar el formulario */}
                        <CampoTexto
                            etiqueta='Contraseña'
                            type='password'
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            placeholder='••••••••'
                            autoComplete='new-password'
                            required
                            minLength={8}
                            maxLength={72}
                            ayuda='Mínimo 8 caracteres'
                        />

                        {/* Boton de envio del formulario */}
                        <Boton type='submit' className='mt-2 w-full py-3'>Crear cuenta</Boton>

                        {/* Link a login */}
                        <p className='text-center text-sm text-texto-suave'>
                            ¿Ya tienes cuenta? <Link to='/login' className='font-semibold text-texto underline underline-offset-4'>Inicia sesión aquí</Link>
                        </p>
                    </form>
                </Tarjeta>
            </main>
        </PaginaPublica>
    )
}
