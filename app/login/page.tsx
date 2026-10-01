"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

function Formulario() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const params = useSearchParams();
  const [modo, setModo] = useState<"entrar" | "crear">("entrar");
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [ver, setVer] = useState(false);
  const [msg, setMsg] = useState<string | null>(
    params.get("error") === "confirmacion" ? "El link de confirmación venció o ya se usó. Entrá con tu mail y contraseña." : null,
  );

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setMsg(null);
    if (modo === "entrar") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: clave });
      if (error) {
        setMsg(error.message.includes("Invalid") ? "Mail o contraseña incorrectos." : "No se pudo entrar: " + error.message);
        setEnviando(false);
        return;
      }
      router.replace("/");
      router.refresh();
    } else {
      if (clave.length < 8) {
        setMsg("La contraseña tiene que tener al menos 8 caracteres.");
        setEnviando(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password: clave,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setMsg(error.message.includes("not allowed") || error.message.includes("disabled")
          ? "La creación de cuentas está cerrada en esta app."
          : "No se pudo crear la cuenta: " + error.message);
        setEnviando(false);
        return;
      }
      if (data.session) {
        router.replace("/");
        router.refresh();
      } else {
        setMsg("Te mandamos un mail para confirmar la cuenta. Abrilo desde este mismo dispositivo.");
        setEnviando(false);
      }
    }
  }

  return (
    <main className="login">
      <p className="marca">MyGym</p>
      <div className="login-hola">
        <h1>{modo === "entrar" ? <>Hola de<br />nuevo.</> : <>Creá tu<br />cuenta.</>}</h1>
        <p>{modo === "entrar" ? "Entrá para seguir donde lo dejaste." : "Una sola vez. Después, solo entrás."}</p>
      </div>
      <form onSubmit={enviar}>
        <div className="campos">
          <div className="campo">
            <label htmlFor="email" className="dato">Mail</label>
            <div className="campo-caja">
              <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="campo">
            <label htmlFor="clave" className="dato">Contraseña</label>
            <div className="campo-caja">
              <input
                id="clave"
                type={ver ? "text" : "password"}
                autoComplete={modo === "entrar" ? "current-password" : "new-password"}
                required
                value={clave}
                onChange={(e) => setClave(e.target.value)}
              />
              <button type="button" onClick={() => setVer(!ver)} aria-pressed={ver}>
                {ver ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>
        </div>
        <div className="login-pie">
          {msg && <p className="error-txt" role="alert">{msg}</p>}
          <button className="btn acc" disabled={enviando}>
            <span>{enviando ? "Un momento…" : modo === "entrar" ? "Entrar" : "Crear cuenta"}</span>
            <span aria-hidden="true">→</span>
          </button>
          <button type="button" className="link" onClick={() => { setModo(modo === "entrar" ? "crear" : "entrar"); setMsg(null); }}>
            {modo === "entrar" ? "Es mi primera vez: crear cuenta" : "Ya tengo cuenta: entrar"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <Formulario />
    </Suspense>
  );
}
