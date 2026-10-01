import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import API_BASE_URL from '../config'
import { obtenerUsuario, obtenerToken, fetchConSesion } from '../sesion'
import PaginaPublica from '../components/PaginaPublica'
import Tarjeta from '../components/Tarjeta'
import Boton from '../components/Boton'

export default function Asistencia() {
    const rutaAsistencia = `${API_BASE_URL}/api/asistencia/registro`
    const usuario = obtenerUsuario()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [estado, setEstado] = useState('cargando')
    const intentoRef = useRef(false)

    useEffect(() => {
        const registrarAsistencia = async (idClase, emailEstudiante) => {
            try {
                const response = await fetchConSesion(rutaAsistencia, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        'id_clase': idClase,
                        'email_estudiante': emailEstudiante
                    })
                })

                // Con 401 fetchConSesion ya llevó al login: conservamos la clase
                // guardada para registrar la asistencia al volver a iniciar sesión
                if (response.status === 401) return
                localStorage.removeItem('idClase')

                if (response.ok) {
                    setEstado('exito')
                    setTimeout(() => navigate('/estudiante'), 2000)
                } else {
                    setEstado('error')
                }
            } catch (error) {
                console.error('Error:', error)
                localStorage.removeItem('idClase')
                setEstado('error')
            }
        }

        if (intentoRef.current) return
        intentoRef.current = true

        const idClase = searchParams.get('clase_id')
        // Guardamos la clase por si hay que iniciar sesión antes de registrar
        // (sin sesión o con la sesión vencida); Login la retoma al terminar
        localStorage.setItem('idClase', idClase)
        if (!usuario || !obtenerToken()) {
            navigate('/login')
            return
        }
        registrarAsistencia(idClase, usuario.email)
    }, [])

    return (
        <PaginaPublica>
            <main className='flex justify-center px-4 py-16'>
                <Tarjeta className='w-full max-w-md text-center' aria-live='polite'>
                    {estado === 'cargando' && (
                        <>
                            <div className='mx-auto mb-6 size-16 animate-spin rounded-full border-4 border-borde border-t-acento' />
                            <h2 className='font-display text-3xl font-bold'>Registrando asistencia</h2>
                            <p className='mt-2 text-texto-suave'>Por favor espera...</p>
                        </>
                    )}

                    {estado === 'exito' && (
                        <>
                            <div className='mx-auto mb-6 grid size-16 place-items-center rounded-full bg-exito/15 text-4xl font-bold text-exito'>✓</div>
                            <h2 className='font-display text-3xl font-bold'>Asistencia registrada</h2>
                            <p className='mt-2 text-texto-suave'>Tu asistencia ha sido registrada exitosamente.</p>
                            <p className='mt-4 text-sm text-texto-suave'>Redirigiendo en 2 segundos...</p>
                        </>
                    )}

                    {estado === 'error' && (
                        <>
                            <div className='mx-auto mb-6 grid size-16 place-items-center rounded-full bg-peligro/15 text-4xl font-bold text-peligro'>!</div>
                            <h2 className='font-display text-3xl font-bold'>Error</h2>
                            <p className='mt-2 mb-6 text-texto-suave'>Hubo un problema al registrar tu asistencia.</p>
                            <Boton onClick={() => navigate('/estudiante')} className='w-full py-3'>
                                Volver al panel
                            </Boton>
                        </>
                    )}
                </Tarjeta>
            </main>
        </PaginaPublica>
    )
}
