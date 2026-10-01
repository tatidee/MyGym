"use client";

import { useEffect, useState } from "react";
import { ddmm, fmt, num, reloj } from "@/lib/fechas";
import { setsTxt, tocoTope } from "@/lib/informe";
import { CALENTAMIENTO_HOMBRO, ORDEN, PLAN, RUTINA_ESPECIAL, type RutinaEspecial } from "@/lib/plan";
import { descansoDe, pasoKg, pasoReps, subaKg, sugerencia } from "@/lib/entreno";
import type { DiaKey, Ejercicio, SetLog } from "@/lib/types";
import { claveSesion, diaVacio, ultimaAntes, type GymData } from "@/lib/useGymData";

export type Activa = { fecha: string; dia: DiaKey; inicio: number };

type Props = {
  data: GymData;
  fecha: string;
  dia: DiaKey | null;
  setDia: (k: DiaKey) => void;
  activa: Activa | null;
  iniciar: (k: DiaKey) => void;
  terminar: () => void;
  volver: () => void;
  avisar: (m: string) => void;
};

const vibrar = (p: number | number[]) => {
  try {
    navigator.vibrate?.(p);
  } catch {}
};

function useAhora(activo: boolean) {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    if (!activo) return;
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, [activo]);
  return ahora;
}

export default function Entreno(props: Props) {
  const { data, fecha, dia, setDia, activa } = props;
  const [elegir, setElegir] = useState(false);
  const [verSplit, setVerSplit] = useState(false);

  // TEMPORAL: borrar después del 02/10/2026
  const esp = RUTINA_ESPECIAL[fecha];
  if (esp && !verSplit) {
    return (
      <Activacion
        esp={esp}
        fecha={fecha}
        volver={props.volver}
        elegirSplit={(k) => {
          setDia(k);
          setVerSplit(true);
        }}
      />
    );
  }

  if (!dia) {
    return (
      <>
        <div className="cabeza-titulo">
          <h1 className="titulo">Entreno</h1>
        </div>
        <section className="card" style={{ marginTop: 16 }}>
          <div className="dato acc-t">Hoy se descansa</div>
          <p style={{ margin: "8px 0 0", color: "var(--ink2)" }}>¿Querés recuperar un día que te faltó? Elegilo:</p>
          <div className="dias-elegir">
            {ORDEN.map((k) => (
              <button key={k} onClick={() => setDia(k)}>{PLAN[k].n}</button>
            ))}
          </div>
        </section>
      </>
    );
  }

  const enCurso = activa?.fecha === fecha && activa.dia === dia ? activa : null;
  return (
    <Sesion
      key={fecha + dia}
      data={data}
      fecha={fecha}
      dia={dia}
      setDia={setDia}
      enCurso={enCurso}
      iniciar={props.iniciar}
      terminar={props.terminar}
      volver={props.volver}
      avisar={props.avisar}
      elegir={elegir}
      setElegir={setElegir}
    />
  );
}

