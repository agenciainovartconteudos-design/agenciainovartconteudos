import { useEffect, useState } from "react";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button, Panel, Avatar, Status, Search, FormModal, Empty, IconButton, useToast } from "./ui";

type Client = {
  id: string;
  owner_id: string;
  name: string;
  niche: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  status: string;
  created_at: string;
};

export function ClientsManager() {
  const toast = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [create, setCreate] = useState(false);
  const [edit, setEdit] = useState<Client | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    const { data, error: err } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    if (err) {
      setError("Não foi possível carregar os clientes.");
      setLoading(false);
      return;
    }
    setClients(data || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = clients.filter((c) =>
    `${c.name} ${c.niche || ""} ${c.contact_name || ""}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  async function createClient(d: Record<string, string>) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const ownerId = session?.user?.id;
    if (!ownerId) {
      toast("Sessão expirada. Faça login novamente.");
      return false;
    }
    const { data, error: err } = await supabase
      .from("clients")
      .insert({
        owner_id: ownerId,
        name: d.name,
        niche: d.niche || null,
        contact_name: d.contact_name || null,
        contact_email: d.contact_email || null,
        contact_phone: d.contact_phone || null,
      })
      .select()
      .single();
    if (err) {
      toast("Não foi possível cadastrar o cliente.");
      return false;
    }
    setClients((prev) => [data as Client, ...prev]);
    toast("Cliente cadastrado.");
  }

  async function updateClient(d: Record<string, string>) {
    if (!edit) return false;
    const { data, error: err } = await supabase
      .from("clients")
      .update({
        name: d.name,
        niche: d.niche || null,
        contact_name: d.contact_name || null,
        contact_email: d.contact_email || null,
        contact_phone: d.contact_phone || null,
      })
      .eq("id", edit.id)
      .select()
      .single();
    if (err) {
      toast("Não foi possível atualizar o cliente.");
      return false;
    }
    setClients((prev) => prev.map((c) => (c.id === edit.id ? (data as Client) : c)));
    toast("Cliente atualizado.");
  }

  if (loading) {
    return (
      <Panel title="Clientes" subtitle="Carregando…">
        <div className="panel-body">
          <Loader2 size={22} />
        </div>
      </Panel>
    );
  }

  return (
    <div className="stack">
      <Panel
        title="Clientes"
        subtitle="Cadastre os clientes da agência para liberar estúdio, Kanban, estratégia e tendências"
        action={
          <Button onClick={() => setCreate(true)}>
            <Plus size={16} /> Novo cliente
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
          <Search value={query} onChange={setQuery} placeholder="Buscar clientes…" />
        </div>
        {filtered.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Nicho</th>
                  <th>Contato</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="inline">
                        <Avatar name={c.name} />
                        <strong>{c.name}</strong>
                      </div>
                    </td>
                    <td>{c.niche || "—"}</td>
                    <td>
                      {c.contact_name || "—"}
                      {c.contact_email && <span className="secondary">{c.contact_email}</span>}
                    </td>
                    <td>
                      <Status value={c.status} />
                    </td>
                    <td>
                      <IconButton label={`Editar ${c.name}`} onClick={() => setEdit(c)}>
                        <Pencil size={15} />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="Nenhum cliente cadastrado"
            text="Cadastre o primeiro cliente para liberar estúdio de design, Kanban, estratégia com IA e tendências."
          >
            <Button onClick={() => setCreate(true)}>
              <Plus size={16} /> Novo cliente
            </Button>
          </Empty>
        )}
      </Panel>

      <FormModal
        open={create || !!edit}
        onClose={() => {
          setCreate(false);
          setEdit(null);
        }}
        title={edit ? "Editar cliente" : "Novo cliente"}
        description="Dados usados em todo o painel: estúdio de artes, Kanban, estratégia com IA e tendências."
        fields={[
          { name: "name", label: "Nome do cliente / marca", value: edit?.name },
          { name: "niche", label: "Nicho / segmento", value: edit?.niche || "", required: false },
          { name: "contact_name", label: "Nome do contato", value: edit?.contact_name || "", required: false },
          { name: "contact_email", label: "E-mail do contato", type: "email", value: edit?.contact_email || "", required: false },
          { name: "contact_phone", label: "Telefone do contato", value: edit?.contact_phone || "", required: false },
        ]}
        submit={edit ? "Salvar alterações" : "Cadastrar cliente"}
        onSubmit={(d) => (edit ? updateClient(d) : createClient(d))}
      />
    </div>
  );
}
