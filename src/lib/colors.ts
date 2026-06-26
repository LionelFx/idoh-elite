export const PRESET_COLORS: { hex: string; name: string }[] = [
  { hex: "#1a1a1a", name: "Noir" },
  { hex: "#FFFFFF", name: "Blanc" },
  { hex: "#808080", name: "Gris" },
  { hex: "#C0C0C0", name: "Argent" },
  { hex: "#2C3E50", name: "Anthracite" },
  { hex: "#0D47A1", name: "Marine" },
  { hex: "#2980B9", name: "Bleu" },
  { hex: "#00BCD4", name: "Cyan" },
  { hex: "#C0392B", name: "Rouge" },
  { hex: "#E91E8B", name: "Rose" },
  { hex: "#FF6B35", name: "Corail" },
  { hex: "#FF9D3D", name: "Orange" },
  { hex: "#F39C12", name: "Jaune" },
  { hex: "#27AE60", name: "Vert" },
  { hex: "#1B5E20", name: "Vert foncé" },
  { hex: "#8E44AD", name: "Violet" },
  { hex: "#795548", name: "Marron" },
  { hex: "#F5CBA7", name: "Beige" },
];

function hexToHsl(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return null;
  const r = parseInt(m[1], 16) / 255;
  const g = parseInt(m[2], 16) / 255;
  const b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, s * 100, l * 100];
}

// Nom lisible pour une couleur — d'abord la liste prédéfinie (noms choisis à la main),
// sinon une approximation par teinte/luminosité. Jamais le code hex brut affiché au client.
export function getColorName(hex: string): string {
  const preset = PRESET_COLORS.find(p => p.hex.toLowerCase() === hex.toLowerCase());
  if (preset) return preset.name;

  const hsl = hexToHsl(hex);
  if (!hsl) return hex;
  const [h, s, l] = hsl;

  if (s < 12) {
    if (l > 90) return "Blanc";
    if (l < 12) return "Noir";
    if (l < 40) return "Gris foncé";
    if (l > 70) return "Gris clair";
    return "Gris";
  }

  const modifier = l >= 75 ? " clair" : l < 30 ? " foncé" : "";
  let base: string;
  if (h < 15 || h >= 345) base = "Rouge";
  else if (h < 45) base = "Orange";
  else if (h < 70) base = "Jaune";
  else if (h < 160) base = "Vert";
  else if (h < 195) base = "Turquoise";
  else if (h < 250) base = "Bleu";
  else if (h < 290) base = "Violet";
  else base = "Rose";

  return `${base}${modifier}`;
}
