import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Megaphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button, Panel, Status, Search, Tabs, Empty, IconButton, Modal, useToast } from "./ui";

type Campaign = {
  id: string;
  owner_id: string;
  client_id: string | null;
  name: string;
  description: string | null;
  channels: string[];
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type ClientOption = { id: string; name: string };

const CHANNELS = ["Instagram", "Facebook", "TikTok", "YouTube", "LinkedIn", "Pinterest", "X (Twitter)"];
const STATUSES = ["Planejada", "Em andamento", "Pausada", "Concluída", "Cancelada"];

const emptyForm = {
  name: "",
  description: "",
  channels: [] as string[],
  start_date: "",
  end_date: "",
  budget: "",
  status: "Planejada",
  client_id: "",
};

function formatMoney(v: number | null) {
  if (v === null || v === undefined) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("pt-BR");
}

export function CampaignsManager() {
  const toast = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Todas");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Campaign | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    const [{ data: camps, error: cerr }, { data: cls }] = await Promise.all([
      supabase.from("campaigns").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name").order("name", { ascending: true }),
    ]);
    if (cerr) {
      setError("Não foi possível carregar as campanhas.");
      setLoading(false);
      return;
    }
    setCampaigns((camps as Campaign[]) || []);
    setClients((cls as ClientOption[]) || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = campaigns.filter(
    (c) =>
      (filter === "Todas" || c.status === filter) &&
      `${c.name} ${c.description || ""}`.toLowerCase().includes(query.toLowerCase()),
  );

  function openCreate() {
    setEdit(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(c: Campaign) {
    setEdit(c);
    setForm({
      name: c.name,
      description: c.description || "",
      channels: c.channels || [],
      start_date: c.start_date || "",
      end_date: c.end_date || "",
      budget: c.budget !== null && c.budget !== undefined ? String(c.budget) : "",
      status: c.status,
      client_id: c.client_id || "",
    });
    setOpen(true);
  }

  function toggleChannel(ch: string) {
    setForm((f) => ({
      ...f,
      channels: f.channels.includes(ch) ? f.channels.filter((x) => x !== ch) : [...f.channels, ch],
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (!form.channels.length) {
      toast("Selecione ao menos um canal.");
      return;
    }
    setSaving(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const ownerId = session?.user?.id;
      if (!ownerId) {
        toast("Sessão expirada. Faça login novamente.");
        return;
      }
      const payload = {
        name: form.name,
        description: form.description || null,
        channels: form.channels,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        budget: form.budget ? Number(form.budget) : null,
        status: form.status,
        client_id: form.client_id || null,
      };
      if (edit) {
        const { data, error: err } = await supabase
          .from("campaigns")
          .update(payload)
          .eq("id", edit.id)
          .select()
          .single();
        if (err) {
          toast("Não foi possível atualizar a campanha.");
          return;
        }
        setCampaigns((prev) => prev.map((c) => (c.id === edit.id ? (data as Campaign) : c)));
        toast("Campanha atualizada.");
      } else {
        const { data, error: err } = await supabase
          .from("campaigns")
          .insert({ ...payload, owner_id: ownerId })
          .select()
          .single();
        if (err) {
          toast("Não foi possível criar a campanha.");
          return;
        }
        setCampaigns((prev) => [data as Campaign, ...prev]);
        toast("Campanha criada.");
      }
      setOpen(false);
      setEdit(null);
      setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(c: Campaign) {
    if (!window.confirm(`Excluir a campanha "${c.name}"? Essa ação não pode ser desfeita.`)) return;
    const { error: err } = await supabase.from("campaigns").delete().eq("id", c.id);
    if (err) {
      toast("Não foi possível excluir a campanha.");
      return;
    }
    setCampaigns((prev) => prev.filter((x) => x.id !== c.id));
    toast("Campanha excluída.");
  }

  if (loading) {
    return (
      <Panel title="Campanhas" subtitle="Carregando…">
        <div className="panel-body">
          <Loader2 size={22} />
        </div>
      </Panel>
    );
  }

  return (
    <div className="stack">
      <Panel
        title="Campanhas"
        subtitle="Planeje, acompanhe e organize as campanhas da equipe"
        action={
          <Button onClick={openCreate}>
            <Plus size={16} /> Nova campanha
          </Button>
        }
      >
        {error && (
          <div className="panel-body">
            <p role="alert" style={{ color: "#a8493d", fontSize: 13, fontWeight: 600 }}>
              {error}
            </p>
          </div>
        )}
        <div className="toolbar panel-body" style={{ paddingBottom: 0 }}>
          <Tabs items={["Todas", ...STATUSES]} value={filter} onChange={setFilter} />
          <Search value={query} onChange={setQuery} placeholder="Buscar campanhas…" />
        </div>
        {filtered.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Campanha</th>
                  <th>Canais</th>
                  <th>Período</th>
                  <th>Orçamento</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="inline">
                        <Megaphone size={16} color="var(--accent)" />
                        <div>
                          <strong>{c.name}</strong>
                          {c.description && <span className="secondary">{c.description}</span>}
                        </div>
                      </div>
                    </td>
                    <td>{(c.channels || []).join(", ") || "—"}</td>
                    <td>
                      {formatDate(c.start_date)} – {formatDate(c.end_date)}
                    </td>
                    <td>{formatMoney(c.budget)}</td>
                    <td>
                      <Status value={c.status} />
                    </td>
                    <td>
                      <div className="inline">
                        <IconButton label={`Editar ${c.name}`} onClick={() => openEdit(c)}>
                          <Pencil size={15} />
                        </IconButton>
                        <IconButton label={`Excluir ${c.name}`} onClick={() => handleDelete(c)}>
                          <Trash2 size={15} />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="Nenhuma campanha encontrada"
            text="Crie a primeira campanha para organizar canais, período e orçamento."
          >
            <Button onClick={openCreate}>
              <Plus size={16} /> Nova campanha
            </Button>
          </Empty>
        )}
        <div className="table-footer">
          {filtered.length} de {campaigns.length} campanhas
          <span>Dados reais do banco</span>
        </div>
      </Panel>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEdit(null);
        }}
        title={edit ? "Editar campanha" : "Nova campanha"}
      >
        <p className="muted form-intro">
          Defina nome, canais, período e orçamento. Os dados são salvos direto no banco.
        </p>
        <form className="form-stack" onSubmit={handleSubmit}>
          <label className="field">
            <span>
              Nome da campanha<small> *</small>
            </span>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Lançamento de coleção de verão"
              required
            />
          </label>
          <label className="field">
            <span>Descrição</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Objetivo e contexto da campanha"
            />
          </label>
          {clients.length > 0 && (
            <label className="field">
              <span>Cliente</span>
              <select
                value={form.client_id}
                onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}
              >
                <option value="">Nenhum cliente específico</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="field">
            <span>
              Canais<small> *</small>
            </span>
            <div className="inline" style={{ flexWrap: "wrap", gap: 8 }}>
              {CHANNELS.map((ch) => (
                <button
                  key={ch}
                  type="button"
                  className={`badge ${form.channels.includes(ch) ? "accent" : "neutral"}`}
                  style={{ border: "1px solid var(--line)", cursor: "pointer" }}
                  aria-pressed={form.channels.includes(ch)}
                  onClick={() => toggleChannel(ch)}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
          <div className="form-grid">
            <label className="field">
              <span>Data de início</span>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
              />
            </label>
            <label className="field">
              <span>Data de término</span>
              <input
                type="date"
                value={form.end_date}
                min={form.start_date || undefined}
                onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))}
              />
            </label>
          </div>
          <div className="form-grid">
            <label className="field">
              <span>Orçamento (R$)</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.budget}
                onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                placeholder="0,00"
              />
            </label>
            <label className="field">
              <span>Status</span>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          <Button type="submit" className="full" disabled={saving}>
            {saving ? "Salvando..." : edit ? "Salvar alterações" : "Criar campanha"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
