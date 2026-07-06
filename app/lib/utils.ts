import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatReads(reads: string) {
  return reads;
}

export function clampText(text: string, max: number) {
  return text.length > max ? text.slice(0, max) + "…" : text;
}