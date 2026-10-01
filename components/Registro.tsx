"use client";

import { useState } from "react";
import { addDays, ddmm, fmt, hoyISO, parseISO } from "@/lib/fechas";
import { ALTURA_CM, CINTURA_META, COMIDAS, NOM_SEMANA, PLAN } from "@/lib/plan";
import { diaEntrenado, type GymData } from "@/lib/useGymData";

export default function Registro({ data }: { data: GymData }) {
  const fechas = Array.from({ length: 14 }, (_, i) => addDays(hoyISO(), -i));
  const pesos = Object.values(data.dias)
    .filter((d) => d.peso != null)
    .sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
    .slice(-60)
    .map((d) => ({ fecha: d.fecha, v: d.peso as number }));
  const cinturas = Object.values(data.dias)
    .filter((d) => d.cintura != null)
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
    .slice(0, 6);
  const hayAlgo = fechas.some((f) => data.dias[f] || diaEntrenado(data.sesiones, f));

  return (
    <>
      <h1 className="titulo">Registro</h1>

      <section className="panel" aria-label="Peso corporal">
        <div className="entre">
          <h2 className="subtitulo">Peso en ayunas</h2>
          {pesos.length > 0 && <span className="etiqueta num">Último: {fmt(pesos[pesos.length - 1].v)} kg</span>}
        </div>
        {pesos.length >= 2 ? (
          <GraficoPeso puntos={pesos} />
        ) : (
          <p className="vacio" style={{ margin: 0 }}>
            Con dos pesajes aparece la curva. Pesate en ayunas, después del baño, y cargalo en Hoy.
          </p>
        )}
      </section>

      <section className="panel" aria-label="Cintura">
        <div className="entre">
          <h2 className="subtitulo">Cintura</h2>
          <span className="etiqueta num">Meta {CINTURA_META} cm</span>
        </div>
        {cinturas.length ? (
          <div className="historial" style={{ fontSize: 15 }}>
            {cinturas.map((c) => (
              <span key={c.fecha}>
                {ddmm(c.fecha)} · <b>{fmt(c.cintura)} cm</b> · cintura/altura {fmt((c.cintura as number) / ALTURA_CM, 2)}
              </span>
            ))}
          </div>
        ) : (
          <p className="muted chico" style={{ margin: 0 }}>Medila una vez por semana, el mismo día y en ayunas.</p>
        )}
      </section>

      <h2 className="subtitulo">Últimos 14 días</h2>
      {!hayAlgo && (
        <p className="vacio">Todavía no hay registros. Empezá en Hoy: sumá agua, marcá el baño o guardá tu peso, y en Rutina cargá tus series.</p>
      )}
      <div className="tabla-caja">
        <table>
          <thead>
            <tr><th>Día</th><th>Entreno</th><th>Agua</th><th>Baño (tipos)</th><th>Peso</th><th>Hombro</th><th>Comidas</th></tr>
          </thead>
          <tbody>
            {fechas.map((f) => {
              const d = data.dias[f];
              const k = diaEntrenado(data.sesiones, f);
              const b = d?.banos ?? [];
              return (
                <tr key={f}>
                  <td>{NOM_SEMANA[parseISO(f).getDay()].slice(0, 3)} {ddmm(f)}</td>
                  <td>{k ? PLAN[k].n : "—"}</td>
                  <td>{d?.agua ? `${fmt(d.agua / 1000, 2)} L` : "—"}</td>
                  <td>{b.length ? `${b.length} (${b.map((x) => x.t).join(", ")})` : "0"}</td>
                  <td>{d?.peso != null ? fmt(d.peso) : "—"}</td>
                  <td>{d?.hombro != null ? `${d.hombro}/10` : "—"}</td>
                  <td>{COMIDAS.filter((c) => d?.comidas?.[c.id]).length}/{COMIDAS.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* Una sola serie: el título del panel la nombra, no necesita leyenda. Eje x proporcional a las fechas. */
function GraficoPeso({ puntos }: { puntos: { fecha: string; v: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 340, H = 180, ml = 34, mr = 14, mt = 14, mb = 26;
  const t0 = parseISO(puntos[0].fecha).getTime();
  const t1 = parseISO(puntos[puntos.length - 1].fecha).getTime();
  const vals = puntos.map((p) => p.v);
  const lo = Math.floor(Math.min(...vals) - 0.5);
  const hi = Math.ceil(Math.max(...vals) + 0.5);
  const paso = hi - lo > 6 ? 2 : 1;
  const ticks: number[] = [];
  for (let y = Math.ceil(lo / paso) * paso; y <= hi; y += paso) ticks.push(y);
  const x = (f: string) => ml + ((parseISO(f).getTime() - t0) / Math.max(1, t1 - t0)) * (W - ml - mr);
  const y = (v: number) => mt + (1 - (v - lo) / (hi - lo)) * (H - mt - mb);
  const linea = puntos.map((p, i) => `${i ? "L" : "M"}${x(p.fecha).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const ultimo = puntos[puntos.length - 1];

  function mover(e: React.PointerEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    let mejor = 0;
    puntos.forEach((p, i) => {
      if (Math.abs(x(p.fecha) - px) < Math.abs(x(puntos[mejor].fecha) - px)) mejor = i;
    });
    setHover(mejor);
  }

  const h = hover != null ? puntos[hover] : null;
  return (
    <div className="grafico">
      <svg viewBox={`0 0 ${W} ${H}`} onPointerMove={mover} onPointerDown={mover} onPointerLeave={() => setHover(null)} role="img" aria-label={`Peso de ${ddmm(puntos[0].fecha)} a ${ddmm(ultimo.fecha)}: de ${fmt(puntos[0].v)} a ${fmt(ultimo.v)} kg`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={ml} x2={W - mr} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth="1" />
            <text x={ml - 6} y={y(t) + 4} fontSize="11" textAnchor="end" fill="var(--muted)" fontFamily="var(--f-body)">{t}</text>
          </g>
        ))}
        <text x={ml} y={H - 6} fontSize="11" fill="var(--muted)" fontFamily="var(--f-body)">{ddmm(puntos[0].fecha)}</text>
        <text x={W - mr} y={H - 6} fontSize="11" fill="var(--muted)" textAnchor="end" fontFamily="var(--f-body)">{ddmm(ultimo.fecha)}</text>
        <path d={linea} fill="none" stroke="var(--disco-20)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {h && <line x1={x(h.fecha)} x2={x(h.fecha)} y1={mt} y2={H - mb} stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 3" />}
        {puntos.map((p, i) => (
          <circle key={p.fecha} cx={x(p.fecha)} cy={y(p.v)} r={i === puntos.length - 1 || i === hover ? 5 : 3}
            fill={i === puntos.length - 1 || i === hover ? "var(--disco-20)" : "var(--surface)"} stroke="var(--disco-20)" strokeWidth="2" />
        ))}
        <rect x={ml} y={mt} width={W - ml - mr} height={H - mt - mb} fill="transparent" />
      </svg>
      {h && (
        <div className="tooltip" style={{ left: `${(x(h.fecha) / W) * 100}%`, top: `${(y(h.v) / H) * 100}%` }}>
          {ddmm(h.fecha)} · {fmt(h.v)} kg
        </div>
      )}
    </div>
  );
}
