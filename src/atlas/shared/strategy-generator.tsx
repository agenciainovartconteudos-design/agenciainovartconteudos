import { useEffect, useState } from "react";
import { Sparkles, Wand2, Copy, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Panel, Button, Badge, useToast, Empty } from "./ui";

type ClientRow = {
  id: string;
  name: string;
  niche: string | null;
  strategy: string | null;
};

const TONES = ["Profissional", "Descontraído", "Inspirador", "Direto ao ponto"];

function buildStrategy(name: string, niche: string, tone: string) {
  const pillars = [
    `Autoridade em ${niche}: conteúdos educativos que mostram domínio do assunto.`,
    `Bastidores e processo: humaniza a marca ${name} e cria conexão.`,
    `Prova social: depoimentos, resultados e cases reais de clientes.`,
    `Oferta e conversão: chamadas claras para o próximo passo do cliente.`,
  ];
  return [
    `ESTRATÉGIA DE CONTEÚDO — ${name.toUpperCase()}`,
    "",
    `Nicho: ${niche}`,
    `Tom de voz: ${tone}`,
    "",
    "Pilares de conteúdo:",
    ...pillars.map((p) => `• ${p}`),
    "",
    "Cadência sugerida: 4 posts/semana (2 feed, 1 carrossel, 1 vídeo curto).",
    "Métrica-chave do mês: taxa de salvamento e comentários qualificados.",
  ].join("\n");
}

function buildCaption(name: string, niche: string, tone: string, topic: string) {
  const hook =
    tone === "Descontraído"
      ? `Sério, ninguém te contou isso sobre ${niche.toLowerCase()} ainda? 👀`
      : tone === "Inspirador"
        ? `Toda jornada em ${niche.toLowerCase()} começa com uma decisão simples.`
        : tone === "Direto ao ponto"
          ? `3 coisas que você precisa saber sobre ${topic || niche}:`
          : `Entenda como ${topic || niche} pode transformar seus resultados.`;
  return [
    hook,
    "",
    `Na ${name}, a gente vive isso de perto todos os dias. ${topic ? `Hoje o assunto é: ${topic}.` : ""}`,
    "",
    "Se esse conteúdo te ajudou, salva pra consultar depois e compartilha com alguém que precisa ver isso. 💬",
    "",
    "#" + niche.replace(/\s+/g, "") + " #ConteudoQueConverte",
  ].join("\n");
}

export function StrategyGenerator() {
  const toast = useToast();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [clientId, setClientId] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [topic, setTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [strategy, setStrategy] = useState("");
  const [caption, setCaption] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, name, niche, strategy")
        .order("name");
      if (!active) return;
      if (!error && data) {
        setClients(data as ClientRow[]);
        if (data.length) setClientId((prev) => prev || data[0].id);
      }
      setLoadingClients(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const selected = clients.find((c) => c.id === clientId);

  function generate() {
    if (!selected) return;
    setGenerating(true);
    const niche = selected.niche || "posicionamento digital";
    setTimeout(() => {
      setStrategy(buildStrategy(selected.name, niche, tone));
      setCaption(buildCaption(selected.name, niche, tone, topic));
      setGenerating(false);
    }, 650);
  }

  async function saveStrategy() {
    if (!selected || !strategy) return;
    setSaving(true);
    const { error } = await supabase
      .from("clients")
      .update({ strategy })
      .eq("id", selected.id);
    setSaving(false);
    if (error) {
      toast("Não foi possível salvar a estratégia.");
      return;
    }
    setClients((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, strategy } : c)),
    );
    toast("Estratégia salva no cadastro do cliente.");
  }

  function copy(text: string, label: string) {
    navigator.clipboard?.writeText(text);
    toast(`${label} copiada para a área de transferência.`);
  }

  if (loadingClients) {
    return (
      <Panel title="Gerador de estratégia e redação">
        <div className="panel-body" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Loader2 size={18} className="spin" />
          <span className="muted">Carregando clientes…</span>
        </div>
      </Panel>
    );
  }

  if (!clients.length) {
    return (
      <Panel title="Gerador de estratégia e redação">
        <Empty
          title="Cadastre um cliente primeiro"
          text="Para gerar estratégia e legendas, adicione ao menos um cliente no painel."
        />
      </Panel>
    );
  }

  return (
    <div className="stack">
      <Panel
        title="Gerador de estratégia e redação com IA"
        subtitle="Escolha o cliente, o tom de voz e gere um plano de conteúdo e uma legenda prontos para revisão."
      >
        <div className="panel-body form-grid">
          <label className="field">
            <span>Cliente</span>
            <select
              className="select full"
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setStrategy("");
                setCaption("");
              }}
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Tom de voz</span>
            <select
              className="select full"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              {TONES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="field" style={{ gridColumn: "1 / -1" }}>
            <span>Tema do próximo post (opcional)</span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex.: lançamento de produto, promoção de aniversário…"
            />
          </label>
        </div>
        <div className="panel-body" style={{ paddingTop: 0 }}>
          <Button onClick={generate} disabled={generating}>
            {generating ? <Loader2 size={17} className="spin" /> : <Sparkles size={17} />}
            {generating ? "Gerando…" : "Gerar estratégia e legenda"}
          </Button>
        </div>
      </Panel>

      {(strategy || caption) && (
        <div className="grid-equal">
          <Panel
            title="Estratégia de conteúdo"
            subtitle={selected ? `Plano sugerido para ${selected.name}` : undefined}
            action={
              <div className="inline">
                <Button variant="secondary" onClick={() => copy(strategy, "Estratégia")}>
                  <Copy size={15} /> Copiar
                </Button>
                <Button variant="secondary" onClick={generate}>
                  <RefreshCw size={15} /> Gerar outra
                </Button>
              </div>
            }
          >
            <div className="panel-body">
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "inherit",
                  fontSize: 14,
                  lineHeight: 1.8,
                  margin: 0,
                }}
              >
                {strategy}
              </pre>
              <div style={{ marginTop: 18 }}>
                <Button onClick={saveStrategy} disabled={saving}>
                  {saving ? "Salvando…" : "Salvar no cadastro do cliente"}
                </Button>
              </div>
            </div>
          </Panel>
          <Panel
            title="Legenda sugerida"
            subtitle="Pronta para revisão e publicação"
            action={
              <Button variant="secondary" onClick={() => copy(caption, "Legenda")}>
                <Copy size={15} /> Copiar
              </Button>
            }
          >
            <div className="panel-body">
              <Badge tone="accent">
                <Wand2 size={13} /> Gerado por IA · revise antes de publicar
              </Badge>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "inherit",
                  fontSize: 14,
                  lineHeight: 1.8,
                  margin: "16px 0 0",
                }}
              >
                {caption}
              </pre>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
