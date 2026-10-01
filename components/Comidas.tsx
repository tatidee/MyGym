import { AGUA_META, CAMBIOS, COMIDAS, COMPRAS, MACROS, PLAN_VERSION } from "@/lib/plan";
import { fmt } from "@/lib/fechas";

export default function Comidas() {
  return (
    <>
      <h1 className="titulo">Comidas</h1>
      <p className="lede">Menú base para repetir todos los días. Marcá cada comida cumplida en Hoy.</p>
      <section className="panel" aria-label="Objetivo diario">
        <div className="macros">
          <div><b>{fmt(MACROS.kcal, 0)}</b><span>kcal</span></div>
          <div><b>{MACROS.p}</b><span>g proteína</span></div>
          <div><b>{MACROS.c}</b><span>g carbos</span></div>
          <div><b>{MACROS.g}</b><span>g grasa</span></div>
        </div>
        <p className="muted chico" style={{ margin: 0 }}>
          Agua: {fmt(AGUA_META / 1000)} L por día. Fibra: unos 30 g, que salen de la avena, la fruta, la ensalada y la soja.
        </p>
      </section>
      {COMIDAS.map((c) => (
        <section className="panel comida" key={c.id}>
          <div className="entre">
            <h2 className="subtitulo">{c.n}</h2>
            <span className="muted chico num">{c.kcal} kcal · {c.p} g prot.</span>
          </div>
          <ul>{c.items.map((i) => <li key={i}>{i}</li>)}</ul>
        </section>
      ))}
      <section className="panel">
        <h2 className="subtitulo">Cambios equivalentes</h2>
        <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
          {CAMBIOS.map((c) => <li key={c}>{c}</li>)}
        </ul>
      </section>
      <section className="panel">
        <h2 className="subtitulo">Lista de compras</h2>
        <ul className="dos-col">{COMPRAS.map((c) => <li key={c}>{c}</li>)}</ul>
      </section>
      <p className="muted chico">Plan {PLAN_VERSION}</p>
    </>
  );
}
