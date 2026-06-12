import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Lock, LogOut, Mail, Phone, MapPin, Calendar, User, Car,
  CheckCircle2, Trash2, Inbox, FileText, RefreshCw,
} from "lucide-react";
import { Logo } from "../components/Logo";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const STORAGE_KEY = "gc_admin_pw";

const Admin = () => {
  const [pw, setPw] = useState(() => sessionStorage.getItem(STORAGE_KEY) || "");
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (pw) verify(pw);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verify = async (password) => {
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API}/admin/login`, { password });
      sessionStorage.setItem(STORAGE_KEY, password);
      setAuthed(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur");
      sessionStorage.removeItem(STORAGE_KEY);
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (e) => {
    e.preventDefault();
    await verify(pw);
  };

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setPw("");
    setAuthed(false);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0F2A5F] flex items-center justify-center p-6 relative overflow-hidden" data-testid="admin-login-page">
        <div className="absolute -top-32 -right-20 blob" style={{ background: "#2DA84F", width: 420, height: 420 }} />
        <div className="absolute -bottom-32 -left-20 blob" style={{ background: "#E9C97C", width: 380, height: 380, opacity: 0.3 }} />
        <div className="grain" />
        <form onSubmit={login} className="relative bg-white rounded-3xl p-10 w-full max-w-md shadow-2xl" data-testid="admin-login-form">
          <div className="flex justify-center mb-8"><Logo size={32} /></div>
          <h1 className="font-display text-3xl text-[#0F2A5F] text-center">Espace admin</h1>
          <p className="text-center text-[#4F5B7A] mt-2 text-sm">Connexion sécurisée</p>

          <div className="mt-8">
            <label className="field-label">Mot de passe</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F5B7A]" />
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="field pl-11"
                required
                autoFocus
                data-testid="admin-password-input"
              />
            </div>
          </div>

          {error && <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm" data-testid="admin-error">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary mt-6 w-full justify-center" data-testid="admin-login-submit">
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>
      </div>
    );
  }

  return <AdminDashboard password={pw} onLogout={logout} />;
};

const AdminDashboard = ({ password, onLogout }) => {
  const [tab, setTab] = useState("quotes");
  const [quotes, setQuotes] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [stats, setStats] = useState({ contacts_total: 0, contacts_new: 0, quotes_total: 0, quotes_new: 0 });
  const [loading, setLoading] = useState(true);

  const headers = { "x-admin-password": password };

  const load = async () => {
    setLoading(true);
    try {
      const [q, c, s] = await Promise.all([
        axios.get(`${API}/admin/quotes`, { headers }),
        axios.get(`${API}/admin/contacts`, { headers }),
        axios.get(`${API}/admin/stats`, { headers }),
      ]);
      setQuotes(q.data);
      setContacts(c.data);
      setStats(s.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const markStatus = async (kind, id, status) => {
    await axios.patch(`${API}/admin/${kind}/${id}`, { status }, { headers });
    load();
  };

  const remove = async (kind, id) => {
    if (!window.confirm("Supprimer définitivement ?")) return;
    await axios.delete(`${API}/admin/${kind}/${id}`, { headers });
    load();
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7]" data-testid="admin-dashboard">
      <header className="bg-white border-b border-[#0F2A5F]/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size={26} />
          <div className="flex items-center gap-2">
            <button onClick={load} className="btn-outline !py-2 !px-4 text-sm" data-testid="admin-refresh">
              <RefreshCw size={14} /> Actualiser
            </button>
            <button onClick={onLogout} className="btn-outline !py-2 !px-4 text-sm" data-testid="admin-logout">
              <LogOut size={14} /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Devis total" value={stats.quotes_total} icon={FileText} color="#2DA84F" />
          <StatCard label="Devis nouveaux" value={stats.quotes_new} icon={Inbox} color="#E9C97C" />
          <StatCard label="Messages total" value={stats.contacts_total} icon={Mail} color="#0F2A5F" />
          <StatCard label="Messages nouveaux" value={stats.contacts_new} icon={Inbox} color="#E9C97C" />
        </div>

        <div className="flex gap-2 mb-6 border-b border-[#0F2A5F]/10">
          {[
            { id: "quotes", label: `Demandes de devis (${quotes.length})` },
            { id: "contacts", label: `Messages contact (${contacts.length})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 font-semibold text-sm border-b-2 transition-colors ${
                tab === t.id ? "border-[#2DA84F] text-[#0F2A5F]" : "border-transparent text-[#4F5B7A] hover:text-[#0F2A5F]"
              }`}
              data-testid={`admin-tab-${t.id}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#4F5B7A]">Chargement…</div>
        ) : tab === "quotes" ? (
          <QuotesList items={quotes} onStatus={markStatus} onDelete={remove} />
        ) : (
          <ContactsList items={contacts} onStatus={markStatus} onDelete={remove} />
        )}
      </div>
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

const StatusBadge = ({ status }) => {
  const map = {
    new: { bg: "#E9C97C33", color: "#7A5A12", label: "Nouveau" },
    in_progress: { bg: "#0F2A5F22", color: "#0F2A5F", label: "En cours" },
    done: { bg: "#2DA84F22", color: "#1F7437", label: "Traité" },
  };
  const m = map[status] || map.new;
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: m.bg, color: m.color }}>
      {m.label}
    </span>
  );
};

