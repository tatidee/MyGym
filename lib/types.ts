export type DiaKey = "upper" | "lower" | "push" | "pull" | "legs";

export type SetLog = { kg: number | null; reps: number };

export type Sesion = {
  fecha: string;
  dia: DiaKey;
  ejercicio: string;
  sets: SetLog[];
};

export type Bano = { h: string; t: number };

/** Una toma de líquido. `auto` = id de la comida que la generó (se borra al destildarla). */
export type AguaToma = { ml: number; fuente: string; h: string; auto?: string };

export type Dia = {
  fecha: string;
  agua: number; // siempre la suma de agua_log
  agua_log: AguaToma[];
  banos: Bano[];
  peso: number | null;
  cintura: number | null;
  hombro: number | null;
  nota: string;
  comidas: Record<string, boolean>;
};

export type Ejercicio = {
  id: string;
  n: string;
  m: string; // músculo principal
  s: number;
  r: [number, number];
  rir: string;
  nota?: string;
  u?: string;
  sinPeso?: boolean;
};

export type DiaPlan = {
  key: DiaKey;
  n: string;
  corto: string; // abreviatura de 2 letras para la semana
  semana: number; // 1 = lunes … 5 = viernes
  calentarHombro?: boolean;
  ej: Ejercicio[];
};
