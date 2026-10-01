"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Barra from "@/components/Barra";

function Formulario() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const params = useSearchParams();
  const [modo, setModo] = useState<"entrar" | "crear">("entrar");
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [enviando, setEnviando] = useState(false);
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
    <main className="wrap login">
      <div className="heroe">
        <h1 className="titulo">MyGym</h1>
        <Barra cargados={["lower", "legs", "upper", "pull", "push"]} />
        <p className="lede">Tus cargas, tu comida, tu agua y tu hombro. Todo en un lugar, solo para vos.</p>
      </div>
      <form className="panel" onSubmit={enviar}>
        <h2 className="subtitulo">{modo === "entrar" ? "Entrar" : "Crear cuenta"}</h2>
        <label className="campo">
          <span className="etiqueta">Mail</span>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="campo">
          <span className="etiqueta">Contraseña</span>
          <input
            id="clave"
            type="password"
            autoComplete={modo === "entrar" ? "current-password" : "new-password"}
            required
            value={clave}
            onChange={(e) => setClave(e.target.value)}
          />
        </label>
        {msg && <p className="error" role="alert">{msg}</p>}
        <button className="btn fuerte" disabled={enviando}>
          {enviando ? "Un momento…" : modo === "entrar" ? "Entrar" : "Crear cuenta"}
        </button>
        <button type="button" className="btn suelto chico" onClick={() => { setModo(modo === "entrar" ? "crear" : "entrar"); setMsg(null); }}>
          {modo === "entrar" ? "Es mi primera vez: crear cuenta" : "Ya tengo cuenta: entrar"}
        </button>
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
