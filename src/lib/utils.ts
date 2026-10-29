import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined, fmt = 'MMM d, yyyy'): string {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return format(d, fmt);
}

export function formatDateTime(date: string | Date | null | undefined, fmt = 'MMM d, yyyy, h:mm a'): string {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return format(d, fmt);
}

export function relativeTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/** ₹1,23,456 (Indian digit grouping). */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return '—';
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/** Compact Indian money: 4,50,000 → "₹4.5 Lakh"; 1,20,00,000 → "₹1.2 Cr". */
export function formatINRCompact(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return '—';
  if (amount >= 1_00_00_000) return `₹${(amount / 1_00_00_000).toFixed(amount % 1_00_00_000 === 0 ? 0 : 2)} Cr`;
  if (amount >= 1_00_000) return `₹${(amount / 1_00_000).toFixed(amount % 1_00_000 === 0 ? 0 : 2)} Lakh`;
  return formatCurrency(amount);
}

/** 42000 → "42,000 km". */
export function formatKm(km: number | null | undefined): string {
  if (km == null || Number.isNaN(km)) return '—';
  return `${km.toLocaleString('en-IN')} km`;
}

/** "MH12AB1234" → "MH12**1234" (public-safe mask). */
export function maskRegNumber(reg?: string | null): string {
  if (!reg) return '—';
  const clean = reg.replace(/\s+/g, '').toUpperCase();
  if (clean.length < 6) return clean;
  return `${clean.slice(0, 4)}**${clean.slice(-4)}`;
}

/** "PETROL" / "TEST_DRIVE_SCHEDULED" → "Petrol" / "Test Drive Scheduled". */
export function titleCase(value?: string | null, fallback = '—'): string {
  if (!value) return fallback;
  return value
    .replace(/_/g, ' ')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word) => (word.length ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');
}

export function truncate(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str ?? '';
  return `${str.slice(0, maxLength)}…`;
}

/**
 * Best-effort user-facing message from the API error envelope.
 * The API returns `{ message, error, errors: string[] }`; prefer the
 * per-field detail for validation failures.
 */
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  const data = (err as any)?.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.join(', ');
  }
  if (data?.message) return data.message;
  if ((err as any)?.message) return (err as any).message;
  return fallback;
}

/**
 * Drop Mongo/server-managed keys before sending a payload to the API.
 * Admin forms often round-trip a full document (via `setForm({ ...row })`);
 * the Joi update schemas reject unknown keys, so `_id`/timestamps/`__v`
 * must be stripped or the request fails with "…is not allowed".
 */
const SERVER_MANAGED_KEYS = new Set(['_id', 'id', '__v', 'createdAt', 'updatedAt', 'lastmod']);
export function stripServerFields<T extends object>(input: T): Partial<T> {
  const out: Partial<T> = {};
  (Object.keys(input) as (keyof T)[]).forEach((key) => {
    if (!SERVER_MANAGED_KEYS.has(key as string)) {
      out[key] = (input as Record<keyof T, unknown>)[key] as T[keyof T];
    }
  });
  return out;
}

/** Build a query string from a filter object, dropping empty values. */
export function toQueryString(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) return;
    if (Array.isArray(v)) v.forEach((item) => qs.append(k, String(item)));
    else qs.append(k, String(v));
  });
  return qs.toString();
}

/** EMI = P·r·(1+r)^n / ((1+r)^n − 1), r = annual/1200. */
export function calculateEmi(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 12 / 100;
  if (r === 0) return Math.round(principal / months);
  const pow = Math.pow(1 + r, months);
  return Math.round((principal * r * pow) / (pow - 1));
}
