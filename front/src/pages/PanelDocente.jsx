import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../config'
import { obtenerUsuario, cerrarSesion as borrarSesion } from '../sesion'
import PanelLayout from '../components/PanelLayout'
import TituloSeccion from '../components/TituloSeccion'
import TarjetaClase from '../components/TarjetaClase'
import Tarjeta from '../components/Tarjeta'
import CampoTexto from '../components/CampoTexto'
import Boton from '../components/Boton'
import Modal from '../components/Modal'

const SECCIONES = [
    { id: 'clases', etiqueta: 'Clases programadas' },
    { id: 'registro', etiqueta: 'Registro clases' },
    { id: 'crear', etiqueta: 'Crear clase' },
]

export default function PanelDocente() {
    const consultarClase = `${API_BASE_URL}/api/clases/consultar`
    const consultarAsistencia = `${API_BASE_URL}/api/asistencia/consulta`
    const crearClase = `${API_BASE_URL}/api/clases/creacion`
    const eliminarClaseUrl = `${API_BASE_URL}/api/clases/eliminar`

    const [activeView, setActiveView] = useState('clases')
    const [claseSeleccionada, setClaseSeleccionada] = useState(null)
    const [asistencia, setAsistencia] = useState([])
    const [clases, setClases] = useState([])
    const [materia, setMateria] = useState('')
    const [horario, setHorario] = useState('')
    // Clase cuyo QR se muestra en el modal (null = modal cerrado)
    const [claseQR, setClaseQR] = useState(null)

    const usuario = obtenerUsuario()
    const nombre = usuario?.nombre
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

    // El formulario se envía con onSubmit para que el navegador valide los campos requeridos
    const handleCrearClase = (e) => {
        e.preventDefault()
        registrarClase(crearClase, materia, horario)
    }

    const cerrarSesion = () => {
        borrarSesion()
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

    const eliminarClase = async (url, idClase) => {
        try {
            const response = await fetch(`${url}?clase_id=${idClase}`, {
                method: 'DELETE',
            })
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status}`)
            }
            setClases(prev => prev.filter(c => c.id !== idClase))
            alert('Clase eliminada con exito')
        } catch (error) {
            console.error('Hubo un problema con la petición:', error)
            alert('Error al eliminar la clase')
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

    const hayClases = clases && clases.length > 0
    const materiaSeleccionada = clases?.find((c) => c.id === claseSeleccionada)?.materia

    const sinClases = (
        <p className='text-texto-suave'>Aún no tienes clases. Crea la primera desde «Crear clase».</p>
    )

    return (
        <PanelLayout
            titulo='Presente docentes'
            nombre={nombre}
            secciones={SECCIONES}
            seccionActiva={activeView}
            onSeleccionar={setActiveView}
            onCerrarSesion={cerrarSesion}
        >
            {/* Vista: Clases programadas */}
            {activeView === 'clases' && (
                <section>
                    <TituloSeccion>Clases programadas</TituloSeccion>
                    {hayClases ? (
                        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                            {clases.map((clase) => (
                                <TarjetaClase
                                    key={clase.id}
                                    materia={clase.materia}
                                    horario={clase.horario}
                                    detalle={`${clase.student_count} ${clase.student_count === 1 ? 'estudiante' : 'estudiantes'}`}
                                >
                                    <Boton onClick={() => setClaseQR(clase)}>Ver QR</Boton>
                                    <Boton variante='peligro' onClick={() => eliminarClase(eliminarClaseUrl, clase.id)}>
                                        Eliminar
                                    </Boton>
                                </TarjetaClase>
                            ))}
                        </div>
                    ) : sinClases}
                </section>
            )}

            {/* Vista: Registro de asistencia */}
            {activeView === 'registro' && (
                <section>
                    {claseSeleccionada === null ? (
                        <>
                            <TituloSeccion>Registro clases</TituloSeccion>
                            {hayClases ? (
                                <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                                    {clases.map((clase) => (
                                        <TarjetaClase key={clase.id} materia={clase.materia} horario={clase.horario}>
                                            <Boton onClick={() => registroAsistencia(clase.id)}>Asistencia</Boton>
                                        </TarjetaClase>
                                    ))}
                                </div>
                            ) : sinClases}
                        </>
                    ) : (
                        <>
                            <TituloSeccion
                                accion={
                                    <Boton variante='secundario' onClick={() => setClaseSeleccionada(null)}>
                                        ← Volver
                                    </Boton>
                                }
                            >
                                Asistencia · {materiaSeleccionada}
                            </TituloSeccion>

                            {asistencia.asistencia_estudiantes && asistencia.asistencia_estudiantes.length > 0 ? (
                                <ul className='space-y-3'>
                                    {asistencia.asistencia_estudiantes.map((estudiante) => (
                                        <Tarjeta as='li' key={estudiante.id} className='py-4 sm:py-4'>
                                            <p className='font-semibold'>{estudiante.nombre} {estudiante.apellido}</p>
                                            <p className='text-sm break-all text-texto-suave'>{estudiante.email}</p>
                                        </Tarjeta>
                                    ))}
                                </ul>
                            ) : (
                                <p className='text-texto-suave'>No hay estudiantes registrados en esta clase.</p>
                            )}
                        </>
                    )}
                </section>
            )}

            {/* Vista: Crear clase */}
            {activeView === 'crear' && (
                <section>
                    <TituloSeccion>Crear clase</TituloSeccion>
                    <Tarjeta as='form' onSubmit={handleCrearClase} className='mx-auto flex max-w-md flex-col gap-4'>
                        <CampoTexto
                            etiqueta='Nombre clase'
                            type='text'
                            value={materia}
                            onChange={(e) => setMateria(e.target.value)}
                            placeholder='Ej: Matemáticas'
                            required
                        />
                        <CampoTexto
                            etiqueta='Hora / día'
                            type='datetime-local'
                            value={horario}
                            onChange={(e) => setHorario(e.target.value)}
                            required
                        />
                        <Boton type='submit' className='mt-2 self-center px-10'>Crear</Boton>
                    </Tarjeta>
                </section>
            )}

            <Modal abierto={claseQR !== null} onCerrar={() => setClaseQR(null)} titulo={claseQR ? `QR · ${claseQR.materia}` : 'QR'}>
                {claseQR && (
                    <div className='flex flex-col items-center gap-3'>
                        {/* Fondo blanco fijo: el QR debe tener contraste para poder escanearse */}
                        <div className='rounded-2xl bg-white p-4'>
                            <img
                                src={`data:image/png;base64,${claseQR.qr}`}
                                alt={`Código QR de la clase ${claseQR.materia}`}
                                className='size-60 max-w-full'
                            />
                        </div>
                        <p className='text-center text-sm text-texto-suave'>
                            Los estudiantes escanean este código para registrar su asistencia.
                        </p>
                    </div>
                )}
            </Modal>
        </PanelLayout>
    )
}
