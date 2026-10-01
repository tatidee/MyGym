"use client";

import { useState } from "react";
import Semana from "./Semana";
import { addDays, ddmm, fechaCorta, fmt, horaAhora, hoyISO, miles, num, parseISO, semanaISO } from "@/lib/fechas";
import { AGUA_META, ALTURA_CM, BRISTOL, COMIDAS, NOM_SEMANA, PLAN, POR_DIA } from "@/lib/plan";
import { minutosDe, seriesDe } from "@/lib/entreno";
import type { DiaKey } from "@/lib/types";
import { claveSesion, diaVacio, type GymData } from "@/lib/useGymData";

type Props = {
  data: GymData;
  fecha: string;
  setFecha: (f: string) => void;
  avisar: (m: string) => void;
  empezar: (k: DiaKey) => void;
  abrirInforme: () => void;
};

const VASO = 250;

export default function Hoy({ data, fecha, setFecha, avisar, empezar, abrirInforme }: Props) {
  const d = data.dias[fecha] ?? diaVacio(fecha);
  const guardar = data.guardarDia;
  const esHoy = fecha === hoyISO();

  return (
    <>
      <div className="cabeza">
        <span className="dato">
          {fechaCorta(fecha)} · semana {semanaISO(fecha)}
        </span>
        <button className="avatar" onClick={abrirInforme} aria-label="Informe y cuenta">
          {(data.email || "?").charAt(0)}
        </button>
      </div>

      <Semana fecha={fecha} sesiones={data.sesiones} onElegir={setFecha} />

      <Toca data={data} fecha={fecha} empezar={empezar} />

      <div className="bloque dato">Hábitos · se guardan solos</div>

      <div className="pila">
        <Agua agua={d.agua} onCambiar={(ml) => guardar(fecha, { agua: Math.max(0, d.agua + ml) }, true)} />

        <section className="card lista" aria-label="Comidas">
          <div className="entre" style={{ paddingBottom: 8 }}>
            <h2 className="etq" style={{ margin: 0 }}>Comidas</h2>
            <span className="mono">
              {COMIDAS.filter((c) => d.comidas[c.id]).length}/{COMIDAS.length} ·{" "}
              {miles(COMIDAS.reduce((a, c) => a + (d.comidas[c.id] ? c.kcal : 0), 0))} kcal
            </span>
          </div>
          {COMIDAS.map((c) => {
            const on = !!d.comidas[c.id];
            return (
              <button key={c.id} className="check" aria-pressed={on} onClick={() => guardar(fecha, { comidas: { ...d.comidas, [c.id]: !on } })}>
                <span className="caja" aria-hidden="true">{on ? "✓" : ""}</span>
                <span className="txt">{c.n}</span>
                <span className="mono">{c.kcal} · {c.p} g P</span>
              </button>
            );
          })}
        </section>

        <Bano
          banos={d.banos}
          onAgregar={(t) => {
            guardar(fecha, { banos: [...d.banos, { h: esHoy ? horaAhora() : "—", t }] });
            avisar(`Registrado: tipo ${t}`);
          }}
          onBorrar={(i) => guardar(fecha, { banos: d.banos.filter((_, j) => j !== i) })}
        />

        <Hombro valor={d.hombro} onElegir={(n) => guardar(fecha, { hombro: d.hombro === n ? null : n })} />

        <Medidas key={fecha} data={data} fecha={fecha} avisar={avisar} />

        <Nota key={`nota-${fecha}`} valor={d.nota} onGuardar={(t) => t !== d.nota && guardar(fecha, { nota: t })} />
      </div>

      <div className="guardado dato">
        {data.guardadoEn
          ? `✓ guardado ${data.guardadoEn.toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit" })}`
          : esHoy
            ? "Todo se guarda al tocar"
            : `Registrando el ${NOM_SEMANA[parseISO(fecha).getDay()].toLowerCase()} ${ddmm(fecha)}`}
      </div>
    </>
  );
}

