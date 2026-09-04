import { useEffect, useState, useRef, useMemo } from "react";
import { generateCalendar, PILAR_META, FORMATO_LABEL, type PlannerInput, type Pilar, type Formato, type Post, type CalendarResult } from "@/lib/plannerEngine";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "planner_setembro_2026_v3";

const defaultInput: PlannerInput = {
  nicho: "marketing digital para iniciantes",
  publico: "mulheres 25-40 anos que querem viver do digital, buscam liberdade e têm dor de não saber por onde começar",
  dor: "falta de constância e medo de aparecer",
  produto: "mentoria Desbloqueie seu Digital",
  frequencia: 5,
  formatos: ["reels", "carrossel", "stories"],
  objetivo: "atrair seguidor novo e vender mentoria",
  contextoExtra: "",
};

// Trilha / stepper
function Trilha({ step }: { step: number }) {
  const steps = [
    { n: 1, title: "Definir", desc: "nicho e público" },
    { n: 2, title: "Gerar", desc: "calendário set" },
    { n: 3, title: "Revisar", desc: "editar headlines" },
    { n: 4, title: "Exportar", desc: "CSV / PDF" },
  ];
  return (
    <div className="w-full border rounded-2xl bg-white overflow-hidden" style={{ borderColor: "#E8E2D6" }}>
      <div className="px-4 md:px-5 py-3 flex items-center justify-between gap-2">
        <span className="font-mono-tech text-[11px] tracking-[0.14em] uppercase opacity-60">Trilha</span>
        <span className="font-mono-tech text-[11px] opacity-50">Passo {step} de 4</span>
      </div>
      <div className="px-4 md:px-5 pb-4">
        <div className="flex items-center gap-0">
          {steps.map((s, idx) => {
            const active = step >= s.n;
            const current = step === s.n;
            return (
              <div key={s.n} className="flex items-center flex-1">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border shrink-0" style={active ? { background: current ? "#D97757" : "#1A1A1B", color: "white", borderColor: current ? "#D97757" : "#1A1A1B" } : { background: "white", borderColor: "#E8E2D6", color: "#9AA0A6" }}>{s.n}</div>
                  <div className="hidden sm:block leading-none">
                    <div className={`text-[13px] font-semibold ${active ? "text-[#1A1A1B]" : "text-[#9AA0A6]"}`}>{s.title}</div>
                    <div className="font-mono-tech text-[11px] opacity-60">{s.desc}</div>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className="flex-1 h-[2px] mx-2 md:mx-3 rounded" style={{ background: step > s.n ? "#1A1A1B" : "#E8E2D6" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Planejador() {
  const [input, setInput] = useState<PlannerInput>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("planner_setembro_2026_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.input) return { ...defaultInput, ...parsed.input };
      }
    } catch {}
    return defaultInput;
  });
  const [result, setResult] = useState<CalendarResult | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("planner_setembro_2026_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.result) return parsed.result;
      }
    } catch {}
    return null;
  });
  const [view, setView] = useState<"calendario" | "tabela">("calendario");
  const [editing, setEditing] = useState<Post | null>(null);
  const [filterPilar, setFilterPilar] = useState<Pilar | "todos">("todos");
  const [contextText, setContextText] = useState(input.contextoExtra || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const step = useMemo(() => {
    if (!result) {
      const hasBasics = input.nicho.trim() && input.publico.trim();
      return hasBasics ? 1 : 1;
    }
    // se tem resultado mas ainda não editou, está no passo 3
    return 3;
  }, [input.nicho, input.publico, result]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ input: { ...input, contextoExtra: contextText }, result }));
  }, [input, result, contextText]);

  const handleGenerate = () => {
    if (!input.nicho.trim() || !input.publico.trim()) {
      toast({ title: "Preencha nicho e público" });
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const enriched: PlannerInput = { ...input, contextoExtra: contextText };
      const r = generateCalendar(enriched, 2026, 8);
      setResult(r);
      setIsGenerating(false);
      toast({ title: `Calendario gerado: ${r.posts.length} posts para setembro` });
      document.getElementById("calendario-anchor")?.scrollIntoView({ behavior: "smooth" });
    }, 550);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "txt" || ext === "md") {
      const txt = await file.text();
      setContextText((prev) => (prev ? prev + "\n\n" : "") + txt.slice(0, 8000));
      toast({ title: `Texto importado: ${file.name}` });
    } else if (ext === "pdf") {
      const buf = await file.arrayBuffer();
      try {
        const dec = new TextDecoder("utf-8").decode(buf);
        const readable = dec.replace(/[^\x20-\x7E\n\r\u00C0-\u00FF]/g, " ").replace(/\s{2,}/g, " ").slice(0, 6000);
        if (readable.trim().length > 100) {
          setContextText((prev) => (prev ? prev + "\n\n[PDF " + file.name + "]\n" : "") + readable.slice(0, 8000));
          toast({ title: `PDF importado: ${file.name}` });
        } else {
          toast({ title: "PDF sem texto extraivel — cole manualmente" });
        }
      } catch {
        toast({ title: "Nao foi possivel ler o PDF" });
      }
    } else {
      toast({ title: "Formatos aceitos: .txt, .md, .pdf" });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const copyAll = () => {
    if (!result) return;
    const header = "data\tpilar\tformato\ttema\theadline\tCTA\n";
    const rows = result.posts.map(p => `${p.data}\t${p.pilar}\t${p.formato}\t${p.tema}\t${p.headline}\t${p.cta}`).join("\n");
    navigator.clipboard.writeText(header + rows);
    toast({ title: "Copiado. Cole no Sheets ou Notion." });
  };

  const exportCSV = () => {
    if (!result) return;
    const header = "data,dia_semana,pilar,formato,tema,headline,gancho,cta,viral_score\n";
    const rows = result.posts.map(p => `"${p.data}","${p.diaSemana}","${p.pilar}","${p.formato}","${p.tema.replace(/"/g, '""')}","${p.headline.replace(/"/g, '""')}","${p.legendaHook.replace(/"/g, '""')}","${p.cta.replace(/"/g, '""')}",${p.viralScore}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "calendario_setembro_2026.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const printPDF = () => window.print();

  const copyPromptTestado = () => {
    const prompt = `Aja como um estrategista de conteudo especializado em ${input.nicho}. Meu publico e ${input.publico}. Eu ofereco ${input.produto}. Posto no Instagram ${input.frequencia} vezes por semana e uso principalmente ${input.formatos.join(", ")}.\nMeu objetivo em setembro e ${input.objetivo}.\n${contextText ? `\nContexto extra:\n${contextText.slice(0, 1500)}\n` : ""}\nCom base nisso, monte um calendario de conteudo completo pra setembro, dia por dia, dividido em 4 pilares: atracao, conexao, autoridade e conversao. Pra cada post me de: data sugerida, pilar, formato, tema e uma headline pronta pra usar.\nOrganize a resposta em tabela, semana por semana. No final, aponte quais 3 posts tem mais chance de viralizar e por que.`;
    navigator.clipboard.writeText(prompt);
    toast({ title: "Prompt copiado" });
  };

  const updatePost = (updated: Post) => {
    if (!result) return;
    const newPosts = result.posts.map(p => p.id === updated.id ? updated : p);
    const newWeeks = result.weeks.map(w => ({ ...w, posts: w.posts.map(p => p.id === updated.id ? updated : p) }));
    const newViral = result.viralTop3.map(v => v.post.id === updated.id ? { ...v, post: updated } : v);
    setResult({ posts: newPosts, weeks: newWeeks, viralTop3: newViral });
  };

  return (
    <div className="min-h-screen text-[15px] leading-relaxed" style={{ background: "#FDFCF9", color: "#1A1A1B" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap');
        .font-claude { font-family: "Instrument Serif", Georgia, serif; }
        .font-mono-tech { font-family: "IBM Plex Mono", monospace; }
        .paper {
          background-color: #FDFCF9;
          background-image:
            linear-gradient(to right, rgba(217,119,87,0.16) 1px, transparent 1px),
            linear-gradient(rgba(26,26,27,0.04) 1px, transparent 1px);
          background-size: 100% 100%, 100% 28px;
          background-position: 72px 0, 0 0;
        }
        .paper::before {
          content:"";
          position:absolute; left:72px; top:0; bottom:0; width:1px; background: rgba(217,119,87,0.18); pointer-events:none;
        }
        .hole {
          width: 16px; height: 16px; border-radius: 50%;
          background: #EAE8E3; box-shadow: inset 0 1.5px 3px rgba(0,0,0,0.14);
          border: 1px solid rgba(0,0,0,0.06);
        }
        @media print {
          .no-print { display:none !important; }
          .paper { background: white !important; }
          .paper::before { display:none; }
        }
      `}</style>

      <header className="sticky top-0 z-30 backdrop-blur-xl border-b no-print" style={{ background: "rgba(253,252,249,0.92)", borderColor: "#ECE9E1" }}>
        <div className="max-w-[1420px] mx-auto px-4 md:px-6 h-[58px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[13px] font-bold tracking-widest" style={{ background: "#D97757" }}>JS</div>
            <div>
              <div className="font-claude text-[19px] leading-none tracking-tight">Planejador <span className="italic font-normal" style={{ color: "#D97757" }}>de Conteudo</span></div>
              <div className="font-mono-tech text-[11px] tracking-widest uppercase opacity-60 -mt-[2px]">Setembro 2026 - Instagram - 4 Pilares</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 font-mono-tech text-xs">
            <span className="px-2.5 py-1 rounded-full border" style={{ background: "#F4F1EB", borderColor: "#E8E2D6" }}>Ao vivo - sem cadastro</span>
            <a href="/" className="px-3 py-1.5 rounded-full text-white font-medium" style={{ background: "#1A1A1B" }}>Voltar ao site</a>
          </div>
          <a href="/" className="md:hidden px-3 py-1.5 rounded-full text-white text-xs font-medium" style={{ background: "#1A1A1B" }}>Voltar</a>
        </div>
      </header>

      <section className="relative paper border-b no-print" style={{ borderColor: "#ECE9E1" }}>
        <div className="max-w-[1420px] mx-auto px-4 md:px-6 py-6 md:py-8 relative">
          {/* Trilha no topo */}
          <div className="mb-6">
            <Trilha step={step} />
          </div>

          <div className="grid grid-cols-12 gap-5 md:gap-6">
            <div className="hidden lg:flex col-span-1 flex-col items-center gap-5 pt-2">
              <div className="flex flex-col gap-4">
                {Array.from({ length: 7 }).map((_, i) => <div key={i} className="hole" />)}
              </div>
              <div className="font-mono-tech text-[10px] tracking-widest rotate-90 origin-center whitespace-nowrap opacity-40 mt-6">CADERNO TEC - 001</div>
            </div>

            <div className="col-span-12 lg:col-span-7">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono-tech text-[11px] tracking-[0.14em] uppercase px-2 py-1 rounded" style={{ background: "#1A1A1B", color: "#FDFCF9" }}>Passo 01 - Ajuste os colchetes</span>
                <span className="font-mono-tech text-[11px] opacity-50 hidden sm:inline">Preencha sua realidade e gere o mes em 1 clique</span>
              </div>

              <h1 className="font-claude text-[32px] md:text-[40px] leading-[0.95] tracking-tight">
                Planeje <span className="italic" style={{ color: "#D97757" }}>setembro inteiro</span> numa tarde so.
                <span className="block text-[16px] md:text-[18px] font-normal opacity-60 mt-2" style={{ fontFamily: "Inter" }}>So ajustar os colchetes e colar na IA que voce ja usa — aqui ja vem pronto em calendario interativo.</span>
              </h1>

              <div className="mt-5 rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "#E8E2D6" }}>
                <div className="px-4 md:px-5 py-3 flex items-center justify-between border-b" style={{ background: "#F9F6F0", borderColor: "#ECE9E1" }}>
                  <span className="font-mono-tech text-[11px] tracking-widest uppercase opacity-70">Prompt testado - setembro 2026</span>
                  <button onClick={copyPromptTestado} className="font-mono-tech text-xs px-3 py-1 rounded-full border bg-white hover:bg-black hover:text-white transition" style={{ borderColor: "#E8E2D6" }}>Copiar prompt</button>
                </div>
                <div className="px-4 md:px-5 py-3 font-mono-tech text-[12.5px] leading-6 bg-white">
                  <span className="opacity-60">Aja como estrategista de conteudo especializado em </span><span className="px-1.5 py-0.5 rounded" style={{ background: "#FFF0E6", border: "1px dashed #D97757" }}>[seu nicho]</span><span className="opacity-60">. Meu publico e </span><span className="px-1.5 py-0.5 rounded" style={{ background: "#FFF0E6", border: "1px dashed #D97757" }}>[quem + busca + dor]</span><span className="opacity-60">. Eu ofereco </span><span className="px-1.5 py-0.5 rounded" style={{ background: "#FFF0E6", border: "1px dashed #D97757" }}>[produto]</span><span className="opacity-60"> ...</span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="col-span-2">
                  <span className="font-mono-tech text-[11px] tracking-widest uppercase opacity-60">[seu nicho]</span>
                  <input value={input.nicho} onChange={e => setInput({ ...input, nicho: e.target.value })} placeholder="ex: confeitaria saudavel" className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-white outline-none focus:ring-2 focus:ring-[#D97757]/20" style={{ borderColor: "#E8E2D6", fontFamily: "Inter" }} />
                </label>
                <label className="col-span-2">
                  <span className="font-mono-tech text-[11px] tracking-widest uppercase opacity-60">[quem e essa pessoa, o que busca e sua dor]</span>
                  <textarea value={input.publico} onChange={e => setInput({ ...input, publico: e.target.value })} rows={2} className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-white outline-none focus:ring-2 focus:ring-[#D97757]/20 resize-none" style={{ borderColor: "#E8E2D6" }} />
                </label>
                <label>
                  <span className="font-mono-tech text-[11px] tracking-widest uppercase opacity-60">[dor principal]</span>
                  <input value={input.dor} onChange={e => setInput({ ...input, dor: e.target.value })} placeholder="ex: medo de aparecer nos stories" className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-white outline-none" style={{ borderColor: "#E8E2D6" }} />
                </label>
                <label>
                  <span className="font-mono-tech text-[11px] tracking-widest uppercase opacity-60">[produto / servico]</span>
                  <input value={input.produto} onChange={e => setInput({ ...input, produto: e.target.value })} placeholder="ex: mentoria 1:1" className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-white outline-none" style={{ borderColor: "#E8E2D6" }} />
                </label>
                <label>
                  <span className="font-mono-tech text-[11px] tracking-widest uppercase opacity-60">[vezes por semana]</span>
                  <div className="mt-1 flex items-center gap-2">
                    <input type="range" min={3} max={7} value={input.frequencia} onChange={e => setInput({ ...input, frequencia: Number(e.target.value) })} className="flex-1 accent-[#D97757]" />
                    <span className="px-3 py-2 rounded-xl border bg-white font-mono-tech text-sm min-w-[72px] text-center" style={{ borderColor: "#E8E2D6" }}>{input.frequencia}x/sem</span>
                  </div>
                </label>
                <label>
                  <span className="font-mono-tech text-[11px] tracking-widest uppercase opacity-60">[formatos]</span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {(["reels", "carrossel", "stories", "feed", "live"] as Formato[]).map(f => (
                      <button key={f} onClick={() => setInput({ ...input, formatos: input.formatos.includes(f) ? input.formatos.filter(x => x !== f) : [...input.formatos, f] })} className={`px-3 py-1.5 rounded-full border text-xs font-medium tracking-wide transition ${input.formatos.includes(f) ? "text-white" : "bg-white"}`} style={input.formatos.includes(f) ? { background: "#1A1A1B", borderColor: "#1A1A1B" } : { borderColor: "#E8E2D6" }}>{FORMATO_LABEL[f]}</button>
                    ))}
                  </div>
                </label>
                <label className="col-span-2">
                  <span className="font-mono-tech text-[11px] tracking-widest uppercase opacity-60">[objetivo em setembro]</span>
                  <input value={input.objetivo} onChange={e => setInput({ ...input, objetivo: e.target.value })} placeholder="ex: atrair seguidor novo e vender 10 vagas" className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-white outline-none" style={{ borderColor: "#E8E2D6" }} />
                </label>
              </div>

              <div className="mt-4 rounded-2xl border bg-[#FFFBF5] p-3 md:p-4" style={{ borderColor: "#E8E2D6" }}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-mono-tech text-[11px] tracking-widest uppercase opacity-70">Cole texto ou PDF para dar contexto (opcional)</span>
                  <div className="flex gap-2">
                    <input ref={fileInputRef} type="file" accept=".txt,.md,.pdf" onChange={handleFile} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="px-3 py-1.5 rounded-full border bg-white text-xs font-medium" style={{ borderColor: "#E8E2D6" }}>Importar PDF/TXT</button>
                    <button onClick={() => setContextText("")} className="px-3 py-1.5 rounded-full border bg-white text-xs" style={{ borderColor: "#E8E2D6" }}>Limpar</button>
                  </div>
                </div>
                <textarea value={contextText} onChange={e => setContextText(e.target.value)} placeholder="Cole bio, pagina de vendas, transcricao, feedbacks. A IA usa isso para headlines mais especificas." rows={4} className="mt-2 w-full px-3.5 py-2.5 rounded-xl border bg-white outline-none resize-none font-mono-tech text-[13px] leading-5" style={{ borderColor: "#E8E2D6" }} />
                <div className="font-mono-tech text-[11px] opacity-50 mt-1">{contextText.length} caracteres - salvo automaticamente</div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <button onClick={handleGenerate} disabled={isGenerating} className="px-6 py-3 rounded-full text-white font-semibold shadow-sm hover:opacity-95 active:scale-[0.99] transition disabled:opacity-60 flex items-center gap-2" style={{ background: "#D97757" }}>
                  {isGenerating ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null} {isGenerating ? "Gerando setembro..." : "Gerar calendario de setembro"}
                </button>
                <button onClick={copyPromptTestado} className="px-5 py-3 rounded-full border bg-white font-medium hover:bg-black hover:text-white transition" style={{ borderColor: "#E8E2D6" }}>Copiar prompt com meus dados</button>
              </div>
              <div className="font-mono-tech text-[11px] opacity-50 mt-2">Geracao 100% local, sem API externa</div>
            </div>

            <div className="col-span-12 lg:col-span-4">
              <div className="rounded-[20px] border bg-white overflow-hidden sticky top-[70px]" style={{ borderColor: "#E8E2D6" }}>
                <div className="h-1.5" style={{ background: "#D97757" }} />
                <div className="p-5">
                  <div className="font-mono-tech text-[11px] tracking-widest uppercase opacity-50">Preview - como fica a entrega</div>
                  <div className="font-claude text-[22px] leading-none mt-1">Semana a semana, <span className="italic" style={{ color: "#D97757" }}>dia por dia</span></div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {(Object.keys(PILAR_META) as Pilar[]).map(p => (
                      <div key={p} className="rounded-xl border px-3 py-2.5" style={{ background: PILAR_META[p].bg, borderColor: "#E8E2D6" }}>
                        <div className="font-mono-tech text-[10px] tracking-widest uppercase flex items-center gap-1.5">
                          <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: PILAR_META[p].color }}>{PILAR_META[p].label}</span> {p}
                        </div>
                        <div className="text-xs opacity-70 leading-tight mt-1">{PILAR_META[p].desc}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-xl border p-3" style={{ background: "#F9F6F0", borderColor: "#ECE9E1" }}>
                    <div className="font-mono-tech text-[11px] tracking-widest uppercase opacity-60">Entrega inclui</div>
                    <ul className="mt-2 space-y-1.5 text-[13px] leading-5">
                      <li>- Calendario visual setembro 2026 (clique para editar)</li>
                      <li>- Tabela semana a semana pronta para Sheets e Notion</li>
                      <li>- 3 posts com maior chance de viralizar e por que</li>
                      <li>- Headline pronta, gancho e CTA por post</li>
                      <li>- Export CSV, PDF e copiar tudo</li>
                    </ul>
                  </div>

                  <div className="mt-4 flex items-center gap-2 font-mono-tech text-[11px]">
                    <span className="px-2 py-1 rounded-full border" style={{ background: "#EEF6EE", borderColor: "#CDE8CD" }}>100% editavel</span>
                    <span className="px-2 py-1 rounded-full border" style={{ background: "#FFF4E6", borderColor: "#FFE1B8" }}>Salvo no navegador</span>
                  </div>
                </div>
                <div className="px-5 py-3 border-t flex items-center justify-between" style={{ background: "#FDFCF9", borderColor: "#ECE9E1" }}>
                  <span className="font-mono-tech text-[11px] opacity-50">Estilo Claude tradicional - caderno tec</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="calendario-anchor" className="max-w-[1420px] mx-auto px-4 md:px-6 py-6 md:py-8">
        {!result ? (
          <div className="rounded-[24px] border-2 border-dashed p-8 md:p-12 text-center" style={{ borderColor: "#E8E2D6", background: "#FFFEFB" }}>
            <div className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center font-mono-tech text-xs font-bold border" style={{ background: "#F4F1EB", borderColor: "#E8E2D6" }}>SET</div>
            <div className="font-claude text-[26px] mt-3">Seu setembro ainda nao foi gerado</div>
            <div className="opacity-60 mt-1 max-w-[560px] mx-auto">Ajuste os campos acima e clique em Gerar calendario. Em segundos voce tera 30 dias organizados por pilar, formato, tema e headline.</div>
            <button onClick={handleGenerate} className="mt-5 px-6 py-3 rounded-full text-white font-semibold" style={{ background: "#1A1A1B" }}>Gerar agora</button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-claude text-[28px] leading-none">Setembro <span className="italic" style={{ color: "#D97757" }}>2026</span> <span className="font-mono-tech text-[12px] tracking-widest uppercase opacity-50 ml-2">{result.posts.length} posts - {input.frequencia}x/sem</span></h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-full border p-1" style={{ background: "#F4F1EB", borderColor: "#E8E2D6" }}>
                  <button onClick={() => setView("calendario")} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${view === "calendario" ? "bg-white shadow-sm border" : "opacity-60"}`} style={view === "calendario" ? { borderColor: "#E8E2D6" } : {}}>Calendario</button>
                  <button onClick={() => setView("tabela")} className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${view === "tabela" ? "bg-white shadow-sm border" : "opacity-60"}`} style={view === "tabela" ? { borderColor: "#E8E2D6" } : {}}>Tabela</button>
                </div>
                <button onClick={copyAll} className="px-3.5 py-2 rounded-full border bg-white text-sm font-medium" style={{ borderColor: "#E8E2D6" }}>Copiar tabela</button>
                <button onClick={exportCSV} className="px-3.5 py-2 rounded-full border bg-white text-sm font-medium" style={{ borderColor: "#E8E2D6" }}>Baixar CSV</button>
                <button onClick={printPDF} className="px-3.5 py-2 rounded-full text-white text-sm font-medium" style={{ background: "#1A1A1B" }}>PDF / Imprimir</button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5 items-center">
              <span className="font-mono-tech text-[11px] tracking-widest uppercase opacity-50 mr-1">Filtrar:</span>
              <button onClick={() => setFilterPilar("todos")} className={`px-3 py-1.5 rounded-full border text-xs font-medium ${filterPilar === "todos" ? "text-white" : "bg-white"}`} style={filterPilar === "todos" ? { background: "#1A1A1B", borderColor: "#1A1A1B" } : { borderColor: "#E8E2D6" }}>todos</button>
              {(Object.keys(PILAR_META) as Pilar[]).map(p => (
                <button key={p} onClick={() => setFilterPilar(p)} className={`px-3 py-1.5 rounded-full border text-xs font-medium ${filterPilar === p ? "border-2" : ""}`} style={filterPilar === p ? { background: PILAR_META[p].bg, borderColor: PILAR_META[p].color, color: PILAR_META[p].color } : { background: "white", borderColor: "#E8E2D6" }}>{PILAR_META[p].label} {p}</button>
              ))}
              <span className="font-mono-tech text-[11px] opacity-50 ml-2 hidden md:inline">Clique no card para editar headline e tema</span>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
              {result.viralTop3.map((v, idx) => (
                <div key={v.post.id} className="rounded-2xl border bg-white p-4 shadow-sm relative overflow-hidden" style={{ borderColor: idx === 0 ? "#D97757" : "#E8E2D6" }}>
                  {idx === 0 && <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "#D97757" }} />}
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: idx === 0 ? "#D97757" : "#1A1A1B" }}>{idx + 1}</span>
                    <span className="font-mono-tech text-[11px] tracking-widest uppercase opacity-60">Maior chance de viralizar</span>
                    <span className="ml-auto text-xs font-mono-tech px-2 py-0.5 rounded-full" style={{ background: "#FFF0E6", border: "1px solid #FFD9C2" }}>{v.post.viralScore}/100</span>
                  </div>
                  <div className="mt-2 font-semibold leading-tight" style={{ fontFamily: "Inter" }}>{v.post.headline}</div>
                  <div className="mt-1 flex flex-wrap gap-1.5 font-mono-tech text-[11px]">
                    <span className="px-2 py-0.5 rounded-full border" style={{ background: PILAR_META[v.post.pilar].bg, borderColor: "#E8E2D6" }}>{PILAR_META[v.post.pilar].label} {v.post.pilar}</span>
                    <span className="px-2 py-0.5 rounded-full border bg-white" style={{ borderColor: "#E8E2D6" }}>{FORMATO_LABEL[v.post.formato]}</span>
                    <span className="px-2 py-0.5 rounded-full border bg-white" style={{ borderColor: "#E8E2D6" }}>{new Date(v.post.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} - {v.post.diaSemana}</span>
                  </div>
                  <div className="mt-2 text-[12.5px] leading-5 p-2.5 rounded-xl" style={{ background: "#F9F6F0", border: "1px solid #ECE9E1" }}><b>Por que:</b> {v.motivo}</div>
                </div>
              ))}
            </div>

            {view === "calendario" && (
              <div className="mt-6 rounded-[20px] border bg-white overflow-hidden shadow-sm" style={{ borderColor: "#E8E2D6" }}>
                <div className="grid grid-cols-7 border-b font-mono-tech text-[11px] tracking-widest uppercase text-center" style={{ background: "#F9F6F0", borderColor: "#ECE9E1" }}>
                  {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"].map(d => <div key={d} className="py-2.5 border-r last:border-r-0" style={{ borderColor: "#ECE9E1" }}>{d}</div>)}
                </div>
                {(() => {
                  const year = 2026, month = 8;
                  const firstWd = new Date(year, month, 1).getDay();
                  const daysInMonth = 30;
                  const cells: (Post | null | "empty")[] = [];
                  for (let i = 0; i < firstWd; i++) cells.push("empty");
                  for (let d = 1; d <= daysInMonth; d++) {
                    const post = result.posts.find(p => p.dia === d) || null;
                    cells.push(post);
                  }
                  while (cells.length % 7 !== 0) cells.push("empty" as any);
                  const visibleCells = filterPilar === "todos" ? cells : cells.map(c => {
                    if (c === "empty" || c === null) return c;
                    return (c as Post).pilar === filterPilar ? c : null;
                  });
                  return (
                    <div className="grid grid-cols-7 auto-rows-fr">
                      {visibleCells.map((c, idx) => {
                        if (c === "empty") return <div key={idx} className="min-h-[132px] border-r border-b p-2" style={{ background: "#FDFCF9", borderColor: "#ECE9E1" }} />;
                        if (c === null) {
                          const dayNum = idx - firstWd + 1;
                          const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
                          return (
                            <div key={idx} className="min-h-[132px] border-r border-b p-2 flex flex-col" style={{ borderColor: "#ECE9E1", background: inMonth ? "white" : "#FDFCF9" }}>
                              {inMonth && <div className="font-mono-tech text-xs opacity-30">{String(dayNum).padStart(2, "0")}</div>}
                              {inMonth && <div className="flex-1 flex items-center justify-center opacity-30 font-mono-tech text-[11px]">folga</div>}
                            </div>
                          );
                        }
                        const post = c as Post;
                        const meta = PILAR_META[post.pilar];
                        return (
                          <button key={idx} onClick={() => setEditing(post)} className="min-h-[132px] border-r border-b p-2 text-left hover:brightness-[0.98] transition flex flex-col gap-1 group" style={{ borderColor: "#ECE9E1", background: "white" }}>
                            <div className="flex items-center justify-between">
                              <span className="font-mono-tech text-[11px] px-1.5 py-0.5 rounded" style={{ background: "#1A1A1B", color: "white" }}>{String(post.dia).padStart(2, "0")}</span>
                              <span className="font-mono-tech text-[10px] px-1.5 py-0.5 rounded-full border truncate" style={{ background: meta.bg, borderColor: meta.color, color: meta.color }}>{meta.label} {post.pilar}</span>
                            </div>
                            <div className="text-[12px] font-semibold leading-[1.25] line-clamp-3" style={{ fontFamily: "Inter" }}>{post.headline}</div>
                            <div className="font-mono-tech text-[11px] opacity-60 flex items-center gap-1 mt-auto">{FORMATO_LABEL[post.formato]} <span className="ml-auto opacity-40 group-hover:opacity-100">editar</span></div>
                            {post.viralReason && <div className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "#FFF0E6", border: "1px solid #FFD9C2" }}>viral {post.viralScore}</div>}
                            <div className="h-1 rounded-full mt-0.5" style={{ background: meta.color, opacity: 0.85 }} />
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
                <div className="px-4 py-2.5 flex flex-wrap gap-2 items-center justify-between font-mono-tech text-[11px]" style={{ background: "#F9F6F0", borderTop: "1px solid #ECE9E1" }}>
                  <span className="opacity-60">Dica: posts em ter/qui/sab tem boost de alcance. Reels para atracao, Carrossel para autoridade.</span>
                  <span className="flex gap-1.5 items-center"><span className="w-2 h-2 rounded-full" style={{ background: "#0e7490" }} /> atracao <span className="w-2 h-2 rounded-full ml-2" style={{ background: "#1d4ed8" }} /> autoridade <span className="w-2 h-2 rounded-full ml-2" style={{ background: "#be123c" }} /> conexao <span className="w-2 h-2 rounded-full ml-2" style={{ background: "#15803d" }} /> conversao</span>
                </div>
              </div>
            )}

            {view === "tabela" && (
              <div className="mt-6 space-y-5">
                {result.weeks.map(w => {
                  const weekPosts = filterPilar === "todos" ? w.posts : w.posts.filter(p => p.pilar === filterPilar);
                  return (
                    <div key={w.semana} className="rounded-[18px] border bg-white overflow-hidden shadow-sm" style={{ borderColor: "#E8E2D6" }}>
                      <div className="px-4 md:px-5 py-3 flex items-center justify-between" style={{ background: w.semana % 2 === 0 ? "#F9F6F0" : "#FFFFFF", borderBottom: "1px solid #ECE9E1" }}>
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: "#1A1A1B" }}>{w.semana}</span>
                          <span className="font-claude text-[18px]">{w.label}</span>
                          <span className="hidden md:inline font-mono-tech text-xs px-2 py-1 rounded-full border" style={{ background: "white", borderColor: "#E8E2D6" }}>{weekPosts.length} posts</span>
                        </div>
                        <span className="font-mono-tech text-[11px] opacity-50 hidden sm:inline">Clique na linha para editar</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[13px]">
                          <thead className="font-mono-tech text-[11px] tracking-widest uppercase opacity-60" style={{ background: "#FDFCF9" }}>
                            <tr>
                              <th className="px-3 md:px-4 py-2.5 whitespace-nowrap">Data</th>
                              <th className="px-3 py-2.5">Pilar</th>
                              <th className="px-3 py-2.5">Formato</th>
                              <th className="px-3 py-2.5 min-w-[160px]">Tema</th>
                              <th className="px-3 py-2.5 min-w-[280px]">Headline pronta</th>
                              <th className="px-3 py-2.5 hidden lg:table-cell">CTA</th>
                              <th className="px-3 py-2.5">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {weekPosts.length === 0 ? (
                              <tr><td colSpan={7} className="px-4 py-6 text-center opacity-40 font-mono-tech text-xs">Nenhum post neste filtro nesta semana</td></tr>
                            ) : weekPosts.map(p => (
                              <tr key={p.id} onClick={() => setEditing(p)} className="border-t hover:bg-[#FFFBF5] cursor-pointer transition" style={{ borderColor: "#ECE9E1" }}>
                                <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                                  <div className="font-mono-tech text-xs font-medium">{String(p.dia).padStart(2, "0")}/09 - {p.diaSemana.slice(0, 3)}</div>
                                  <div className="font-mono-tech text-[11px] opacity-50">{p.data}</div>
                                </td>
                                <td className="px-3 py-3"><span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-medium whitespace-nowrap" style={{ background: PILAR_META[p.pilar].bg, borderColor: PILAR_META[p.pilar].color, color: PILAR_META[p.pilar].color }}>{PILAR_META[p.pilar].label} {p.pilar}</span></td>
                                <td className="px-3 py-3"><span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border bg-white text-xs whitespace-nowrap" style={{ borderColor: "#E8E2D6" }}>{FORMATO_LABEL[p.formato]}</span></td>
                                <td className="px-3 py-3"><span className="text-[13px] leading-5">{p.tema}</span><div className="font-mono-tech text-[11px] opacity-50 line-clamp-1">{p.legendaHook}</div></td>
                                <td className="px-3 py-3"><span className="font-medium leading-5" style={{ fontFamily: "Inter" }}>{p.headline}</span></td>
                                <td className="px-3 py-3 hidden lg:table-cell"><span className="font-mono-tech text-xs px-2 py-1 rounded-full" style={{ background: "#F4F1EB" }}>{p.cta}</span></td>
                                <td className="px-3 py-3">
                                  <select value={p.status} onClick={e => e.stopPropagation()} onChange={e => updatePost({ ...p, status: e.target.value as Post["status"] })} className="text-xs rounded-full border px-2 py-1 bg-white outline-none" style={{ borderColor: "#E8E2D6" }}>
                                    <option value="planejado">planejado</option>
                                    <option value="produzido">produzido</option>
                                    <option value="publicado">publicado</option>
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-3">
              <div className="lg:col-span-2 rounded-2xl border bg-white p-4 flex flex-wrap gap-4 items-center" style={{ borderColor: "#E8E2D6" }}>
                {(() => {
                  const total = result.posts.length;
                  const byPilar = (Object.keys(PILAR_META) as Pilar[]).map(p => ({ p, c: result.posts.filter(x => x.pilar === p).length }));
                  return (
                    <>
                      <span className="font-mono-tech text-[11px] tracking-widest uppercase opacity-60">Distribuicao real:</span>
                      {byPilar.map(({ p, c }) => (
                        <span key={p} className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full" style={{ background: PILAR_META[p as Pilar].color }} /> {p} <b>{c}</b> <span className="opacity-50">({Math.round(c / total * 100)}%)</span></span>
                      ))}
                      <span className="ml-auto font-mono-tech text-xs px-2.5 py-1 rounded-full border" style={{ background: "#F9F6F0", borderColor: "#ECE9E1" }}>Objetivo: {input.objetivo.slice(0, 44)}</span>
                    </>
                  );
                })()}
              </div>
              <div className="rounded-2xl border p-4 flex items-center gap-3" style={{ background: "#1A1A1B", borderColor: "#1A1A1B", color: "white" }}>
                <div className="text-sm leading-tight"><b>Pronto para colar na IA?</b><br /><span className="opacity-70 font-mono-tech text-xs">Use o botao Copiar prompt no topo.</span></div>
                <button onClick={copyPromptTestado} className="ml-auto px-4 py-2 rounded-full bg-white text-black text-xs font-semibold whitespace-nowrap">Copiar</button>
              </div>
            </div>
          </>
        )}
      </section>

      {editing && (
        <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center p-0 md:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative w-full max-w-[720px] bg-white rounded-t-[20px] md:rounded-[20px] shadow-2xl max-h-[92vh] overflow-auto" style={{ border: "1px solid #E8E2D6" }}>
            <div className="sticky top-0 z-10 px-5 md:px-6 py-4 border-b flex items-center justify-between" style={{ background: "#F9F6F0", borderColor: "#ECE9E1" }}>
              <div>
                <div className="font-mono-tech text-[11px] tracking-widest uppercase opacity-60">Editando - {editing.data} - {editing.diaSemana}</div>
                <div className="font-claude text-[20px] leading-none">Refine este post <span className="italic" style={{ color: "#D97757" }}>sem refazer o mes</span></div>
              </div>
              <button onClick={() => setEditing(null)} className="w-9 h-9 rounded-full border bg-white flex items-center justify-center" style={{ borderColor: "#E8E2D6" }}>X</button>
            </div>
            <div className="p-5 md:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className="font-mono-tech text-[11px] tracking-widest uppercase opacity-60">Pilar</span>
                  <select value={editing.pilar} onChange={e => setEditing({ ...editing, pilar: e.target.value as Pilar })} className="mt-1 w-full px-3 py-2.5 rounded-xl border bg-white outline-none" style={{ borderColor: "#E8E2D6" }}>
                    {(Object.keys(PILAR_META) as Pilar[]).map(p => <option key={p} value={p}>{PILAR_META[p as Pilar].label} {p} - {PILAR_META[p as Pilar].desc}</option>)}
                  </select>
                </label>
                <label>
                  <span className="font-mono-tech text-[11px] tracking-widest uppercase opacity-60">Formato</span>
                  <select value={editing.formato} onChange={e => setEditing({ ...editing, formato: e.target.value as Formato })} className="mt-1 w-full px-3 py-2.5 rounded-xl border bg-white outline-none" style={{ borderColor: "#E8E2D6" }}>
                    {(["reels", "carrossel", "stories", "feed", "live"] as Formato[]).map(f => <option key={f} value={f}>{FORMATO_LABEL[f]}</option>)}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="font-mono-tech text-[11px] tracking-widest uppercase opacity-60">Tema</span>
                <input value={editing.tema} onChange={e => setEditing({ ...editing, tema: e.target.value })} className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-white outline-none" style={{ borderColor: "#E8E2D6" }} />
              </label>
              <label className="block">
                <span className="font-mono-tech text-[11px] tracking-widest uppercase opacity-60">Headline pronta</span>
                <textarea value={editing.headline} onChange={e => setEditing({ ...editing, headline: e.target.value })} rows={2} className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-white outline-none resize-none text-[15px] font-medium" style={{ borderColor: "#E8E2D6", fontFamily: "Inter" }} />
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label>
                  <span className="font-mono-tech text-[11px] tracking-widest uppercase opacity-60">Gancho de legenda</span>
                  <input value={editing.legendaHook} onChange={e => setEditing({ ...editing, legendaHook: e.target.value })} className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-white outline-none text-sm" style={{ borderColor: "#E8E2D6" }} />
                </label>
                <label>
                  <span className="font-mono-tech text-[11px] tracking-widest uppercase opacity-60">CTA</span>
                  <input value={editing.cta} onChange={e => setEditing({ ...editing, cta: e.target.value })} className="mt-1 w-full px-3.5 py-2.5 rounded-xl border bg-white outline-none text-sm" style={{ borderColor: "#E8E2D6" }} />
                </label>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { updatePost(editing); setEditing(null); toast({ title: "Post atualizado" }); }} className="flex-1 py-3 rounded-full text-white font-semibold" style={{ background: "#D97757" }}>Salvar alteracoes</button>
                <button onClick={() => { navigator.clipboard.writeText(`${editing.headline}\n\n${editing.legendaHook}\n\n${editing.cta}`); toast({ title: "Copiado" }); }} className="px-5 py-3 rounded-full border bg-white font-medium" style={{ borderColor: "#E8E2D6" }}>Copiar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-8 border-t py-6 text-center font-mono-tech text-[11px] tracking-widest uppercase opacity-40" style={{ borderColor: "#ECE9E1", background: "#F9F6F0" }}>
        Planejador Pro - Setembro 2026 - estilo Claude tradicional - caderno tec
      </footer>
    </div>
  );
}
