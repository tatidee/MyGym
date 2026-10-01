import type { DiaKey, DiaPlan } from "./types";

/**
 * EL PLAN. Para cambiar la rutina, la comida o las metas, editá este archivo.
 * Los ids de ejercicio (`id`) se usan para guardar el historial: si renombrás
 * un ejercicio cambiá solo `n`, así no perdés sus cargas anteriores.
 */
export const PLAN_VERSION = "v3 · octubre 2026 · lunes a viernes";

export const PLAN: Record<DiaKey, DiaPlan> = {
  upper: {
    key: "upper", n: "Upper", corto: "UP", semana: 1, calentarHombro: true,
    ej: [
      { id: "press-plano-mb", m: "Pecho", n: "Press plano con mancuernas", s: 3, r: [8, 10], rir: "2", nota: "Agarre semi-neutro, codos a ~45°. Bajá hasta donde el hombro no moleste." },
      { id: "remo-mb", m: "Espalda", n: "Remo con mancuerna a 1 brazo", s: 3, r: [8, 10], rir: "1-2" },
      { id: "jalon-neutro", m: "Dorsal", n: "Jalón al pecho agarre neutro", s: 3, r: [8, 12], rir: "1-2" },
      { id: "landmine", m: "Hombro", n: "Press landmine a 1 brazo", s: 2, r: [10, 12], rir: "2-3", nota: "Reemplaza al press militar: empuja en diagonal y carga menos el manguito." },
      { id: "lat-polea", m: "Hombro lateral", n: "Vuelos laterales en polea a 1 brazo", s: 3, r: [12, 15], rir: "1", nota: "Brazo un poco adelante del cuerpo, hasta la altura del hombro." },
      { id: "rot-ext", m: "Manguito rotador", n: "Rotación externa en polea", s: 2, r: [12, 15], rir: "3", nota: "Liviano y lento. Es prevención, nunca al fallo." },
      { id: "curl-barra", m: "Bíceps", n: "Curl con barra", s: 2, r: [10, 12], rir: "1" },
      { id: "frances-mb", m: "Tríceps", n: "Press francés con mancuernas", s: 2, r: [10, 12], rir: "1" },
    ],
  },
  lower: {
    key: "lower", n: "Lower", corto: "LO", semana: 2,
    ej: [
      { id: "hack", m: "Cuádriceps", n: "Hack squat (o prensa)", s: 3, r: [8, 10], rir: "2", nota: "Sin barra en la espalda: no fuerza la rotación del hombro." },
      { id: "rdl", m: "Femorales y glúteos", n: "Peso muerto rumano con barra", s: 3, r: [8, 10], rir: "2" },
      { id: "prensa", m: "Cuádriceps", n: "Prensa", s: 2, r: [10, 12], rir: "1" },
      { id: "femoral-sentado", m: "Femorales", n: "Curl femoral sentado", s: 3, r: [10, 12], rir: "1" },
      { id: "gemelos-prensa", m: "Gemelos", n: "Gemelos en prensa", s: 4, r: [10, 15], rir: "0-1" },
      { id: "abs-polea", m: "Abdomen", n: "Abs en polea con soga", s: 3, r: [12, 15], rir: "1" },
    ],
  },
  push: {
    key: "push", n: "Push", corto: "PU", semana: 3, calentarHombro: true,
    ej: [
      { id: "inclinado-mb", m: "Pecho superior", n: "Press inclinado 30° con mancuernas", s: 3, r: [8, 10], rir: "2", nota: "Agarre neutro (palmas enfrentadas)." },
      { id: "pecho-maquina", m: "Pecho", n: "Press de pecho en máquina", s: 2, r: [10, 12], rir: "1" },
      { id: "aperturas", m: "Pecho", n: "Aperturas en doble polea", s: 2, r: [12, 15], rir: "1", nota: "Rango corto: no estires el pecho al fondo." },
      { id: "lat-mb", m: "Hombro lateral", n: "Vuelos laterales con mancuernas", s: 3, r: [12, 20], rir: "1", nota: "Hasta la altura del hombro, no más arriba." },
      { id: "triceps-soga", m: "Tríceps", n: "Tríceps en polea con soga", s: 3, r: [10, 15], rir: "0-1" },
      { id: "triceps-1b", m: "Tríceps", n: "Tríceps a 1 brazo en polea, agarre invertido", s: 2, r: [12, 15], rir: "1" },
    ],
  },
  pull: {
    key: "pull", n: "Pull", corto: "PL", semana: 4, calentarHombro: true,
    ej: [
      { id: "jalon-1b", m: "Dorsal", n: "Jalón a 1 brazo en polea, en banco", s: 3, r: [8, 12], rir: "1" },
      { id: "gironda", m: "Espalda media", n: "Remo gironda", s: 3, r: [8, 12], rir: "1-2" },
      { id: "remo-apoyado", m: "Espalda alta", n: "Remo con pecho apoyado", s: 2, r: [10, 12], rir: "1" },
      { id: "posteriores", m: "Deltoide posterior", n: "Vuelos posteriores en doble polea", s: 3, r: [12, 15], rir: "0-1" },
      { id: "rot-ext", m: "Manguito rotador", n: "Rotación externa en polea", s: 2, r: [12, 15], rir: "3", nota: "Liviano y lento. Es prevención, nunca al fallo." },
      { id: "scott", m: "Bíceps", n: "Curl scott con mancuerna a 1 brazo", s: 3, r: [10, 12], rir: "0-1" },
      { id: "martillo", m: "Braquial", n: "Curl martillo", s: 2, r: [10, 15], rir: "0-1" },
    ],
  },
  legs: {
    key: "legs", n: "Legs", corto: "LG", semana: 5,
    ej: [
      { id: "bulgara", m: "Cuádriceps y glúteos", n: "Sentadilla búlgara con mancuernas", s: 3, r: [8, 12], rir: "1-2" },
      { id: "hip-thrust", m: "Glúteos", n: "Hip thrust", s: 3, r: [8, 12], rir: "1-2" },
      { id: "extension", m: "Cuádriceps", n: "Extensión de cuádriceps (1C-1iso-3E)", s: 3, r: [12, 15], rir: "0-1" },
      { id: "femoral-acostado", m: "Femorales", n: "Curl femoral acostado", s: 3, r: [10, 12], rir: "0-1" },
      { id: "gemelos-sentado", m: "Gemelos", n: "Gemelos sentado", s: 3, r: [12, 20], rir: "0-1" },
      { id: "plancha", m: "Core", n: "Plancha", s: 3, r: [30, 60], rir: "—", u: "seg", sinPeso: true },
    ],
  },
};

