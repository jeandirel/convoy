import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, CheckCircle2, LogOut, MapPin, Upload } from "lucide-react";
import { Logo } from "../components/Logo";
import {
  clearSupabaseSession,
  createMissionPhoto,
  getMyProfile,
  listDriverMissions,
  listMissionPhotos,
  updateMission,
  uploadFile,
} from "../lib/supabaseRest";

const statusOptions = {
  driver_assigned: "Convoyeur affecte",
  in_progress: "Mission en cours",
  completed: "Mission terminee",
};

const DriverPortal = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [missions, setMissions] = useState([]);
  const [photos, setPhotos] = useState({});
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
      if (me.role === "client") return navigate("/client", { replace: true });
      setProfile(me);
      const nextMissions = await listDriverMissions(me.id);
      setMissions(nextMissions);
      const photoPairs = await Promise.all(nextMissions.map(async (mission) => [mission.id, await listMissionPhotos(mission.id)]));
      setPhotos(Object.fromEntries(photoPairs));
    } catch (err) {
      navigate("/login", { replace: true });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (mission, status) => {
    setError("");
    setMessage("");
    try {
      await updateMission(mission.id, { status });
      setMessage("Statut mis a jour.");
      await load();
    } catch (err) {
      setError("Impossible de changer le statut.");
    }
  };

  const uploadPhoto = async (mission, file, type) => {
    if (!file) return;
    setError("");
    setMessage("");
    try {
      const safeName = `${Date.now()}-${file.name}`.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${mission.id}/${safeName}`;
      const url = await uploadFile("mission-photos", path, file);
      await createMissionPhoto({ mission_id: mission.id, driver_id: profile.id, type, url, notes: "" });
      setMessage("Photo ajoutee au rapport de livraison.");
      await load();
    } catch (err) {
      setError("Upload impossible. Verifiez le bucket Supabase et les permissions.");
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      <header className="bg-white border-b border-[#0F2A5F]/10 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link to="/"><Logo size={28} /></Link>
          <div className="flex items-center gap-3"><span className="hidden sm:block text-sm text-[#4F5B7A]">{profile?.full_name || "Convoyeur"}</span><button onClick={logout} className="btn-outline !py-2 !px-4 text-sm"><LogOut size={14} /> Deconnexion</button></div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <span className="num-tag">Espace convoyeur</span>
        <h1 className="font-display text-4xl text-[#0F2A5F] mt-3 mb-6">Missions affectees</h1>
        {message && <Notice>{message}</Notice>}
        {error && <Notice error>{error}</Notice>}
        {loading ? <div className="py-24 text-center text-[#4F5B7A]">Chargement...</div> : (
          <div className="grid lg:grid-cols-2 gap-5">
            {missions.length ? missions.map((mission) => (
              <MissionCard key={mission.id} mission={mission} photos={photos[mission.id] || []} onStatus={changeStatus} onUpload={uploadPhoto} />
            )) : <div className="bg-white rounded-3xl border border-[#0F2A5F]/10 p-10 text-center text-[#4F5B7A] lg:col-span-2">Aucune mission affectee pour le moment.</div>}
          </div>
        )}
      </div>
    </main>
  );
};

const MissionCard = ({ mission, photos, onStatus, onUpload }) => (
  <article className="bg-white rounded-3xl border border-[#0F2A5F]/10 p-6">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl text-[#0F2A5F]">{mission.vehicle || "Vehicule a confirmer"}</h2>
        <p className="text-sm text-[#4F5B7A] mt-1">Client : {mission.client_name || mission.client_email}</p>
      </div>
      <CheckCircle2 size={26} className="text-[#2DA84F]" />
    </div>
    <div className="mt-5 rounded-2xl bg-[#F5F2EA] p-4 text-sm text-[#4F5B7A] space-y-2">
      <p className="flex gap-2"><MapPin size={15} /> {mission.pickup_address} -> {mission.delivery_address}</p>
      <p>Date : {mission.scheduled_date || "A confirmer"}</p>
      {mission.notes && <p>Notes : {mission.notes}</p>}
    </div>
    <div className="mt-5">
      <label className="field-label">Statut mission</label>
      <select className="field" value={mission.status} onChange={(e) => onStatus(mission, e.target.value)}>
        {Object.entries(statusOptions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        <option value="completed">Mission terminee</option>
      </select>
    </div>
    <div className="mt-5 grid sm:grid-cols-2 gap-3">
      <UploadBox label="Photo avant" type="before" mission={mission} onUpload={onUpload} />
      <UploadBox label="Photo apres" type="after" mission={mission} onUpload={onUpload} />
    </div>
    <div className="mt-5">
      <h3 className="font-semibold text-[#0F2A5F] flex items-center gap-2"><Camera size={16} /> Rapport photos</h3>
      <div className="grid grid-cols-3 gap-2 mt-3">
        {photos.map((photo) => <a key={photo.id} href={photo.url} target="_blank" rel="noreferrer" className="aspect-square rounded-xl bg-[#F5F2EA] overflow-hidden"><img src={photo.url} alt={photo.type} className="w-full h-full object-cover" /></a>)}
      </div>
      {!photos.length && <p className="text-sm text-[#4F5B7A] mt-2">Aucune photo ajoutee.</p>}
    </div>
  </article>
);

const UploadBox = ({ label, type, mission, onUpload }) => <label className="rounded-2xl border border-dashed border-[#0F2A5F]/20 p-4 text-sm text-[#4F5B7A] hover:border-[#2DA84F]/60 cursor-pointer"><Upload size={17} className="mb-2" />{label}<input type="file" accept="image/*" className="hidden" onChange={(e) => onUpload(mission, e.target.files?.[0], type)} /></label>;
const Notice = ({ children, error }) => <div className={`mb-5 rounded-2xl p-4 text-sm ${error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>{children}</div>;

export default DriverPortal;
