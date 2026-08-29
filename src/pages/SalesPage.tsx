import { useState, useEffect } from "react";
import { CalendarCheck, Star, CheckCircle2, ArrowRight, Clock, Users, Trophy, Shield, Zap, Heart, Target, TrendingUp, Phone, Mail, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteColors } from "@/hooks/useSiteColors";

interface SiteSettings {
  site_title: string;
  site_bio: string | null;
  avatar_url: string | null;
  color_primary: string;
}

const SalesPage = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  useSiteColors();

  useEffect(() => {
    supabase.from("site_settings").select("site_title, site_bio, avatar_url, color_primary").single()
      .then(({ data }) => { if (data) setSettings(data); });
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-galactic opacity-50" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            ⚡ Vagas Limitadas
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Transforme Sua Carreira com <span className="text-primary">Mentoria Personalizada</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Alcance seus objetivos profissionais com orientação de especialistas. 
            Nosso método comprovado já ajudou centenas de pessoas a conquistarem resultados extraordinários.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#pricing" className="btn-gradient inline-flex items-center justify-center gap-2">
              <CalendarCheck className="w-5 h-5" />
              Quero Começar Agora
            </a>
            <a href="#results" className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary hover:text-primary-foreground transition-all">
              Ver Resultados
            </a>
          </div>
          <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>+500 clientes atendidos</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              <span>4.9/5 avaliação</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Garantia de 7 dias</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problema */}
      <section className="py-20 px-6 bg-card">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Você se identifica com alguma dessas situações?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              "Sente que está estagnado na carreira",
              "Não sabe como dar o próximo passo",
              "Falta clareza nos objetivos profissionais",
              "Dificuldade em se posicionar no mercado",
              "Quer aumentar sua renda mas não sabe como",
              "Precisa de orientação personalizada",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-background border border-border">
                <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-destructive text-sm">✗</span>
                </div>
                <span className="text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solução */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
            Como Nossa Mentoria Funciona
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Um processo simples e comprovado para transformar sua carreira
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Diagnóstico", desc: "Analisamos sua situação atual e definimos metas claras e alcançáveis" },
              { icon: TrendingUp, title: "Estratégia", desc: "Criamos um plano personalizado com ações práticas para seu crescimento" },
              { icon: Trophy, title: "Resultados", desc: "Acompanhamos seu progresso e ajustamos o caminho para o sucesso" },
            ].map((item, i) => (
              <div key={i} className="text-center p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-colors">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-20 px-6 bg-card">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            O Que Você Vai Receber
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Users, text: "Sessões 1:1 personalizadas" },
              { icon: Clock, text: "Acompanhamento contínuo" },
              { icon: Zap, text: "Método comprovado e testado" },
              { icon: Heart, text: "Suporte dedicado e acolhedor" },
              { icon: Star, text: "Material exclusivo incluso" },
              { icon: Shield, text: "Garantia de satisfação" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="results" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Resultados Que Falam Por Si
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Ana S.", role: "Empreendedora", text: "Em 3 meses dupliquei minha renda. A mentoria foi transformadora!", rating: 5 },
              { name: "Carlos M.", role: "Gerente", text: "Consegui a promoção que sempre quis. Orientação incrível!", rating: 5 },
              { name: "Juliana P.", role: "Freelancer", text: "Organizei meu negócio e agora faturamento 3x mais.", rating: 5 },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex gap-1 mb-4">
                  {[...Array(item.rating)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-4 italic">"{item.text}"</p>
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preço */}
      <section id="pricing" className="py-20 px-6 bg-card">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Invista No Seu Futuro
          </h2>
          <p className="text-muted-foreground mb-12">
            Escolha o plano ideal para seus objetivos
          </p>
          <div className="p-8 rounded-3xl bg-background border-2 border-primary relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
              Mais Popular
            </div>
            <h3 className="text-2xl font-bold mb-2">Plano Completo</h3>
            <div className="mb-6">
              <span className="text-5xl font-bold text-primary">R$ 997</span>
              <span className="text-muted-foreground">/único</span>
            </div>
            <ul className="text-left space-y-3 mb-8">
              {[
                "4 sessões 1:1 de 60 minutos",
                "Plano personalizado de carreira",
                "Acesso ao grupo exclusivo",
                "Material de apoio completo",
                "Suporte por 30 dias",
                "Garantia de 7 dias",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <a href="#contact" className="btn-gradient w-full inline-flex items-center justify-center gap-2">
              Garantir Minha Vaga
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Perguntas Frequentes
          </h2>
          <div className="space-y-4">
            {[
              { q: "Quanto tempo dura a mentoria?", a: "O plano completo tem duração de 4 semanas, com sessões semanais de 60 minutos." },
              { q: "Como funcionam as sessões?", a: "As sessões são online via videochamada, com total privacidade e flexibilidade de horário." },
              { q: "E se eu não gostar?", a: "Oferecemos garantia de 7 dias. Se não ficar satisfeito, devolvemos 100% do seu investimento." },
              { q: "Preciso de experiência prévia?", a: "Não! Nossa mentoria é para todos os níveis, desde iniciantes até profissionais experientes." },
            ].map((item, i) => (
              <details key={i} className="group p-4 rounded-xl bg-card border border-border">
                <summary className="font-semibold cursor-pointer list-none flex items-center justify-between">
                  {item.q}
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-muted-foreground mt-3">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section id="contact" className="py-20 px-6 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto Para Transformar Sua Carreira?
          </h2>
          <p className="mb-8 opacity-90">
            Não perca essa oportunidade. Vagas limitadas para garantir atendimento personalizado.
          </p>
          <a href="/agenda" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-foreground rounded-full font-semibold hover:bg-white/90 transition-all">
            <CalendarCheck className="w-5 h-5" />
            Agendar Consulta Grátis
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-muted-foreground mb-4">
            © {new Date().getFullYear()} {settings?.site_title ?? "Mentoria & Consultoria"} • Todos os direitos reservados
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              <Phone className="w-4 h-4 inline mr-1" />
              Contato
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default SalesPage;
