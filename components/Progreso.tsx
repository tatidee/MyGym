"use client";

import { useState } from "react";
import { avanceDe } from "./Semana";
import { addDays, ddmm, fmt, hoyISO, lunesDe, parseISO } from "@/lib/fechas";
import { tocoTope } from "@/lib/informe";
import { ALTURA_CM, CINTURA_META, ORDEN, PLAN, POR_DIA } from "@/lib/plan";
import { subaKg } from "@/lib/entreno";
import type { Dia, Ejercicio, Sesion } from "@/lib/types";
import { sesionesDe, type GymData } from "@/lib/useGymData";

const signo = (n: number) => (n > 0 ? "+" : n < 0 ? "−" : "±");

export default function Progreso({ data, abrirInforme }: { data: GymData; abrirInforme: () => void }) {
  const [rango, setRango] = useState<14 | 56>(14);
  const hoy = hoyISO();
  const desde = addDays(hoy, -(rango - 1));
  const dias = Object.values(data.dias);

  return (
    <>
      <div className="cabeza-titulo">
        <h1 className="titulo">Progreso</h1>
        <div className="seg" role="group" aria-label="Período">
          <button aria-pressed={rango === 14} onClick={() => setRango(14)}>14 d</button>
          <button aria-pressed={rango === 56} onClick={() => setRango(56)}>8 sem</button>
        </div>
      </div>

      <div className="pila grilla" style={{ marginTop: 18 }}>
        <Peso dias={dias} desde={desde} hoy={hoy} rango={rango} />
        <Cintura dias={dias} />
        <Cargas sesiones={data.sesiones} />
        <Hombro dias={data.dias} hoy={hoy} />
        <Constancia data={data} hoy={hoy} />
        <button className="btn tinta ancho" onClick={abrirInforme}>
          <span>Generar informe para la IA</span>
          <span aria-hidden="true">↗</span>
        </button>
      </div>
    </>
  );
}

function Peso({ dias, desde, hoy, rango }: { dias: Dia[]; desde: string; hoy: string; rango: number }) {
  const pts = dias
    .filter((d) => d.peso != null && d.fecha >= desde && d.fecha <= hoy)
    .sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
    .map((d) => ({ f: d.fecha, v: d.peso as number }));
  const ult = pts[pts.length - 1];
  const dif = pts.length >= 2 ? ult.v - pts[0].v : null;
  const vals = pts.map((p) => p.v);
  const lo = Math.min(...vals) - 0.2;
  const hi = Math.max(...vals) + 0.2;
  const t0 = parseISO(desde).getTime();
  const t1 = parseISO(hoy).getTime();

  return (
    <section className="card" aria-label="Peso en ayunas">
      <div className="entre">
        <h2 className="etq" style={{ margin: 0 }}>Peso en ayunas</h2>
        {dif != null && (
          <span className={`mono ${dif < 0 ? "ok-t" : ""}`}>
            {signo(dif)}{fmt(Math.abs(dif))} kg en {rango === 14 ? "14 d" : "8 sem"}
          </span>
        )}
      </div>
      <div className="num" style={{ fontSize: 60, marginTop: 4 }}>
        {ult ? fmt(ult.v) : "—"}
        <small> kg</small>
      </div>
      {pts.length >= 2 ? (
        <>
          <div className="puntos" role="img" aria-label={`Peso de ${fmt(pts[0].v)} a ${fmt(ult.v)} kg`}>
            {pts.map((p, i) => (
              <span
                key={p.f}
                className={i === pts.length - 1 ? "ultimo" : ""}
                style={{
                  left: `${4 + ((parseISO(p.f).getTime() - t0) / Math.max(1, t1 - t0)) * 92}%`,
                  bottom: `${((p.v - lo) / (hi - lo)) * 100}%`,
                }}
                title={`${ddmm(p.f)} · ${fmt(p.v)} kg`}
              />
            ))}
          </div>
          <div className="eje">
            <span>{ddmm(desde)}</span>
            <span>máx {fmt(Math.max(...vals))}</span>
            <span>hoy</span>
          </div>
        </>
      ) : (
        <p className="vacio" style={{ paddingBottom: 0 }}>Con dos pesajes aparece la tendencia. Pesate en ayunas, después del baño.</p>
      )}
    </section>
  );
}

