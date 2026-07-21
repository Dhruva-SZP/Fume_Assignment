// src/lib/cn.ts
// Tiny className combiner. We avoid adding clsx as a dep to keep the bundle small.
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
