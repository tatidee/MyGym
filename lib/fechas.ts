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
