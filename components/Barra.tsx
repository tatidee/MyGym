import { PLAN } from "@/lib/plan";
import type { DiaKey } from "@/lib/types";

/**
 * La semana como una barra olímpica: cada día entrenado carga su disco en ambos lados.
 * Igual que en competencia, los discos van del más pesado (adentro) al más liviano (afuera),
 * y los de 25-10 kg tienen el mismo diámetro: lo que cambia es el grosor.
 */
const ORDEN_DISCOS: DiaKey[] = ["lower", "legs", "upper", "pull", "push"];
const GROSOR: Record<number, number> = { 25: 17, 20: 15, 15: 13, 10: 11, 5: 10 };
const ALTO: Record<number, number> = { 25: 108, 20: 108, 15: 108, 10: 108, 5: 64 };

export default function Barra({ cargados }: { cargados: DiaKey[] }) {
  const cy = 66;
  const set = new Set(cargados);
  let izq = 111;
  let der = 249;
  const discos = ORDEN_DISCOS.map((k) => {
    const { kg, color, tinta } = PLAN[k].disco;
    const w = GROSOR[kg];
    const h = ALTO[kg];
    const xi = izq - w;
    const xd = der;
    izq = xi - 2;
    der = xd + w + 2;
    return { k, kg, color, tinta, w, h, xi, xd, on: set.has(k) };
  });

  return (
    <svg className="barra-svg" viewBox="0 0 360 132" role="img" aria-label={`Semana: ${cargados.length} de 5 días entrenados`}>
      {/* barra */}
      <rect x="4" y={cy - 7} width="352" height="14" rx="3" fill="var(--acero-claro)" />
      <rect x="120" y={cy - 4} width="120" height="8" rx="2" fill="var(--acero)" />
      {Array.from({ length: 13 }, (_, i) => (
        <line key={i} x1={132 + i * 8} y1={cy - 4} x2={128 + i * 8} y2={cy + 4} stroke="var(--acero-claro)" strokeWidth="1" opacity="0.6" />
      ))}
      {/* topes */}
      <rect x="111" y={cy - 16} width="9" height="32" rx="2" fill="var(--acero)" />
      <rect x="240" y={cy - 16} width="9" height="32" rx="2" fill="var(--acero)" />
      {discos.map((d) =>
        [d.xi, d.xd].map((x, lado) =>
          d.on ? (
            <g key={d.k + lado}>
              <rect x={x} y={cy - d.h / 2} width={d.w} height={d.h} rx="3" fill={d.color} stroke="rgba(0,0,0,.22)" strokeWidth="1" />
              <rect x={x + 2} y={cy - d.h / 2 + 6} width="2" height={d.h - 12} rx="1" fill="rgba(255,255,255,.22)" />
              <text
                x={x + d.w / 2}
                y={cy - d.h / 2 + 14}
                fill={d.tinta}
                fontSize="8.5"
                fontWeight="800"
                textAnchor="middle"
                fontFamily="var(--f-body)"
              >
                {d.kg}
              </text>
            </g>
          ) : (
            <rect
              key={d.k + lado}
              x={x + 0.5}
              y={cy - d.h / 2 + 0.5}
              width={d.w - 1}
              height={d.h - 1}
              rx="3"
              fill="none"
              stroke="var(--line)"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          ),
        ),
      )}
    </svg>
  );
}

export function Punto({ k }: { k: DiaKey }) {
  const { kg, color, tinta } = PLAN[k].disco;
  return (
    <span className="punto" style={{ background: color, color: tinta }} aria-hidden="true">
      {kg}
    </span>
  );
}
