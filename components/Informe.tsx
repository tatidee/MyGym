"use client";

import { useRef, useState } from "react";
import { generarInforme } from "@/lib/informe";
import type { GymData } from "@/lib/useGymData";

export default function Informe({ data, avisar }: { data: GymData; avisar: (m: string) => void }) {
  const [n, setN] = useState(7);
  const pre = useRef<HTMLPreElement>(null);
  const texto = generarInforme(data.dias, data.sesiones, n);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      avisar("Informe copiado. Pegalo en el chat con Claude.");
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
    <>
      <h1 className="titulo">Informe</h1>
      <p className="lede">Copiá el texto y pegáselo a Claude. Con eso ajusta la rutina, la comida o lo que haga falta.</p>
      <div className="dias" role="group" aria-label="Período">
        {[7, 14, 28].map((d) => (
          <button key={d} className="dia-btn" style={{ paddingLeft: 14 }} aria-pressed={n === d} onClick={() => setN(d)}>
            {d} días
          </button>
        ))}
      </div>
      <pre className="informe" ref={pre}>{texto}</pre>
      <div className="fila">
        <button className="btn fuerte" onClick={copiar}>Copiar informe</button>
        <button className="btn suelto" onClick={data.salir}>Cerrar sesión ({data.email})</button>
      </div>
    </>
  );
}
