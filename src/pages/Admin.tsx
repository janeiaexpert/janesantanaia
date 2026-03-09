import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, Eye, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [linksLoading, setLinksLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            checkAdminRole(session.user.id);
          }, 0);
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
          toast({ 
            title: "Erro", 
            description: error.message,
            variant: "destructive" 
          });
        } else {
          toast({ 
            title: "Email enviado!", 
            description: "Verifique seu email para redefinir a senha." 
          });
          setIsForgotPassword(false);
        }
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
          },
        });

        if (error) {
          toast({ 
            title: "Erro no cadastro", 
            description: error.message,
            variant: "destructive" 
          });
        } else {
          toast({ 
            title: "Conta criada!", 
            description: "Verifique seu email para confirmar a conta." 
          });
          setIsSignUp(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast({ 
            title: "Erro no login", 
            description: error.message,
            variant: "destructive" 
          });
        } else {
          toast({ title: "Login realizado!", description: "Bem-vindo ao painel admin." });
        }
      }
    } catch (error) {
      toast({ 
        title: "Erro", 
        description: "Ocorreu um erro inesperado",
        variant: "destructive" 
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logout realizado" });
  };

  const addLink = async () => {
    try {
      const newPosition = links.length > 0 ? Math.max(...links.map(l => l.position)) + 1 : 0;
      
      const { data, error } = await supabase
        .from("links")
        .insert({
          title: "Novo Link",
          url: "#",
          position: newPosition,
        })
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

  const updateLink = async (id: string, field: "title" | "url", value: string) => {
    setLinks(links.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
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
      const { error } = await supabase
        .from("links")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setLinks(links.filter(link => link.id !== id));
      toast({ title: "Link removido" });
    } catch (error) {
      console.error("Error deleting link:", error);
      toast({ title: "Erro ao remover link", variant: "destructive" });
    }
  };

  const saveAllChanges = async () => {
    try {
      for (const link of links) {
        await supabase
          .from("links")
          .update({ title: link.title, url: link.url })
          .eq("id", link.id);
      }
      toast({ title: "Alterações salvas!", description: "Os links foram atualizados." });
    } catch (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

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
              {isSignUp ? "Criar Conta" : "Painel Admin"}
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
              <Button type="submit" className="w-full" disabled={authLoading}>
                {authLoading 
                  ? (isSignUp ? "Criando..." : "Entrando...") 
                  : (isSignUp ? "Criar Conta" : "Entrar")
                }
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? "Já tenho conta" : "Criar nova conta"}
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
            <p className="text-muted-foreground">
              Você não tem permissão de administrador.
            </p>
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
            <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              <Eye className="w-4 h-4 mr-2" />
              Ver Site
            </Button>
            <Button onClick={saveAllChanges}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>

        {/* Links Editor */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-poppins text-lg">Gerenciar Links</CardTitle>
            <Button size="sm" variant="outline" onClick={addLink}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
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

        {/* Info */}
        <p className="text-center text-xs text-muted-foreground">
          Logado como: {user.email}
        </p>
      </div>
    </main>
  );
};

export default Admin;
