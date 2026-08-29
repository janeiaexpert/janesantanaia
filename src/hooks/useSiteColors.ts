import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  color_primary: string;
  color_secondary: string;
  color_background: string;
  color_text: string;
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
      root.style.setProperty("--primary", data.color_primary);
      root.style.setProperty("--background", data.color_background);
      root.style.setProperty("--foreground", data.color_text);
      root.style.setProperty("--card-foreground", data.color_text);
      root.style.setProperty("--secondary", data.color_secondary);
    };

    loadAndApply();

    return () => {
      mounted = false;
      const root = document.documentElement;
      root.style.removeProperty("--primary");
      root.style.removeProperty("--background");
      root.style.removeProperty("--foreground");
      root.style.removeProperty("--card-foreground");
      root.style.removeProperty("--secondary");
    };
  }, []);
};
