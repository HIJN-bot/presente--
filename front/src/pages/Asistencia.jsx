import { useEffect, useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import API_BASE_URL from '../config'

export default function Asistencia() {
    const rutaAsistencia = `${API_BASE_URL}/api/asistencia/registro`
    const usuarioString = localStorage.getItem('user')
    const usuario = usuarioString ? JSON.parse(usuarioString) : null
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [estado, setEstado] = useState('cargando')
    const intentoRef = useRef(false)

    useEffect(() => {
        if (intentoRef.current) return
        intentoRef.current = true

        const idClase = searchParams.get('clase_id')
        if (!usuario) {
            navigate('/login')
            return
        }
        registrarAsistencia(idClase, usuario.email)
    }, [])

    const registrarAsistencia = async (idClase, emailEstudiante) => {
        try {
            const response = await fetch(rutaAsistencia, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    'id_clase': idClase,
                    'email_estudiante': emailEstudiante
                })
            })

            if (response.ok) {
                const data = await response.json()
                setEstado('exito')
                setTimeout(() => navigate('/estudiante'), 2000)
            } else {
                setEstado('error')
            }
        } catch (error) {
            console.error('Error:', error)
            setEstado('error')
        }
    }

    return (
        <div className='min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4'>
            <div className='max-w-md w-full'>
                {estado === 'cargando' && (
                    <div className='bg-slate-700 rounded-lg p-8 border border-slate-600 text-center'>
                        <div className='mb-6'>
                            <div className='inline-block'>
                                <div className='w-16 h-16 border-4 border-slate-600 border-t-teal-500 rounded-full animate-spin'></div>
                            </div>
                        </div>
                        <h1 className='text-3xl font-bold text-white mb-2'>Registrando Asistencia</h1>
                        <p className='text-gray-400'>Por favor espera...</p>
                    </div>
                )}

                {estado === 'exito' && (
                    <div className='bg-slate-700 rounded-lg p-8 border border-slate-600 text-center'>
                        <div className='mb-6 text-5xl font-bold text-teal-400'>✓</div>
                        <h1 className='text-3xl font-bold text-teal-400 mb-2'>Asistencia Registrada</h1>
                        <p className='text-gray-400 mb-4'>Tu asistencia ha sido registrada exitosamente.</p>
                        <p className='text-gray-500 text-sm'>Redirigiendo en 2 segundos...</p>
                    </div>
                )}

                {estado === 'error' && (
                    <div className='bg-slate-700 rounded-lg p-8 border border-slate-600 text-center'>
                        <div className='mb-6 text-5xl font-bold text-red-400'>!</div>
                        <h1 className='text-3xl font-bold text-red-400 mb-2'>Error</h1>
                        <p className='text-gray-400 mb-6'>Hubo un problema al registrar tu asistencia.</p>
                        <button
                            onClick={() => navigate('/estudiante')}
                            className='w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-all duration-300'
                        >
                            Volver al Panel
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
