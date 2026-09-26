import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config'
import { leerMensajeDeError } from '../errores'
import { obtenerUsuario, cerrarSesion as borrarSesion, fetchConSesion } from '../sesion'
import PanelLayout from '../components/PanelLayout'
import TituloSeccion from '../components/TituloSeccion'
import TarjetaClase from '../components/TarjetaClase'
import Tarjeta from '../components/Tarjeta'
import CampoTexto from '../components/CampoTexto'
import Boton from '../components/Boton'
import Aviso from '../components/Aviso'

const SECCIONES = [
    { id: 'asistencia', etiqueta: 'Asistencia clases' },
    { id: 'notas', etiqueta: 'Notas' },
]

// Hace la petición con el token de sesión y devuelve siempre { datos } o { error }
async function pedir(url, opciones) {
    try {
        const respuesta = await fetchConSesion(url, opciones)
        if (!respuesta.ok) {
            return { error: await leerMensajeDeError(respuesta) }
        }
        return { datos: await respuesta.json() }
    } catch (error) {
        console.error('Error:', error.message)
        return { error: 'No se pudo conectar con el servidor. Revisa tu conexión.' }
    }
}

export default function PanelEstudiante() {
    const navigate = useNavigate()
    const usuario = obtenerUsuario()
    const nombre = usuario?.nombre || 'Estudiante'
    const parametroEmail = `email_estudiante=${encodeURIComponent(usuario?.email ?? '')}`

    const [activeView, setActiveView] = useState('asistencia')
    const [clases, setClases] = useState([])
    const [notas, setNotas] = useState([])
    const [nuevaNota, setNuevaNota] = useState('')
    const [cargando, setCargando] = useState(true)
    const [publicando, setPublicando] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        const cargarDatos = async () => {
            const [historial, notasGuardadas] = await Promise.all([
                pedir(`${API_BASE_URL}/api/asistencia/historial?${parametroEmail}`),
                pedir(`${API_BASE_URL}/api/notas/consultar?${parametroEmail}`),
            ])
            if (Array.isArray(historial.datos)) setClases(historial.datos)
            if (Array.isArray(notasGuardadas.datos)) setNotas(notasGuardadas.datos)
            setError(historial.error || notasGuardadas.error || '')
            setCargando(false)
        }
        cargarDatos()
    }, [parametroEmail])

    const publicarNota = async (e) => {
        e.preventDefault()
        setError('')
        setPublicando(true)
        const { datos, error } = await pedir(`${API_BASE_URL}/api/notas/creacion?${parametroEmail}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contenido: nuevaNota.trim() }),
        })
        setPublicando(false)

        if (error) {
            setError(error)
            return
        }
        setNotas((prev) => [datos, ...prev])
        setNuevaNota('')
    }

    const cerrarSesion = () => {
        borrarSesion()
        navigate('/')
    }

    return (
        <PanelLayout
            titulo='Presente estudiante'
            nombre={nombre}
            secciones={SECCIONES}
            seccionActiva={activeView}
            onSeleccionar={setActiveView}
            onCerrarSesion={cerrarSesion}
        >
            {error && <div className='mb-6'><Aviso>{error}</Aviso></div>}

            {/* Vista: clases a las que el estudiante registró asistencia */}
            {activeView === 'asistencia' && (
                <section>
                    <TituloSeccion>Asistencia clases</TituloSeccion>
                    {cargando ? (
                        <p className='text-texto-suave'>Cargando…</p>
                    ) : clases.length > 0 ? (
                        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                            {clases.map((clase) => (
                                <TarjetaClase
                                    key={clase.id}
                                    materia={clase.materia}
                                    horario={clase.horario}
                                    detalle={`ID de clase: ${clase.id}`}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className='text-texto-suave'>
                            Todavía no has registrado asistencia. Escanea el QR de tu clase para hacerlo.
                        </p>
                    )}
                </section>
            )}

            {/* Vista: notas del estudiante */}
            {activeView === 'notas' && (
                <section>
                    <TituloSeccion>Notas</TituloSeccion>

                    <Tarjeta as='form' onSubmit={publicarNota} className='mx-auto flex max-w-xl flex-col gap-4'>
                        <CampoTexto
                            etiqueta='Deja una nota aquí'
                            multilinea
                            value={nuevaNota}
                            onChange={(e) => setNuevaNota(e.target.value)}
                            placeholder='Escribe tu nota…'
                            maxLength={500}
                            required
                        />
                        <Boton type='submit' disabled={publicando || !nuevaNota.trim()} className='self-center px-10'>
                            {publicando ? 'Publicando…' : 'Publicar'}
                        </Boton>
                    </Tarjeta>

                    {notas.length > 0 && (
                        <ul className='mx-auto mt-8 max-w-xl space-y-3 border-t border-dashed border-borde pt-8'>
                            {notas.map((nota) => (
                                <Tarjeta as='li' key={nota.id} className='py-4 sm:py-4'>
                                    <p className='break-words whitespace-pre-line'>{nota.contenido}</p>
                                    {nota.fecha && (
                                        <p className='mt-2 text-xs text-texto-suave'>
                                            {new Date(nota.fecha).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}
                                        </p>
                                    )}
                                </Tarjeta>
                            ))}
                        </ul>
                    )}
                </section>
            )}
        </PanelLayout>
    )
}
