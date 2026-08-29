import { useState } from "react";
import { Sparkles, FileText, Presentation, Table, ChevronDown, ChevronUp, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: <FileText className="w-5 h-5" />,
    title: "Documentos Profissionais",
    description: "Relatórios, propostas, contratos com acabamento premium",
  },
  {
    icon: <Presentation className="w-5 h-5" />,
    title: "Apresentações & Slides",
    description: "Decks visuais e impactantes para reuniões",
  },
  {
    icon: <Table className="w-5 h-5" />,
    title: "Planilhas & Dados",
    description: "Análises, gráficos e organização de informações",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Conectores Externos (MCPs)",
    description: "Integração com ferramentas externas em tempo real",
  },
];

const ChatGPTWorkCard = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full">
      <a
        href="https://chatgpt.com"
        target="_blank"
        rel="noopener noreferrer"
        className="chatgpt-work-card group block"
        onClick={(e) => {
          e.preventDefault();
          setExpanded(!expanded);
        }}
      >
        <div className="flex items-center gap-3 w-full">
          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10a37f] to-[#1a7f64] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#10a37f]/30">
            <Sparkles className="w-5 h-5 text-white" />
          </span>
          <div className="flex-1 text-left">
            <span className="text-foreground text-base font-semibold block">Conheça o ChatGPT Work</span>
            <span className="text-muted-foreground text-xs block mt-0.5">Documentos, slides, planilhas e muito mais</span>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground transition-transform" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform" />
          )}
        </div>
      </a>

      {expanded && (
        <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-[#10a37f]/5 to-[#1a7f64]/5 border border-[#10a37f]/20 space-y-3 animate-fade-in-up">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Use o <strong className="text-foreground">ChatGPT Work</strong> quando uma tarefa exigir mais que uma resposta rápida. 
            Ele reúne contexto, organiza o trabalho e cria documentos, slides, planilhas e muito mais com acabamento profissional.
          </p>

          <div className="grid grid-cols-1 gap-2">
            {FEATURES.map((feature, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50"
              >
                <span className="w-8 h-8 rounded-lg bg-[#10a37f]/10 flex items-center justify-center flex-shrink-0 text-[#10a37f]">
                  {feature.icon}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{feature.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <a
            href="https://chatgpt.com"
            target="_blank"
            rel="noopener noreferrer"
            className="chatgpt-work-cta flex items-center justify-center gap-2 w-full"
          >
            <Sparkles className="w-4 h-4" />
            Abrir ChatGPT Work
          </a>
        </div>
      )}
    </div>
  );
};

export default ChatGPTWorkCard;