/** Orden en la semana. */
export const ORDEN: DiaKey[] = ["upper", "lower", "push", "pull", "legs"];

/** Día de la semana (0 = domingo) → día de rutina. Lunes a viernes seguidos; sábado (gimnasio cerrado) y domingo, descanso. */
export const POR_DIA: Record<number, DiaKey | undefined> = { 1: "upper", 2: "lower", 3: "push", 4: "pull", 5: "legs" };

/**
 * Calentamiento de hombro (~5 min) antes de Upper, Push y Pull.
 * Si el fisio da ejercicios propios, reemplazan a estos.
 */
export const CALENTAMIENTO_HOMBRO: { n: string; dosis: string; nota?: string }[] = [
  { n: "Rotación externa en polea liviana", dosis: "1×15-20", nota: "Codo pegado al cuerpo." },
  { n: "Rotación interna en polea liviana", dosis: "1×15-20", nota: "Trabaja el subescapular: el más importante." },
  { n: "Separación de banda o face pull liviano", dosis: "1×15" },
  { n: "Elevación en plano escapular", dosis: "1×12", nota: "Sin peso o 1 kg, hasta la altura del hombro." },
  { n: "Series de aproximación del primer ejercicio", dosis: "8 al 50% + 4 al 75%" },
];

export const NOM_SEMANA = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

