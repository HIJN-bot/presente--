import PaginaPublica from '../components/PaginaPublica'
import Boton from '../components/Boton'
import Tarjeta from '../components/Tarjeta'
import ManosLevantadas from '../components/ilustraciones/ManosLevantadas'
import CelularQR from '../components/ilustraciones/CelularQR'

// Textos de la sección "Con Presente" (describen funciones que ya existen).
// "orden" define la posición en móvil, donde las tarjetas se apilan.
const FUNCIONES = [
    {
        titulo: 'Crea tus clases en segundos',
        texto: 'Registra la materia y el horario desde tu panel docente. Presente genera un código QR único para cada clase.',
        clases: 'md:col-start-2 max-md:order-1',
    },
    {
        titulo: 'Tus estudiantes escanean el QR',
        texto: 'Al llegar a clase, cada estudiante escanea el código con su celular y su asistencia queda registrada al instante, sin listas en papel.',
        clases: 'md:col-start-1 max-md:order-3',
    },
    {
        titulo: 'Consulta la asistencia cuando quieras',
        texto: 'Revisa desde tu panel quiénes asistieron a cada clase y mantén tus registros organizados en un solo lugar.',
        clases: 'md:col-start-3 max-md:order-4',
    },
]

export default function Inicio() {
    const [primera, ...resto] = FUNCIONES

    return (
        <PaginaPublica>
            <main>
                {/* Hero: ilustración a la izquierda, mensaje a la derecha (en móvil se apilan) */}
                <section className='mx-auto grid max-w-6xl items-center gap-8 px-4 py-10 sm:px-6 md:grid-cols-2 md:gap-12 md:py-20'>
                    <ManosLevantadas className='mx-auto w-full max-w-md max-md:order-2' />

                    <div className='text-center md:text-left'>
                        <h2 className='font-display text-4xl leading-tight font-bold text-balance sm:text-5xl lg:text-6xl'>
                            Automatiza el proceso de asistencia
                        </h2>
                        <Boton to='/login' className='mt-8 px-10 py-3 text-base'>
                            Iniciar
                        </Boton>
                    </div>
                </section>

                {/* Sección explicativa */}
                <section aria-labelledby='titulo-con-presente' className='border-t border-dashed border-borde'>
                    <div className='mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-20'>
                        <div className='flex items-center justify-center gap-4 sm:gap-8'>
                            <span aria-hidden='true' className='hidden h-16 w-32 shrink-0 rounded-[50%] border border-borde bg-superficie-alt sm:block lg:h-24 lg:w-52' />
                            <h2 id='titulo-con-presente' className='font-display text-3xl font-bold whitespace-nowrap sm:text-4xl lg:text-5xl'>
                                Con Presente
                            </h2>
                            <span aria-hidden='true' className='hidden h-16 w-32 shrink-0 rounded-[50%] border border-borde bg-superficie-alt sm:block lg:h-24 lg:w-52' />
                        </div>

                        <div className='mt-10 grid gap-6 md:mt-14 md:grid-cols-3 md:items-center md:gap-8'>
                            <TarjetaFuncion {...primera} />
                            <TarjetaFuncion {...resto[0]} />
                            <CelularQR className='mx-auto w-full max-w-xs max-md:order-2' />
                            <TarjetaFuncion {...resto[1]} />
                        </div>
                    </div>
                </section>
            </main>
        </PaginaPublica>
    )
}

function TarjetaFuncion({ titulo, texto, clases }) {
    return (
        <Tarjeta as='article' className={clases}>
            <h3 className='font-display text-lg font-bold'>{titulo}</h3>
            <p className='mt-2 leading-relaxed text-texto-suave'>{texto}</p>
        </Tarjeta>
    )
}
