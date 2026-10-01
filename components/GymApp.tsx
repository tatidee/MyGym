"use client";

import { useEffect, useState } from "react";
import { hoyISO, parseISO } from "@/lib/fechas";
import { NOM_SEMANA as NOMBRE, POR_DIA } from "@/lib/plan";
import type { DiaKey } from "@/lib/types";
import { useGymData } from "@/lib/useGymData";
import Hoy from "./Hoy";
import Rutina from "./Rutina";
import Comidas from "./Comidas";
import Registro from "./Registro";
import Informe from "./Informe";

type Tab = "hoy" | "rutina" | "comidas" | "registro" | "informe";

const TABS: { id: Tab; n: string; icono: React.ReactNode }[] = [
  { id: "hoy", n: "Hoy", icono: <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></> },
  { id: "rutina", n: "Rutina", icono: <path d="M3 10v4M6 7v10M18 7v10M21 10v4M6 12h12" /> },
  { id: "comidas", n: "Comidas", icono: <path d="M5 3v8a3 3 0 0 0 3 3v7M8 3v8M11 3v8M17 21V3c-2 2-3 5-3 8h3" /> },
  { id: "registro", n: "Registro", icono: <path d="M4 19h16M7 15l3-4 3 2 4-6" /> },
  { id: "informe", n: "Informe", icono: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M10 13h5M10 17h5" /></> },
];

export default function GymApp() {
  const data = useGymData();
  const [tab, setTab] = useState<Tab>("hoy");
  const [fecha, setFecha] = useState(hoyISO);
  const [dia, setDia] = useState<DiaKey>(() => POR_DIA[new Date().getDay()] ?? "upper");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const cambiarFecha = (f: string) => {
    if (!f) return;
    setFecha(f);
    const k = POR_DIA[parseISO(f).getDay()];
    if (k) setDia(k);
  };
  const ir = (t: Tab) => {
    setTab(t);
    window.scrollTo({ top: 0 });
  };

  const wd = parseISO(fecha).getDay();

  return (
    <>
      <div className="wrap">
        <header className="top">
          <p className="marca">MyGym</p>
          <label className="fecha-chip">
            <span>{NOMBRE[wd].slice(0, 3)}</span>
            <input id="fecha" type="date" value={fecha} onChange={(e) => cambiarFecha(e.target.value)} aria-label="Fecha que estás registrando" />
          </label>
        </header>

        {data.error && (
          <div className="aviso-barra" role="alert">
            <span>{data.error}</span>
            <button className="x" onClick={() => data.setError(null)} aria-label="Cerrar aviso">×</button>
          </div>
        )}

        <main>
          {data.cargando ? (
            <p className="vacio">Cargando tus registros…</p>
          ) : tab === "hoy" ? (
            <Hoy data={data} fecha={fecha} avisar={setToast} abrirRutina={(k) => { setDia(k); ir("rutina"); }} />
          ) : tab === "rutina" ? (
            <Rutina data={data} fecha={fecha} dia={dia} setDia={setDia} avisar={setToast} />
          ) : tab === "comidas" ? (
            <Comidas />
          ) : tab === "registro" ? (
            <Registro data={data} />
          ) : (
            <Informe data={data} avisar={setToast} />
          )}
        </main>
      </div>

      {toast && <div className="toast" role="status">{toast}</div>}

      <nav className="dock" aria-label="Secciones">
        <div className="dock-in">
          {TABS.map((t) => (
            <button key={t.id} aria-current={tab === t.id ? "page" : undefined} onClick={() => ir(t.id)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">{t.icono}</svg>
              {t.n}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
