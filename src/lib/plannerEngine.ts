export type Pilar = "atração" | "conexão" | "autoridade" | "conversão";
export type Formato = "reels" | "carrossel" | "stories" | "feed" | "live";

export interface PlannerInput {
  nicho: string;
  publico: string;
  dor: string;
  produto: string;
  frequencia: number; // 3-7
  formatos: Formato[];
  objetivo: string;
  contextoExtra?: string;
}

export interface Post {
  id: string;
  data: string; // YYYY-MM-DD
  dia: number;
  diaSemana: string;
  pilar: Pilar;
  formato: Formato;
  tema: string;
  headline: string;
  legendaHook: string;
  cta: string;
  viralScore: number;
  viralReason?: string;
  status: "planejado" | "produzido" | "publicado";
}

export interface WeekGroup {
  semana: number;
  label: string;
  posts: Post[];
}

export interface ViralPick {
  post: Post;
  motivo: string;
}

export interface CalendarResult {
  posts: Post[];
  weeks: WeekGroup[];
  viralTop3: ViralPick[];
}

// ── Helpers ──
const diasSemana = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const diasSemanaLong = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

function distributionDays(frequencia: number): number[] {
  // 0=dom ... 6=sab
  const map: Record<number, number[]> = {
    7: [0, 1, 2, 3, 4, 5, 6],
    6: [1, 2, 3, 4, 5, 6], // folga domingo
    5: [1, 2, 3, 4, 5], // seg-sex
    4: [1, 2, 4, 6], // seg, ter, qui, sab (alta performance)
    3: [2, 4, 6], // ter, qui, sab
    2: [2, 5], // ter, sex
    1: [4], // qui
  };
  return map[frequencia] || map[5];
}

function getPilarWeights(objetivo: string): Record<Pilar, number> {
  const o = objetivo.toLowerCase();
  if (o.includes("atrair") || o.includes("seguidor") || o.includes("alcance") || o.includes("crescer")) {
    return { atração: 0.40, conexão: 0.20, autoridade: 0.25, conversão: 0.15 };
  }
  if (o.includes("vender") || o.includes("venda") || o.includes("convers") || o.includes("leads")) {
    return { atração: 0.25, conexão: 0.20, autoridade: 0.25, conversão: 0.30 };
  }
  if (o.includes("engaj") || o.includes("comunidade") || o.includes("conex")) {
    return { atração: 0.25, conexão: 0.35, autoridade: 0.20, conversão: 0.20 };
  }
  if (o.includes("autoridade") || o.includes("referência")) {
    return { atração: 0.25, conexão: 0.20, autoridade: 0.35, conversão: 0.20 };
  }
  return { atração: 0.30, conexão: 0.25, autoridade: 0.25, conversão: 0.20 };
}

function pickWeighted<T extends string>(weights: Record<T, number>, seed: number): T {
  const r = (Math.sin(seed * 9999) * 10000) % 1;
  const v = r < 0 ? r + 1 : r;
  let acc = 0;
  for (const [k, w] of Object.entries(weights) as [T, number][]) {
    acc += w;
    if (v < acc) return k;
  }
  return Object.keys(weights)[0] as T;
}

// ── Tema / Headline libraries ──
type Template = { tema: string; headline: string; hook: string; cta: string };

