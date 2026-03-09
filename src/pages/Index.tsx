import { Link } from "react-router-dom";
import { Instagram, MessageCircle, BookOpen, Mail, ShoppingBag } from "lucide-react";
import LinkButton from "@/components/LinkButton";

const links = [
  {
    title: "Instagram",
    url: "https://instagram.com",
    icon: <Instagram className="w-5 h-5" />,
  },
  {
    title: "WhatsApp",
    url: "https://wa.me/5511999999999",
    icon: <MessageCircle className="w-5 h-5" />,
  },
  {
    title: "E-book Gratuito",
    url: "#",
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    title: "Loja",
    url: "#",
    icon: <ShoppingBag className="w-5 h-5" />,
  },
  {
    title: "Contato",
    url: "mailto:contato@guiafacil.com",
    icon: <Mail className="w-5 h-5" />,
  },
];

const Index = () => {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-md flex flex-col items-center gap-6">
        {/* Profile Section */}
        <div 
          className="flex flex-col items-center gap-4 animate-scale-in"
        >
          <Link to="#" className="group">
            <ProfileAvatar />
          </Link>
          
          <Link 
            to="#"
            className="text-center group"
          >
            <h1 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
              Tex IA
            </h1>
            <p className="text-muted-foreground font-poppins text-sm mt-1">
              @texiaoficialbr
            </p>
          </Link>
        </div>

        {/* Links Section */}
        <nav className="w-full flex flex-col gap-3 mt-4">
          {links.map((link, index) => (
            <div
              key={link.title}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <LinkButton {...link} />
            </div>
          ))}
        </nav>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-xs text-muted-foreground font-inter">
            © 2025 Tex IA • Todos os direitos reservados
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
