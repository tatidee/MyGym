"use client";

import { useState } from "react";
import { Punto } from "./Barra";
import { ddmm, fmt, num } from "@/lib/fechas";
import { setsTxt, tocoTope } from "@/lib/informe";
import { CALENTAMIENTO_HOMBRO, ORDEN, PLAN } from "@/lib/plan";
import type { DiaKey, Ejercicio, SetLog } from "@/lib/types";
import { claveSesion, sesionesDe, ultimaAntes, type GymData } from "@/lib/useGymData";

type Props = { data: GymData; fecha: string; dia: DiaKey; setDia: (k: DiaKey) => void; avisar: (m: string) => void };

export default function Rutina({ data, fecha, dia, setDia, avisar }: Props) {
  const plan = PLAN[dia];
  return (
    <>
      <h1 className="titulo">{plan.n}</h1>
      <div className="dias" role="group" aria-label="Día de rutina">
        {ORDEN.map((k) => (
          <button key={k} className="dia-btn" aria-pressed={k === dia} onClick={() => setDia(k)}>
            <Punto k={k} />
            {PLAN[k].n}
          </button>
        ))}
      </div>
      <p className="lede chico">
        Se guarda en la fecha {ddmm(fecha)}. En gris ves lo que hiciste la última vez. Cuando todas las series llegan al tope del rango, subí 2,5 kg en barra o 1-2 kg en mancuerna.
      </p>
      {plan.calentarHombro ? (
        <Calentamiento key={fecha + dia} />
      ) : (
        <p className="muted chico">Antes del primer ejercicio: 2 series de aproximación (8 reps al 50% y 4 al 75% del peso de trabajo).</p>
      )}
      {plan.ej.map((ex) => (
        <Tarjeta key={fecha + ex.id} ex={ex} data={data} fecha={fecha} dia={dia} color={plan.disco.color} avisar={avisar} />
      ))}
      <p className="muted chico">
        Hombro: si una serie duele más de 3/10, o el dolor sigue al día siguiente, bajá peso o rango y anotalo en Hoy.
      </p>
    </>
  );
}

function Calentamiento() {
  const [hecho, setHecho] = useState<boolean[]>(() => CALENTAMIENTO_HOMBRO.map(() => false));
  const listos = hecho.filter(Boolean).length;
  return (
    <section className="panel" aria-label="Calentamiento de hombro">
      <div className="entre">
        <h2 className="subtitulo">Calentamiento de hombro</h2>
        <span className={`pastilla ${listos === hecho.length ? "ok" : "neutra"} num`}>
          {listos === hecho.length ? "Listo" : `${listos} de ${hecho.length} · 5 min`}
        </span>
      </div>
      <div>
        {CALENTAMIENTO_HOMBRO.map((c, i) => (
          <label key={c.n} className="check">
            <input
              type="checkbox"
              id={`calentamiento-${i}`}
              checked={hecho[i]}
              onChange={(e) => setHecho(hecho.map((v, j) => (j === i ? e.target.checked : v)))}
            />
            <span className="crece">
              {c.n}
              {c.nota && <span className="muted chico" style={{ display: "block" }}>{c.nota}</span>}
            </span>
            <span className="muted chico num">{c.dosis}</span>
          </label>
        ))}
      </div>
    </section>
  );
}

