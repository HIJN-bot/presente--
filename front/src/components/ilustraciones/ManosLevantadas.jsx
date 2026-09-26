// Ilustración del hero: manos levantadas en clase.
// Cada mano se dibuja dos veces (contorno grueso debajo y relleno encima)
// para que las piezas que se superponen se vean como una sola silueta.

const MANOS = [
    { x: 95, y: 150, giro: -14, escala: 0.8 },
    { x: 305, y: 145, giro: 12, escala: 0.8 },
    { x: 150, y: 110, giro: -4, escala: 1 },
    { x: 250, y: 118, giro: 8, escala: 0.95 },
    { x: 200, y: 175, giro: 2, escala: 0.9 },
]

function PiezasMano() {
    return (
        <>
            {/* Brazo */}
            <rect x='-15' y='28' width='30' height='130' rx='13' />
            {/* Palma */}
            <rect x='-23' y='-8' width='46' height='50' rx='17' />
            {/* Dedos */}
            <rect x='-23' y='-40' width='11' height='44' rx='5.5' />
            <rect x='-10.5' y='-52' width='11' height='56' rx='5.5' />
            <rect x='2' y='-47' width='11' height='51' rx='5.5' />
            <rect x='13.5' y='-33' width='9.5' height='38' rx='4.75' />
            {/* Pulgar */}
            <rect x='-33' y='2' width='12' height='32' rx='6' transform='rotate(-32 -22 32)' />
        </>
    )
}

export default function ManosLevantadas({ className = '' }) {
    return (
        <svg viewBox='0 0 400 300' className={className} role='img' aria-label='Estudiantes levantando la mano en clase'>
            <defs>
                {/* Todo lo que queda por debajo del pupitre se recorta */}
                <clipPath id='manos-sobre-pupitre'>
                    <rect x='0' y='0' width='400' height='290' />
                </clipPath>
            </defs>

            <g clipPath='url(#manos-sobre-pupitre)'>
                <ellipse cx='200' cy='175' rx='175' ry='135' fill='var(--superficie-alt)' />

                {MANOS.map(({ x, y, giro, escala }, i) => (
                    <g key={i} transform={`translate(${x} ${y}) rotate(${giro}) scale(${escala})`}>
                        <g fill='var(--texto)' stroke='var(--texto)' strokeWidth='6' strokeLinejoin='round'>
                            <PiezasMano />
                        </g>
                        <g fill='var(--superficie)'>
                            <PiezasMano />
                        </g>
                    </g>
                ))}
            </g>

            {/* Línea del pupitre */}
            <line x1='30' y1='290' x2='370' y2='290' stroke='var(--texto)' strokeWidth='4' strokeLinecap='round' />
        </svg>
    )
}
