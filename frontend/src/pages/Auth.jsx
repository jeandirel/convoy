import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { Logo } from "../components/Logo";
import { getMyProfile, isSupabaseConfigured, redirectPathForRole, signUp, supabaseLogin } from "../lib/supabaseRest";

const AuthPage = ({ mode = "login" }) => {
  const navigate = useNavigate();
  const isRegister = mode === "register";
  const [form, setForm] = useState({ role: "client", full_name: "", company: "", phone: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      if (isRegister) {
        const res = await signUp(form);
        if (!res?.access_token) {
          setMessage("Compte cree. Verifiez votre email pour confirmer l'inscription, puis connectez-vous.");
          return;
        }
      } else {
        await supabaseLogin(form.email, form.password);
      }
      const profile = await getMyProfile();
      navigate(redirectPathForRole(profile?.role), { replace: true });
    } catch (err) {
      setError(isRegister ? "Inscription impossible. Verifiez les champs et la configuration Supabase." : "Connexion impossible. Verifiez vos identifiants.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAF7] pt-32 pb-20 px-6">
      <form onSubmit={submit} className="mx-auto max-w-md bg-white border border-[#0F2A5F]/10 rounded-3xl p-8 shadow-[0_30px_70px_-35px_rgba(15,42,95,0.35)]">
        <div className="flex justify-center mb-7"><Logo size={34} /></div>
        <h1 className="font-display text-3xl text-[#0F2A5F] text-center">{isRegister ? "Creer un compte" : "Connexion"}</h1>
        <p className="text-center text-[#4F5B7A] mt-2 text-sm">Acces client, convoyeur ou administrateur.</p>

        {!isSupabaseConfigured && <div className="mt-5 rounded-2xl bg-amber-50 text-amber-800 text-sm p-4">Supabase n'est pas configure sur Vercel.</div>}

        {isRegister && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="field-label">Type de compte</label>
              <select className="field" value={form.role} onChange={(e) => update("role", e.target.value)}>
                <option value="client">Client</option>
                <option value="driver">Convoyeur</option>
              </select>
            </div>
            <div>
              <label className="field-label">Nom complet</label>
              <input className="field" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="field-label">Telephone</label>
                <input className="field" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
              <div>
                <label className="field-label">Entreprise</label>
                <input className="field" value={form.company} onChange={(e) => update("company", e.target.value)} />
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="field-label">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F5B7A]" />
              <input type="email" className="field pl-11" value={form.email} onChange={(e) => update("email", e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="field-label">Mot de passe</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F5B7A]" />
              <input type="password" className="field pl-11" minLength={6} value={form.password} onChange={(e) => update("password", e.target.value)} required />
            </div>
          </div>
        </div>

        {message && <div className="mt-4 rounded-2xl bg-emerald-50 text-emerald-700 p-4 text-sm">{message}</div>}
        {error && <div className="mt-4 rounded-2xl bg-red-50 text-red-700 p-4 text-sm">{error}</div>}

        <button disabled={loading || !isSupabaseConfigured} className="btn-primary w-full justify-center mt-6">
          {loading ? "Traitement..." : isRegister ? "Creer mon compte" : "Se connecter"}
          {!loading && <ArrowRight size={18} />}
        </button>

        <p className="text-center text-sm text-[#4F5B7A] mt-5">
          {isRegister ? "Deja un compte ?" : "Pas encore de compte ?"} {" "}
          <Link className="font-semibold text-[#0F2A5F] hover:text-[#2DA84F]" to={isRegister ? "/login" : "/register"}>{isRegister ? "Se connecter" : "S'inscrire"}</Link>
        </p>
      </form>
    </main>
  );
};

export default AuthPage;
