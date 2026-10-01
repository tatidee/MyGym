"use client";

import { useRef } from "react";
import { addDays, hoyISO, lunesDe } from "@/lib/fechas";
import { PLAN, POR_DIA } from "@/lib/plan";
import { seriesDe } from "@/lib/entreno";
import type { Sesion } from "@/lib/types";

const LETRAS = ["L", "M", "X", "J", "V", "S", "D"];

/** Series registradas en una fecha sobre las planificadas para ese día (0 a 1). */
export function avanceDe(sesiones: Record<string, Sesion>, fecha: string) {
  const del = Object.values(sesiones).filter((s) => s.fecha === fecha);
  if (!del.length) return 0;
  const total = seriesDe(PLAN[del[0].dia]);
  const hechas = del.reduce((a, s) => a + s.sets.length, 0);
  return Math.min(1, hechas / total);
}

type Props = {
  fecha: string;
  sesiones: Record<string, Sesion>;
  onElegir: (f: string) => void;
};

/**
 * La semana en 7 columnas: 5 altas (días de entreno) y 2 bajas (descanso).
 * Lleno = hecho, contorno naranja = el día elegido, gris = pendiente.
 * Deslizar a los costados cambia de semana.
 */
export default function Semana({ fecha, sesiones, onElegir }: Props) {
  const lunes = lunesDe(fecha);
  const hoy = hoyISO();
  const x0 = useRef<number | null>(null);
  const hechos = [0, 1, 2, 3, 4].filter((i) => avanceDe(sesiones, addDays(lunes, i)) >= 1).length;

  const mover = (dir: number) => {
    const f = addDays(fecha, dir * 7);
    onElegir(f > hoy ? hoy : f);
  };

  return (
    <>
      <div
        className="semana"
        role="group"
        aria-label="Semana"
        onTouchStart={(e) => (x0.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (x0.current == null) return;
          const dx = e.changedTouches[0].clientX - x0.current;
          x0.current = null;
          if (Math.abs(dx) > 50) mover(dx < 0 ? 1 : -1);
        }}
      >
        {LETRAS.map((l, i) => {
          const f = addDays(lunes, i);
          const k = POR_DIA[(i + 1) % 7];
          const elegido = f === fecha;
          const futuro = f > hoy;
          if (!k) {
            return (
              <button key={f} disabled={futuro} onClick={() => onElegir(f)} aria-label={`${l}, descanso`} aria-pressed={elegido}>
                <span className={`col descanso ${elegido ? "elegido" : ""}`} />
                <span className={`letra ${elegido ? "elegido" : ""}`}>{l}</span>
              </button>
            );
          }
          const av = avanceDe(sesiones, f);
          const lleno = av >= 1;
          return (
            <button
              key={f}
              disabled={futuro}
              onClick={() => onElegir(f)}
              aria-pressed={elegido}
              aria-label={`${l}, ${PLAN[k].n}${lleno ? ", hecho" : av > 0 ? ", a medias" : ""}`}
            >
              <span className={`col ${lleno ? "hecho" : ""} ${elegido ? "elegido" : ""}`}>
                {!lleno && av > 0 && <i style={{ height: `${av * 100}%` }} />}
                <span style={!lleno && av > 0.25 ? { color: "var(--bg)" } : undefined}>{PLAN[k].corto}</span>
              </span>
              <span className={`letra ${elegido ? "elegido" : ""}`}>{l}</span>
            </button>
          );
        })}
      </div>
      <div className="semana-pie">
        <span>{hechos} de 5 hechos</span>
        {fecha !== hoy ? (
          <button className="link" style={{ minHeight: 0, padding: 0, color: "var(--acc)" }} onClick={() => onElegir(hoy)}>
            Volver a hoy
          </button>
        ) : (
          <span>Deslizá para otra semana</span>
        )}
      </div>
    </>
  );
}
