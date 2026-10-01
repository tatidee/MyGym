export type DiaKey = "upper" | "lower" | "push" | "pull" | "legs";

export type SetLog = { kg: number | null; reps: number };

export type Sesion = {
  fecha: string;
  dia: DiaKey;
  ejercicio: string;
  sets: SetLog[];
};

export type Bano = { h: string; t: number };

export type Dia = {
  fecha: string;
  agua: number;
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
  semana: number; // 1 = lunes … 5 = viernes
  calentarHombro?: boolean;
  disco: { kg: number; color: string; tinta: string };
  ej: Ejercicio[];
};