const lib: Record<Pilar, Template[]> = {
  atração: [
    { tema: "Mito vs Verdade do nicho", headline: "3 mentiras que te contaram sobre {nicho} (e o que fazer instead)", hook: "Se você ainda acredita na #2, seu crescimento está travado.", cta: "Salva pra não esquecer →" },
    { tema: "Erro caro que trava iniciante", headline: "O erro de R$ 0 que custa caro pra quem trabalha com {nicho}", headlineAlt: "", hook: "Pare de fazer isso hoje.", cta: "Comenta ERRO que te mando o check-list" },
    { tema: "Reels gancho choque", headline: "Ninguém te contou, mas {dor} não se resolve com força de vontade", hook: "É método. E eu te mostro em 30s.", cta: "Segue pra parte 2" },
    { tema: "Lista salvável", headline: "7 ganchos prontos pra atrair {publicoCurto} em 2026", hook: "Copia e cola amanhã.", cta: "Salva e usa" },
    { tema: "Trend adaptada", headline: "Usei essa trend pra explicar {produto} e deu 3x mais alcance", hook: "Áudio em alta + sua mensagem.", cta: "Quer o roteiro?" },
    { tema: "Bastidor curioso", headline: "O que eu faço em 15min toda manhã pra nunca ficar sem ideia de post", hook: "Rotina real, sem filtro.", cta: "Comenta ROTINA" },
    { tema: "Comparação antes/depois", headline: "De {dor} pra {resultado}: o post que mudou meu Instagram", hook: "Foi esse carrossel.", cta: "Desliza pra ver" },
    { tema: "Pergunta polarizadora", headline: "{nicho} sem {coisaPolêmica}: coragem ou burrice?", hook: "Minha opinião impopular:", cta: "Concorda? Comenta" },
  ],
  conexão: [
    { tema: "História pessoal vulnerável", headline: "O dia que eu quase desisti de {nicho} (e o que me fez ficar)", hook: "História real de ontem à noite.", cta: "Me conta se já passou por isso" },
    { tema: "Rotina / dia a dia", headline: "Um dia real comigo: {nicho} + vida sem filtro", hook: "7h às 22h, sem glamour.", cta: "Qual parte você quer ver mais?" },
    { tema: "Crença / valor", headline: "Eu não acredito em {nicho} rápido e fácil. E é por isso que meus alunos duram.", hook: "Valor inegociável.", cta: "Se identificou? Fica aqui" },
    { tema: "Bastidor do produto", headline: "Como nasce um {produto} por dentro (você nunca viu isso)", hook: "Do rascunho ao pronto.", cta: "Quer bastidor da próxima?" },
    { tema: "Pergunta caixinha", headline: "Me conta: qual sua maior trava com {dor} hoje? (vou responder 10)", hook: "Caixinha aberta por 24h.", cta: "Manda na caixinha" },
    { tema: "Carta aberta", headline: "Carta aberta pra quem se sente atrasada em {nicho}", hook: "Você não está atrasada.", cta: "Marca alguém que precisa ler" },
    { tema: "Comunidade", headline: "3 respostas da minha comunidade que me emocionaram essa semana", hook: "Print + reflexão.", cta: "Quer fazer parte?" },
    { tema: "Storytelling falha", headline: "Gastei R$ X e errei feio em {nicho} — aprendi isso", hook: "Erro documentado.", cta: "Evita esse erro" },
  ],
  autoridade: [
    { tema: "Tutorial passo a passo", headline: "Como fazer {resultado} em {nicho} em 4 passos (sem {dor})", hook: "Passo 3 é o que ninguém faz.", cta: "Salva o passo a passo" },
    { tema: "Carrossel framework", headline: "Meu framework A.C.T.A. pra {publicoCurto} sair de {dor} pra {resultado}", hook: "Salvável + aplicável.", cta: "Comenta FRAMEWORK" },
    { tema: "Prova / estudo de caso", headline: "Aluna saiu de 0 pra {resultado} em 23 dias: o que ela fez diferente", hook: "Números + print.", cta: "Quer o mesmo?" },
    { tema: "Live / aula", headline: "Aula grátis: o mapa de {nicho} que uso com clientes de {produto}", hook: "30 min que valem mentoria.", cta: "Comenta AULA" },
    { tema: "Checklist / ferramenta", headline: "Checklist de 9 itens pra revisar seu {nicho} antes de postar", hook: "Use antes de todo post.", cta: "Comenta CHECKLIST" },
    { tema: "Análise de caso", headline: "Analisei 12 perfis de {nicho}: 5 padrões que se repetem nos que crescem", hook: "Dados, não achismo.", cta: "Quer sua análise?" },
    { tema: "Mito técnico", headline: "Algoritmo 2026: o que realmente importa em {nicho} (atualizado)", hook: "Testei por 30 dias.", cta: "Salva pra consultar" },
    { tema: "Demonstração", headline: "Fiz {produto} ao vivo em 18 minutos — assiste e copia", hook: "Tela gravada.", cta: "Quer o template?" },
  ],
  conversão: [
    { tema: "Oferta direta", headline: "Vagas abertas: {produto} pra quem quer {resultado} em setembro", hook: "3 vagas com condição especial.", cta: "Comenta VAGA" },
    { tema: "Prova social empilhada", headline: "7 prints, 7 histórias: por que {produto} funciona pra {publicoCurto}", hook: "Antes → processo → depois.", cta: "Quer ser a próxima?" },
    { tema: "Quebra de objeção", headline: "“Mas eu não tenho tempo/dinheiro pra {nicho}” — vamos resolver em 1 post", hook: "Objeção #1 quebrada.", cta: "Qual sua objeção? Comenta" },
    { tema: "Bônus / escassez", headline: "Inscrições até domingo: bônus ao vivo + planilha que vale o investimento", hook: "Depois sai do ar.", cta: "Garanta agora" },
    { tema: "Convite DM", headline: "Quer meu diagnóstico gratuito de {nicho} em 15 min? (5 vagas)", hook: "Sem pitch chato.", cta: "Comenta DIAGNÓSTICO" },
    { tema: "Garantia / risco", headline: "Por que ofereço garantia de 7 dias no {produto} (e por que isso te protege)", hook: "Transparência total.", cta: "Tira dúvidas na DM" },
    { tema: "Comparação sincera", headline: "{produto} é pra você? Faça esse teste de 3 perguntas", hook: "Se marcar 2/3, é pra você.", cta: "Comenta TESTE" },
    { tema: "Última chamada", headline: "Últimas horas: fecha hoje às 23h59 e não volta nesse valor", hook: "Aviso honesto.", cta: "Link na bio" },
  ],
};