function Toca({ data, fecha, empezar }: { data: GymData; fecha: string; empezar: (k: DiaKey) => void }) {
  const wd = parseISO(fecha).getDay();
  const k = POR_DIA[wd];
  const cuando = fecha === hoyISO() ? "Hoy" : `El ${NOM_SEMANA[wd].toLowerCase()}`;

  if (!k) {
    return (
      <section className="card toca">
        <div className="dato acc-t">{cuando} se descansa</div>
        <h1 className="display">Libre</h1>
        <p style={{ marginBottom: 0 }}>
          Sin pesas. Si tenés ganas, caminá igual: suma al déficit y no te quita recuperación.
        </p>
      </section>
    );
  }

  const plan = PLAN[k];
  const hechas = plan.ej.reduce((a, e) => a + (data.sesiones[claveSesion(fecha, e.id)]?.sets.length ?? 0), 0);
  const total = seriesDe(plan);
  const accion = hechas >= total ? "Ver" : hechas > 0 ? "Seguir" : "Empezar";

  return (
    <section className="card toca">
      <div className="dato acc-t">{fecha === hoyISO() ? "Hoy toca" : `${cuando} tocaba`}</div>
      <h1 className="display">{plan.n}</h1>
      <p>
        {plan.ej.length} ejercicios · {hechas > 0 ? `${hechas} de ${total}` : total} series · ~{minutosDe(plan)} min
        <br />
        {plan.calentarHombro ? "Antes, hombro (5 min)." : "Antes, 2 series de aproximación."} Después, 1 h de cinta.
      </p>
      <button className="btn acc" onClick={() => empezar(k)}>
        <span>{accion} {plan.n}</span>
        <span aria-hidden="true">→</span>
      </button>
    </section>
  );
}

function Agua({ agua, onCambiar }: { agua: number; onCambiar: (ml: number) => void }) {
  const vasos = Math.floor(agua / VASO);
  const meta = agua >= AGUA_META;
  return (
    <section className="card" aria-label="Agua">
      <div className="entre">
        <h2 className="etq" style={{ margin: 0 }}>Agua</h2>
        <span className="sec" style={{ fontSize: 13 }}>meta {fmt(AGUA_META / 1000)} L</span>
      </div>
      <div className={`num ${meta ? "ok-t" : ""}`} style={{ fontSize: 60, marginTop: 2 }} aria-live="polite">
        {fmt(agua / 1000, 2)}
        <small> L</small>
      </div>
      <div
        className={`segmentos ${meta ? "meta" : ""}`}
        role="progressbar"
        aria-label="Agua tomada"
        aria-valuemin={0}
        aria-valuemax={AGUA_META}
        aria-valuenow={agua}
      >
        {Array.from({ length: AGUA_META / VASO }, (_, i) => (
          <i key={i} className={i < vasos ? "on" : ""} />
        ))}
      </div>
      <div className="agua-btns">
        <button className="menos" onClick={() => onCambiar(-VASO)} disabled={agua <= 0} aria-label="Restar 250 ml">−</button>
        <button className="mas" onClick={() => onCambiar(VASO)}>+250 ml</button>
        <button className="mas2" onClick={() => onCambiar(2 * VASO)}>+500 ml</button>
      </div>
    </section>
  );
}

function Bano({ banos, onAgregar, onBorrar }: { banos: { h: string; t: number }[]; onAgregar: (t: number) => void; onBorrar: (i: number) => void }) {
  const [borrando, setBorrando] = useState<number | null>(null);
  const ultimo = banos.length ? banos[banos.length - 1].t : 0;
  return (
    <section className="card" aria-label="Baño">
      <div className="entre">
        <h2 className="etq" style={{ margin: 0 }}>Baño</h2>
        <span className="sec" style={{ fontSize: 13 }}>Escala de Bristol</span>
      </div>
      <div className="bristol">
        {[1, 2, 3, 4, 5, 6, 7].map((t) => (
          <button key={t} aria-pressed={ultimo === t} onClick={() => onAgregar(t)} aria-label={`Tipo ${t}: ${BRISTOL[t]}`}>
            <b>{t}</b>
            <span>{BRISTOL[t].split(" ")[0]}</span>
          </button>
        ))}
        <div className="zona" />
        <div className="zona-txt">zona normal</div>
      </div>
      {banos.length > 0 && (
        <div className="chips">
          {banos.map((b, i) =>
            borrando === i ? (
              <button key={i} className="borrar" onClick={() => { onBorrar(i); setBorrando(null); }} onBlur={() => setBorrando(null)}>
                Borrar {b.h} ×
              </button>
            ) : (
              <button key={i} onClick={() => setBorrando(i)} aria-label={`${b.h}, tipo ${b.t}. Tocá para borrar`}>
                {b.h} · tipo {b.t}
              </button>
            ),
          )}
        </div>
      )}
    </section>
  );
}

