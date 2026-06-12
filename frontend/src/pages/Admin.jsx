import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileSignature,
  FileText,
  LayoutDashboard,
  Link as LinkIcon,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Plus,
  ReceiptText,
  RefreshCw,
  Trash2,
  User,
} from "lucide-react";
import { Logo } from "../components/Logo";
import {
  clearSupabaseSession,
  createRecord,
  deleteRecord,
  getSupabaseSession,
  isSupabaseConfigured,
  listRecords,
  supabaseLogin,
  updateRecord,
} from "../lib/supabaseRest";

const emptyForm = {
  kind: "reservation",
  status: "draft",
  title: "",
  client_name: "",
  client_email: "",
  client_phone: "",
  vehicle: "",
  pickup_address: "",
  delivery_address: "",
  scheduled_date: "",
  amount: "",
  document_url: "",
  signature_url: "",
  notes: "",
};

const kindLabels = {
  reservation: "Réservation",
  devis: "Devis",
  contrat: "Contrat",
  facture: "Facture",
  document: "Document",
  mission: "Mission",
};

const statusLabels = {
  draft: "Brouillon",
  new: "Nouveau",
  in_progress: "En cours",
  sent: "Envoyé",
  signed: "Signé",
  paid: "Payé",
  done: "Terminé",
  cancelled: "Annulé",
};

const statusClasses = {
  draft: "bg-slate-100 text-slate-700",
  new: "bg-[#E9C97C]/25 text-[#7A5A12]",
  in_progress: "bg-[#0F2A5F]/10 text-[#0F2A5F]",
  sent: "bg-blue-50 text-blue-700",
  signed: "bg-purple-50 text-purple-700",
  paid: "bg-emerald-50 text-emerald-700",
  done: "bg-[#2DA84F]/15 text-[#1F7437]",
  cancelled: "bg-red-50 text-red-700",
};

const kindIcons = {
  reservation: Calendar,
  devis: FileText,
  contrat: FileSignature,
  facture: ReceiptText,
  document: LinkIcon,
  mission: BriefcaseBusiness,
};

const normalizeForm = (form) => ({
  ...form,
  amount: form.amount === "" ? null : Number(form.amount),
  scheduled_date: form.scheduled_date || null,
  document_url: form.document_url || null,
  signature_url: form.signature_url || null,
});

const formatMoney = (amount) => {
  if (amount === null || amount === undefined || amount === "") return "-";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(amount));
};

const Admin = () => {
  const [session, setSession] = useState(() => getSupabaseSession());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const nextSession = await supabaseLogin(email, password);
      setSession(nextSession);
    } catch (err) {
      setLoginError("Connexion impossible. Vérifiez l'email, le mot de passe et les variables Supabase sur Vercel.");
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = () => {
    clearSupabaseSession();
    setSession(null);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0F2A5F] flex items-center justify-center p-6 relative overflow-hidden" data-testid="admin-login-page">
        <div className="absolute -top-32 -right-20 blob" style={{ background: "#2DA84F", width: 420, height: 420 }} />
        <div className="absolute -bottom-32 -left-20 blob" style={{ background: "#E9C97C", width: 380, height: 380, opacity: 0.3 }} />
        <div className="grain" />
        <form onSubmit={login} className="relative bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl" data-testid="admin-login-form">
          <div className="flex justify-center mb-8"><Logo size={32} /></div>
          <h1 className="font-display text-3xl text-[#0F2A5F] text-center">Espace pro</h1>
          <p className="text-center text-[#4F5B7A] mt-2 text-sm">Connexion Supabase admin</p>

          {!isSupabaseConfigured && (
            <div className="mt-6 rounded-2xl bg-amber-50 text-amber-800 text-sm p-4">
              Configurez `REACT_APP_SUPABASE_URL` et `REACT_APP_SUPABASE_ANON_KEY` dans Vercel pour activer l'espace pro.
            </div>
          )}

          <div className="mt-8 space-y-4">
            <div>
              <label className="field-label">Email admin</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F5B7A]" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="field pl-11" required autoFocus />
              </div>
            </div>
            <div>
              <label className="field-label">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F5B7A]" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="field pl-11" required />
              </div>
            </div>
          </div>

          {loginError && <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm">{loginError}</div>}

          <button type="submit" disabled={loginLoading || !isSupabaseConfigured} className="btn-primary mt-6 w-full justify-center">
            {loginLoading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    );
  }

  return <AdminWorkspace onLogout={logout} />;
};

