import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck } from "lucide-react";
import LinkButton from "@/components/LinkButton";
import ProfileAvatar from "@/components/ProfileAvatar";
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

  const headingFont = settings?.font_heading ?? "font-playfair";
  const bodyFont = settings?.font_body ?? "font-arial";

  return (
    <main className="min-h-screen bg-background flex flex-col items-center px-6 py-16">
      <div className="w-full max-w-lg flex flex-col items-center gap-8">
        {/* Brand Section */}
        <div className="flex flex-col items-center gap-5 animate-scale-in">
          <ProfileAvatar size="lg" />

          <h1 className={`text-4xl md:text-5xl font-bold text-center text-foreground tracking-tight ${headingFont}`}>
            {settings?.site_title ?? "Link Tree"}
          </h1>

          {settings?.site_bio && (
            <p className={`text-muted-foreground text-center text-base md:text-lg leading-relaxed max-w-sm ${bodyFont}`}>
              {settings.site_bio}
            </p>
          )}
        </div>

        {/* Links Section */}
        <nav className="w-full flex flex-col gap-4 mt-4">
          <Link
            to="/agenda"
            className={`w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full py-4 px-6 font-semibold shadow-lg hover:opacity-90 transition-opacity ${bodyFont}`}
          >
            <CalendarCheck className="w-5 h-5" strokeWidth={1.75} />
            Agendar Consulta
          </Link>
          {links.length === 0 ? null : (
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
        <footer className="mt-16 text-center space-y-2">
          <p className={`text-sm text-muted-foreground ${bodyFont}`}>
            © {new Date().getFullYear()} {settings?.site_title ?? "Link Tree"} • Todos os direitos reservados
          </p>
          <Link
            to="/admin"
            className="text-xs text-muted-foreground/40 hover:text-primary transition-colors inline-block"
          >
            Admin
          </Link>
        </footer>
      </div>
    </main>
  );
};

export default Index;
