import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarCheck } from "lucide-react";
import LinkButton from "@/components/LinkButton";

import ProfileAvatar from "@/components/ProfileAvatar";
import { supabase } from "@/integrations/supabase/client";
import { useSiteColors } from "@/hooks/useSiteColors";

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
  const [motionType, setMotionType] = useState("scale");
  const [bgType, setBgType] = useState("gradient");
  useSiteColors();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: linksData }, { data: settingsData }] = await Promise.all([
          supabase.from("links").select("*").eq("is_active", true).order("position", { ascending: true }),
          supabase.from("site_settings").select("*").single(),
        ]);
        if (linksData) setLinks(linksData);
        if (settingsData) setSettings(settingsData);
        setMotionType(localStorage.getItem("motion_type") || "scale");
        setBgType(localStorage.getItem("background_type") || "gradient");
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Colors applied via useSiteColors hook

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
    <main className="min-h-screen bg-background flex flex-col items-center px-4 sm:px-6 py-10 sm:py-16 relative overflow-hidden">
      {/* Background Dinâmico */}
      {(bgType === "none" || bgType === "gradient") && (
        <div className="bg-galactic" />
      )}
      {bgType === "particles" && (
        <div className="floating-elements">
          <div className="orb" /><div className="orb" /><div className="orb" />
        </div>
      )}
      {bgType === "waves" && (
        <div className="bg-galactic" style={{ background: "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--primary) / 0.1) 50%, hsl(var(--background)) 100%)" }} />
      )}
      {bgType === "blur" && (
        <div className="bg-galactic" style={{ filter: "blur(40px)" }} />
      )}

      {/* Floating Elements */}
      <div className="floating-elements">
        <div className="orb" /><div className="orb" /><div className="orb" />
      </div>

        <div className="w-full max-w-lg flex flex-col items-center gap-6 sm:gap-8 relative z-10">
        {/* Brand Section */}
          <div className={`flex flex-col items-center gap-4 sm:gap-5 ${
          motionType === "fade" ? "animate-fade-in-up" :
          motionType === "slide" ? "animate-slide-in-left" :
          motionType === "scale" ? "animate-scale-in" :
          motionType === "blur" ? "animate-fade-in-up" :
          motionType === "none" ? "" :
          "animate-scale-in"
        }`}>
          <div className="profile-ring">
            <ProfileAvatar size="lg" src={settings?.avatar_url} />
          </div>

          <h1 className={`text-3xl sm:text-4xl md:text-5xl font-bold text-center text-foreground tracking-tight ${headingFont}`}>
            {settings?.site_title ?? "Mentoria & Consultoria em IA"}
          </h1>

          {settings?.site_bio && (
            <p className={`text-muted-foreground text-center text-base md:text-lg leading-relaxed max-w-sm ${bodyFont}`}>
              {settings.site_bio}
            </p>
          )}
        </div>

        {/* Links Section */}
        <nav className="w-full flex flex-col gap-4 mt-4">
          <a
            href="/agenda"
            className="btn-gradient w-full flex items-center justify-center gap-2"
          >
            <CalendarCheck className="w-5 h-5" strokeWidth={1.75} />
            Agendar Consulta
          </a>

          {links.length === 0 ? null : (
            links.map((link, index) => (
              <div
                key={link.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <LinkButton title={link.title} url={link.url} icon={link.icon} />
              </div>
            ))
          )}
        </nav>

        {/* Footer */}
        <footer className="mt-16 text-center space-y-2">
          <p className={`text-sm text-muted-foreground ${bodyFont}`}>
            © {new Date().getFullYear()} {settings?.site_title ?? "Jane Santana"} • Todos os direitos reservados
          </p>
          <a
            href="/admin"
            className="text-xs text-muted-foreground/40 hover:text-primary transition-colors inline-block"
          >
            Admin
          </a>
        </footer>
      </div>
    </main>
  );
};

export default Index;