function Cintura({ dias }: { dias: Dia[] }) {
  const ms = dias.filter((d) => d.cintura != null).sort((a, b) => (a.fecha < b.fecha ? -1 : 1));
  const ini = ms[0]?.cintura as number | undefined;
  const ult = ms[ms.length - 1]?.cintura as number | undefined;
  const pct = ini != null && ult != null && ini > CINTURA_META ? ((ini - ult) / (ini - CINTURA_META)) * 100 : 0;

  return (
    <section className="card" aria-label="Cintura">
      <div className="entre">
        <h2 className="etq" style={{ margin: 0 }}>Cintura</h2>
        <span className="mono">meta {CINTURA_META} cm</span>
      </div>
      {ult != null ? (
        <>
          <div className="num" style={{ fontSize: 48, marginTop: 4 }}>
            {fmt(ult)}
            <small> cm · {ult > CINTURA_META ? `faltan ${fmt(ult - CINTURA_META)}` : "meta cumplida"}</small>
          </div>
          <div className="pista" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label="Avance hacia la meta de cintura">
            <i style={{ width: `${Math.max(2, Math.min(100, pct))}%` }} />
          </div>
          <div className="eje">
            <span>{fmt(ini)} · inicio</span>
            <span>ratio {fmt(ult / ALTURA_CM, 2)}</span>
            <span>{CINTURA_META}</span>
          </div>
        </>
      ) : (
        <p className="vacio" style={{ paddingBottom: 0 }}>Medila una vez por semana, el mismo día, en ayunas y a la altura del ombligo.</p>
      )}
    </section>
  );
}

/** Mejor serie de una sesión: el mayor peso (o las reps, si es sin peso). */
const valorDe = (s: Sesion, ex: Ejercicio) =>
  ex.sinPeso ? Math.max(...s.sets.map((x) => x.reps)) : Math.max(...s.sets.map((x) => x.kg ?? 0));

function Cargas({ sesiones }: { sesiones: Record<string, Sesion> }) {
  const vistos = new Set<string>();
  const ejercicios: Ejercicio[] = [];
  ORDEN.forEach((k) => PLAN[k].ej.forEach((e) => !vistos.has(e.id) && (vistos.add(e.id), ejercicios.push(e))));

  const filas = ejercicios
    .map((ex) => ({ ex, ses: sesionesDe(sesiones, ex.id).filter((s) => s.sets.length) }))
    .filter((x) => x.ses.length)
    .sort((a, b) => (a.ses[0].fecha < b.ses[0].fecha ? 1 : -1))
    .slice(0, 6);

  return (
    <section className="card lista" aria-label="Cargas">
      <h2 className="etq" style={{ margin: 0, paddingBottom: 6 }}>Cargas · últimas 6 sesiones</h2>
      {!filas.length && <p className="vacio">Cuando registres series en Entreno, acá ves cómo sube cada ejercicio.</p>}
      {filas.map(({ ex, ses }) => {
        const ult6 = ses.slice(0, 6).reverse();
        const vs = ult6.map((s) => valorDe(s, ex));
        const max = Math.max(...vs, 1);
        const u = ses[0];
        const v = vs[vs.length - 1];
        const ant = vs.length > 1 ? vs[vs.length - 2] : null;
        const d = ant != null ? v - ant : null;
        const tope = !ex.sinPeso && tocoTope(u, ex);
        const color = d != null && d > 0 ? "var(--ok)" : d != null && d < 0 ? "var(--warn)" : "var(--ink)";
        const det =
          d == null
            ? "primera sesión"
            : d === 0
              ? `= · ${u.sets.map((x) => x.reps).join("·")}`
              : `${signo(d)}${fmt(Math.abs(d))} ${ex.sinPeso ? ex.u ?? "reps" : "kg"}`;
        return (
          <div className="carga" key={ex.id}>
            <div className="info">
              <b>{ex.n}</b>
              <span className="mono" style={{ color: tope ? "var(--ok)" : d != null && d < 0 ? "var(--warn)" : undefined }}>
                {det}
                {tope ? ` · tope, +${fmt(subaKg(ex))} kg` : ""}
              </span>
            </div>
            <div className="barras" aria-hidden="true">
              {vs.map((x, i) => (
                <i key={i} style={{ height: `${Math.max(8, (x / max) * 100)}%`, background: i === vs.length - 1 ? color : undefined }} />
              ))}
            </div>
            <div className="v num">{fmt(v)}</div>
          </div>
        );
      })}
    </section>
  );
}