function Tarjeta({ ex, data, fecha, dia, color, avisar }: { ex: Ejercicio; data: GymData; fecha: string; dia: DiaKey; color: string; avisar: (m: string) => void }) {
  const hoy = data.sesiones[claveSesion(fecha, ex.id)];
  const ult = ultimaAntes(data.sesiones, ex.id, fecha);
  const hist = sesionesDe(data.sesiones, ex.id).filter((s) => s.fecha !== fecha).slice(0, 3);
  const [kg, setKg] = useState<string[]>(() => Array.from({ length: ex.s }, (_, i) => (hoy?.sets[i]?.kg != null ? fmt(hoy.sets[i].kg) : "")));
  const [reps, setReps] = useState<string[]>(() => Array.from({ length: ex.s }, (_, i) => (hoy?.sets[i] ? String(hoy.sets[i].reps) : "")));
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    const sets: SetLog[] = [];
    for (let i = 0; i < ex.s; i++) {
      const r = num(reps[i]);
      if (r == null) continue;
      const k = ex.sinPeso ? null : num(kg[i]);
      if (!ex.sinPeso && k == null) return avisar(`Falta el peso en la serie ${i + 1}.`);
      sets.push({ kg: k, reps: Math.round(r) });
    }
    if (!sets.length) return avisar("Cargá al menos una serie con repeticiones.");
    setGuardando(true);
    const ok = await data.guardarSesion(fecha, dia, ex.id, sets);
    setGuardando(false);
    if (ok) avisar(`Guardado: ${ex.n}`);
  }

  const upd = (arr: string[], set: (a: string[]) => void, i: number, v: string) => {
    const c = [...arr];
    c[i] = v;
    set(c);
  };

  return (
    <article className={`ej ${hoy ? "guardado" : ""}`} style={{ ["--color-dia" as string]: color }}>
      <div className="ej-cabeza">
        <div className="entre">
          <h2 className="ej-nombre">{ex.n}</h2>
          {hoy && <span className="pastilla ok">Guardado</span>}
        </div>
        <div className="receta">
          <span>{ex.s} series</span>
          <span>{ex.r[0]}-{ex.r[1]} {ex.u ?? "reps"}</span>
          <span>RIR {ex.rir}</span>
        </div>
        {ex.nota && <p className="ej-nota">{ex.nota}</p>}
        {ult && (
          <div className="fila chico">
            <span className="muted num">Última ({ddmm(ult.fecha)}): {setsTxt(ult, ex)}</span>
            {tocoTope(ult, ex) && !ex.sinPeso && <span className="pastilla aviso">Llegaste al tope: subí carga</span>}
          </div>
        )}
      </div>
      <div className="ej-cuerpo">
        {Array.from({ length: ex.s }, (_, i) => {
          const prev = ult?.sets[i];
          return (
            <div className="serie" key={i}>
              <span className="n">Serie {i + 1}</span>
              {ex.sinPeso ? (
                <span className="muted chico">peso corporal</span>
              ) : (
                <input
                  id={`kg-${ex.id}-${i}`}
                  inputMode="decimal"
                  aria-label={`Kilos, serie ${i + 1}`}
                  placeholder={prev?.kg != null ? fmt(prev.kg) : "kg"}
                  value={kg[i]}
                  onChange={(e) => upd(kg, setKg, i, e.target.value)}
                />
              )}
              <span className="por">×</span>
              <input
                id={`r-${ex.id}-${i}`}
                inputMode="numeric"
                aria-label={`${ex.u ?? "Repeticiones"}, serie ${i + 1}`}
                placeholder={prev ? String(prev.reps) : ex.u ?? "reps"}
                value={reps[i]}
                onChange={(e) => upd(reps, setReps, i, e.target.value)}
              />
            </div>
          );
        })}
        <div className="fila">
          <button className="btn fuerte chico" onClick={guardar} disabled={guardando}>
            {guardando ? "Guardando…" : hoy ? "Actualizar series" : "Guardar series"}
          </button>
          {hoy && (
            <button
              className="btn suelto chico"
              onClick={() => {
                data.borrarSesion(fecha, ex.id);
                setKg(Array(ex.s).fill(""));
                setReps(Array(ex.s).fill(""));
                avisar("Borrado");
              }}
            >
              Borrar
            </button>
          )}
        </div>
        {hist.length > 0 && (
          <div className="historial">
            {hist.map((h) => (
              <span key={h.fecha}>{ddmm(h.fecha)} · {setsTxt(h, ex)}</span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