const viralReasons: Record<Pilar, string[]> = {
  atração: ["Gancho de curiosidade + dor específica = salvamento alto", "Formato Reels com trend + dor do público = compartilhamento", "Lista prática com promessa direta = viral salvável"],
  conexão: ["Vulnerabilidade + identificação = comentários emocionais", "História real com virada = tempo de retenção alto"],
  autoridade: ["Framework próprio nomeado = autoridade + salvamentos", "Tutorial passo a passo com prova = compartilhamento em grupos"],
  conversão: ["Quebra de objeção empática = DM lotada", "Prova social empilhada = gatilho de prova + escassez"],
};

function interpolate(str: string, input: PlannerInput): string {
  const pubCurto = input.publico.split(",")[0].split(" que")[0].split(" e ")[0].trim().slice(0, 32) || "iniciantes";
  const nichoCap = input.nicho.charAt(0).toUpperCase() + input.nicho.slice(1);
  return str
    .replaceAll("{nicho}", nichoCap)
    .replaceAll("{publico}", input.publico)
    .replaceAll("{publicoCurto}", pubCurto)
    .replaceAll("{dor}", input.dor || "travar no começo")
    .replaceAll("{produto}", input.produto || "meu método")
    .replaceAll("{resultado}", input.objetivo.includes("vender") ? "vender todos os dias" : input.objetivo.includes("seguidor") ? "crescer com seguidores certos" : "ter constância sem surtar")
    .replaceAll("{coisaPolêmica}", input.dor.split(" ")[0] || "atalhos");
}

function hashDay(day: number, pilar: Pilar): number {
  return (day * 37 + pilar.length * 13) % 100;
}

