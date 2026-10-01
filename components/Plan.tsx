"use client";

import { useState } from "react";
import { fmt, miles } from "@/lib/fechas";
import { AGUA_META, CALENTAMIENTO_HOMBRO, CAMBIOS, COMIDAS, COMPRAS, MACROS, NOM_SEMANA, ORDEN, PLAN, PLAN_VERSION } from "@/lib/plan";

type Vista = "comidas" | "rutina" | "compras";

export default function Plan() {
  const [vista, setVista] = useState<Vista>("comidas");
  return (
    <>
      <div className="cabeza-titulo">
        <h1 className="titulo">Plan</h1>
      </div>
      <div className="seg" role="group" aria-label="Sección del plan" style={{ margin: "16px 8px 0" }}>
        <button aria-pressed={vista === "comidas"} onClick={() => setVista("comidas")}>Comidas</button>
        <button aria-pressed={vista === "rutina"} onClick={() => setVista("rutina")}>Rutina</button>
        <button aria-pressed={vista === "compras"} onClick={() => setVista("compras")}>Compras</button>
      </div>
      <div className="pila columnas" style={{ marginTop: 16 }}>
        {vista === "comidas" ? <Comidas /> : vista === "rutina" ? <Rutina /> : <Compras />}
      </div>
      <p className="guardado dato">Plan {PLAN_VERSION}</p>
    </>
  );
}

function Comidas() {
  const kp = MACROS.p * 4;
  const kc = MACROS.c * 4;
  const kg = MACROS.g * 9;
  return (
    <>
      <section className="card" aria-label="Objetivo diario">
        <div className="macros">
          <div><div className="num">{miles(MACROS.kcal)}</div><span>kcal</span></div>
          <div><div className="num">{MACROS.p}</div><span>g proteína</span></div>
          <div><div className="num">{MACROS.c}</div><span>g carbos</span></div>
          <div><div className="num">{MACROS.g}</div><span>g grasa</span></div>
        </div>
        <div className="reparto" role="img" aria-label={`Calorías: ${kp} de proteína, ${kc} de carbos, ${kg} de grasa`}>
          <i style={{ flex: kp, background: "var(--ink)" }} />
          <i style={{ flex: kc, background: "var(--ink3)" }} />
          <i style={{ flex: kg, background: "var(--line)" }} />
        </div>
        <p className="sec" style={{ fontSize: 13, margin: "12px 0 0" }}>
          Agua {fmt(AGUA_META / 1000)} L. Fibra ~30 g: avena, fruta, ensalada y soja.
        </p>
      </section>
      {COMIDAS.map((c) => (
        <section className="card comida-plan" key={c.id}>
          <div className="entre">
            <h3>{c.n}</h3>
            <span className="mono" style={{ whiteSpace: "nowrap" }}>{c.kcal} kcal · {c.p} g P</span>
          </div>
          <ul className="items">{c.items.map((i) => <li key={i}>{i}</li>)}</ul>
        </section>
      ))}
      <section className="card hueca comida-plan">
        <h2 className="etq" style={{ margin: 0 }}>Cambios equivalentes</h2>
        <ul className="items sec">{CAMBIOS.map((c) => <li key={c}>{c}</li>)}</ul>
      </section>
    </>
  );
}

function Rutina() {
  return (
    <>
      {ORDEN.map((k) => {
        const p = PLAN[k];
        return (
          <section className="card comida-plan dia-plan" key={k}>
            <div className="entre">
              <h3>{p.n}</h3>
              <span className="mono">{NOM_SEMANA[p.semana].toLowerCase()}</span>
            </div>
            {p.calentarHombro && <p className="sec" style={{ fontSize: 13, margin: "6px 0 0" }}>Con calentamiento de hombro antes.</p>}
            {p.ej.map((e) => (
              <div className="fila-ej" key={e.id}>
                <span>{e.n}</span>
                <span>{e.s} × {e.r[0]}–{e.r[1]}{e.u ? ` ${e.u}` : ""} · RIR {e.rir}</span>
              </div>
            ))}
          </section>
        );
      })}
      <section className="card hueca comida-plan dia-plan">
        <h3>Calentamiento de hombro</h3>
        <p className="sec" style={{ fontSize: 13, margin: "6px 0 0" }}>
          ~5 min antes de Upper, Push y Pull. Si el fisio te da ejercicios propios, van esos.
        </p>
        {CALENTAMIENTO_HOMBRO.map((c) => (
          <div className="fila-ej" key={c.n}>
            <span>{c.n}</span>
            <span>{c.dosis}</span>
          </div>
        ))}
      </section>
      <p className="sec" style={{ fontSize: 13, margin: "4px 8px 0" }}>
        Doble progresión: cuando todas las series llegan al tope del rango, subí 2,5 kg en barra o 1-2 kg en mancuerna.
        Sábado y domingo, descanso.
      </p>
    </>
  );
}

function Compras() {
  return (
    <section className="card comida-plan">
      <h2 className="etq" style={{ margin: 0 }}>Lista de compras</h2>
      <ul className="items dos-col">{COMPRAS.map((c) => <li key={c}>{c}</li>)}</ul>
    </section>
  );
}
