import { tocoTope } from "./informe";
import type { DiaPlan, Ejercicio, Sesion, SetLog } from "./types";

/** Mancuernas suben de a 1 kg; barra, máquina y polea, de a 2,5 kg. */
export const esMancuerna = (ex: Ejercicio) => /-mb$|mancuerna/i.test(`${ex.id} ${ex.n}`);
export const pasoKg = (ex: Ejercicio) => (esMancuerna(ex) ? 1 : 2.5);
/** Lo que se sube cuando se llega al tope (doble progresión). */
export const subaKg = (ex: Ejercicio) => (esMancuerna(ex) ? 2 : 2.5);
export const pasoReps = (ex: Ejercicio) => (ex.u === "seg" ? 5 : 1);

/**
 * Valores precargados para la serie `j`:
 * la serie anterior de hoy; si es la primera, la misma serie de la última sesión
 * (con la suba si llegó al tope); si nunca se hizo, vacío de kg y el piso del rango.
 */
export function sugerencia(ex: Ejercicio, hechas: SetLog[], ult: Sesion | undefined, j: number): SetLog {
  if (j > 0 && hechas[j - 1]) return { ...hechas[j - 1] };
  if (ult?.sets.length) {
    const prev = ult.sets[Math.min(j, ult.sets.length - 1)];
    if (tocoTope(ult, ex) && !ex.sinPeso) return { kg: (prev.kg ?? 0) + subaKg(ex), reps: ex.r[0] };
    return { kg: prev.kg, reps: prev.reps };
  }
  return { kg: null, reps: ex.r[0] };
}

export const seriesDe = (plan: DiaPlan) => plan.ej.reduce((a, e) => a + e.s, 0);

/** ~3 min por serie con el descanso, redondeado a 5. */
export const minutosDe = (plan: DiaPlan) => Math.round((seriesDe(plan) * 2.9) / 5) * 5;

/** Segundos de descanso: más para los compuestos pesados (rango bajo). */
export const descansoDe = (ex: Ejercicio) => (ex.u === "seg" ? 60 : ex.r[0] <= 8 ? 120 : 90);