function Sesion({
  data, fecha, dia, setDia, enCurso, iniciar, terminar, volver, avisar, elegir, setElegir,
}: Omit<Props, "dia" | "activa"> & { dia: DiaKey; enCurso: Activa | null; elegir: boolean; setElegir: (b: boolean) => void }) {
  const plan = PLAN[dia];
  const hechasDe = (ex: Ejercicio) => data.sesiones[claveSesion(fecha, ex.id)]?.sets ?? [];
  const completo = (ex: Ejercicio) => hechasDe(ex).length >= ex.s;

  const [idx, setIdx] = useState(() => Math.max(0, plan.ej.findIndex((e) => !completo(e))));
  const [descanso, setDescanso] = useState<number | null>(null); // timestamp de fin
  const ahora = useAhora(!!enCurso || descanso != null);
  const quedan = descanso != null ? Math.ceil((descanso - ahora) / 1000) : 0;

  useEffect(() => {
    if (descanso != null && quedan <= 0) {
      vibrar([200, 100, 200]);
      setDescanso(null);
    }
  }, [descanso, quedan]);

  const ex = plan.ej[idx];
  const hombro = (data.dias[fecha] ?? diaVacio(fecha)).hombro;
  const avisoHombro = hombro != null && hombro > 3;

  return (
    <div className="ent-grid">
      <div>
      <div className="ent-cabeza">
        <button className="redondo" onClick={volver} aria-label="Volver a Hoy">←</button>
        <button className="centro" onClick={() => setElegir(!elegir)} aria-expanded={elegir} aria-label={`${plan.n}. Cambiar de día`}>
          <b>{plan.n} ▾</b>
          <span className="mono">
            {enCurso ? reloj((ahora - enCurso.inicio) / 1000) : ddmm(fecha)} · {idx + 1} de {plan.ej.length}
          </span>
        </button>
        {enCurso ? (
          <button className="chip-btn" onClick={terminar}>Terminar</button>
        ) : (
          <span style={{ width: 48 }} />
        )}
      </div>

      {elegir && (
        <div className="dias-elegir">
          {ORDEN.map((k) => (
            <button key={k} aria-pressed={k === dia} onClick={() => { setDia(k); setElegir(false); }}>
              {PLAN[k].n}
            </button>
          ))}
        </div>
      )}

      <div className="progreso-ej" role="group" aria-label="Ejercicios">
        {plan.ej.map((e, i) => (
          <button
            key={e.id}
            className={i === idx ? "actual" : completo(e) ? "hecho" : ""}
            onClick={() => setIdx(i)}
            aria-label={`${i + 1}. ${e.n}${completo(e) ? ", hecho" : ""}`}
            aria-current={i === idx ? "step" : undefined}
          >
            <i />
          </button>
        ))}
      </div>

      {avisoHombro && (
        <div className="aviso acc" style={{ marginTop: 16 }}>
          Hoy el hombro está en {hombro}/10. Bajá peso o rango en lo que moleste, y si sigue así, consultá al fisio.
        </div>
      )}

      {plan.calentarHombro ? <Calentamiento clave={`${fecha}-${dia}`} /> : (
        <div className="calentar">
          <div className="calentar-fila">
            <div className="info">
              <b>Series de aproximación</b>
              <span>8 reps al 50% y 4 al 75% del peso de trabajo</span>
            </div>
          </div>
        </div>
      )}

      <Foco
        key={ex.id}
        ex={ex}
        i={idx}
        data={data}
        fecha={fecha}
        dia={dia}
        onSerie={() => {
          if (!enCurso) iniciar(dia);
          vibrar(10);
          setDescanso(Date.now() + descansoDe(ex) * 1000);
        }}
        onSiguiente={() => {
          const sig = plan.ej.findIndex((e, j) => j > idx && !completo(e));
          const resto = plan.ej.findIndex((e) => !completo(e) && e.id !== ex.id);
          const n = sig >= 0 ? sig : resto;
          if (n >= 0) setIdx(n);
          else avisar(`${plan.n} completo. Ahora, 1 h de cinta.`);
        }}
        avisar={avisar}
      />

      {descanso != null && quedan > 0 && (
        <div className="descanso" role="timer" aria-live="off">
          <span>
            Descanso <b>{reloj(quedan)}</b>
          </span>
          <span className="acciones">
            <button onClick={() => setDescanso(null)}>Listo</button>
            <button className="mas30" onClick={() => setDescanso(descanso + 30000)}>+30 s</button>
          </span>
        </div>
      )}

      </div>

      <div className="col-fija">
      <div className="bloque dato">Ejercicios</div>
      <div className="lista-ej">
        {plan.ej.map((e, i) =>
          i === idx ? null : (
            <button key={e.id} className={completo(e) ? "hecho" : ""} onClick={() => { setIdx(i); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
              <span className="i">{String(i + 1).padStart(2, "0")}</span>
              <span className="info">
                <b>{e.n}</b>
                <span>{e.s} × {e.r[0]}–{e.r[1]}{e.u ? ` ${e.u}` : ""} · RIR {e.rir}</span>
              </span>
              <span className="mono">{completo(e) ? "✓" : ultimoKg(data, e, fecha)}</span>
            </button>
          ),
        )}
      </div>

      {!avisoHombro && (
        <div className="aviso" style={{ marginTop: 10 }}>
          Hombro: si una serie duele más de 3/10, o sigue al día siguiente, bajá peso o rango.
        </div>
      )}
      </div>
    </div>
  );
}

/**
 * TEMPORAL: borrar después del 02/10/2026.
 * Rutina especial como checklist: lo tildado vive en el celular (localStorage), no en Supabase,
 * así no entra al historial de cargas ni al informe.
 */
function Activacion({ esp, fecha, volver, elegirSplit }: { esp: RutinaEspecial; fecha: string; volver: () => void; elegirSplit: (k: DiaKey) => void }) {
  const k = `mygym-activacion-${fecha}`;
  const [hecho, setHecho] = useState<boolean[]>(() => {
    try {
      const v = JSON.parse(localStorage.getItem(k) ?? "null");
      if (Array.isArray(v) && v.length === esp.ej.length) return v;
    } catch {}
    return esp.ej.map(() => false);
  });
  const [elegir, setElegir] = useState(false);
  const listos = hecho.filter(Boolean).length;

  const tildar = (i: number) => {
    const v = hecho.map((x, j) => (j === i ? !x : x));
    setHecho(v);
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  };

  return (
    <>
      <div className="ent-cabeza">
        <button className="redondo" onClick={volver} aria-label="Volver a Hoy">←</button>
        <button className="centro" onClick={() => setElegir(!elegir)} aria-expanded={elegir} aria-label={`${esp.n}. Cambiar a un día del split`}>
          <b>{esp.n} ▾</b>
          <span className="mono">{ddmm(fecha)} · {listos} de {esp.ej.length}</span>
        </button>
        <span style={{ width: 48 }} />
      </div>

      {elegir && (
        <>
          <p className="sec" style={{ fontSize: 13, margin: "12px 8px 0" }}>Hacer un día del split en vez de la activación:</p>
          <div className="dias-elegir">
            {ORDEN.map((d) => (
              <button key={d} onClick={() => elegirSplit(d)}>{PLAN[d].n}</button>
            ))}
          </div>
        </>
      )}

      <div className="progreso-ej" aria-hidden="true">
        {esp.ej.map((e, i) => (
          <span key={e.n} className={hecho[i] ? "hecho" : ""} style={{ height: 20, display: "flex", alignItems: "center" }}>
            <i />
          </span>
        ))}
      </div>

      {esp.calentarHombro && <Calentamiento clave={`${fecha}-especial`} />}

      <section className="card fuerte ej" aria-label={esp.n}>
        <div className="ej-cab">
          <div className="dato">Cuerpo completo · {esp.ej.length} ejercicios</div>
          <h2 className="ej-nombre">{esp.n}</h2>
          <div className="receta">
            <span>{esp.ej[0].s} × {esp.ej[0].r[0]}–{esp.ej[0].r[1]}</span>
            <span>RIR {esp.ej[0].rir}</span>
          </div>
          <p className="ej-nota">{esp.nota}</p>
        </div>
        <div style={{ marginTop: 12 }}>
          {esp.ej.map((e, i) => (
            <button key={e.n} className="check" aria-pressed={hecho[i]} onClick={() => tildar(i)}>
              <span className="caja" aria-hidden="true">{hecho[i] ? "✓" : ""}</span>
              <span className="txt">{e.n}</span>
              <span className="mono">{e.s} × {e.r[0]}–{e.r[1]}</span>
            </button>
          ))}
        </div>
        {listos === esp.ej.length && (
          <div className="completo tope">
            <span>Listo. Ahora, {esp.caminata}.</span>
          </div>
        )}
      </section>

      <div className="aviso" style={{ marginTop: 10 }}>
        No guarda series: es para volver a moverte. Los datos reales arrancan el lunes 05/10.
      </div>
    </>
  );
}

function ultimoKg(data: GymData, ex: Ejercicio, fecha: string) {
  const u = ultimaAntes(data.sesiones, ex.id, fecha);
  if (!u?.sets.length) return "";
  if (ex.sinPeso) return `${u.sets[0].reps} ${ex.u ?? ""}`;
  const k = u.sets[0].kg;
  return k != null ? `${fmt(k)} kg` : "";
}

function Calentamiento({ clave }: { clave: string }) {
  const k = `mygym-calentamiento-${clave}`;
  const [hecho, setHecho] = useState<boolean[]>(() => {
    try {
      const v = JSON.parse(localStorage.getItem(k) ?? "null");
      if (Array.isArray(v) && v.length === CALENTAMIENTO_HOMBRO.length) return v;
    } catch {}
    return CALENTAMIENTO_HOMBRO.map(() => false);
  });
  const [abierto, setAbierto] = useState(false);
  const listos = hecho.filter(Boolean).length;
  const todo = listos === hecho.length;

  const guardar = (v: boolean[]) => {
    setHecho(v);
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  };

  return (
    <section className="calentar" aria-label="Calentamiento de hombro">
      <div className="calentar-fila">
        <button
          aria-pressed={todo}
          aria-label={todo ? "Desmarcar calentamiento" : "Marcar calentamiento completo"}
          onClick={() => guardar(hecho.map(() => !todo))}
          style={{ width: 44, height: 44, display: "grid", placeItems: "center", flex: "none" }}
        >
          <span className={`caja ${todo ? "ok" : ""}`} aria-hidden="true">{todo ? "✓" : ""}</span>
        </button>
        <div className="info">
          <b>Calentamiento de hombro</b>
          <span>{listos} de {hecho.length} · 5 min</span>
        </div>
        <button className="link" onClick={() => setAbierto(!abierto)} aria-expanded={abierto}>
          {abierto ? "Cerrar" : "Ver"}
        </button>
      </div>
      {abierto && (
        <div style={{ marginTop: 6 }}>
          {CALENTAMIENTO_HOMBRO.map((c, i) => (
            <button key={c.n} className="check" aria-pressed={hecho[i]} onClick={() => guardar(hecho.map((v, j) => (j === i ? !v : v)))}>
              <span className="caja" aria-hidden="true">{hecho[i] ? "✓" : ""}</span>
              <span className="txt">
                {c.n}
                {c.nota && <small>{c.nota}</small>}
              </span>
              <span className="mono">{c.dosis}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

type FocoProps = {
  ex: Ejercicio;
  i: number;
  data: GymData;
  fecha: string;
  dia: DiaKey;
  onSerie: () => void;
  onSiguiente: () => void;
  avisar: (m: string) => void;
};

const aTexto = (v: number | null) => (v == null ? "" : fmt(v));

function Foco({ ex, i, data, fecha, dia, onSerie, onSiguiente, avisar }: FocoProps) {
  const hechas = data.sesiones[claveSesion(fecha, ex.id)]?.sets ?? [];
  const ult = ultimaAntes(data.sesiones, ex.id, fecha);
  const subir = !ex.sinPeso && tocoTope(ult, ex);

  // `edit` es la serie que se está cargando: la siguiente, o una hecha que se tocó para corregir.
  const [edit, setEdit] = useState(hechas.length);
  const base = edit < hechas.length ? hechas[edit] : sugerencia(ex, hechas, ult, edit);
  const [kg, setKg] = useState(aTexto(base.kg));
  const [reps, setReps] = useState(String(base.reps));
  const [ocupado, setOcupado] = useState(false);
  const [extra, setExtra] = useState(false);

  const cargar = (j: number, lista: SetLog[], conExtra = false) => {
    const b = j < lista.length ? lista[j] : sugerencia(ex, lista, ult, j);
    setEdit(j);
    setExtra(conExtra);
    setKg(aTexto(b.kg));
    setReps(String(b.reps));
  };

  const kgN = num(kg);
  const repsN = num(reps);
  const activa = edit < ex.s || edit < hechas.length || extra;
  const tope = hechas.length >= ex.s && hechas.slice(0, ex.s).every((s) => s.reps >= ex.r[1]);

  async function registrar() {
    if (repsN == null || repsN <= 0) return avisar(`Faltan las ${ex.u ?? "reps"}.`);
    if (!ex.sinPeso && kgN == null) return avisar("Falta el peso.");
    const set: SetLog = { kg: ex.sinPeso ? null : kgN, reps: Math.round(repsN) };
    const nuevas = edit < hechas.length ? hechas.map((s, j) => (j === edit ? set : s)) : [...hechas, set];
    setOcupado(true);
    const ok = await data.guardarSesion(fecha, dia, ex.id, nuevas);
    setOcupado(false);
    if (!ok) return;
    if (edit >= hechas.length) onSerie();
    cargar(nuevas.length, nuevas);
  }

  async function borrar() {
    const nuevas = hechas.filter((_, j) => j !== edit);
    if (nuevas.length) await data.guardarSesion(fecha, dia, ex.id, nuevas);
    else await data.borrarSesion(fecha, ex.id);
    cargar(nuevas.length, nuevas);
  }

  const paso = (v: string, d: number, min = 0) => {
    const x = Math.max(min, Math.round(((num(v) ?? 0) + d) * 100) / 100);
    return fmt(x);
  };

  const filas = Math.max(ex.s, hechas.length, activa ? edit + 1 : 0);
  const u = ex.u ?? "reps";

  return (
    <section className="card fuerte ej" aria-label={ex.n}>
      <div className="ej-cab">
        <div className="dato">{String(i + 1).padStart(2, "0")} · {ex.m}</div>
        <h2 className="ej-nombre">{ex.n}</h2>
        <div className="receta">
          <span>{ex.s} × {ex.r[0]}–{ex.r[1]}{ex.u ? ` ${ex.u}` : ""}</span>
          <span>RIR {ex.rir}</span>
          {subir && <span className="sube">+{fmt(subaKg(ex))} kg</span>}
        </div>
        {ex.nota && <p className="ej-nota">{ex.nota}</p>}
        <div className="anterior">
          {ult ? `Anterior ${ddmm(ult.fecha)} · ${setsTxt(ult, ex)}${subir ? " → tope" : ""}` : "Primera vez: elegí un peso cómodo."}
        </div>
      </div>

      <div className="series-cab" aria-hidden="true">
        <span>SERIE</span>
        <span>{ex.sinPeso ? "" : "KG"}</span>
        <span>{u.toUpperCase()}</span>
        <span />
      </div>

      {Array.from({ length: filas }, (_, j) => {
        if (j === edit && activa) {
          return (
            <div className="activa" key={j}>
              <div className="activa-cab">
                <span>SERIE {j + 1}</span>
                <span>OBJETIVO {ex.r[0]}–{ex.r[1]}</span>
              </div>
              <div className={`steppers ${ex.sinPeso ? "uno" : ""}`}>
                {!ex.sinPeso && (
                  <div className="stepper">
                    <button onClick={() => setKg(paso(kg, -pasoKg(ex)))} aria-label={`Menos ${fmt(pasoKg(ex))} kg`}>−</button>
                    <label>
                      <input inputMode="decimal" value={kg} placeholder="—" onChange={(e) => setKg(e.target.value)} aria-label="Kilos" />
                      <span>KG</span>
                    </label>
                    <button onClick={() => setKg(paso(kg, pasoKg(ex)))} aria-label={`Más ${fmt(pasoKg(ex))} kg`}>+</button>
                  </div>
                )}
                <div className="stepper">
                  <button onClick={() => setReps(paso(reps, -pasoReps(ex)))} aria-label={`Menos ${pasoReps(ex)} ${u}`}>−</button>
                  <label>
                    <input inputMode="numeric" value={reps} onChange={(e) => setReps(e.target.value)} aria-label={u} />
                    <span>{u.toUpperCase()}</span>
                  </label>
                  <button onClick={() => setReps(paso(reps, pasoReps(ex)))} aria-label={`Más ${pasoReps(ex)} ${u}`}>+</button>
                </div>
              </div>
              <button className="btn acc" onClick={registrar} disabled={ocupado}>
                <span>
                  {edit < hechas.length ? "Corregir" : "Registrar"}{" "}
                  {ex.sinPeso ? `${reps || "—"} ${u}` : `${kg || "—"} × ${reps || "—"}`}
                </span>
                <span aria-hidden="true">✓</span>
              </button>
              <div className="activa-pie">
                {edit < hechas.length ? (
                  <>
                    <button className="link" onClick={() => cargar(hechas.length, hechas)}>Cancelar</button>
                    <button className="link acc-t" onClick={borrar}>Borrar serie</button>
                  </>
                ) : (
                  <span style={{ width: "100%", textAlign: "center" }}>
                    {hechas.length || ult ? "Precargado con la serie anterior · 1 toque si se repite" : "Ajustá con − y +, o tocá el número"}
                  </span>
                )}
              </div>
            </div>
          );
        }
        const s = hechas[j];
        if (s) {
          const alTope = s.reps >= ex.r[1];
          return (
            <div className="serie" key={j}>
              <span className="n">{j + 1}</span>
              <span className="v num">{ex.sinPeso ? "" : aTexto(s.kg)}</span>
              <span className={`v num ${alTope ? "ok-t" : ""}`}>{s.reps}</span>
              <button className={`marca hecha`} onClick={() => cargar(j, hechas)} aria-label={`Serie ${j + 1} hecha. Tocá para corregir`}>✓</button>
            </div>
          );
        }
        const g = sugerencia(ex, hechas, ult, j);
        return (
          <div className="serie pendiente" key={j}>
            <span className="n">{j + 1}</span>
            <span className="v num">{ex.sinPeso ? "" : aTexto(g.kg) || "—"}</span>
            <span className="v num">{g.reps}</span>
            <span className="marca vacia" aria-hidden="true" />
          </div>
        );
      })}

      {!activa && (
        <div className={`completo ${tope && !ex.sinPeso ? "tope" : ""}`}>
          <span>{tope && !ex.sinPeso ? `Tope: la próxima, +${fmt(subaKg(ex))} kg` : "Ejercicio completo"}</span>
          <button onClick={onSiguiente}>Siguiente →</button>
        </div>
      )}
      {!activa && (
        <button className="link" style={{ width: "100%", marginTop: 4 }} onClick={() => cargar(hechas.length, hechas, true)}>
          + Serie extra
        </button>
      )}
    </section>
  );
}
