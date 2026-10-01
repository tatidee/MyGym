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
