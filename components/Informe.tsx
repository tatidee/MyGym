"use client";

import { useEffect, useRef, useState } from "react";
import { generarInforme } from "@/lib/informe";
import type { GymData } from "@/lib/useGymData";

/** Hoja que sube desde abajo con el texto para pegarle a Claude. Se cierra con ×, Escape o deslizando hacia abajo. */
export default function Informe({ data, cerrar, avisar }: { data: GymData; cerrar: () => void; avisar: (m: string) => void }) {
  const [n, setN] = useState(7);
  const [copiado, setCopiado] = useState(false);
  const pre = useRef<HTMLPreElement>(null);
  const y0 = useRef<number | null>(null);
  const texto = generarInforme(data.dias, data.sesiones, n);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && cerrar();
    document.addEventListener("keydown", esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = prev;
    };
  }, [cerrar]);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
    } catch {
      if (pre.current) {
        const r = document.createRange();
        r.selectNodeContents(pre.current);
        const s = window.getSelection();
        s?.removeAllRanges();
        s?.addRange(r);
      }
      avisar("Texto seleccionado: copialo con el menú del celular.");
    }
  }

  return (
    <div className="velo" onClick={(e) => e.target === e.currentTarget && cerrar()}>
      <div className="hoja" role="dialog" aria-modal="true" aria-labelledby="informe-titulo">
        <div
          className="asa"
          onTouchStart={(e) => (y0.current = e.touches[0].clientY)}
          onTouchEnd={(e) => {
            if (y0.current != null && e.changedTouches[0].clientY - y0.current > 80) cerrar();
            y0.current = null;
          }}
        >
          <i />
        </div>
        <div className="entre" style={{ alignItems: "center", marginTop: 10 }}>
          <h2 id="informe-titulo" className="titulo" style={{ fontSize: 36 }}>Informe</h2>
          <button className="avatar" onClick={cerrar} aria-label="Cerrar" style={{ fontSize: 22, fontWeight: 400 }}>×</button>
        </div>
        <p className="sec" style={{ margin: "4px 0 0", fontSize: 15, lineHeight: 1.4 }}>
          Copialo y pegáselo a Claude: con eso ajusta la rutina, la comida o lo que haga falta.
        </p>
        <div className="rangos" role="group" aria-label="Período">
          {[7, 14, 28].map((d) => (
            <button key={d} aria-pressed={n === d} onClick={() => { setN(d); setCopiado(false); }}>
              {d} días
            </button>
          ))}
        </div>
        <pre className="informe" ref={pre}>{texto}</pre>
        <button className={`btn ${copiado ? "ok" : "acc"}`} onClick={copiar}>
          <span>{copiado ? "Copiado. Pegalo en Claude" : "Copiar informe"}</span>
          <span aria-hidden="true">{copiado ? "✓" : "⧉"}</span>
        </button>
        <div className="hoja-pie">
          <span>{data.email}</span>
          <button onClick={data.salir}>Cerrar sesión</button>
        </div>
      </div>
    </div>
  );
}
