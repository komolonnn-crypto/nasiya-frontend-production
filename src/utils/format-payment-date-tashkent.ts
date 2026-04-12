/** O'zbekiston (Asia/Tashkent) bo'yicha sana/vaqt (to'lov jadvali, audit log va h.k.). */
const ASIA_TASHKENT = "Asia/Tashkent";

function formatParts(
  d: Date,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormatPart[] {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: ASIA_TASHKENT,
    ...options,
  }).formatToParts(d);
}

function part(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
): string {
  return parts.find((p) => p.type === type)?.value ?? "";
}

export function formatDdMmYyyyTashkent(
  input: string | Date | undefined | null,
): string {
  if (input == null || input === "") return "";
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  const parts = formatParts(d, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  return `${part(parts, "day")}.${part(parts, "month")}.${part(parts, "year")}`;
}

export function formatDdMmYyyyHhMmSsTashkent(
  input: string | Date | undefined | null,
): string {
  if (input == null || input === "") return "";
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  const parts = formatParts(d, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return `${part(parts, "day")}.${part(parts, "month")}.${part(
    parts,
    "year",
  )} ${part(parts, "hour")}:${part(parts, "minute")}:${part(parts, "second")}`;
}

export function formatHhMmSsTashkent(
  input: string | Date | undefined | null,
): string {
  if (input == null || input === "") return "";
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  const parts = formatParts(d, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return `${part(parts, "hour")}:${part(parts, "minute")}:${part(parts, "second")}`;
}

function utcNoonSerial(y: number, m: number, day: number): number {
  return Math.floor(Date.UTC(y, m - 1, day, 12) / 86400000);
}

function parseDueYmdSerial(dueYmd: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dueYmd.trim());
  if (!m) return null;
  return utcNoonSerial(+m[1], +m[2], +m[3]);
}

/** Belgilangan sana (YYYY-MM-DD) va to'langan vaqt oralig'idagi kunlar (Tashkent kalendari). */
export function delayPaidVsDueCalendarDays(
  dueYmd: string,
  paidAt: string | Date,
): number {
  const dueSerial = parseDueYmdSerial(dueYmd);
  if (dueSerial == null) return 0;
  const paidKey = formatDdMmYyyyTashkent(paidAt);
  const bits = paidKey.split(".").map(Number);
  if (bits.length !== 3 || bits.some((n) => !Number.isFinite(n))) return 0;
  const [dd, mm, yyyy] = bits;
  const paidSerial = utcNoonSerial(yyyy, mm, dd);
  return paidSerial - dueSerial;
}

/** To'lanmagan qatorlar: bugungi Tashkent sanasi belgilangan sanadan keyin necha kun. */
export function delayUnpaidOverdueCalendarDays(dueYmd: string): number {
  const dueSerial = parseDueYmdSerial(dueYmd);
  if (dueSerial == null) return 0;
  const todayKey = formatDdMmYyyyTashkent(new Date());
  const bits = todayKey.split(".").map(Number);
  if (bits.length !== 3 || bits.some((n) => !Number.isFinite(n))) return 0;
  const [dd, mm, yyyy] = bits;
  const todaySerial = utcNoonSerial(yyyy, mm, dd);
  return Math.max(0, todaySerial - dueSerial);
}
