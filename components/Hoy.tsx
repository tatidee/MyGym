"use client";

import { useState } from "react";
import Semana from "./Semana";
import { addDays, ddmm, fechaCorta, fmt, horaAhora, hoyISO, miles, num, parseISO, semanaISO } from "@/lib/fechas";
import {
  AGUA_META, ALTURA_CM, BRISTOL, COMIDAS, DIA_CINTURA, NOM_SEMANA, PLAN, POR_DIA, RUTINA_ESPECIAL, TERMO_MATE_ML, type Comida,
} from "@/lib/plan";
import { minutosDe, seriesDe } from "@/lib/entreno";
import type { AguaToma, DiaKey } from "@/lib/types";
import { claveSesion, diaVacio, type GymData } from "@/lib/useGymData";

type Props = {
  data: GymData;
  fecha: string;
  setFecha: (f: string) => void;
  avisar: (m: string) => void;
  empezar: (k?: DiaKey) => void;
  abrirInforme: () => void;
};

const VASO = 250;

export default function Hoy({ data, fecha, setFecha, avisar, empezar, abrirInforme }: Props) {
  const d = data.dias[fecha] ?? diaVacio(fecha);
  const guardar = data.guardarDia;
  const esHoy = fecha === hoyISO();
  const hora = () => (esHoy ? horaAhora() : "—");

  /* ---- agua: cada toma con su fuente; `agua` se recalcula sola en guardarDia ---- */
  const sumarToma = (ml: number, fuente: string) =>
    guardar(fecha, { agua_log: [...d.agua_log, { ml, fuente, h: hora() }] }, true);
  const restar = (ml: number) => {
    // descuenta de la última toma manual (las automáticas se sacan destildando la comida)
    let i = d.agua_log.length - 1;
    while (i >= 0 && d.agua_log[i].auto) i--;
    if (i < 0) return;
    const t = d.agua_log[i];
    const log = t.ml > ml ? d.agua_log.map((x, j) => (j === i ? { ...x, ml: x.ml - ml } : x)) : d.agua_log.filter((_, j) => j !== i);
    guardar(fecha, { agua_log: log }, true);
  };
  const borrarToma = (i: number) => guardar(fecha, { agua_log: d.agua_log.filter((_, j) => j !== i) });

  const tildarComida = (c: Comida) => {
    const on = !d.comidas[c.id];
    let log = d.agua_log.filter((t) => t.auto !== c.id);
    if (on && c.liquido) log = [...log, { ml: c.liquido.ml, fuente: c.liquido.nombre, h: hora(), auto: c.id }];
    guardar(fecha, { comidas: { ...d.comidas, [c.id]: on }, agua_log: log });
  };

  const viernes = parseISO(fecha).getDay() === DIA_CINTURA;

  return (
    <div className="hoy-grid">
      <div className="col-fija">
      <div className="cabeza">
        <span className="dato">
          {fechaCorta(fecha)} · semana {semanaISO(fecha)}
        </span>
        <button className="avatar" onClick={abrirInforme} aria-label="Informe y cuenta">
          {(data.email || "?").charAt(0)}
        </button>
      </div>

      {viernes &&
        (d.cintura == null ? (
          <div className="aviso" role="note" style={{ margin: "14px 0 4px" }}>
            <b>Hoy toca medir cintura:</b> en ayunas, después de orinar, cinta horizontal en el ombligo, al final de una
            exhalación normal sin meter panza.
          </div>
        ) : (
          <div className="aviso ok" style={{ margin: "14px 0 4px" }}>
            Cintura medida: {fmt(d.cintura)} cm. La próxima, el viernes que viene.
          </div>
        ))}

      <Semana fecha={fecha} sesiones={data.sesiones} onElegir={setFecha} />

      <Toca data={data} fecha={fecha} empezar={empezar} />
      </div>

      <div>
      <div className="bloque dato">Hábitos · se guardan solos</div>

      <div className="pila">
        <Agua agua={d.agua} log={d.agua_log} onSumar={sumarToma} onRestar={restar} onBorrar={borrarToma} />

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
              <button key={c.id} className="check" aria-pressed={on} onClick={() => tildarComida(c)}>
                <span className="caja" aria-hidden="true">{on ? "✓" : ""}</span>
                <span className="txt">
                  {c.n}
                  {c.liquido && <small>suma {c.liquido.ml} ml al agua</small>}
                </span>
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
      </div>
    </div>
  );
}

