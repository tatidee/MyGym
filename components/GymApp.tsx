"use client";

import { useCallback, useEffect, useState } from "react";
import { hoyISO, parseISO, reloj } from "@/lib/fechas";
import { PLAN, POR_DIA } from "@/lib/plan";
import type { DiaKey } from "@/lib/types";
import { useGymData } from "@/lib/useGymData";
import Hoy from "./Hoy";
import Entreno, { type Activa } from "./Entreno";
import Progreso from "./Progreso";
import Plan from "./Plan";
import Informe from "./Informe";

type Tab = "hoy" | "entreno" | "progreso" | "plan";

const TABS: { id: Tab; n: string }[] = [
  { id: "hoy", n: "Hoy" },
  { id: "entreno", n: "Entreno" },
  { id: "progreso", n: "Progreso" },
  { id: "plan", n: "Plan" },
];

const CLAVE_ACTIVA = "mygym-sesion-activa";

export default function GymApp() {
  const data = useGymData();
  const [tab, setTab] = useState<Tab>("hoy");
  const [fecha, setFechaEstado] = useState(hoyISO);
  const [dia, setDia] = useState<DiaKey | null>(() => POR_DIA[new Date().getDay()] ?? null);
  const [activa, setActiva] = useState<Activa | null>(null);
  const [informe, setInforme] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [ahora, setAhora] = useState(() => Date.now());

  // La sesión en curso sobrevive a recargar la app, pero no pasa de un día a otro.
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(CLAVE_ACTIVA) ?? "null") as Activa | null;
      if (v && v.fecha === hoyISO() && PLAN[v.dia]) setActiva(v);
      else localStorage.removeItem(CLAVE_ACTIVA);
    } catch {}
  }, []);

  useEffect(() => {
    if (!activa) return;
    const t = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(t);
  }, [activa]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const guardarActiva = (a: Activa | null) => {
    setActiva(a);
    try {
      if (a) localStorage.setItem(CLAVE_ACTIVA, JSON.stringify(a));
      else localStorage.removeItem(CLAVE_ACTIVA);
    } catch {}
  };

  const setFecha = (f: string) => {
    setFechaEstado(f);
    setDia(POR_DIA[parseISO(f).getDay()] ?? null);
  };

  const ir = (t: Tab) => {
    setTab(t);
    window.scrollTo({ top: 0 });
  };

  const empezar = (k?: DiaKey) => {
    if (k) setDia(k);
    ir("entreno");
  };

  const cerrarInforme = useCallback(() => setInforme(false), []);

  const pildora = activa && tab !== "entreno";

  return (
    <>
      <div className={`wrap ${pildora ? "con-pildora" : ""}`}>
        {data.error && (
          <div className="aviso acc error" role="alert">
            <span>{data.error}</span>
            <button onClick={() => data.setError(null)} aria-label="Cerrar aviso">×</button>
          </div>
        )}

        <main>
          {data.cargando ? (
            <p className="cargando dato">Cargando tus registros…</p>
          ) : tab === "hoy" ? (
            <Hoy data={data} fecha={fecha} setFecha={setFecha} avisar={setToast} empezar={empezar} abrirInforme={() => setInforme(true)} />
          ) : tab === "entreno" ? (
            <Entreno
              data={data}
              fecha={fecha}
              dia={dia}
              setDia={setDia}
              activa={activa}
              iniciar={(k) => guardarActiva({ fecha, dia: k, inicio: Date.now() })}
              terminar={() => {
                if (activa) setToast(`${PLAN[activa.dia].n} terminado en ${reloj((Date.now() - activa.inicio) / 1000)}. Ahora, cinta.`);
                guardarActiva(null);
                ir("hoy");
              }}
              volver={() => ir("hoy")}
              avisar={setToast}
            />
          ) : tab === "progreso" ? (
            <Progreso data={data} abrirInforme={() => setInforme(true)} />
          ) : (
            <Plan />
          )}
        </main>
      </div>

      {toast && <div className="toast" role="status">{toast}</div>}

      {pildora && (
        <div className="en-curso">
          <span>
            {PLAN[activa.dia].n} en curso · <b>{reloj((ahora - activa.inicio) / 1000)}</b>
          </span>
          <button
            onClick={() => {
              setFechaEstado(activa.fecha);
              setDia(activa.dia);
              ir("entreno");
            }}
          >
            Volver
          </button>
        </div>
      )}

      <nav className="nav" aria-label="Secciones">
        <div className="nav-in">
          <span className="nav-marca marca" aria-hidden="true">MyGym</span>
          {TABS.map((t) => (
            <button key={t.id} aria-current={tab === t.id ? "page" : undefined} onClick={() => ir(t.id)}>
              {t.n}
            </button>
          ))}
        </div>
      </nav>

      {informe && <Informe data={data} cerrar={cerrarInforme} avisar={setToast} />}
    </>
  );
}
