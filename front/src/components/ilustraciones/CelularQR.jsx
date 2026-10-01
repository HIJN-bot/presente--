// Ilustración de la sección "Con Presente": un celular escaneando el QR de una clase.

const TAMANO_QR = 11

// Módulos de un QR decorativo (no codifica nada). Se generan una sola vez con
// un pseudoaleatorio de semilla fija para que el dibujo sea siempre el mismo.
const MODULOS_QR = (() => {
    let semilla = 7
    const siguiente = () => {
        semilla = (semilla * 16807) % 2147483647
        return semilla / 2147483647
    }
    const esBuscador = (f, c) =>
        (f < 4 && c < 4) || (f < 4 && c >= TAMANO_QR - 4) || (f >= TAMANO_QR - 4 && c < 4)

    const modulos = []
    for (let f = 0; f < TAMANO_QR; f++) {
        for (let c = 0; c < TAMANO_QR; c++) {
            if (!esBuscador(f, c) && siguiente() > 0.5) modulos.push([f, c])
        }
    }
    return modulos
})()

function CodigoQR({ x, y, tamano }) {
    const m = tamano / TAMANO_QR
    const buscadores = [[0, 0], [0, TAMANO_QR - 3], [TAMANO_QR - 3, 0]]

    return (
        <g transform={`translate(${x} ${y})`} fill='var(--texto)'>
            {buscadores.map(([f, c]) => (
                <g key={`${f}-${c}`}>
                    <rect x={c * m} y={f * m} width={m * 3} height={m * 3} rx={m * 0.6} />
                    <rect x={c * m + m * 0.6} y={f * m + m * 0.6} width={m * 1.8} height={m * 1.8} rx={m * 0.4} fill='var(--superficie)' />
                    <rect x={c * m + m} y={f * m + m} width={m} height={m} />
                </g>
            ))}
            {MODULOS_QR.map(([f, c]) => (
                <rect key={`${f}-${c}`} x={c * m} y={f * m} width={m * 0.9} height={m * 0.9} rx={m * 0.2} />
            ))}
        </g>
    )
}

export default function CelularQR({ className = '' }) {
    return (
        <svg viewBox='0 0 320 300' className={className} role='img' aria-label='Celular escaneando el código QR de una clase'>
            <circle cx='160' cy='150' r='135' fill='var(--superficie-alt)' />

            {/* Hoja con el QR de la clase */}
            <g transform='rotate(-8 105 160)'>
                <rect x='40' y='80' width='130' height='160' rx='18' fill='var(--superficie)' stroke='var(--texto)' strokeWidth='4' />
                <CodigoQR x={62} y={102} tamano={86} />
                <rect x='62' y='204' width='86' height='8' rx='4' fill='var(--borde)' />
                <rect x='62' y='218' width='56' height='8' rx='4' fill='var(--borde)' />
            </g>

            {/* Celular */}
            <g transform='rotate(10 225 150)'>
                <rect x='168' y='50' width='112' height='210' rx='22' fill='var(--texto)' />
                <rect x='176' y='66' width='96' height='178' rx='14' fill='var(--superficie)' />
                <rect x='208' y='56' width='32' height='5' rx='2.5' fill='var(--superficie)' />

                {/* Visor de la cámara */}
                <g fill='none' stroke='var(--texto)' strokeWidth='4' strokeLinecap='round'>
                    <path d='M190 104v-14h14M258 104v-14h-14M190 158v14h14M258 158v14h-14' />
                </g>
                <CodigoQR x={200} y={106} tamano={48} />
                <line x1='186' y1='131' x2='262' y2='131' stroke='var(--peligro)' strokeWidth='3' strokeLinecap='round' />

                {/* Confirmación */}
                <circle cx='224' cy='210' r='16' fill='var(--exito)' />
                <path d='M216 210l6 6 11-12' fill='none' stroke='var(--superficie)' strokeWidth='4' strokeLinecap='round' strokeLinejoin='round' />
            </g>
        </svg>
    )
}