/** `liquido`: al tildar la comida se suma solo al agua del día, con esa fuente. */
export type Comida = { id: string; n: string; kcal: number; p: number; items: string[]; liquido?: { ml: number; nombre: string } };

export const COMIDAS: Comida[] = [
  { id: "desayuno", n: "Desayuno", kcal: 575, p: 31, items: ["60 g de avena", "300 ml de leche descremada", "1 banana", "2 huevos revueltos"], liquido: { ml: 300, nombre: "Leche del desayuno" } },
  { id: "almuerzo", n: "Almuerzo", kcal: 585, p: 52, items: ["200 g de pechuga de pollo (peso crudo)", "60 g de arroz (crudo)", "Ensalada libre", "10 ml de aceite"] },
  { id: "merienda", n: "Merienda", kcal: 355, p: 27, items: ["200 g de ricota descremada", "1 rebanada de pan integral", "1 manzana"] },
  { id: "cena", n: "Cena: boloñesa mixta", kcal: 720, p: 69, items: ["60 g de soja texturizada (seca)", "150 g de carne picada magra", "50 g de fideos (crudos)", "Salsa de tomate con verduras", "10 ml de aceite"] },
];

export const CAMBIOS = [
  "Pollo ⇄ nalga o peceto (mismo peso)",
  "60 g de arroz ⇄ 250 g de papa o boniato",
  "Fideos ⇄ lentejas (misma cantidad en crudo)",
  "Ricota ⇄ 1 lata de atún al agua + 1 huevo",
];

export const COMPRAS = [
  "Avena", "Leche descremada", "Bananas y manzanas", "Huevos (maple)", "Pechuga de pollo", "Picada magra",
  "Soja texturizada", "Arroz", "Fideos", "Salsa de tomate", "Ricota descremada", "Pan integral", "Verduras", "Aceite",
];

export const MACROS = { kcal: 2200, p: 180, c: 235, g: 60 };
export const AGUA_META = 3000; // ml
export const TERMO_MATE_ML = 1000; // lo que suma "+ termo de mate"
export const DIA_CINTURA = 5; // la cintura se mide los viernes (0 = domingo)
export const CINTURA_META = 88; // cm: relación cintura/altura 0,50 con 1,76 m
export const ALTURA_CM = 176;

export const BRISTOL = ["", "Bolitas duras", "Grumosa", "Agrietada", "Lisa y blanda", "Trozos blandos", "Pastosa", "Líquida"];

// TEMPORAL: borrar después del 02/10/2026 (y sus usos en Hoy, Semana y Entreno: buscá RUTINA_ESPECIAL).
/**
 * Días sueltos que no siguen el split. Ganan sobre POR_DIA en Hoy, Semana y Entreno.
 * Son una checklist: no guardan series en Supabase, así no ensucian el historial ni el informe.
 */
export type RutinaEspecial = {
  n: string;
  corto: string;
  calentarHombro: boolean;
  caminata: string;
  nota: string;
  ej: { n: string; s: number; r: [number, number]; rir: string }[];
};

const ACTIVACION: RutinaEspecial = {
  n: "Activación",
  corto: "AC",
  calentarHombro: true,
  caminata: "30-40 min de caminata",
  nota: "Encontrá pesos y escuchá al hombro, no es para matarte.",
  ej: [
    "Press inclinado 30° con mancuernas, agarre neutro",
    "Jalón al pecho, agarre neutro",
    "Hack squat o prensa",
    "Peso muerto rumano liviano",
    "Vuelos laterales livianos, hasta la altura del hombro",
    "Rotación externa en polea",
  ].map((n) => ({ n, s: 2, r: [10, 12], rir: "3-4" })),
};

export const RUTINA_ESPECIAL: Record<string, RutinaEspecial> = {
  "2026-10-01": ACTIVACION,
  "2026-10-02": ACTIVACION,
};