function Hombro({ dias, hoy }: { dias: Record<string, Dia>; hoy: string }) {
  const fechas = Array.from({ length: 14 }, (_, i) => addDays(hoy, i - 13));
  const vals = fechas.map((f) => dias[f]?.hombro ?? null);
  const con = vals.filter((v): v is number => v != null);
  return (
    <section className="card" aria-label="Hombro izquierdo">
      <div className="entre">
        <h2 className="etq" style={{ margin: 0 }}>Hombro izq.</h2>
        <span className="mono">
          {con.length ? `prom. ${fmt(con.reduce((a, b) => a + b, 0) / con.length)} · máx ${Math.max(...con)}` : "sin datos"}
        </span>
      </div>
      <div className="tendencia" role="img" aria-label={`Dolor de hombro, últimos 14 días: ${con.join(", ") || "sin datos"}`}>
        {vals.map((v, i) => (
          <i key={fechas[i]} className={v == null ? "nada" : v > 3 ? "alto" : ""} style={{ height: v == null ? 2 : `${Math.max(6, v * 10)}%` }} />
        ))}
      </div>
      <div className="mono warn-t" style={{ marginTop: 6, fontWeight: 400, fontSize: 11 }}>— límite 3/10</div>
    </section>
  );
}

function Constancia({ data, hoy }: { data: GymData; hoy: string }) {
  const inicio = addDays(lunesDe(hoy), -21);
  const celdas = Array.from({ length: 28 }, (_, i) => addDays(inicio, i));
  let hechos = 0;
  let previstos = 0;
  const clases = celdas.map((f) => {
    if (f === hoy) return "hoy";
    if (f > hoy) return "";
    const av = avanceDe(data.sesiones, f);
    if (POR_DIA[parseISO(f).getDay()]) {
      previstos++;
      if (av >= 1) hechos++;
    }
    if (av >= 1) return "lleno";
    if (av > 0) return "parcial";
    const d = data.dias[f];
    if (d && (d.agua || d.banos.length || d.peso != null || d.hombro != null || Object.values(d.comidas).some(Boolean))) return "habitos";
    return "";
  });

  return (
    <section className="card" aria-label="Constancia">
      <div className="entre">
        <h2 className="etq" style={{ margin: 0 }}>Constancia</h2>
        <span className="mono">{hechos} de {previstos} entrenos</span>
      </div>
      <div className="calor-letras" aria-hidden="true">
        {["L", "M", "X", "J", "V", "S", "D"].map((l) => <span key={l}>{l}</span>)}
      </div>
      <div className="calor" role="img" aria-label={`Últimas 4 semanas: ${hechos} de ${previstos} entrenamientos completos`}>
        {celdas.map((f, i) => <i key={f} className={clases[i]} />)}
      </div>
      <div className="leyenda">
        <span>■ entreno</span>
        <span style={{ color: "var(--ink3)" }}>■ parcial</span>
        <span>□ solo hábitos</span>
      </div>
    </section>
  );
}
