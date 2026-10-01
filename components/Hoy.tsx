"use client";

import { useState } from "react";
import Barra, { Punto } from "./Barra";
import { addDays, ddmm, fmt, horaAhora, hoyISO, lunesDe, num, parseISO } from "@/lib/fechas";
import { AGUA_META, ALTURA_CM, BRISTOL, COMIDAS, NOM_SEMANA, ORDEN, PLAN, POR_DIA } from "@/lib/plan";
import type { DiaKey } from "@/lib/types";
import { claveSesion, diaVacio, type GymData } from "@/lib/useGymData";

type Props = { data: GymData; fecha: string; avisar: (m: string) => void; abrirRutina: (k: DiaKey) => void };

export default function Hoy({ data, fecha, avisar, abrirRutina }: Props) {
  const d = data.dias[fecha] ?? diaVacio(fecha);
  const wd = parseISO(fecha).getDay();
  const k = POR_DIA[wd];

  // semana: qué días se entrenaron (lunes a domingo de esta fecha)
  const lunes = lunesDe(fecha);
  const domingo = addDays(lunes, 6);
  const cargados = ORDEN.filter((key) =>
    Object.values(data.sesiones).some((s) => s.dia === key && s.fecha >= lunes && s.fecha <= domingo),
  );

  return (
    <>
      <section className="heroe" aria-label="Semana">
        <h1 className="titulo">{fecha === hoyISO() ? "Hoy" : `${NOM_SEMANA[wd]} ${ddmm(fecha)}`}</h1>
        <Barra cargados={cargados} />
        <div className="entre">
          <p className="etiqueta">
            Semana del {ddmm(lunes)}: <span className="num">{cargados.length} de 5</span> discos cargados
          </p>
        </div>
        <div className="leyenda">
          {ORDEN.map((key) => (
            <span key={key} className={`leyenda-item ${cargados.includes(key) ? "hecho" : ""}`}>
              <Punto k={key} />
              {PLAN[key].n}
            </span>
          ))}
        </div>
      </section>

      <Toca data={data} fecha={fecha} k={k} abrirRutina={abrirRutina} />
      <Agua agua={d.agua} onSumar={(ml) => data.guardarDia(fecha, { agua: Math.max(0, d.agua + ml) }, true)} />
      <Bano
        banos={d.banos}
        onAgregar={(t) => {
          data.guardarDia(fecha, { banos: [...d.banos, { h: fecha === hoyISO() ? horaAhora() : "—", t }] });
          avisar(`Registrado: tipo ${t}`);
        }}
        onBorrar={(i) => data.guardarDia(fecha, { banos: d.banos.filter((_, j) => j !== i) })}
      />
      <Cuerpo key={fecha} data={data} fecha={fecha} avisar={avisar} />
      <section className="panel" aria-label="Comidas del día">
        <div className="entre">
          <h2 className="subtitulo">Comidas</h2>
          <span className="etiqueta num">
            {COMIDAS.filter((c) => d.comidas[c.id]).length} de {COMIDAS.length}
          </span>
        </div>
        <div>
          {COMIDAS.map((c) => (
            <label key={c.id} className="check">
              <input
                type="checkbox"
                id={`comida-${c.id}`}
                checked={!!d.comidas[c.id]}
                onChange={(e) => data.guardarDia(fecha, { comidas: { ...d.comidas, [c.id]: e.target.checked } })}
              />
              <span className="crece">{c.n}</span>
              <span className="muted chico num">{c.kcal} kcal · {c.p} g prot.</span>
            </label>
          ))}
        </div>
      </section>
    </>
  );
}

function Toca({ data, fecha, k, abrirRutina }: { data: GymData; fecha: string; k?: DiaKey; abrirRutina: (k: DiaKey) => void }) {
  if (!k) {
    return (
      <section className="panel">
        <h2 className="subtitulo">Hoy se descansa</h2>
        <p className="lede">Sin pesas. Si tenés ganas, caminá igual: suma al déficit y no te quita recuperación.</p>
      </section>
    );
  }
  const plan = PLAN[k];
  const hechos = plan.ej.filter((e) => data.sesiones[claveSesion(fecha, e.id)]).length;
  return (
    <section className="panel">
      <div className="toca">
        <div className="disco-grande" style={{ background: plan.disco.color, color: plan.disco.tinta }} aria-hidden="true">
          <span>{plan.disco.kg}</span>
        </div>
        <div>
          <h2 className="subtitulo">Toca {plan.n}</h2>
          <p className="muted chico num" style={{ margin: "4px 0 0" }}>
            {hechos} de {plan.ej.length} ejercicios registrados · después, 1 hora de cinta
          </p>
        </div>
      </div>
      <button className="btn fuerte" onClick={() => abrirRutina(k)}>
        Abrir rutina de {plan.n}
      </button>
    </section>
  );
}

