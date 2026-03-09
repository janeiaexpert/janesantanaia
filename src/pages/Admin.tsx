import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, Eye, LogOut, Settings, Link2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

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

const FONT_OPTIONS = [
  { label: "Sans-serif", value: "font-sans" },
  { label: "Serif", value: "font-serif" },
  { label: "Mono", value: "font-mono" },
];

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Links state
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);

  // Site settings state
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => checkAdminRole(session.user.id), 0);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking admin role:", error);
      }
      setIsAdmin(!!data);
    } catch (error) {
      console.error("Error checking admin role:", error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchLinks();
      fetchSettings();
    }
  }, [isAdmin]);

  const fetchLinks = async () => {
    setLinksLoading(true);
    try {
      const { data, error } = await supabase
        .from("links")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error("Error fetching links:", error);
      toast({ title: "Erro ao carregar links", variant: "destructive" });
    } finally {
      setLinksLoading(false);
    }
  };

  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .single();
      if (error && error.code !== "PGRST116") throw error;
      if (data) setSettings(data);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({ title: "Erro ao carregar configurações", variant: "destructive" });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          toast({ title: "Erro", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Email enviado!", description: "Verifique seu email para redefinir a senha." });
          setIsForgotPassword(false);
        }
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) {
          toast({ title: "Erro no cadastro", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Conta criada!", description: "Verifique seu email para confirmar a conta." });
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast({ title: "Erro no login", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Login realizado!", description: "Bem-vindo ao painel admin." });
        }
      }
    } catch (error) {
      toast({ title: "Erro", description: "Ocorreu um erro inesperado", variant: "destructive" });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logout realizado" });
  };

  // --- Links CRUD ---
  const addLink = async () => {
    try {
      const newPosition = links.length > 0 ? Math.max(...links.map(l => l.position)) + 1 : 0;
      const { data, error } = await supabase
        .from("links")
        .insert({ title: "Novo Link", url: "#", position: newPosition })
        .select()
        .single();
      if (error) throw error;
      setLinks([...links, data]);
      toast({ title: "Link adicionado" });
    } catch (error) {
      console.error("Error adding link:", error);
      toast({ title: "Erro ao adicionar link", variant: "destructive" });
    }
  };

  const updateLink = (id: string, field: "title" | "url", value: string) => {
    setLinks(links.map(link => link.id === id ? { ...link, [field]: value } : link));
  };

  const saveLink = async (id: string) => {
    const link = links.find(l => l.id === id);
    if (!link) return;
    try {
      const { error } = await supabase
        .from("links")
        .update({ title: link.title, url: link.url })
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Link salvo" });
    } catch (error) {
      console.error("Error saving link:", error);
      toast({ title: "Erro ao salvar link", variant: "destructive" });
    }
  };

  const deleteLink = async (id: string) => {
    try {
      const { error } = await supabase.from("links").delete().eq("id", id);
      if (error) throw error;
      setLinks(links.filter(link => link.id !== id));
      toast({ title: "Link removido" });
    } catch (error) {
      console.error("Error deleting link:", error);
      toast({ title: "Erro ao remover link", variant: "destructive" });
    }
  };

  const saveAllLinks = async () => {
    try {
      for (const link of links) {
        await supabase
          .from("links")
          .update({ title: link.title, url: link.url })
          .eq("id", link.id);
      }
      toast({ title: "Links salvos!", description: "Todos os links foram atualizados." });
    } catch (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  // --- Settings ---
  const updateSetting = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings(prev => prev ? { ...prev, [key]: value } : prev);
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSettingsSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .update({
          site_title: settings.site_title,
          site_bio: settings.site_bio,
          avatar_url: settings.avatar_url,
          color_primary: settings.color_primary,
          color_secondary: settings.color_secondary,
          color_background: settings.color_background,
          color_text: settings.color_text,
          font_heading: settings.font_heading,
          font_body: settings.font_body,
        })
        .eq("id", settings.id);

      if (error) throw error;
      toast({ title: "Configurações salvas!", description: "As alterações foram aplicadas ao site." });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({ title: "Erro ao salvar configurações", variant: "destructive" });
    } finally {
      setSettingsSaving(false);
    }
  };

  // --- Color helper: hsl string -> hex for input[type=color] ---
  const hslToHex = (hsl: string): string => {
    try {
      const parts = hsl.trim().split(/\s+/);
      if (parts.length < 3) return "#000000";
      const h = parseFloat(parts[0]);
      const s = parseFloat(parts[1].replace("%", "")) / 100;
      const l = parseFloat(parts[2].replace("%", "")) / 100;
      const a = s * Math.min(l, 1 - l);
      const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, "0");
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    } catch {
      return "#000000";
    }
  };

  const hexToHsl = (hex: string): string => {
    try {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) return "0 0% 0%";
      let r = parseInt(result[1], 16) / 255;
      let g = parseInt(result[2], 16) / 255;
      let b = parseInt(result[3], 16) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0, s = 0;
      const l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    } catch {
      return "0 0% 0%";
    }
  };

  // --- Auth screens ---
  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="font-montserrat">
              {isForgotPassword ? "Recuperar Senha" : (isSignUp ? "Criar Conta" : "Painel Admin")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              {!isForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a senha"
                    required
                    minLength={6}
                  />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={authLoading}>
                {authLoading
                  ? (isForgotPassword ? "Enviando..." : (isSignUp ? "Criando..." : "Entrando..."))
                  : (isForgotPassword ? "Enviar Email" : (isSignUp ? "Criar Conta" : "Entrar"))
                }
              </Button>
              {!isForgotPassword && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => { setIsSignUp(!isSignUp); setIsForgotPassword(false); }}
                >
                  {isSignUp ? "Já tenho conta" : "Criar nova conta"}
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                className="w-full text-sm"
                onClick={() => { setIsForgotPassword(!isForgotPassword); setIsSignUp(false); }}
              >
                {isForgotPassword ? "Voltar ao login" : "Esqueci minha senha"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao site
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="font-montserrat text-destructive">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">Você não tem permissão de administrador.</p>
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
              <Button variant="ghost" onClick={() => navigate("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao site
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-montserrat font-bold">Painel Admin</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleLogout} title="Sair">
              <LogOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              <Eye className="w-4 h-4 mr-2" />
              Ver Site
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="links">
          <TabsList className="w-full">
            <TabsTrigger value="links" className="flex-1 gap-2">
              <Link2 className="w-4 h-4" />
              Links
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 gap-2">
              <Palette className="w-4 h-4" />
              Personalização
            </TabsTrigger>
          </TabsList>

          {/* ── Links Tab ── */}
          <TabsContent value="links" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-poppins text-lg">Gerenciar Links</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={addLink}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                  <Button size="sm" onClick={saveAllLinks}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {linksLoading ? (
                  <p className="text-center text-muted-foreground">Carregando links...</p>
                ) : links.length === 0 ? (
                  <p className="text-center text-muted-foreground">Nenhum link cadastrado</p>
                ) : (
                  links.map((link, index) => (
                    <div
                      key={link.id}
                      className="flex gap-3 items-start p-4 bg-muted rounded-lg animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex-1 space-y-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Título</Label>
                          <Input
                            value={link.title}
                            onChange={(e) => updateLink(link.id, "title", e.target.value)}
                            onBlur={() => saveLink(link.id)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">URL</Label>
                          <Input
                            value={link.url}
                            onChange={(e) => updateLink(link.id, "url", e.target.value)}
                            onBlur={() => saveLink(link.id)}
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => deleteLink(link.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Settings Tab ── */}
          <TabsContent value="settings" className="mt-4">
            {settingsLoading ? (
              <p className="text-center text-muted-foreground py-8">Carregando configurações...</p>
            ) : settings ? (
              <div className="space-y-4">
                {/* Perfil */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Informações do Perfil
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <Label>Título do Site</Label>
                      <Input
                        value={settings.site_title}
                        onChange={(e) => updateSetting("site_title", e.target.value)}
                        placeholder="Ex: Meu Link Tree"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Bio / Descrição</Label>
                      <Textarea
                        value={settings.site_bio ?? ""}
                        onChange={(e) => updateSetting("site_bio", e.target.value)}
                        placeholder="Uma breve descrição sobre você ou seu negócio"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>URL do Avatar</Label>
                      <Input
                        value={settings.avatar_url ?? ""}
                        onChange={(e) => updateSetting("avatar_url", e.target.value || null)}
                        placeholder="https://exemplo.com/minha-foto.jpg"
                      />
                      {settings.avatar_url && (
                        <div className="mt-2 flex items-center gap-3">
                          <img
                            src={settings.avatar_url}
                            alt="Preview do avatar"
                            className="w-12 h-12 rounded-full object-cover border border-border"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
                          <span className="text-xs text-muted-foreground">Preview do avatar</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Cores */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Paleta de Cores
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    {[
                      { key: "color_primary" as const, label: "Cor Primária" },
                      { key: "color_secondary" as const, label: "Cor Secundária" },
                      { key: "color_background" as const, label: "Fundo" },
                      { key: "color_text" as const, label: "Texto" },
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs">{label}</Label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={hslToHex(settings[key])}
                            onChange={(e) => updateSetting(key, hexToHsl(e.target.value))}
                            className="h-9 w-9 rounded cursor-pointer border border-border p-0.5 bg-transparent"
                          />
                          <Input
                            value={settings[key]}
                            onChange={(e) => updateSetting(key, e.target.value)}
                            placeholder="H S% L%"
                            className="text-xs font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Fontes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Tipografia</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    {[
                      { key: "font_heading" as const, label: "Fonte dos Títulos" },
                      { key: "font_body" as const, label: "Fonte do Corpo" },
                    ].map(({ key, label }) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs">{label}</Label>
                        <div className="flex flex-col gap-1">
                          {FONT_OPTIONS.map((opt) => (
                            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={key}
                                value={opt.value}
                                checked={settings[key] === opt.value}
                                onChange={() => updateSetting(key, opt.value)}
                                className="accent-primary"
                              />
                              <span className={`text-sm ${opt.value}`}>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Save button */}
                <Button className="w-full" onClick={saveSettings} disabled={settingsSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {settingsSaving ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma configuração encontrada.
              </p>
            )}
          </TabsContent>
        </Tabs>

        <p className="text-center text-xs text-muted-foreground">
          Logado como: {user.email}
        </p>
      </div>
    </main>
  );
};

export default Admin;
