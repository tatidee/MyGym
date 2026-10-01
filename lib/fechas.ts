const pad = (n: number) => String(n).padStart(2, "0");

export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const hoyISO = () => iso(new Date());
export const parseISO = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const ddmm = (s: string) => `${s.slice(8, 10)}/${s.slice(5, 7)}`;
export const addDays = (s: string, n: number) => {
  const d = parseISO(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};
/** Lunes de la semana de esa fecha. */
export const lunesDe = (s: string) => {
  const wd = parseISO(s).getDay();
  return addDays(s, wd === 0 ? -6 : 1 - wd);
};
export const horaAhora = () => {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const fmt = (n: number | null | undefined, dec = 1) =>
  n == null || Number.isNaN(n) ? "—" : Number(n).toLocaleString("es-UY", { maximumFractionDigits: dec });

/** Acepta "22,5" o "22.5". */
export const num = (v: string | null | undefined) => {
  if (v == null || v.trim() === "") return null;
  const x = parseFloat(v.replace(",", "."));
  return Number.isNaN(x) ? null : x;
};

/** 2200 → "2.200" (es-UY no agrupa los números de 4 cifras). */
export const miles = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const DIA_CORTO = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];
const MES_CORTO = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

/** Número de semana ISO (la semana arranca el lunes). */
export const semanaISO = (s: string) => {
  const d = parseISO(s);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const ene4 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - ene4.getTime()) / 864e5 - 3 + ((ene4.getDay() + 6) % 7)) / 7);
};

/** "JUE 1 OCT" */
export const fechaCorta = (s: string) => {
  const d = parseISO(s);
  return `${DIA_CORTO[d.getDay()]} ${d.getDate()} ${MES_CORTO[d.getMonth()]}`;
};

/** Segundos → "4:05" o "1:02:10". */
export const reloj = (seg: number) => {
  const s = Math.max(0, Math.floor(seg));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
};
