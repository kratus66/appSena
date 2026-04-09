import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPageTitle(segment: string) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (value) => value.toUpperCase());
}
