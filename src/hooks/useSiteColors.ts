import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  color_primary: string;
  color_secondary: string;
  color_background: string;
  color_text: string;
}

function hslToHslParts(hsl: string): string {
  return hsl.replace(/\s+/g, " ").trim();
}

function deriveColors(primary: string, secondary: string, background: string, text: string) {
  const p = primary.split(" ").map(Number);
  const s = secondary.split(" ").map(Number);
  const b = background.split(" ").map(Number);

  const lighterBg = `${b[0]} ${Math.min(b[1] + 2, 50)}% ${Math.min(b[2] + 4, 99)}%`;
  const cardBg = `${b[0]} ${b[1]}% ${Math.min(b[2] + 1, 99)}%`;
  const popoverBg = `${b[0]} ${b[1]}% ${Math.min(b[2] + 1, 99)}%`;
  const muted = `${b[0]} ${Math.min(b[1] + 3, 30)}% ${Math.min(b[2] + 5, 97)}%`;
  const mutedFg = `${p[0]} ${Math.min(p[1] - 10, 30)}% ${Math.min(p[2] + 18, 50)}%`;
  const accent = `${p[0]} ${Math.min(p[1] + 5, 60)}% ${Math.min(p[2] + 13, 50)}%`;
  const border = `${p[0]} ${Math.min(p[1] - 5, 20)}% ${Math.min(b[2] - 8, 92)}%`;
  const input = `${p[0]} ${Math.min(p[1] - 5, 20)}% ${Math.min(b[2] - 8, 92)}%`;
  const ring = primary;

  return {
    "--background": hslToHslParts(background),
    "--foreground": hslToHslParts(text),
    "--card": cardBg,
    "--card-foreground": hslToHslParts(text),
    "--popover": popoverBg,
    "--popover-foreground": hslToHslParts(text),
    "--primary": hslToHslParts(primary),
    "--primary-foreground": "0 0% 100%",
    "--secondary": hslToHslParts(secondary),
    "--secondary-foreground": hslToHslParts(text),
    "--muted": muted,
    "--muted-foreground": mutedFg,
    "--accent": accent,
    "--accent-foreground": "0 0% 100%",
    "--destructive": "0 84% 60%",
    "--destructive-foreground": "0 0% 100%",
    "--border": border,
    "--input": input,
    "--ring": ring,
  };
}

export const useSiteColors = () => {
  useEffect(() => {
    let mounted = true;

    const loadAndApply = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("color_primary, color_secondary, color_background, color_text")
        .single();

      if (!mounted || !data) return;

      const root = document.documentElement;
      const colors = deriveColors(
        data.color_primary,
        data.color_secondary,
        data.color_background,
        data.color_text
      );

      Object.entries(colors).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    };

    loadAndApply();

    return () => {
      mounted = false;
      const root = document.documentElement;
      [
        "--background", "--foreground", "--card", "--card-foreground",
        "--popover", "--popover-foreground", "--primary", "--primary-foreground",
        "--secondary", "--secondary-foreground", "--muted", "--muted-foreground",
        "--accent", "--accent-foreground", "--destructive", "--destructive-foreground",
        "--border", "--input", "--ring",
      ].forEach((key) => root.style.removeProperty(key));
    };
  }, []);
};
