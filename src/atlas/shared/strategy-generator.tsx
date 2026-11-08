import { useEffect, useState } from "react";
import { Sparkles, Wand2, Copy, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button, Panel, useToast } from "./ui";

type Client = {
  id: string;
  name: string;
  niche: string | null;
  strategy: string | null;
};

const TONES = ["Profissional", "Casual", "Divertido", "Inspirador", "Educativo"];
const PLATFORMS = ["Instagram", "TikTok", "LinkedIn", "Facebook", "YouTube"];

function buildStrategy(client: Client, tone: string, platforms: string[], goal: string) {
  const niche = client.niche || "o nicho do cliente";
  const platformList = platforms.length ? platforms.join(", ") : "Instagram";
  const freq = (platforms.length ? platforms : ["Instagram"])
    .map((p) => `• ${p}: 3 a 5 publicações por semana`)
    .join("\n");
  return `ESTRATÉGIA DE CONTEÚDO — ${client.name.toUpperCase()}\n\nNicho: ${niche}\nTom de voz: ${tone}\nCanais prioritários: ${platformList}\nObjetivo principal: ${goal || "Aumentar reconhecimento de marca e gerar leads qualificados"}\n\nPILARES DE CONTEÚDO\n1. Educação — conteúdos que ensinam algo prático sobre ${niche}, gerando autoridade.\n2. Prova social — depoimentos, bastidores e resultados reais de clientes.\n3. Conexão — conteúdos de bastidores e valores da marca, no tom ${tone.toLowerCase()}.\n4. Conversão — chamadas diretas para ação, ofertas e lançamentos.\n\nFREQUÊNCIA SUGERIDA\n${freq}\n\nPRÓXIMOS PASSOS\n• Validar os pilares com o cliente.\n• Planejar o calendário editorial do mês.\n• Criar as primeiras artes com base nesta estratégia.`;
}

function buildCaption(topic: string, tone: string) {
  return `✨ ${topic}\n\nConteúdo pensado no tom ${tone.toLowerCase()} para gerar conexão real com o público. Compartilhe se isso fizer sentido para você! 🙌\n\n#conteudo #estrategia`;
}

export function StrategyGenerator() {
  const toast = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [platforms, setPlatforms] = useState<string[]>(["Instagram"]);
  const [goal, setGoal] = useState("");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: err } = await supabase
        .from("clients")
        .select("id, name, niche, strategy")
        .order("name", { ascending: true });
      if (!active) return;
      if (err) {
        setError("Não foi possível carregar os clientes.");
        setLoadingClients(false);
        return;
      }
      setClients(data || []);
      if (data && data.length) setSelected(data[0].id);
      setLoadingClients(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const client = clients.find((c) => c.id === selected);

  function togglePlatform(p: string) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  async function generateStrategy() {
    if (!client) return;
    setError("");
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 650));
      setResult(buildStrategy(client, tone, platforms, goal));
      toast("Estratégia gerada.");
    } finally {
      setLoading(false);
    }
  }

  function generateCaption() {
    if (!topic.trim()) {
      setError("Informe um tema para gerar a legenda.");
      return;
    }
    setError("");
    setCaption(buildCaption(topic, tone));
    toast("Legenda gerada.");
  }

  async function saveStrategy() {
    if (!client || !result) return;
    setSaving(true);
    setError("");
    try {
      const { error: err } = await supabase
        .from("clients")
        .update({ strategy: result })
        .eq("id", client.id);
      if (err) {
        setError("Não foi possível salvar a estratégia no cliente.");
        return;
      }
      setClients((prev) =>
        prev.map((c) => (c.id === client.id ? { ...c, strategy: result } : c)),
      );
      toast("Estratégia salva no cadastro do cliente.");
    } finally {
      setSaving(false);
    }
  }

  function copy(text: string) {
    navigator.clipboard?.writeText(text);
    toast("Copiado para a área de transferência.");
  }

  if (loadingClients) {
    return (
      <Panel title="Gerador de estratégia e redação" subtitle="Carregando clientes…">
        <div className="panel-body">
          <Loader2 size={22} />
        </div>
      </Panel>
    );
  }

  if (!clients.length) {
    return (
      <Panel title="Gerador de estratégia e redação">
        <div className="empty">
          <Sparkles size={32} />
          <h3>Nenhum cliente cadastrado</h3>
          <p>Cadastre um cliente na área de Clientes para gerar estratégias e legendas com IA.</p>
        </div>
      </Panel>
    );
  }

  return (
    <div className="stack">
      <Panel
        title="Gerador de estratégia"
        subtitle="Monte um plano de conteúdo em segundos com base no perfil do cliente"
      >
        <div className="panel-body form-stack">
          <label className="field">
            <span>Cliente</span>
            <select
              value={selected}
              onChange={(e) => {
                setSelected(e.target.value);
                setResult("");
              }}
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.niche ? ` — ${c.niche}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Tom de voz</span>
            <select value={tone} onChange={(e) => setTone(e.target.value)}>
              {TONES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Canais</span>
            <div className="chip-row">
              {PLATFORMS.map((p) => (
                <button
                  type="button"
                  key={p}
                  className={`chip ${platforms.includes(p) ? "active" : ""}`}
                  onClick={() => togglePlatform(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </label>
          <label className="field">
            <span>Objetivo principal</span>
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Ex.: Aumentar vendas do novo serviço"
            />
          </label>
          {error && (
            <p role="alert" style={{ color: "#a8493d", fontSize: 13, fontWeight: 600 }}>
              {error}
            </p>
          )}
          <Button onClick={generateStrategy} disabled={loading || !client}>
            {loading ? <Loader2 size={17} /> : <Wand2 size={17} />}
            {loading ? "Gerando…" : "Gerar estratégia com IA"}
          </Button>
        </div>
      </Panel>

      {result && (
        <Panel
          title="Estratégia gerada"
          subtitle={client ? `Para ${client.name}` : ""}
          action={
            <div className="inline">
              <Button variant="secondary" onClick={() => copy(result)}>
                <Copy size={15} /> Copiar
              </Button>
              <Button onClick={saveStrategy} disabled={saving}>
                {saving ? <Loader2 size={15} /> : <Save size={15} />}
                {saving ? "Salvando…" : "Salvar no cliente"}
              </Button>
            </div>
          }
        >
          <div className="panel-body">
            <pre style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.7, fontFamily: "inherit" }}>
              {result}
            </pre>
          </div>
        </Panel>
      )}

      <Panel
        title="Gerador de legendas"
        subtitle="Crie uma legenda rápida para uma publicação, no tom escolhido acima"
      >
        <div className="panel-body form-stack">
          <label className="field">
            <span>Tema da publicação</span>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex.: Lançamento do novo serviço de consultoria"
            />
          </label>
          <Button onClick={generateCaption} variant="secondary">
            <Sparkles size={16} /> Gerar legenda com IA
          </Button>
          {caption && (
            <div className="panel-body" style={{ background: "var(--bg)", borderRadius: 10, padding: 16 }}>
              <pre style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.7, fontFamily: "inherit", margin: 0 }}>
                {caption}
              </pre>
              <Button variant="ghost" onClick={() => copy(caption)} style={{ marginTop: 12 }}>
                <Copy size={15} /> Copiar legenda
              </Button>
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}
