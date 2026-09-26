import mano from '../../assets/mano-asset.png'

// Ilustración del hero: manos levantadas en clase, con la misma disposición del
// boceto (front/designs/homepage-presente.jpg): dos manos atrás y más arriba
// (centro y derecha) y tres adelante. Cada mano es el asset mano-asset.png con
// un brazo debajo que usa la textura del propio asset y baja hasta el pupitre.

// Medidas del asset en px: tamaño total y caja de la palma visible
const ASSET = { ancho: 435, alto: 437 }
const PALMA = { x: 45, y: 39, ancho: 347, alto: 387 }
const CENTRO_PALMA = PALMA.x + PALMA.ancho / 2
// Brazo centrado en la muñeca del asset (que está corrida hacia el meñique)
const BRAZO = { x: 172, y: 360, ancho: 150, alto: 1400 }
// Zona opaca de la palma que se repite como textura del brazo
const TEXTURA = { x: 170, y: 260, ancho: 150, alto: 130 }

// Línea del pupitre: todo lo que queda por debajo se recorta
const PUPITRE_Y = 560

// Posiciones tomadas del boceto. cx/arriba: centro y borde superior de la palma;
// ancho: ancho de la palma; giro en grados; espejo: pulgar hacia la derecha;
// atras: se dibuja un poco más oscura para dar profundidad.
// El orden es el de dibujo: primero las de atrás.
const MANOS = [
    { cx: 395, arriba: 40, ancho: 175, giro: -6, espejo: true, atras: true },
    { cx: 650, arriba: 95, ancho: 165, giro: 8, espejo: false, atras: true },
    { cx: 130, arriba: 262, ancho: 165, giro: -8, espejo: true },
    { cx: 335, arriba: 232, ancho: 175, giro: 3, espejo: false },
    { cx: 525, arriba: 275, ancho: 170, giro: 7, espejo: true },
]

function transformacion({ cx, arriba, ancho, giro, espejo }) {
    const escala = ancho / PALMA.ancho
    const munecaY = PALMA.alto * escala
    // Gira sobre la muñeca, refleja si hace falta y ubica la palma en (cx, arriba)
    return `translate(${cx} ${arriba}) rotate(${giro} 0 ${munecaY}) `
        + `scale(${espejo ? -escala : escala} ${escala}) translate(${-CENTRO_PALMA} ${-PALMA.y})`
}

export default function ManosLevantadas({ className = '' }) {
    return (
        <svg viewBox='20 20 760 560' className={className} role='img' aria-label='Estudiantes levantando la mano en clase'>
            <defs>
                <pattern id='manos-textura' patternUnits='userSpaceOnUse' width={TEXTURA.ancho} height={TEXTURA.alto}>
                    <image href={mano} x={-TEXTURA.x} y={-TEXTURA.y} width={ASSET.ancho} height={ASSET.alto} />
                </pattern>
                <clipPath id='manos-sobre-pupitre'>
                    <rect x='0' y='0' width='800' height={PUPITRE_Y} />
                </clipPath>
                {/* Sombra suave para separar las manos que se superponen */}
                <filter id='manos-sombra' x='-20%' y='-20%' width='140%' height='140%'>
                    <feDropShadow dx='0' dy='6' stdDeviation='6' floodColor='#1e1036' floodOpacity='0.35' />
                </filter>
                {/* Las manos de atrás, un poco más oscuras */}
                <filter id='manos-sombra-atras' x='-20%' y='-20%' width='140%' height='140%'>
                    <feComponentTransfer in='SourceGraphic' result='oscura'>
                        <feFuncR type='linear' slope='0.78' />
                        <feFuncG type='linear' slope='0.78' />
                        <feFuncB type='linear' slope='0.82' />
                    </feComponentTransfer>
                    <feDropShadow in='oscura' dx='0' dy='6' stdDeviation='6' floodColor='#1e1036' floodOpacity='0.35' />
                </filter>
                <g id='manos-mano'>
                    <rect x={BRAZO.x} y={BRAZO.y} width={BRAZO.ancho} height={BRAZO.alto} rx={BRAZO.ancho / 2} fill='url(#manos-textura)' />
                    <image href={mano} width={ASSET.ancho} height={ASSET.alto} />
                </g>
            </defs>

            <g clipPath='url(#manos-sobre-pupitre)'>
                {MANOS.map((datos, i) => (
                    <use
                        key={i}
                        href='#manos-mano'
                        transform={transformacion(datos)}
                        filter={datos.atras ? 'url(#manos-sombra-atras)' : 'url(#manos-sombra)'}
                    />
                ))}
            </g>

            {/* Línea del pupitre */}
            <line x1='30' y1={PUPITRE_Y} x2='770' y2={PUPITRE_Y} stroke='var(--texto)' strokeWidth='6' strokeLinecap='round' />
        </svg>
    )
}