export function generateCalendar(input: PlannerInput, year = 2026, month = 8): CalendarResult {
  // month 0-indexed, 8 = setembro
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const activeWeekdays = distributionDays(input.frequencia);
  const weights = getPilarWeights(input.objetivo);
  const formatos = input.formatos.length ? input.formatos : ["reels", "carrossel", "stories"];

  const posts: Post[] = [];
  let pilarQueue: Pilar[] = [];
  // Build weighted sequence to ensure balance across month
  const totalPostsEstimate = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1).getDay()).filter(d => activeWeekdays.includes(d)).length;
  const counts: Record<Pilar, number> = { atração: 0, conexão: 0, autoridade: 0, conversão: 0 };
  // pre-calc target counts
  (Object.keys(weights) as Pilar[]).forEach(p => {
    counts[p] = Math.round(totalPostsEstimate * weights[p]);
  });
  // adjust rounding diff
  let diff = totalPostsEstimate - Object.values(counts).reduce((a, b) => a + b, 0);
  while (diff !== 0) {
    const p: Pilar = diff > 0 ? "atração" : "conversão";
    counts[p] += diff > 0 ? 1 : -1;
    diff = totalPostsEstimate - Object.values(counts).reduce((a, b) => a + b, 0);
  }
  // build queue alternating to avoid same pilar consecutively when possible
  const pilarsOrder: Pilar[] = ["atração", "autoridade", "conexão", "conversão"];
  // distribute by interleaving
  const remaining = { ...counts };
  while (Object.values(remaining).some(v => v > 0)) {
    for (const p of pilarsOrder) {
      if (remaining[p] > 0) {
        pilarQueue.push(p);
        remaining[p]--;
      }
    }
  }
  // shuffle queue deterministically based on nicho hash
  const seed = input.nicho.length + input.publico.length;
  pilarQueue = pilarQueue
    .map((p, i) => ({ p, r: Math.sin((i + seed) * 12.9898) * 43758.5453 % 1 }))
    .sort((a, b) => a.r - b.r)
    .map(x => x.p);

  // avoid 2 same pilar in a row after shuffle: bubble fix
  for (let i = 1; i < pilarQueue.length; i++) {
    if (pilarQueue[i] === pilarQueue[i - 1]) {
      const swapIdx = pilarQueue.findIndex((_, j) => j > i && pilarQueue[j] !== pilarQueue[i]);
      if (swapIdx !== -1) {
        const tmp = pilarQueue[i];
        pilarQueue[i] = pilarQueue[swapIdx];
        pilarQueue[swapIdx] = tmp;
      }
    }
  }

  let queueIdx = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const wd = date.getDay();
    if (!activeWeekdays.includes(wd)) continue;

    const pilar = pilarQueue[queueIdx % pilarQueue.length];
    queueIdx++;

    // formato smart per pilar
    let formato: Formato;
    const fmtPool = [...formatos];
    if (pilar === "atração" && fmtPool.includes("reels")) formato = "reels";
    else if (pilar === "autoridade" && fmtPool.includes("carrossel")) formato = "carrossel";
    else if (pilar === "conexão" && fmtPool.includes("stories")) formato = "stories";
    else if (pilar === "conversão" && fmtPool.includes("carrossel")) formato = "carrossel";
    else {
      // cycle
      formato = fmtPool[(d + queueIdx) % fmtPool.length] as Formato;
    }

    const templates = lib[pilar];
    const tpl = templates[(d * 7 + queueIdx * 3) % templates.length];

    const headline = interpolate(tpl.headline, input);
    const tema = interpolate(tpl.tema, input);
    const hook = interpolate(tpl.hook, input);
    const cta = interpolate(tpl.cta, input);

    const baseScore = pilar === "atração" ? 85 : pilar === "autoridade" ? 78 : pilar === "conexão" ? 72 : 70;
    const dayFactor = (d % 7 === 0 || d % 7 === 2 || d % 7 === 4) ? 8 : 0; // ter/qui/dom boost
    const formatBoost = formato === "reels" ? 7 : formato === "carrossel" ? 5 : 2;
    const viralScore = Math.min(99, baseScore + dayFactor + formatBoost + (hashDay(d, pilar) % 5));

    posts.push({
      id: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      data: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      dia: d,
      diaSemana: diasSemanaLong[wd],
      pilar,
      formato,
      tema,
      headline,
      legendaHook: hook,
      cta,
      viralScore,
      status: "planejado",
    });
  }

  // weeks grouping: semana 1 = 1-7, semana 2 = 8-14, etc but labeled by date ranges
  const weeks: WeekGroup[] = [];
  const weekDefs = [
    { n: 1, start: 1, end: 7, label: "Semana 1 • 01–07 set" },
    { n: 2, start: 8, end: 14, label: "Semana 2 • 08–14 set" },
    { n: 3, start: 15, end: 21, label: "Semana 3 • 15–21 set" },
    { n: 4, start: 22, end: 30, label: "Semana 4 • 22–30 set" },
  ];
  for (const w of weekDefs) {
    const wPosts = posts.filter(p => p.dia >= w.start && p.dia <= w.end);
    weeks.push({ semana: w.n, label: w.label, posts: wPosts });
  }

  // viral top 3
  const sorted = [...posts].sort((a, b) => b.viralScore - a.viralScore).slice(0, 3);
  const viralTop3: ViralPick[] = sorted.map(p => {
    const reasons = viralReasons[p.pilar];
    const motivo = reasons[p.dia % reasons.length];
    return { post: p, motivo: `${motivo} • Pilar ${p.pilar} • ${p.formato.toUpperCase()} • Score ${p.viralScore}/100` };
  });

  // annotate posts with reason if in top3
  viralTop3.forEach(v => {
    const target = posts.find(p => p.id === v.post.id);
    if (target) target.viralReason = v.motivo;
  });

  return { posts, weeks, viralTop3 };
}

export const PILAR_META: Record<Pilar, { color: string; bg: string; label: string; desc: string }> = {
  atração: { color: "#0e7490", bg: "#ecfeff", label: "AT", desc: "alcance e novos seguidores" },
  conexão: { color: "#be123c", bg: "#fff1f2", label: "CX", desc: "proximidade e confiança" },
  autoridade: { color: "#1d4ed8", bg: "#eff6ff", label: "AU", desc: "prova e ensino" },
  conversão: { color: "#15803d", bg: "#f0fdf4", label: "CV", desc: "oferta e venda" },
};

export const FORMATO_LABEL: Record<Formato, string> = {
  reels: "REELS",
  carrossel: "CARROSSEL",
  stories: "STORIES",
  feed: "FEED",
  live: "LIVE",
};
