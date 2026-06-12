import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BriefcaseBusiness, Download, FileText, LayoutDashboard, LogOut, Plus, ReceiptText, RefreshCw, User, Users } from "lucide-react";
import { Logo } from "../components/Logo";
import {
  clearSupabaseSession,
  createInvoice,
  createMission,
  createQuote,
  createTestimonial,
  deleteMission,
  getMyProfile,
  isSupabaseConfigured,
  listClients,
  listDrivers,
  listInvoices,
  listMissions,
  listProfiles,
  listQuotes,
  listSiteContent,
  listTestimonials,
  supabaseLogin,
  updateInvoice,
  updateMission,
  updateQuote,
  updateTestimonial,
  upsertSiteContent,
} from "../lib/supabaseRest";

const missionStatuses = {
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

const emptyMission = { client_id: "", driver_id: "", service_type: "conduite", status: "request_received", vehicle: "", pickup_address: "", delivery_address: "", scheduled_date: "", amount: "", notes: "" };
const emptyQuote = { mission_id: "", amount: "", status: "draft", external_url: "", signature_url: "", notes: "" };
const emptyInvoice = { mission_id: "", amount: "", status: "sent", payment_url: "", external_url: "", notes: "" };

const Admin = () => {
  const [session, setSession] = useState(() => sessionStorage.getItem("gc_supabase_session"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    try {
      await supabaseLogin(email, password);
      setSession("ok");
    } catch (err) {
      setLoginError("Connexion impossible. Verifiez les identifiants et Supabase.");
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0F2A5F] flex items-center justify-center p-6 relative overflow-hidden" data-testid="admin-login-page">
        <form onSubmit={login} className="relative bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl" data-testid="admin-login-form">
          <div className="flex justify-center mb-8"><Logo size={34} /></div>
          <h1 className="font-display text-3xl text-[#0F2A5F] text-center">Espace administrateur</h1>
          <p className="text-center text-[#4F5B7A] mt-2 text-sm">Connexion Supabase admin</p>
          {!isSupabaseConfigured && <div className="mt-6 rounded-2xl bg-amber-50 text-amber-800 text-sm p-4">Configurez les variables Supabase dans Vercel.</div>}
          <label className="field-label mt-8 block">Email</label><input type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label className="field-label mt-4 block">Mot de passe</label><input type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {loginError && <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm">{loginError}</div>}
          <button disabled={loading || !isSupabaseConfigured} className="btn-primary mt-6 w-full justify-center">{loading ? "Connexion..." : "Se connecter"}</button>
        </form>
      </div>
    );
  }
  return <AdminWorkspace />;
};

const AdminWorkspace = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [clients, setClients] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [missions, setMissions] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [contents, setContents] = useState([]);
  const [tab, setTab] = useState("missions");
  const [missionForm, setMissionForm] = useState(emptyMission);
  const [quoteForm, setQuoteForm] = useState(emptyQuote);
  const [invoiceForm, setInvoiceForm] = useState(emptyInvoice);
  const [contentForm, setContentForm] = useState({ section: "vision", title: "", body: "", media_url: "" });
  const [testimonialForm, setTestimonialForm] = useState({ name: "", role: "", quote: "", published: true });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
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
      if (!me || me.role !== "admin") {
        setError("Votre compte n'a pas le role admin dans Supabase.");
        return;
      }
      setProfile(me);
      const [allProfiles, allClients, allDrivers, allMissions, allQuotes, allInvoices, allTestimonials, allContents] = await Promise.all([
        listProfiles(), listClients(), listDrivers(), listMissions(), listQuotes(), listInvoices(), listTestimonials(), listSiteContent(),
      ]);
      setProfiles(allProfiles);
      setClients(allClients);
      setDrivers(allDrivers);
      setMissions(allMissions);
      setQuotes(allQuotes);
      setInvoices(allInvoices);
      setTestimonials(allTestimonials);
      setContents(allContents);
    } catch (err) {
      setError("Impossible de charger les donnees admin. Verifiez la migration SQL et le role admin.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => ({
    clients: clients.length,
    drivers: drivers.length,
    missions: missions.length,
    inProgress: missions.filter((m) => ["driver_assigned", "in_progress"].includes(m.status)).length,
    pendingQuotes: quotes.filter((q) => ["draft", "sent"].includes(q.status)).length,
    unpaid: invoices.filter((i) => i.status !== "paid").length,
    revenue: invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + Number(i.amount || 0), 0),
  }), [clients, drivers, missions, quotes, invoices]);

  const notify = async (fn, success) => {
    setError("");
    setMessage("");
    try {
      await fn();
      setMessage(success);
      await load();
    } catch (err) {
      setError("Action impossible. Verifiez les champs et les permissions Supabase.");
    }
  };

  const saveMission = (e) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === missionForm.client_id);
    notify(() => createMission({
      ...missionForm,
      amount: missionForm.amount ? Number(missionForm.amount) : null,
      scheduled_date: missionForm.scheduled_date || null,
      driver_id: missionForm.driver_id || null,
      client_name: client?.full_name,
      client_email: client?.email,
      client_phone: client?.phone,
    }), "Mission creee.");
    setMissionForm(emptyMission);
  };

  const assignDriver = (missionId, driverId) => notify(() => updateMission(missionId, { driver_id: driverId || null, status: driverId ? "driver_assigned" : "request_received" }), "Convoyeur affecte.");
  const changeMissionStatus = (missionId, status) => notify(() => updateMission(missionId, { status }), "Statut mis a jour.");
  const removeMission = (missionId) => window.confirm("Supprimer cette mission ?") && notify(() => deleteMission(missionId), "Mission supprimee.");

  const saveQuote = (e) => {
    e.preventDefault();
    const mission = missions.find((m) => m.id === quoteForm.mission_id);
    notify(async () => {
      await createQuote({ ...quoteForm, client_id: mission?.client_id, amount: quoteForm.amount ? Number(quoteForm.amount) : null, reference: `DEV-${Date.now()}` });
      if (mission) await updateMission(mission.id, { status: "quote_sent", amount: quoteForm.amount ? Number(quoteForm.amount) : null });
    }, "Devis cree.");
    setQuoteForm(emptyQuote);
  };

  const saveInvoice = (e) => {
    e.preventDefault();
    const mission = missions.find((m) => m.id === invoiceForm.mission_id);
    notify(async () => {
      await createInvoice({ ...invoiceForm, client_id: mission?.client_id, amount: invoiceForm.amount ? Number(invoiceForm.amount) : null, reference: `FAC-${Date.now()}` });
      if (mission) await updateMission(mission.id, { status: "invoice_sent" });
    }, "Facture creee.");
    setInvoiceForm(emptyInvoice);
  };

  const saveContent = (e) => {
    e.preventDefault();
    notify(() => upsertSiteContent(contentForm), "Contenu enregistre.");
  };

  const saveTestimonial = (e) => {
    e.preventDefault();
    notify(() => createTestimonial(testimonialForm), "Temoignage ajoute.");
    setTestimonialForm({ name: "", role: "", quote: "", published: true });
  };

  const exportCsv = (name, rows) => {
    const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
    const csv = [keys.join(","), ...rows.map((row) => keys.map((key) => JSON.stringify(row[key] ?? "")).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      <header className="bg-white border-b border-[#0F2A5F]/10 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/"><Logo size={28} /></Link>
          <div className="flex items-center gap-2"><button onClick={load} className="btn-outline !py-2 !px-4 text-sm"><RefreshCw size={14} /> Actualiser</button><button onClick={logout} className="btn-outline !py-2 !px-4 text-sm"><LogOut size={14} /> Deconnexion</button></div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <span className="num-tag">Admin pro</span>
        <h1 className="font-display text-4xl text-[#0F2A5F] mt-3">Gestion GastyConvoy</h1>
        <p className="text-[#4F5B7A] mt-2 mb-8">Clients, convoyeurs, missions, devis, factures, contenus et documents.</p>
        {error && <Notice error>{error}</Notice>}
        {message && <Notice>{message}</Notice>}
        <div className="grid sm:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Stat label="Clients" value={stats.clients} icon={Users} />
          <Stat label="Convoyeurs" value={stats.drivers} icon={User} />
          <Stat label="Missions" value={stats.missions} icon={BriefcaseBusiness} />
          <Stat label="En cours" value={stats.inProgress} icon={LayoutDashboard} />
          <Stat label="Devis" value={stats.pendingQuotes} icon={FileText} />
          <Stat label="Impayees" value={stats.unpaid} icon={ReceiptText} />
          <Stat label="CA paye" value={stats.revenue.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} icon={Download} />
        </div>
        <div className="flex flex-wrap gap-2 mb-6">
          {["missions", "clients", "quotes", "invoices", "content"].map((key) => <Tab key={key} active={tab === key} onClick={() => setTab(key)}>{labels[key]}</Tab>)}
        </div>
        {loading ? <div className="py-24 text-center text-[#4F5B7A]">Chargement...</div> : (
          <>
            {tab === "missions" && <MissionsTab missions={missions} clients={clients} drivers={drivers} form={missionForm} setForm={setMissionForm} onSubmit={saveMission} onAssign={assignDriver} onStatus={changeMissionStatus} onDelete={removeMission} />}
            {tab === "clients" && <PeopleTab profiles={profiles} clients={clients} drivers={drivers} onExport={exportCsv} />}
            {tab === "quotes" && <QuotesTab missions={missions} quotes={quotes} form={quoteForm} setForm={setQuoteForm} onSubmit={saveQuote} onUpdate={(id, row) => notify(() => updateQuote(id, row), "Devis mis a jour.")} onExport={exportCsv} />}
            {tab === "invoices" && <InvoicesTab missions={missions} invoices={invoices} form={invoiceForm} setForm={setInvoiceForm} onSubmit={saveInvoice} onUpdate={(id, row) => notify(() => updateInvoice(id, row), "Facture mise a jour.")} onExport={exportCsv} />}
            {tab === "content" && <ContentTab contents={contents} testimonials={testimonials} contentForm={contentForm} setContentForm={setContentForm} testimonialForm={testimonialForm} setTestimonialForm={setTestimonialForm} onContent={saveContent} onTestimonial={saveTestimonial} onToggleTestimonial={(id, published) => notify(() => updateTestimonial(id, { published }), "Temoignage mis a jour.")} />}
          </>
        )}
        {profile && <p className="text-xs text-[#4F5B7A] mt-8">Connecte : {profile.email}</p>}
      </div>
    </main>
  );
};

const labels = { missions: "Missions", clients: "Clients", quotes: "Devis", invoices: "Factures", content: "Contenu" };
const Notice = ({ children, error }) => <div className={`mb-5 rounded-2xl p-4 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{children}</div>;
const Stat = ({ label, value, icon: Icon }) => <div className="bg-white rounded-2xl p-5 border border-[#0F2A5F]/10"><Icon size={17} className="text-[#2DA84F]" /><div className="text-xs uppercase tracking-wider text-[#4F5B7A] mt-3">{label}</div><div className="font-display text-2xl text-[#0F2A5F] mt-1 break-words">{value}</div></div>;
const Tab = ({ active, onClick, children }) => <button onClick={onClick} className={`px-4 py-2 rounded-full text-sm font-semibold ${active ? "bg-[#0F2A5F] text-white" : "bg-white text-[#0F2A5F] border border-[#0F2A5F]/10"}`}>{children}</button>;
const Field = ({ label, value, onChange, type = "text", required }) => <div><label className="field-label">{label}</label><input className="field" type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} /></div>;
const Select = ({ label, value, onChange, options }) => <div><label className="field-label">{label}</label><select className="field" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>;
const Panel = ({ title, children }) => <section className="bg-white rounded-3xl border border-[#0F2A5F]/10 p-5"><h2 className="font-display text-2xl text-[#0F2A5F] mb-5">{title}</h2>{children}</section>;

const MissionsTab = ({ missions, clients, drivers, form, setForm, onSubmit, onAssign, onStatus, onDelete }) => <div className="grid lg:grid-cols-12 gap-6 items-start"><Panel title="Nouvelle mission"><form onSubmit={onSubmit} className="space-y-3"><Select label="Client" value={form.client_id} onChange={(v) => setForm({ ...form, client_id: v })} options={[{ value: "", label: "Choisir" }, ...clients.map((c) => ({ value: c.id, label: c.full_name || c.email }))]} /><Select label="Convoyeur" value={form.driver_id} onChange={(v) => setForm({ ...form, driver_id: v })} options={[{ value: "", label: "Non affecte" }, ...drivers.map((d) => ({ value: d.id, label: d.full_name || d.email }))]} /><Field label="Vehicule" value={form.vehicle} onChange={(v) => setForm({ ...form, vehicle: v })} required /><Field label="Depart" value={form.pickup_address} onChange={(v) => setForm({ ...form, pickup_address: v })} required /><Field label="Arrivee" value={form.delivery_address} onChange={(v) => setForm({ ...form, delivery_address: v })} required /><Field label="Date" type="date" value={form.scheduled_date} onChange={(v) => setForm({ ...form, scheduled_date: v })} /><Field label="Montant" type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} /><label className="field-label">Notes</label><textarea className="field" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /><button className="btn-primary w-full justify-center"><Plus size={17} /> Creer</button></form></Panel><div className="lg:col-span-8 space-y-4">{missions.map((m) => <article key={m.id} className="bg-white rounded-2xl border border-[#0F2A5F]/10 p-5"><div className="flex flex-wrap justify-between gap-4"><div><h3 className="font-display text-xl text-[#0F2A5F]">{m.vehicle || "Mission"}</h3><p className="text-sm text-[#4F5B7A] mt-1">{m.client_name || m.client_email} - {m.pickup_address} -> {m.delivery_address}</p></div><button onClick={() => onDelete(m.id)} className="text-red-700 text-sm">Supprimer</button></div><div className="grid md:grid-cols-2 gap-3 mt-4"><Select label="Statut" value={m.status} onChange={(v) => onStatus(m.id, v)} options={Object.entries(missionStatuses).map(([value, label]) => ({ value, label }))} /><Select label="Convoyeur" value={m.driver_id || ""} onChange={(v) => onAssign(m.id, v)} options={[{ value: "", label: "Non affecte" }, ...drivers.map((d) => ({ value: d.id, label: d.full_name || d.email }))]} /></div></article>)}</div></div>;
const PeopleTab = ({ profiles, clients, drivers, onExport }) => <div className="space-y-6"><div className="flex gap-2"><button className="btn-outline" onClick={() => onExport("clients", clients)}>Exporter clients</button><button className="btn-outline" onClick={() => onExport("convoyeurs", drivers)}>Exporter convoyeurs</button></div><Panel title="Comptes"><div className="grid md:grid-cols-2 gap-3">{profiles.map((p) => <article key={p.id} className="rounded-2xl bg-[#F5F2EA] p-4"><h3 className="font-semibold text-[#0F2A5F]">{p.full_name || p.email}</h3><p className="text-sm text-[#4F5B7A]">{p.email} - {p.role}</p><p className="text-sm text-[#4F5B7A]">{p.phone || ""} {p.company || ""}</p></article>)}</div></Panel></div>;
const QuotesTab = ({ missions, quotes, form, setForm, onSubmit, onUpdate, onExport }) => <div className="grid lg:grid-cols-12 gap-6"><Panel title="Creer un devis"><form onSubmit={onSubmit} className="space-y-3"><Select label="Mission" value={form.mission_id} onChange={(v) => setForm({ ...form, mission_id: v })} options={[{ value: "", label: "Choisir" }, ...missions.map((m) => ({ value: m.id, label: `${m.vehicle || "Mission"} - ${m.client_name || "client"}` }))]} /><Field label="Montant" type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} /><Field label="Lien devis" value={form.external_url} onChange={(v) => setForm({ ...form, external_url: v })} /><Field label="Lien signature" value={form.signature_url} onChange={(v) => setForm({ ...form, signature_url: v })} /><button className="btn-primary w-full justify-center">Creer devis</button></form></Panel><Records title="Devis" rows={quotes} onExport={() => onExport("devis", quotes)} onStatus={(id, status) => onUpdate(id, { status })} /></div>;
const InvoicesTab = ({ missions, invoices, form, setForm, onSubmit, onUpdate, onExport }) => <div className="grid lg:grid-cols-12 gap-6"><Panel title="Creer une facture"><form onSubmit={onSubmit} className="space-y-3"><Select label="Mission" value={form.mission_id} onChange={(v) => setForm({ ...form, mission_id: v })} options={[{ value: "", label: "Choisir" }, ...missions.map((m) => ({ value: m.id, label: `${m.vehicle || "Mission"} - ${m.client_name || "client"}` }))]} /><Field label="Montant" type="number" value={form.amount} onChange={(v) => setForm({ ...form, amount: v })} /><Field label="Lien paiement" value={form.payment_url} onChange={(v) => setForm({ ...form, payment_url: v })} /><Field label="Lien facture" value={form.external_url} onChange={(v) => setForm({ ...form, external_url: v })} /><button className="btn-primary w-full justify-center">Creer facture</button></form></Panel><Records title="Factures" rows={invoices} onExport={() => onExport("factures", invoices)} onStatus={(id, status) => onUpdate(id, { status })} /></div>;
const Records = ({ title, rows, onExport, onStatus }) => <div className="lg:col-span-8"><Panel title={title}><button className="btn-outline mb-4" onClick={onExport}>Exporter CSV</button><div className="space-y-3">{rows.map((row) => <article key={row.id} className="rounded-2xl bg-[#F5F2EA] p-4"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-semibold text-[#0F2A5F]">{row.reference || row.id}</h3><p className="text-sm text-[#4F5B7A]">{Number(row.amount || 0).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</p></div><select className="field max-w-[180px]" value={row.status} onChange={(e) => onStatus(row.id, e.target.value)}><option value="draft">Brouillon</option><option value="sent">Envoye</option><option value="accepted">Accepte</option><option value="paid">Paye</option><option value="cancelled">Annule</option></select></div>{(row.external_url || row.payment_url || row.signature_url) && <div className="mt-3 flex flex-wrap gap-3 text-sm"><a href={row.external_url || row.payment_url} target="_blank" rel="noreferrer" className="text-[#0F2A5F] font-semibold">Ouvrir</a>{row.signature_url && <a href={row.signature_url} target="_blank" rel="noreferrer" className="text-[#2DA84F] font-semibold">Signature</a>}</div>}</article>)}</div></Panel></div>;
const ContentTab = ({ contents, testimonials, contentForm, setContentForm, testimonialForm, setTestimonialForm, onContent, onTestimonial, onToggleTestimonial }) => <div className="grid lg:grid-cols-2 gap-6"><Panel title="Contenu du site"><form onSubmit={onContent} className="space-y-3"><Select label="Section" value={contentForm.section} onChange={(v) => setContentForm({ ...contentForm, section: v })} options={["vision", "mission", "services", "parcours", "realisations"].map((v) => ({ value: v, label: v }))} /><Field label="Titre" value={contentForm.title} onChange={(v) => setContentForm({ ...contentForm, title: v })} /><label className="field-label">Texte</label><textarea className="field" rows={5} value={contentForm.body} onChange={(e) => setContentForm({ ...contentForm, body: e.target.value })} /><Field label="Image / media URL" value={contentForm.media_url} onChange={(v) => setContentForm({ ...contentForm, media_url: v })} /><button className="btn-primary w-full justify-center">Enregistrer</button></form><div className="mt-5 space-y-2">{contents.map((c) => <button key={c.section} onClick={() => setContentForm(c)} className="block w-full text-left rounded-xl bg-[#F5F2EA] p-3 text-sm text-[#0F2A5F]">{c.section} - {c.title}</button>)}</div></Panel><Panel title="Temoignages"><form onSubmit={onTestimonial} className="space-y-3"><Field label="Nom" value={testimonialForm.name} onChange={(v) => setTestimonialForm({ ...testimonialForm, name: v })} /><Field label="Role" value={testimonialForm.role} onChange={(v) => setTestimonialForm({ ...testimonialForm, role: v })} /><label className="field-label">Temoignage</label><textarea className="field" rows={4} value={testimonialForm.quote} onChange={(e) => setTestimonialForm({ ...testimonialForm, quote: e.target.value })} /><button className="btn-primary w-full justify-center">Ajouter</button></form><div className="mt-5 space-y-3">{testimonials.map((t) => <article key={t.id} className="rounded-2xl bg-[#F5F2EA] p-4"><h3 className="font-semibold text-[#0F2A5F]">{t.name}</h3><p className="text-sm text-[#4F5B7A]">{t.quote}</p><button className="btn-outline !py-2 !px-3 text-sm mt-3" onClick={() => onToggleTestimonial(t.id, !t.published)}>{t.published ? "Masquer" : "Publier"}</button></article>)}</div></Panel></div>;

export default Admin;
