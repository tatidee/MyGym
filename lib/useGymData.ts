"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { AguaToma, Dia, DiaKey, Sesion, SetLog } from "./types";

export const diaVacio = (fecha: string): Dia => ({
  fecha, agua: 0, agua_log: [], banos: [], peso: null, cintura: null, hombro: null, nota: "", comidas: {},
});

const toNum = (v: unknown) => (v == null || v === "" ? null : Number(v));

type FilaDia = Partial<Dia> & { fecha: string };

export const sumaAgua = (log: AguaToma[]) => log.reduce((a, t) => a + t.ml, 0);

function normalizarDia(r: FilaDia): Dia {
  const agua = Number(r.agua ?? 0);
  let log: AguaToma[] = Array.isArray(r.agua_log) ? r.agua_log : [];
  // Días cargados antes de agua_log: una sola toma con todo, así la suma coincide.
  if (!log.length && agua > 0) log = [{ ml: agua, fuente: "Agua", h: "—" }];
  return {
    fecha: r.fecha,
    agua: sumaAgua(log),
    agua_log: log,
    banos: Array.isArray(r.banos) ? r.banos : [],
    peso: toNum(r.peso),
    cintura: toNum(r.cintura),
    hombro: toNum(r.hombro),
    nota: r.nota ?? "",
    comidas: r.comidas ?? {},
  };
}

export const claveSesion = (fecha: string, ejercicio: string) => `${fecha}__${ejercicio}`;

export function useGymData() {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string>("");
  const [dias, setDias] = useState<Record<string, Dia>>({});
  const [sesiones, setSesiones] = useState<Record<string, Sesion>>({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guardadoEn, setGuardadoEn] = useState<Date | null>(null);
  const diasRef = useRef(dias);
  diasRef.current = dias;
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    let vivo = true;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!vivo) return;
      setUserId(auth.user?.id ?? null);
      setEmail(auth.user?.email ?? "");
      const [d, s] = await Promise.all([
        supabase.from("dias").select("*"),
        supabase.from("sesiones").select("fecha,dia,ejercicio,sets"),
      ]);
      if (!vivo) return;
      if (d.error || s.error) {
        setError(
          (d.error ?? s.error)!.message.includes("does not exist")
            ? "Faltan las tablas en Supabase. Corré supabase/schema.sql en el SQL Editor."
            : "No se pudieron cargar tus datos. Revisá la conexión y recargá.",
        );
      }
      const md: Record<string, Dia> = {};
      (d.data ?? []).forEach((r: FilaDia) => (md[r.fecha] = normalizarDia(r)));
      const ms: Record<string, Sesion> = {};
      (s.data ?? []).forEach((r: Sesion) => (ms[claveSesion(r.fecha, r.ejercicio)] = { ...r, sets: Array.isArray(r.sets) ? r.sets : [] }));
      setDias(md);
      setSesiones(ms);
      setCargando(false);
    })();
    return () => {
      vivo = false;
    };
  }, [supabase]);

  const escribirDia = useCallback(
    async (dia: Dia) => {
      if (!userId) return;
      const { error: e } = await supabase
        .from("dias")
        .upsert({ ...dia, user_id: userId, updated_at: new Date().toISOString() }, { onConflict: "user_id,fecha" });
      if (e) setError("No se guardó el último cambio del día. Probá de nuevo.");
      else setGuardadoEn(new Date());
    },
    [supabase, userId],
  );

  /** Actualiza el día al instante en pantalla y lo guarda. Con `demorar`, agrupa toques rápidos (agua). */
  const guardarDia = useCallback(
    (fecha: string, cambios: Partial<Dia>, demorar = false) => {
      const nuevo: Dia = { ...(diasRef.current[fecha] ?? diaVacio(fecha)), ...cambios, fecha };
      nuevo.agua = sumaAgua(nuevo.agua_log); // `agua` nunca se escribe suelto
      setDias((prev) => ({ ...prev, [fecha]: nuevo }));
      diasRef.current = { ...diasRef.current, [fecha]: nuevo };
      clearTimeout(timers.current[fecha]);
      if (demorar) timers.current[fecha] = setTimeout(() => escribirDia(diasRef.current[fecha]), 700);
      else escribirDia(nuevo);
    },
    [escribirDia],
  );

  const guardarSesion = useCallback(
    async (fecha: string, dia: DiaKey, ejercicio: string, sets: SetLog[]) => {
      if (!userId) return false;
      const ses: Sesion = { fecha, dia, ejercicio, sets };
      setSesiones((prev) => ({ ...prev, [claveSesion(fecha, ejercicio)]: ses }));
      const { error: e } = await supabase
        .from("sesiones")
        .upsert({ ...ses, user_id: userId }, { onConflict: "user_id,fecha,ejercicio" });
      if (e) {
        setError("No se guardó la serie. Probá de nuevo.");
        return false;
      }
      setGuardadoEn(new Date());
      return true;
    },
    [supabase, userId],
  );

  const borrarSesion = useCallback(
    async (fecha: string, ejercicio: string) => {
      setSesiones((prev) => {
        const c = { ...prev };
        delete c[claveSesion(fecha, ejercicio)];
        return c;
      });
      const { error: e } = await supabase.from("sesiones").delete().eq("fecha", fecha).eq("ejercicio", ejercicio);
      if (e) setError("No se pudo borrar. Probá de nuevo.");
      else setGuardadoEn(new Date());
    },
    [supabase],
  );

  const salir = useCallback(async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }, [supabase]);

  return { dias, sesiones, cargando, error, setError, guardadoEn, email, guardarDia, guardarSesion, borrarSesion, salir };
}

export type GymData = ReturnType<typeof useGymData>;

/* ---------- consultas sobre los datos ---------- */

export function sesionesDe(sesiones: Record<string, Sesion>, ejercicio: string) {
  return Object.values(sesiones)
    .filter((s) => s.ejercicio === ejercicio)
    .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
}

export function ultimaAntes(sesiones: Record<string, Sesion>, ejercicio: string, fecha: string) {
  return sesionesDe(sesiones, ejercicio).find((s) => s.fecha < fecha);
}

/** Qué día de rutina se entrenó en esa fecha (según lo registrado). */
export function diaEntrenado(sesiones: Record<string, Sesion>, fecha: string): DiaKey | null {
  const s = Object.values(sesiones).find((x) => x.fecha === fecha);
  return s ? s.dia : null;
}