const StatusButtons = ({ kind, item, onStatus, onDelete }) => (
  <div className="flex flex-wrap gap-2 items-center pt-3 mt-3 border-t border-[#0F2A5F]/8">
    {item.status !== "in_progress" && (
      <button onClick={() => onStatus(kind, item.id, "in_progress")} className="text-xs px-3 py-1.5 rounded-full bg-[#0F2A5F]/8 text-[#0F2A5F] hover:bg-[#0F2A5F]/15" data-testid={`mark-progress-${item.id}`}>
        En cours
      </button>
    )}
    {item.status !== "done" && (
      <button onClick={() => onStatus(kind, item.id, "done")} className="text-xs px-3 py-1.5 rounded-full bg-[#2DA84F]/15 text-[#1F7437] hover:bg-[#2DA84F]/25 inline-flex items-center gap-1" data-testid={`mark-done-${item.id}`}>
        <CheckCircle2 size={12} /> Traité
      </button>
    )}
    <button onClick={() => onDelete(kind, item.id)} className="ml-auto text-xs px-3 py-1.5 rounded-full text-red-700 hover:bg-red-50 inline-flex items-center gap-1" data-testid={`delete-${item.id}`}>
      <Trash2 size={12} /> Supprimer
    </button>
  </div>
);

const formatDate = (s) => {
  try {
    return new Date(s).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch { return s; }
};

const QuotesList = ({ items, onStatus, onDelete }) => {
  if (items.length === 0) return <Empty label="Aucune demande de devis pour le moment." />;
  return (
    <div className="space-y-4" data-testid="quotes-list">
      {items.map((q) => (
        <div key={q.id} className="bg-white rounded-2xl p-6 border border-[#0F2A5F]/10" data-testid={`quote-item-${q.id}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-display text-xl text-[#0F2A5F]">{q.name}</h3>
                <StatusBadge status={q.status} />
                <span className="text-xs text-[#4F5B7A]">{formatDate(q.created_at)}</span>
              </div>
              <div className="text-sm text-[#4F5B7A] mt-1">{q.client_type === "particulier" ? "Particulier" : "Professionnel"} · {q.service_type}</div>
            </div>
            <div className="flex gap-2 flex-wrap text-sm">
              <a href={`tel:${q.phone}`} className="px-3 py-1.5 rounded-full bg-[#2DA84F]/12 text-[#2DA84F] inline-flex items-center gap-1.5"><Phone size={12} />{q.phone}</a>
              <a href={`mailto:${q.email}`} className="px-3 py-1.5 rounded-full bg-[#0F2A5F]/8 text-[#0F2A5F] inline-flex items-center gap-1.5"><Mail size={12} />{q.email}</a>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-5">
            <Field label="Prise en charge" icon={MapPin} value={q.pickup_address} />
            <Field label="Livraison" icon={MapPin} value={q.delivery_address} />
            {q.pickup_date && <Field label="Date souhaitée" icon={Calendar} value={q.pickup_date} />}
            {(q.vehicle_brand || q.vehicle_model) && (
              <Field label="Véhicule" icon={Car} value={`${q.vehicle_brand || ""} ${q.vehicle_model || ""} ${q.vehicle_year ? `(${q.vehicle_year})` : ""} ${q.vehicle_fuel ? `· ${q.vehicle_fuel}` : ""}`} />
            )}
          </div>

          {q.notes && (
            <div className="mt-4 p-4 rounded-xl bg-[#F5F2EA] text-[#0F2A5F] text-sm whitespace-pre-wrap">{q.notes}</div>
          )}

          <StatusButtons kind="quotes" item={q} onStatus={onStatus} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
};

const ContactsList = ({ items, onStatus, onDelete }) => {
  if (items.length === 0) return <Empty label="Aucun message pour le moment." />;
  return (
    <div className="space-y-4" data-testid="contacts-list">
      {items.map((c) => (
        <div key={c.id} className="bg-white rounded-2xl p-6 border border-[#0F2A5F]/10" data-testid={`contact-item-${c.id}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-display text-xl text-[#0F2A5F]">{c.name}</h3>
                <StatusBadge status={c.status} />
                <span className="text-xs text-[#4F5B7A]">{formatDate(c.created_at)}</span>
              </div>
              {c.subject && <div className="text-sm text-[#4F5B7A] mt-1">{c.subject}</div>}
            </div>
            <div className="flex gap-2 flex-wrap text-sm">
              {c.phone && <a href={`tel:${c.phone}`} className="px-3 py-1.5 rounded-full bg-[#2DA84F]/12 text-[#2DA84F] inline-flex items-center gap-1.5"><Phone size={12} />{c.phone}</a>}
              <a href={`mailto:${c.email}`} className="px-3 py-1.5 rounded-full bg-[#0F2A5F]/8 text-[#0F2A5F] inline-flex items-center gap-1.5"><Mail size={12} />{c.email}</a>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-[#F5F2EA] text-[#0F2A5F] whitespace-pre-wrap">{c.message}</div>

          <StatusButtons kind="contacts" item={c} onStatus={onStatus} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
};

const Field = ({ label, icon: Icon, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-full bg-[#F5F2EA] flex items-center justify-center shrink-0">
      <Icon size={14} className="text-[#0F2A5F]" />
    </div>
    <div>
      <div className="text-xs uppercase tracking-wider text-[#4F5B7A]">{label}</div>
      <div className="text-[#0F2A5F] font-medium">{value}</div>
    </div>
  </div>
);

const Empty = ({ label }) => (
  <div className="text-center py-20 bg-white rounded-3xl border border-[#0F2A5F]/10">
    <Inbox size={32} className="text-[#0F2A5F]/30 mx-auto" />
    <p className="mt-3 text-[#4F5B7A]">{label}</p>
  </div>
);

export default Admin;