function Toca({ data, fecha, empezar }: { data: GymData; fecha: string; empezar: (k?: DiaKey) => void }) {
  const wd = parseISO(fecha).getDay();
  const k = POR_DIA[wd];
  const cuando = fecha === hoyISO() ? "Hoy" : `El ${NOM_SEMANA[wd].toLowerCase()}`;

  // TEMPORAL: borrar después del 02/10/2026
  const esp = RUTINA_ESPECIAL[fecha];
  if (esp) {
    const series = esp.ej.reduce((a, e) => a + e.s, 0);
    return (
      <section className="card toca">
        <div className="dato acc-t">{fecha === hoyISO() ? "Hoy toca" : `${cuando} tocaba`}</div>
        <h1 className="display" style={{ fontSize: 72 }}>{esp.n}</h1>
        <p>
          {esp.ej.length} ejercicios · {series} series · cuerpo completo, liviano
          <br />
          {esp.calentarHombro ? "Antes, hombro (5 min). " : ""}Después, {esp.caminata}.
        </p>
        <button className="btn acc" onClick={() => empezar()}>
          <span>Empezar {esp.n}</span>
          <span aria-hidden="true">→</span>
        </button>
      </section>
    );
  }

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

type AguaProps = {
  agua: number;
  log: AguaToma[];
  onSumar: (ml: number, fuente: string) => void;
  onRestar: (ml: number) => void;
  onBorrar: (i: number) => void;
};

function Agua({ agua, log, onSumar, onRestar, onBorrar }: AguaProps) {
  const hayManual = log.some((t) => !t.auto);
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
        <button className="mas" onClick={() => onSumar(VASO, "Agua")}>+250 agua</button>
        <button className="mas2" onClick={() => onSumar(2 * VASO, "Agua")}>+500 agua</button>
        <button className="mas2" onClick={() => onSumar(3 * VASO, "Agua")}>+750 agua</button>
        <button className="menos" onClick={() => onRestar(VASO)} disabled={!hayManual} aria-label="Restar 250 ml de la última toma">−250</button>
        <button className="mas2 mate" onClick={() => onSumar(TERMO_MATE_ML, "Mate")}>+ termo de mate</button>
      </div>
      {log.length > 0 && (
        <ul className="tomas" aria-label="Tomas del día">
          {log.map((t, i) => (
            <li key={i} className={t.auto ? "auto" : ""}>
              <span className="mono">{t.h}</span>
              <span className="ml">{miles(t.ml)} ml</span>
              <span className="f">
                {t.fuente}
                {t.auto && " · automático"}
              </span>
              {t.auto ? (
                <span />
              ) : (
                <button onClick={() => onBorrar(i)} aria-label={`Borrar ${t.ml} ml de ${t.fuente.toLowerCase()} de las ${t.h}`}>×</button>
              )}
            </li>
          ))}
        </ul>
      )}
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

  const wd = parseISO(fecha).getDay();
  const conCintura = wd === DIA_CINTURA || d.cintura != null;
  const proxima = addDays(fecha, (DIA_CINTURA - wd + 7) % 7 || 7);

  return (
    <div>
    <div className={conCintura ? "dos" : ""}>
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
      {conCintura && (
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
          {d.cintura != null ? `cm · ratio ${fmt(d.cintura / ALTURA_CM, 2)}` : "cm · en ayunas"}
        </div>
      </div>
      )}
    </div>
      {!conCintura && (
        <p className="mono" style={{ margin: "8px 8px 0" }}>
          Próxima medición de cintura: {NOM_SEMANA[DIA_CINTURA].toLowerCase()} {ddmm(proxima)}
        </p>
      )}
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
