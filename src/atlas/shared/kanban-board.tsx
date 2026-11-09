import { useEffect, useState } from "react";
import { Plus, Loader2, Sparkles, LayoutGrid } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button, Panel, Empty, FormModal, Badge, useToast } from "./ui";

type Client = { id: string; name: string; niche: string | null };

type Asset = {
  id: string;
  client_id: string;
  title: string;
  format: string;
  stage: string;
  source: string;
  caption: string | null;
  created_at: string;
};

const STAGES = [
  { id: "ideia", label: "Ideia", dot: "stage-1" },
  { id: "roteiro", label: "Roteiro", dot: "stage-2" },
  { id: "design", label: "Design", dot: "stage-3" },
  { id: "revisão", label: "Revisão", dot: "stage-4" },
  { id: "aprovado", label: "Aprovado", dot: "stage-1" },
];

const FORMATS = ["feed-1-1", "stories-9-16", "carrossel", "banner"];

export function KanbanBoard() {
  const toast = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [selected, setSelected] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [error, setError] = useState("");
  const [create, setCreate] = useState(false);

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

  async function loadAssets(clientId: string) {
    setLoadingAssets(true);
    setError("");
    const { data, error: err } = await supabase
      .from("design_assets")
      .select("id, client_id, title, format, stage, source, caption, created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });
    if (err) {
      setError("Não foi possível carregar os cards do Kanban.");
      setLoadingAssets(false);
      return;
    }
    setAssets(data || []);
    setLoadingAssets(false);
  }

  useEffect(() => {
    if (!selected) {
      setAssets([]);
      return;
    }
    loadAssets(selected);
  }, [selected]);

  const client = clients.find((c) => c.id === selected);

  async function moveStage(asset: Asset, stage: string) {
    const { error: err } = await supabase
      .from("design_assets")
      .update({ stage })
      .eq("id", asset.id);
    if (err) {
      toast("Não foi possível mover o card.");
      return;
    }
    setAssets((prev) => prev.map((a) => (a.id === asset.id ? { ...a, stage } : a)));
  }

  if (loadingClients) {
    return (
      <Panel title="Kanban editorial" subtitle="Carregando clientes…">
        <div className="panel-body">
          <Loader2 size={22} />
        </div>
      </Panel>
    );
  }

  if (!clients.length) {
    return (
      <Panel title="Kanban editorial">
        <Empty
          title="Nenhum cliente cadastrado"
          text="Cadastre um cliente na área de Clientes para organizar o fluxo de conteúdo no Kanban."
        />
      </Panel>
    );
  }

  return (
    <div className="stack">
      <Panel
        title="Kanban editorial"
        subtitle="Ideias de tendências, roteiros e artes, organizados por etapa"
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
              <Plus size={16} /> Novo card
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
        {loadingAssets ? (
          <div className="panel-body">
            <Loader2 size={22} />
          </div>
        ) : assets.length ? (
          <div className="panel-body kanban-scroll">
            <div className="kanban">
              {STAGES.map((stage) => {
                const items = assets.filter((a) => a.stage === stage.id);
                return (
                  <div className="kanban-column" key={stage.id}>
                    <div className="kanban-head">
                      <span className={`stage-dot ${stage.dot}`} />
                      <h2>{stage.label}</h2>
                      <span>{items.length}</span>
                    </div>
                    <div className="kanban-total">
                      {items.length} card{items.length === 1 ? "" : "s"}
                    </div>
                    {items.map((a) => (
                      <div className="deal-card" key={a.id}>
                        <div className="between">
                          {a.source === "trend" ? (
                            <Badge tone="accent">
                              <Sparkles size={11} /> Tendência
                            </Badge>
                          ) : (
                            <Badge>{a.format}</Badge>
                          )}
                        </div>
                        <h3>{a.title}</h3>
                        {a.caption && (
                          <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
                            {a.caption.slice(0, 90)}
                            {a.caption.length > 90 ? "…" : ""}
                          </p>
                        )}
                        <label className="field" style={{ marginTop: 12 }}>
                          <select
                            value={a.stage}
                            onChange={(e) => moveStage(a, e.target.value)}
                          >
                            {STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                Mover para: {s.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    ))}
                    {!items.length && (
                      <p className="field-hint" style={{ padding: "0 4px" }}>
                        Nenhum card nesta etapa.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <Empty
            title="Nenhum card ainda"
            text="Crie um card manualmente ou use o Rastreador de tendências para transformar uma ideia em card."
          >
            <Button onClick={() => setCreate(true)}>
              <Plus size={16} /> Novo card
            </Button>
          </Empty>
        )}
      </Panel>

      <FormModal
        open={create}
        onClose={() => setCreate(false)}
        title="Novo card no Kanban"
        description="Crie um card de conteúdo para este cliente e mova pelas etapas do fluxo editorial."
        fields={[
          { name: "title", label: "Título do post / arte" },
          { name: "format", label: "Formato", type: "select", options: FORMATS, value: FORMATS[0] },
          { name: "stage", label: "Etapa inicial", type: "select", options: STAGES.map((s) => s.id), value: "ideia" },
          { name: "caption", label: "Legenda / roteiro", type: "textarea", required: false },
        ]}
        submit="Criar card"
        onSubmit={(d) => {
          if (!client) return false;
          (async () => {
            const {
              data: { session },
            } = await supabase.auth.getSession();
            const ownerId = session?.user?.id;
            if (!ownerId) {
              toast("Sessão expirada. Faça login novamente.");
              return;
            }
            const { data, error: err } = await supabase
              .from("design_assets")
              .insert({
                client_id: client.id,
                owner_id: ownerId,
                title: d.title,
                format: d.format,
                stage: d.stage,
                source: "manual",
                caption: d.caption || "",
              })
              .select()
              .single();
            if (err) {
              toast("Não foi possível criar o card.");
              return;
            }
            setAssets((prev) => [data as Asset, ...prev]);
            toast("Card criado no Kanban.");
          })();
        }}
      />
    </div>
  );
}
