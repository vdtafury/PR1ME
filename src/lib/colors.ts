const COLOR_MAP: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  gray: "#9ca3af",
  grey: "#9ca3af",
  silver: "#c0c0c0",
  beige: "#e7d3b1",
  cream: "#f5ecd7",
  brown: "#7c4a2d",
  tan: "#d2a679",
  red: "#dc2626",
  maroon: "#7f1d1d",
  pink: "#ec4899",
  rose: "#fb7185",
  orange: "#f97316",
  yellow: "#facc15",
  gold: "#d4af37",
  green: "#16a34a",
  olive: "#6b7a3a",
  mint: "#86efac",
  teal: "#0d9488",
  blue: "#2563eb",
  navy: "#1e3a8a",
  sky: "#38bdf8",
  purple: "#7c3aed",
  violet: "#8b5cf6",
  multicolor: "linear-gradient(90deg,#f87171,#facc15,#34d399,#60a5fa,#a78bfa)",
};

export function colorToHex(name: string): string {
  if (!name) return "#cbd5e1";
  const trimmed = name.trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) return trimmed;
  return COLOR_MAP[trimmed.toLowerCase()] ?? "#cbd5e1";
}