function Hombro({ valor, onElegir }: { valor: number | null; onElegir: (n: number) => void }) {
  const alto = valor != null && valor > 3;
  return (
    <section className="card" aria-label="Hombro izquierdo">
      <div className="entre" style={{ alignItems: "flex-start" }}>
        <div>
          <h2 className="etq" style={{ margin: 0 }}>Hombro izquierdo</h2>
          <div style={{ fontSize: 13, marginTop: 4, maxWidth: 220 }} className={alto ? "acc-t" : "sec"}>
            {valor == null ? "¿Cuánto duele hoy? 0 es nada." : alto ? "Más de 3: bajá peso o rango y anotalo." : "Tolerable. Entrená normal."}
          </div>
        </div>
        <div className={`num ${alto ? "acc-t" : ""}`} style={{ fontSize: 52, lineHeight: 0.9 }}>
          {valor ?? "—"}
          <small>/10</small>
        </div>
      </div>
      <div className={`escala ${alto ? "alto" : ""}`}>
        {Array.from({ length: 11 }, (_, n) => (
          <button
            key={n}
            className={`${valor != null && n <= valor ? "on" : ""} ${n === 3 ? "limite" : ""}`}
            aria-pressed={valor === n}
            aria-label={`Dolor ${n}`}
            onClick={() => onElegir(n)}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="escala-pie">
        <span>nada</span>
        <span>▲ 3 · límite</span>
        <span>máximo</span>
      </div>
    </section>
  );
}

function Medidas({ data, fecha, avisar }: { data: GymData; fecha: string; avisar: (m: string) => void }) {
  const d = data.dias[fecha] ?? diaVacio(fecha);
  const [peso, setPeso] = useState(d.peso != null ? fmt(d.peso) : "");
  const [cintura, setCintura] = useState(d.cintura != null ? fmt(d.cintura) : "");

  // último pesaje anterior a esta fecha, para la diferencia
  const previo = Object.values(data.dias)
    .filter((x) => x.fecha < fecha && x.peso != null)
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))[0];
  const dif = d.peso != null && previo ? d.peso - (previo.peso as number) : null;

  function guardarPeso() {
    const p = num(peso);
    if (p === d.peso) return;
    if (p != null && (p < 40 || p > 200)) {
      avisar("Revisá el peso: tiene que estar entre 40 y 200 kg.");
      return setPeso(d.peso != null ? fmt(d.peso) : "");
    }
    data.guardarDia(fecha, { peso: p });
  }
  function guardarCintura() {
    const c = num(cintura);
    if (c === d.cintura) return;
    if (c != null && (c < 50 || c > 180)) {
      avisar("Revisá la cintura: en cm, entre 50 y 180.");
      return setCintura(d.cintura != null ? fmt(d.cintura) : "");
    }
    data.guardarDia(fecha, { cintura: c });
  }

  return (
    <div className="dos">
      <div className="card medida">
        <label htmlFor="peso">Peso en ayunas</label>
        <input
          id="peso"
          inputMode="decimal"
          enterKeyHint="done"
          placeholder="—"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          onBlur={guardarPeso}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        />
        <div className={`mono ${dif != null && dif < 0 ? "ok-t" : ""}`}>
          {dif != null ? `${dif > 0 ? "+" : dif < 0 ? "−" : "±"}${fmt(Math.abs(dif))} vs. ${previo.fecha === addDays(fecha, -1) ? "ayer" : ddmm(previo.fecha)}` : "kg"}
        </div>
      </div>
      <div className={`card medida ${d.cintura == null ? "hueca" : ""}`}>
        <label htmlFor="cintura">Cintura (ombligo)</label>
        <input
          id="cintura"
          inputMode="decimal"
          enterKeyHint="done"
          placeholder="—"
          value={cintura}
          onChange={(e) => setCintura(e.target.value)}
          onBlur={guardarCintura}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        />
        <div className="mono">
          {d.cintura != null ? `cm · ratio ${fmt(d.cintura / ALTURA_CM, 2)}` : "1 vez por semana"}
        </div>
      </div>
    </div>
  );
}

function Nota({ valor, onGuardar }: { valor: string; onGuardar: (t: string) => void }) {
  const [t, setT] = useState(valor);
  return (
    <>
      <label htmlFor="nota" className="oculto">Nota del día</label>
      <textarea
        id="nota"
        className="nota"
        placeholder="Nota del día · energía, sueño, qué molestó…"
        value={t}
        onChange={(e) => setT(e.target.value)}
        onBlur={() => onGuardar(t.trim())}
      />
    </>
  );
}