function Agua({ agua, onSumar }: { agua: number; onSumar: (ml: number) => void }) {
  const pct = Math.min(100, (agua / AGUA_META) * 100);
  const lleno = agua >= AGUA_META;
  return (
    <section className="panel" aria-label="Agua">
      <div className="agua">
        <div
          className={`tubo ${lleno ? "lleno" : ""}`}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={AGUA_META}
          aria-valuenow={agua}
          aria-label="Agua tomada"
        >
          <i style={{ height: `${pct}%` }} />
          <b style={{ bottom: "33.33%" }} />
          <b style={{ bottom: "66.66%" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, justifyContent: "space-between", minWidth: 0 }}>
          <div>
            <h2 className="subtitulo">Agua</h2>
            <p className="grande" style={{ margin: "6px 0 0" }}>
              {fmt(agua / 1000, 2)}
              <span className="muted" style={{ fontSize: 22 }}> / {fmt(AGUA_META / 1000)} L</span>
            </p>
            {lleno && <span className="pastilla ok" style={{ marginTop: 6 }}>Meta cumplida</span>}
          </div>
          <div className="fila">
            <button className="btn chico" onClick={() => onSumar(250)}>+250 ml</button>
            <button className="btn chico" onClick={() => onSumar(500)}>+500 ml</button>
            <button className="btn chico" onClick={() => onSumar(750)}>+750 ml</button>
            <button className="btn chico suelto" onClick={() => onSumar(-250)} aria-label="Restar 250 ml">−250</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Bano({ banos, onAgregar, onBorrar }: { banos: { h: string; t: number }[]; onAgregar: (t: number) => void; onBorrar: (i: number) => void }) {
  return (
    <section className="panel" aria-label="Baño">
      <div className="entre">
        <h2 className="subtitulo">Baño</h2>
        <span className="etiqueta">Escala de Bristol</span>
      </div>
      <div className="bristol">
        {[1, 2, 3, 4, 5, 6, 7].map((t) => (
          <button key={t} className={t >= 3 && t <= 5 ? "normal" : ""} onClick={() => onAgregar(t)} aria-label={`Tipo ${t}: ${BRISTOL[t]}`}>
            <b>{t}</b>
            <span>{BRISTOL[t].split(" ")[0]}</span>
          </button>
        ))}
      </div>
      <p className="muted chico" style={{ margin: 0 }}>Tocá el tipo cada vez que vayas. Lo normal es 3 a 5; 1 y 2 indican estreñimiento.</p>
      {banos.length > 0 && (
        <div className="eventos">
          {banos.map((b, i) => (
            <div className="evento" key={i}>
              <span className="num">
                {b.h} · tipo {b.t} <span className="muted">({BRISTOL[b.t].toLowerCase()})</span>
              </span>
              <button className="x" onClick={() => onBorrar(i)} aria-label="Borrar este registro">×</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Cuerpo({ data, fecha, avisar }: { data: GymData; fecha: string; avisar: (m: string) => void }) {
  const d = data.dias[fecha] ?? diaVacio(fecha);
  const [peso, setPeso] = useState(d.peso != null ? fmt(d.peso) : "");
  const [cintura, setCintura] = useState(d.cintura != null ? fmt(d.cintura) : "");
  const [nota, setNota] = useState(d.nota);
  const c = num(cintura);

  function guardar() {
    const p = num(peso);
    if (p != null && (p < 40 || p > 200)) return avisar("Revisá el peso: tiene que estar entre 40 y 200 kg.");
    if (c != null && (c < 50 || c > 180)) return avisar("Revisá la cintura: en cm, entre 50 y 180.");
    data.guardarDia(fecha, { peso: p, cintura: c, nota: nota.trim() });
    avisar("Guardado");
  }

  return (
    <section className="panel" aria-label="Cuerpo y hombro">
      <h2 className="subtitulo">Cuerpo y hombro</h2>
      <div className="campos">
        <label className="campo">
          <span className="etiqueta">Peso en ayunas (kg)</span>
          <input id="peso" inputMode="decimal" placeholder="80,0" value={peso} onChange={(e) => setPeso(e.target.value)} />
        </label>
        <label className="campo">
          <span className="etiqueta">Cintura en el ombligo (cm)</span>
          <input id="cintura" inputMode="decimal" placeholder="1 vez por semana" value={cintura} onChange={(e) => setCintura(e.target.value)} />
          {c != null && c >= 50 && <span className="muted chico num">Cintura/altura: {fmt(c / ALTURA_CM, 2)} (meta 0,50)</span>}
        </label>
      </div>
      <div className="campo">
        <span className="etiqueta">Dolor del hombro izquierdo hoy (0 nada · 10 máximo)</span>
        <div className="escala">
          {Array.from({ length: 11 }, (_, n) => (
            <button
              key={n}
              className={n >= 4 ? "alto" : ""}
              aria-pressed={d.hombro === n}
              onClick={() => data.guardarDia(fecha, { hombro: d.hombro === n ? null : n })}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <label className="campo">
        <span className="etiqueta">Nota del día</span>
        <textarea id="nota" placeholder="Energía, sueño, qué molestó…" value={nota} onChange={(e) => setNota(e.target.value)} />
      </label>
      <button className="btn fuerte" onClick={guardar}>Guardar peso, cintura y nota</button>
    </section>
  );
}
