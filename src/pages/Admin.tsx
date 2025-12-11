import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface LinkItem {
  id: string;
  title: string;
  url: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [links, setLinks] = useState<LinkItem[]>([
    { id: "1", title: "Instagram", url: "https://instagram.com" },
    { id: "2", title: "WhatsApp", url: "https://wa.me/5511999999999" },
    { id: "3", title: "E-book Gratuito", url: "#" },
    { id: "4", title: "Loja", url: "#" },
    { id: "5", title: "Contato", url: "mailto:contato@guiafacil.com" },
  ]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsAuthenticated(true);
      toast({ title: "Login realizado!", description: "Bem-vinda ao painel admin." });
    } else {
      toast({ title: "Senha incorreta", variant: "destructive" });
    }
  };

  const addLink = () => {
    const newLink: LinkItem = {
      id: Date.now().toString(),
      title: "Novo Link",
      url: "#",
    };
    setLinks([...links, newLink]);
  };

  const updateLink = (id: string, field: "title" | "url", value: string) => {
    setLinks(links.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ));
  };

  const deleteLink = (id: string) => {
    setLinks(links.filter(link => link.id !== id));
    toast({ title: "Link removido" });
  };

  const saveChanges = () => {
    toast({ title: "Alterações salvas!", description: "Os links foram atualizados." });
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="font-montserrat">Painel Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha"
                />
              </div>
              <Button type="submit" className="w-full">
                Entrar
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
            <Button variant="outline" onClick={() => navigate("/")}>
              <Eye className="w-4 h-4 mr-2" />
              Ver Site
            </Button>
            <Button onClick={saveChanges}>
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
            {links.map((link, index) => (
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
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">URL</Label>
                    <Input
                      value={link.url}
                      onChange={(e) => updateLink(link.id, "url", e.target.value)}
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
            ))}
          </CardContent>
        </Card>

        {/* Info */}
        <p className="text-center text-xs text-muted-foreground">
          Senha padrão: admin123
        </p>
      </div>
    </main>
  );
};

export default Admin;
