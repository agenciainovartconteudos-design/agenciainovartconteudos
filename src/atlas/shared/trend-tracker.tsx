import { useEffect, useState } from "react";
import { TrendingUp, Plus, Loader2, ExternalLink, Sparkles, LayoutGrid } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button, Panel, Empty, FormModal, useToast, Badge } from "./ui";

type Client = { id: string; name: string; niche: string | null };

type Trend = {
  id: string;
  client_id: string;
  title: string;
  source_url: string | null;
  summary: string | null;
  suggested_post: string | null;
  created_at: string;
};

function suggestPost(title: string, niche: string | null) {
  const n = niche || "o nicho do cliente";
  return `Ideia de post: aborde "${title}" sob a ótica de ${n}. Ângulo sugerido: traga um exemplo prático ligando a tendência ao dia a dia do público, com uma chamada para comentários no final.`;
}

export function TrendTracker() {
  const toast = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState("");
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [error, setError] = useState("");
  const [create, setCreate] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: err } = await supabase
        .from("clients")
        .select("id, name, niche")
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

  useEffect(() => {
    if (!selected) {
      setTrends([]);
      return;
    }
    let active = true;
    setLoadingTrends(true);
    setError("");
    (async () => {
      const { data, error: err } = await supabase
        .from("trends")
        .select("*")
        .eq("client_id", selected)
        .order("created_at", { ascending: false });
      if (!active) return;
      if (err) {
        setError("Não foi possível carregar as tendências deste cliente.");
        setLoadingTrends(false);
        return;
      }
      setTrends(data || []);
      setLoadingTrends(false);
    })();
    return () => {
      active = false;
    };
  }, [selected]);

  const client = clients.find((c) => c.id === selected);

  async function createCard(trend: Trend) {
    if (!client) return;
    setSendingId(trend.id);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const ownerId = session?.user?.id;
      if (!ownerId) {
        toast("Sessão expirada. Faça login novamente.");
        return;
      }
      const { error: err } = await supabase.from("design_assets").insert({
        client_id: client.id,
        owner_id: ownerId,
        title: trend.title,
        format: "feed-1-1",
        stage: "roteiro",
        source: "trend",
        caption: trend.suggested_post || "",
      });
      if (err) {
        toast("Não foi possível criar o card no Kanban.");
        return;
      }
      toast("Card criado no Kanban em \"Roteiro / Ideia\".");
    } finally {
      setSendingId(null);
    }
  }

  if (loadingClients) {
    return (
      <Panel title="Rastreador de tendências" subtitle="Carregando clientes…">
        <div className="panel-body">
          <Loader2 size={22} />
        </div>
      </Panel>
    );
  }

  if (!clients.length) {
    return (
      <Panel title="Rastreador de tendências">
        <Empty
          title="Nenhum cliente cadastrado"
          text="Cadastre um cliente na área de Clientes para monitorar tendências por nicho."
        />
      </Panel>
    );
  }

  return (
    <div className="stack">
      <Panel
        title="Rastreador de tendências"
        subtitle="Assuntos em alta e sugestões de post, segmentados pelo nicho do cliente"
        action={
          <div className="inline">
            <label className="field" style={{ margin: 0 }}>
              <select value={selected} onChange={(e) => setSelected(e.target.value)}>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.niche ? ` — ${c.niche}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <Button onClick={() => setCreate(true)} disabled={!client}>
              <Plus size={16} /> Nova tendência
            </Button>
          </div>
        }
      >
        {error && (
          <div className="panel-body">
            <p role="alert" style={{ color: "#a8493d", fontSize: 13, fontWeight: 600 }}>
              {error}
            </p>
          </div>
        )}
        {loadingTrends ? (
          <div className="panel-body">
            <Loader2 size={22} />
          </div>
        ) : trends.length ? (
          <div className="panel-body" style={{ display: "grid", gap: 16 }}>
            {trends.map((t) => (
              <div
                key={t.id}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 12,
                  padding: 18,
                  display: "grid",
                  gap: 10,
                }}
              >
                <div className="between">
                  <div className="inline">
                    <TrendingUp size={16} color="var(--accent)" />
                    <strong style={{ fontSize: 14 }}>{t.title}</strong>
                  </div>
                  <Badge tone="accent">{client?.niche || "Geral"}</Badge>
                </div>
                {t.summary && <p style={{ fontSize: 13, color: "var(--muted)" }}>{t.summary}</p>}
                {t.suggested_post && (
                  <div
                    style={{
                      background: "var(--bg)",
                      borderRadius: 8,
                      padding: 12,
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}
                  >
                    <div className="inline" style={{ marginBottom: 6 }}>
                      <Sparkles size={14} color="var(--accent)" />
                      <b style={{ fontSize: 12 }}>Sugestão de post</b>
                    </div>
                    {t.suggested_post}
                  </div>
                )}
                <div className="inline" style={{ justifyContent: "space-between" }}>
                  {t.source_url ? (
                    <a
                      href={t.source_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700, display: "inline-flex", gap: 5, alignItems: "center" }}
                    >
                      <ExternalLink size={13} /> Ver notícia de referência
                    </a>
                  ) : (
                    <span />
                  )}
                  <Button
                    variant="secondary"
                    onClick={() => createCard(t)}
                    disabled={sendingId === t.id}
                  >
                    {sendingId === t.id ? <Loader2 size={15} /> : <LayoutGrid size={15} />}
                    {sendingId === t.id ? "Criando…" : "Criar card no Kanban"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty
            title="Nenhuma tendência registrada"
            text="Adicione um assunto em alta, trend ou notícia quente para este cliente."
          >
            <Button onClick={() => setCreate(true)}>
              <Plus size={16} /> Nova tendência
            </Button>
          </Empty>
        )}
      </Panel>

      <FormModal
        open={create}
        onClose={() => setCreate(false)}
        title="Nova tendência"
        description="Registre um assunto em alta para este cliente e gere uma sugestão de post automaticamente."
        fields={[
          { name: "title", label: "Título do assunto / trend" },
          { name: "source_url", label: "Link da notícia de referência", required: false },
          { name: "summary", label: "Resumo", type: "textarea", required: false },
        ]}
        submit="Adicionar tendência"
        onSubmit={(d) => {
          if (!client) return false;
          const suggested = suggestPost(d.title, client.niche);
          (async () => {
            const { data, error: err } = await supabase
              .from("trends")
              .insert({
                client_id: client.id,
                title: d.title,
                source_url: d.source_url || null,
                summary: d.summary || null,
                suggested_post: suggested,
              })
              .select()
              .single();
            if (err) {
              toast("Não foi possível salvar a tendência.");
              return;
            }
            setTrends((prev) => [data as Trend, ...prev]);
            toast("Tendência adicionada com sugestão de post.");
          })();
        }}
      />
    </div>
  );
}
