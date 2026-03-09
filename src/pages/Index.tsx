import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LinkButton from "@/components/LinkButton";
import { supabase } from "@/integrations/supabase/client";

interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon: string | null;
  is_active: boolean;
  position: number;
}

interface SiteSettings {
  id: string;
  site_title: string;
  site_bio: string | null;
  avatar_url: string | null;
  color_primary: string;
  color_secondary: string;
  color_background: string;
  color_text: string;
  font_heading: string;
  font_body: string;
}

const Index = () => {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: linksData }, { data: settingsData }] = await Promise.all([
          supabase.from("links").select("*").eq("is_active", true).order("position", { ascending: true }),
          supabase.from("site_settings").select("*").single(),
        ]);
        if (linksData) setLinks(linksData);
        if (settingsData) setSettings(settingsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Apply dynamic CSS variables from site_settings
  useEffect(() => {
    if (!settings) return;
    const root = document.documentElement;
    root.style.setProperty("--primary", settings.color_primary);
    root.style.setProperty("--background", settings.color_background);
    root.style.setProperty("--foreground", settings.color_text);
    root.style.setProperty("--card-foreground", settings.color_text);
    root.style.setProperty("--secondary", settings.color_secondary);
    return () => {
      // Reset on unmount
      root.style.removeProperty("--primary");
      root.style.removeProperty("--background");
      root.style.removeProperty("--foreground");
      root.style.removeProperty("--card-foreground");
      root.style.removeProperty("--secondary");
    };
  }, [settings]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        {/* Brand Section */}
        <div className="flex flex-col items-center gap-4 animate-scale-in mb-8">
          {settings?.avatar_url && (
            <img
              src={settings.avatar_url}
              alt={settings.site_title}
              className="w-20 h-20 rounded-full object-cover border-2 border-primary/30 shadow-md"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <h1 className={`text-3xl font-bold text-center text-foreground ${settings?.font_heading ?? ""}`}>
            {settings?.site_title ?? "Link Tree"}
          </h1>
          {settings?.site_bio && (
            <p className={`text-muted-foreground text-center text-sm ${settings?.font_body ?? ""}`}>
              {settings.site_bio}
            </p>
          )}
        </div>

        {/* Links Section */}
        <nav className="w-full flex flex-col gap-4 mt-6">
          {links.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm">Nenhum link disponível.</p>
          ) : (
            links.map((link, index) => (
              <div
                key={link.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <LinkButton title={link.title} url={link.url} />
              </div>
            ))
          )}
        </nav>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {settings?.site_title ?? "Link Tree"} • Todos os direitos reservados
          </p>
          <Link
            to="/admin"
            className="text-xs text-muted-foreground/50 hover:text-primary transition-colors mt-2 inline-block"
          >
            Admin
          </Link>
        </footer>
      </div>
    </main>
  );
};

export default Index;
