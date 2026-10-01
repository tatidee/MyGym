import { addDays, ddmm, fmt, hoyISO, parseISO } from "./fechas";
import { AGUA_META, ALTURA_CM, BRISTOL, COMIDAS, ORDEN, PLAN, PLAN_VERSION, POR_DIA } from "./plan";
import type { Dia, Ejercicio, Sesion } from "./types";
import { diaEntrenado, sesionesDe } from "./useGymData";

export function setsTxt(s: Sesion | undefined, ex?: Ejercicio) {
  if (!s || !s.sets.length) return "—";
  if (ex?.sinPeso) return s.sets.map((x) => x.reps).join(" / ") + (ex.u ? ` ${ex.u}` : "");
  const kgs = s.sets.map((x) => x.kg);
  if (kgs.every((k) => k === kgs[0])) return `${fmt(kgs[0])} kg × ${s.sets.map((x) => x.reps).join(" / ")}`;
  return s.sets.map((x) => `${fmt(x.kg)}×${x.reps}`).join(", ");
}

/** Todas las series planificadas llegaron al tope del rango: toca subir peso. */
export function tocoTope(s: Sesion | undefined, ex: Ejercicio) {
  return !!s && s.sets.length >= ex.s && s.sets.slice(0, ex.s).every((x) => x.reps >= ex.r[1]);
}

/** Texto plano para pegarle a Claude. */
export function generarInforme(dias: Record<string, Dia>, sesiones: Record<string, Sesion>, n: number) {
  const fin = hoyISO();
  const ini = addDays(fin, -(n - 1));
  const rango = Array.from({ length: n }, (_, i) => addDays(ini, i));
  const dia = (f: string) => dias[f];
  const L: string[] = [];

  L.push(`INFORME MYGYM · ${ddmm(ini)} al ${ddmm(fin)} (${n} días) · plan ${PLAN_VERSION}`);

  const ent = rango.map((f) => [f, diaEntrenado(sesiones, f)] as const).filter(([, k]) => k);
  const esperados = rango.filter((f) => POR_DIA[parseISO(f).getDay()]).length;
  L.push(
    `\nENTRENAMIENTOS: ${ent.length}/${esperados} planificados` +
      (ent.length ? ` · ${ent.map(([f, k]) => `${PLAN[k!].n} ${ddmm(f)}`).join(", ")}` : ""),
  );

  L.push(`\nCARGAS (última sesión del período vs anterior):`);
  const vistos = new Set<string>();
  let hay = false;
  ORDEN.forEach((k) =>
    PLAN[k].ej.forEach((ex) => {
      if (vistos.has(ex.id)) return;
      vistos.add(ex.id);
      const todas = sesionesDe(sesiones, ex.id);
      const enRango = todas.filter((s) => s.fecha >= ini && s.fecha <= fin);
      if (!enRango.length) return;
      hay = true;
      const u = enRango[0];
      const prev = todas.find((s) => s.fecha < u.fecha);
      L.push(
        `- [${PLAN[k].n}] ${ex.n}: ${setsTxt(u, ex)} (${ddmm(u.fecha)})` +
          (prev ? ` | antes: ${setsTxt(prev, ex)} (${ddmm(prev.fecha)})` : " | primera vez") +
          (tocoTope(u, ex) && !ex.sinPeso ? " · llegó al tope" : ""),
      );
    }),
  );
  if (!hay) L.push("- Sin series registradas.");

  const pesos = rango.map((f) => dia(f)?.peso).filter((x): x is number => x != null);
  L.push(
    `\nPESO: ${
      pesos.length
        ? `promedio ${fmt(pesos.reduce((a, b) => a + b, 0) / pesos.length)} kg (${pesos.length} pesajes, mín ${fmt(Math.min(...pesos))} / máx ${fmt(Math.max(...pesos))})`
        : "sin datos"
    }`,
  );
  const cint = rango.map((f) => [f, dia(f)?.cintura] as const).filter(([, c]) => c != null);
  L.push(
    `CINTURA: ${
      cint.length ? cint.map(([f, c]) => `${fmt(c)} cm (${ddmm(f)}, cintura/altura ${fmt(c! / ALTURA_CM, 2)})`).join(", ") : "sin datos"
    }`,
  );
  const aguas = rango.map((f) => dia(f)?.agua ?? 0).filter((x) => x > 0);
  L.push(
    `AGUA: ${
      aguas.length
        ? `promedio ${fmt(aguas.reduce((a, b) => a + b, 0) / aguas.length / 1000, 2)} L/día en ${aguas.length} días (meta ${fmt(AGUA_META / 1000)} L)`
        : "sin datos"
    }`,
  );
  const banos = rango.flatMap((f) => dia(f)?.banos ?? []);
  const diasSin = rango.filter((f) => !(dia(f)?.banos ?? []).length).length;
  L.push(
    `BAÑO: ${banos.length} veces en ${n} días · tipos Bristol: ${banos.length ? banos.map((b) => b.t).join(", ") : "—"} · días sin ir: ${diasSin}` +
      (banos.some((b) => b.t <= 2) ? ` · hubo tipo 1-2 (${BRISTOL[1].toLowerCase()} / ${BRISTOL[2].toLowerCase()})` : ""),
  );
  const hom = rango.map((f) => [f, dia(f)?.hombro] as const).filter(([, h]) => h != null);
  L.push(`HOMBRO IZQ. (dolor 0-10): ${hom.length ? hom.map(([f, h]) => `${h} (${ddmm(f)})`).join(", ") : "sin datos"}`);
  const com = rango.reduce((a, f) => a + COMIDAS.filter((c) => dia(f)?.comidas?.[c.id]).length, 0);
  L.push(`COMIDAS CUMPLIDAS: ${com}/${n * COMIDAS.length}`);

  const notas = rango.map((f) => [f, dia(f)?.nota] as const).filter(([, t]) => t);
  if (notas.length) {
    L.push(`\nNOTAS:`);
    notas.forEach(([f, t]) => L.push(`- ${ddmm(f)}: ${t}`));
  }
  return L.join("\n");
}
