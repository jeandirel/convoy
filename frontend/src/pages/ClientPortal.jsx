import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Download, FileText, LogOut, MessageCircle, Plus, Upload } from "lucide-react";
import { Logo } from "../components/Logo";
import {
  clearSupabaseSession,
  createDocument,
  createMission,
  getMyProfile,
  listMyDocuments,
  listMyInvoices,
  listMyMissions,
  listMyQuotes,
  uploadFile,
} from "../lib/supabaseRest";

const initialMission = {
  service_type: "conduite",
  vehicle: "",
  pickup_address: "",
  delivery_address: "",
  scheduled_date: "",
  notes: "",
};

const statusLabels = {
  request_received: "Demande recue",
  quote_sent: "Devis envoye",
  quote_accepted: "Devis accepte",
  driver_assigned: "Convoyeur affecte",
  in_progress: "Mission en cours",
  completed: "Mission terminee",
  invoice_sent: "Facture envoyee",
  paid: "Payee",
  cancelled: "Annulee",
};

const ClientPortal = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [missions, setMissions] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState(initialMission);
  const [file, setFile] = useState(null);
  const [selectedMission, setSelectedMission] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const logout = () => {
    clearSupabaseSession();
    navigate("/login", { replace: true });
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const me = await getMyProfile();
      if (!me) throw new Error("no profile");
      if (me.role === "admin") return navigate("/admin", { replace: true });
      if (me.role === "driver") return navigate("/convoyeur", { replace: true });
      setProfile(me);
      const [nextMissions, nextQuotes, nextInvoices, nextDocuments] = await Promise.all([
        listMyMissions(me.id),
        listMyQuotes(me.id),
        listMyInvoices(me.id),
        listMyDocuments(me.id),
      ]);
      setMissions(nextMissions);
      setQuotes(nextQuotes);
      setInvoices(nextInvoices);
      setDocuments(nextDocuments);
      if (!selectedMission && nextMissions[0]) setSelectedMission(nextMissions[0].id);
    } catch (err) {
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate, selectedMission]);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => ({
    missions: missions.length,
    quotes: quotes.length,
    invoices: invoices.length,
    docs: documents.length,
  }), [missions, quotes, invoices, documents]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submitMission = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await createMission({
        ...form,
        client_id: profile.id,
        client_name: profile.full_name,
        client_email: profile.email,
        client_phone: profile.phone,
        status: "request_received",
        scheduled_date: form.scheduled_date || null,
      });
      setForm(initialMission);
      setMessage("Demande enregistree. L'admin pourra preparer un devis.");
      await load();
    } catch (err) {
      setError("Impossible d'enregistrer la demande.");
    }
  };

  const submitDocument = async (e) => {
    e.preventDefault();
    if (!file) return;
    setError("");
    setMessage("");
    try {
      const safeName = `${Date.now()}-${file.name}`.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${profile.id}/${safeName}`;
      const url = await uploadFile("client-documents", path, file);
      await createDocument({ owner_id: profile.id, mission_id: selectedMission || null, title: file.name, type: "client", url });
      setFile(null);
      setMessage("Document ajoute a votre espace.");
      await load();
    } catch (err) {
      setError("Upload impossible. Verifiez le bucket Supabase et les permissions.");
    }
  };

  if (loading) return <Shell onLogout={logout}><div className="py-24 text-center text-[#4F5B7A]">Chargement...</div></Shell>;

  return (
    <Shell onLogout={logout} profile={profile}>
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Stat label="Missions" value={stats.missions} />
        <Stat label="Devis" value={stats.quotes} />
        <Stat label="Factures" value={stats.invoices} />
        <Stat label="Documents" value={stats.docs} />
      </div>

      {message && <Notice tone="success">{message}</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-4 bg-white rounded-2xl border border-[#0F2A5F]/10 p-5">
          <h2 className="font-display text-2xl text-[#0F2A5F] flex items-center gap-2"><Plus size={20} /> Nouvelle demande</h2>
          <form onSubmit={submitMission} className="mt-4 space-y-3">
            <FieldSelect label="Service" value={form.service_type} onChange={(v) => update("service_type", v)} options={{ conduite: "Convoyage", livraison: "Livraison", recuperation: "Recuperation", transport: "Transport plateau" }} />
            <Field label="Vehicule" value={form.vehicle} onChange={(v) => update("vehicle", v)} required />
            <Field label="Depart" value={form.pickup_address} onChange={(v) => update("pickup_address", v)} required />
            <Field label="Arrivee" value={form.delivery_address} onChange={(v) => update("delivery_address", v)} required />
            <Field label="Date souhaitee" type="date" value={form.scheduled_date} onChange={(v) => update("scheduled_date", v)} />
            <label className="field-label">Notes</label>
            <textarea className="field" rows={4} value={form.notes} onChange={(e) => update("notes", e.target.value)} />
            <button className="btn-primary w-full justify-center">Envoyer la demande</button>
          </form>

          <form onSubmit={submitDocument} className="mt-8 pt-6 border-t border-[#0F2A5F]/10">
            <h3 className="font-display text-xl text-[#0F2A5F] flex items-center gap-2"><Upload size={18} /> Ajouter un document</h3>
            <FieldSelect label="Mission" value={selectedMission} onChange={setSelectedMission} options={Object.fromEntries(missions.map((m) => [m.id, m.vehicle || m.title || m.id]))} />
            <input className="field mt-3" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <button className="btn-outline w-full justify-center mt-3">Uploader</button>
          </form>
        </section>

        <section className="lg:col-span-8 space-y-5">
          <Panel title="Suivi des missions" icon={Calendar}>
            <div className="space-y-3">{missions.length ? missions.map((m) => <MissionCard key={m.id} mission={m} />) : <Empty text="Aucune mission pour le moment." />}</div>
          </Panel>
          <Panel title="Devis et factures" icon={FileText}>
            <div className="grid md:grid-cols-2 gap-3">
              {quotes.map((q) => <DocCard key={q.id} title={`Devis ${q.reference || ""}`} amount={q.amount} status={q.status} url={q.external_url} />)}
              {invoices.map((i) => <DocCard key={i.id} title={`Facture ${i.reference || ""}`} amount={i.amount} status={i.status} url={i.payment_url || i.external_url} />)}
              {!quotes.length && !invoices.length && <Empty text="Aucun devis ou facture." />}
            </div>
          </Panel>
          <Panel title="Documents" icon={Download}>
            <div className="grid md:grid-cols-2 gap-3">{documents.length ? documents.map((d) => <DocCard key={d.id} title={d.title} status={d.type} url={d.url} />) : <Empty text="Aucun document." />}</div>
          </Panel>
        </section>
      </div>
    </Shell>
  );
};

const Shell = ({ children, onLogout, profile }) => (
  <main className="min-h-screen bg-[#FAFAF7]">
    <header className="bg-white border-b border-[#0F2A5F]/10 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link to="/"><Logo size={28} /></Link>
        <div className="flex items-center gap-3"><span className="hidden sm:block text-sm text-[#4F5B7A]">{profile?.full_name || "Client"}</span><button onClick={onLogout} className="btn-outline !py-2 !px-4 text-sm"><LogOut size={14} /> Deconnexion</button></div>
      </div>
    </header>
    <div className="max-w-7xl mx-auto px-6 py-8">
      <span className="num-tag">Espace client</span>
      <h1 className="font-display text-4xl text-[#0F2A5F] mt-3 mb-6">Mes convoyages</h1>
      {children}
    </div>
  </main>
);

const Stat = ({ label, value }) => <div className="bg-white rounded-2xl border border-[#0F2A5F]/10 p-5"><div className="text-xs uppercase tracking-wider text-[#4F5B7A]">{label}</div><div className="font-display text-3xl text-[#0F2A5F] mt-2">{value}</div></div>;
const Notice = ({ children, tone }) => <div className={`mb-5 rounded-2xl p-4 text-sm ${tone === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{children}</div>;
const Panel = ({ title, icon: Icon, children }) => <div className="bg-white rounded-2xl border border-[#0F2A5F]/10 p-5"><h2 className="font-display text-2xl text-[#0F2A5F] flex items-center gap-2 mb-4"><Icon size={20} /> {title}</h2>{children}</div>;
const Empty = ({ text }) => <p className="text-[#4F5B7A] text-sm py-4">{text}</p>;
const Field = ({ label, value, onChange, type = "text", required }) => <div><label className="field-label">{label}</label><input className="field" type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} /></div>;
const FieldSelect = ({ label, value, onChange, options }) => <div><label className="field-label">{label}</label><select className="field" value={value} onChange={(e) => onChange(e.target.value)}>{Object.entries(options).map(([key, labelText]) => <option key={key} value={key}>{labelText}</option>)}</select></div>;
const MissionCard = ({ mission }) => <article className="rounded-2xl bg-[#F5F2EA] p-4"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-display text-xl text-[#0F2A5F]">{mission.vehicle || "Vehicule a confirmer"}</h3><p className="text-sm text-[#4F5B7A] mt-1">{mission.pickup_address} -> {mission.delivery_address}</p></div><span className="h-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0F2A5F]">{statusLabels[mission.status] || mission.status}</span></div>{mission.notes && <p className="text-sm text-[#4F5B7A] mt-3">{mission.notes}</p>}</article>;
const DocCard = ({ title, amount, status, url }) => <article className="rounded-2xl bg-[#F5F2EA] p-4"><h3 className="font-semibold text-[#0F2A5F]">{title}</h3><p className="text-sm text-[#4F5B7A] mt-1">{status || "document"}{amount ? ` - ${Number(amount).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}` : ""}</p>{url && <a href={url} target="_blank" rel="noreferrer" className="btn-outline !py-2 !px-3 text-sm mt-3 inline-flex">Ouvrir</a>}</article>;

export default ClientPortal;