const AdminWorkspace = ({ onLogout }) => {
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRecords(await listRecords());
    } catch (err) {
      setError("Impossible de charger les dossiers Supabase.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredRecords = useMemo(() => {
    if (filter === "all") return records;
    return records.filter((record) => record.kind === filter);
  }, [records, filter]);

  const stats = useMemo(() => ({
    total: records.length,
    active: records.filter((r) => !["done", "cancelled"].includes(r.status)).length,
    devis: records.filter((r) => r.kind === "devis").length,
    factures: records.filter((r) => r.kind === "facture").length,
  }), [records]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await updateRecord(editingId, normalizeForm(form));
      } else {
        await createRecord(normalizeForm(form));
      }
      resetForm();
      await load();
    } catch (err) {
      setError("Enregistrement impossible. Vérifiez les champs et les permissions Supabase.");
    } finally {
      setSaving(false);
    }
  };

  const edit = (record) => {
    setEditingId(record.id);
    setForm({
      ...emptyForm,
      ...record,
      amount: record.amount ?? "",
      scheduled_date: record.scheduled_date ?? "",
      document_url: record.document_url ?? "",
      signature_url: record.signature_url ?? "",
      notes: record.notes ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!window.confirm("Supprimer ce dossier ?")) return;
    await deleteRecord(id);
    await load();
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7]" data-testid="admin-dashboard">
      <header className="bg-white border-b border-[#0F2A5F]/10 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Logo size={26} />
          <div className="flex items-center gap-2">
            <button onClick={load} className="btn-outline !py-2 !px-4 text-sm"><RefreshCw size={14} /> Actualiser</button>
            <button onClick={onLogout} className="btn-outline !py-2 !px-4 text-sm"><LogOut size={14} /> Déconnexion</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between gap-6 flex-wrap mb-8">
          <div>
            <span className="num-tag">Admin pro</span>
            <h1 className="font-display text-4xl text-[#0F2A5F] mt-3">Gestion GastyConvoy</h1>
            <p className="text-[#4F5B7A] mt-2 max-w-2xl">Réservations, devis, contrats, factures, signatures et documents clients.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Dossiers" value={stats.total} icon={LayoutDashboard} color="#0F2A5F" />
          <StatCard label="Actifs" value={stats.active} icon={BriefcaseBusiness} color="#2DA84F" />
          <StatCard label="Devis" value={stats.devis} icon={FileText} color="#E9C97C" />
          <StatCard label="Factures" value={stats.factures} icon={ReceiptText} color="#7C3AED" />
        </div>

        {error && <div className="mb-6 rounded-2xl bg-red-50 text-red-700 p-4 text-sm">{error}</div>}

        <section className="grid lg:grid-cols-12 gap-6 items-start">
          <form onSubmit={submit} className="lg:col-span-4 bg-white rounded-2xl border border-[#0F2A5F]/10 p-5 sticky top-24">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl text-[#0F2A5F]">{editingId ? "Modifier" : "Créer"}</h2>
              {editingId && <button type="button" onClick={resetForm} className="text-sm text-[#4F5B7A] hover:text-[#0F2A5F]">Annuler</button>}
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mt-5">
              <FieldSelect label="Type" value={form.kind} onChange={(v) => update("kind", v)} options={kindLabels} />
              <FieldSelect label="Statut" value={form.status} onChange={(v) => update("status", v)} options={statusLabels} />
            </div>
            <FieldInput label="Titre *" value={form.title} onChange={(v) => update("title", v)} required />
            <FieldInput label="Client" value={form.client_name} onChange={(v) => update("client_name", v)} />
            <div className="grid sm:grid-cols-2 gap-3">
              <FieldInput label="Email" type="email" value={form.client_email || ""} onChange={(v) => update("client_email", v)} />
              <FieldInput label="Téléphone" value={form.client_phone || ""} onChange={(v) => update("client_phone", v)} />
            </div>
            <FieldInput label="Véhicule" value={form.vehicle || ""} onChange={(v) => update("vehicle", v)} />
            <FieldInput label="Départ" value={form.pickup_address || ""} onChange={(v) => update("pickup_address", v)} />
            <FieldInput label="Arrivée" value={form.delivery_address || ""} onChange={(v) => update("delivery_address", v)} />
            <div className="grid sm:grid-cols-2 gap-3">
              <FieldInput label="Date" type="date" value={form.scheduled_date || ""} onChange={(v) => update("scheduled_date", v)} />
              <FieldInput label="Montant" type="number" value={form.amount ?? ""} onChange={(v) => update("amount", v)} />
            </div>
            <FieldInput label="Lien document" value={form.document_url || ""} onChange={(v) => update("document_url", v)} />
            <FieldInput label="Lien signature" value={form.signature_url || ""} onChange={(v) => update("signature_url", v)} />
            <div className="mt-3">
              <label className="field-label">Notes</label>
              <textarea className="field" rows={4} value={form.notes || ""} onChange={(e) => update("notes", e.target.value)} />
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full justify-center mt-5">
              <Plus size={18} /> {saving ? "Enregistrement..." : editingId ? "Mettre à jour" : "Créer le dossier"}
            </button>
          </form>

          <div className="lg:col-span-8">
            <div className="flex flex-wrap gap-2 mb-4">
              <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>Tous</FilterButton>
              {Object.entries(kindLabels).map(([key, label]) => (
                <FilterButton key={key} active={filter === key} onClick={() => setFilter(key)}>{label}</FilterButton>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-20 text-[#4F5B7A]">Chargement...</div>
            ) : filteredRecords.length === 0 ? (
              <Empty label="Aucun dossier pour le moment." />
            ) : (
              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <RecordCard key={record.id} record={record} onEdit={edit} onDelete={remove} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-2xl p-5 border border-[#0F2A5F]/10">
    <div className="flex items-center justify-between">
      <span className="text-xs uppercase tracking-wider text-[#4F5B7A]">{label}</span>
      <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `${color}1f` }}>
        <Icon size={16} style={{ color }} />
      </div>
    </div>
    <div className="font-display text-3xl text-[#0F2A5F] mt-3">{value}</div>
  </div>
);

const FieldInput = ({ label, value, onChange, type = "text", required = false }) => (
  <div className="mt-3">
    <label className="field-label">{label}</label>
    <input className="field" type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
  </div>
);

const FieldSelect = ({ label, value, onChange, options }) => (
  <div>
    <label className="field-label">{label}</label>
    <select className="field" value={value} onChange={(e) => onChange(e.target.value)}>
      {Object.entries(options).map(([key, labelText]) => <option key={key} value={key}>{labelText}</option>)}
    </select>
  </div>
);

const FilterButton = ({ active, onClick, children }) => (
  <button onClick={onClick} className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${active ? "bg-[#0F2A5F] text-white" : "bg-white text-[#0F2A5F] border border-[#0F2A5F]/10 hover:border-[#2DA84F]/50"}`}>
    {children}
  </button>
);

const RecordCard = ({ record, onEdit, onDelete }) => {
  const Icon = kindIcons[record.kind] || BriefcaseBusiness;
  return (
    <article className="bg-white rounded-2xl border border-[#0F2A5F]/10 p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-[#F5F2EA] flex items-center justify-center shrink-0"><Icon size={19} className="text-[#0F2A5F]" /></div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2DA84F]">{kindLabels[record.kind] || record.kind}</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClasses[record.status] || statusClasses.draft}`}>{statusLabels[record.status] || record.status}</span>
            </div>
            <h3 className="font-display text-xl text-[#0F2A5F] mt-1 break-words">{record.title}</h3>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#4F5B7A]">
              {record.client_name && <span className="inline-flex items-center gap-1"><User size={13} /> {record.client_name}</span>}
              {record.scheduled_date && <span className="inline-flex items-center gap-1"><Calendar size={13} /> {record.scheduled_date}</span>}
              {(record.pickup_address || record.delivery_address) && <span className="inline-flex items-center gap-1"><MapPin size={13} /> {[record.pickup_address, record.delivery_address].filter(Boolean).join(" → ")}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(record)} className="btn-outline !py-2 !px-3 text-sm">Modifier</button>
          <button onClick={() => onDelete(record.id)} className="text-red-700 hover:bg-red-50 rounded-full p-2"><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="mt-4 grid sm:grid-cols-3 gap-3 text-sm">
        <MiniInfo label="Montant" value={formatMoney(record.amount)} />
        <MiniInfo label="Véhicule" value={record.vehicle || "-"} />
        <MiniInfo label="Contact" value={record.client_phone || record.client_email || "-"} />
      </div>

      {(record.document_url || record.signature_url || record.notes) && (
        <div className="mt-4 pt-4 border-t border-[#0F2A5F]/8 flex flex-wrap gap-3 items-center text-sm">
          {record.document_url && <a href={record.document_url} target="_blank" rel="noreferrer" className="text-[#0F2A5F] font-semibold inline-flex items-center gap-1">Document <ExternalLink size={13} /></a>}
          {record.signature_url && <a href={record.signature_url} target="_blank" rel="noreferrer" className="text-[#2DA84F] font-semibold inline-flex items-center gap-1">Signature <ExternalLink size={13} /></a>}
          {record.notes && <span className="text-[#4F5B7A]">{record.notes}</span>}
        </div>
      )}
    </article>
  );
};

const MiniInfo = ({ label, value }) => (
  <div className="rounded-xl bg-[#F5F2EA] px-3 py-2">
    <div className="text-[11px] uppercase tracking-wider text-[#4F5B7A]">{label}</div>
    <div className="text-[#0F2A5F] font-semibold truncate">{value}</div>
  </div>
);

const Empty = ({ label }) => (
  <div className="text-center py-20 bg-white rounded-3xl border border-[#0F2A5F]/10">
    <CheckCircle2 size={32} className="text-[#0F2A5F]/30 mx-auto" />
    <p className="mt-3 text-[#4F5B7A]">{label}</p>
  </div>
);

export default Admin;