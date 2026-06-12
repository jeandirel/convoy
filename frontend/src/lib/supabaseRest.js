const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
const SESSION_KEY = "gc_supabase_session";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const jsonHeaders = () => ({
  apikey: SUPABASE_ANON_KEY,
  "Content-Type": "application/json",
});

const getStoredSession = () => {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
};

export const getSupabaseSession = getStoredSession;

export const clearSupabaseSession = () => {
  sessionStorage.removeItem(SESSION_KEY);
};

const authHeader = () => {
  const session = getStoredSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
};

const request = async (path, options = {}) => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase n'est pas configure sur Vercel.");
  }

  const headers = {
    ...jsonHeaders(),
    ...authHeader(),
    ...options.headers,
  };

  const res = await fetch(`${SUPABASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `Supabase error ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
};

const query = (table, params = "select=*") => request(`/rest/v1/${table}?${params}`);

export const supabaseLogin = async (email, password) => {
  const data = await request("/auth/v1/token?grant_type=password", {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ email, password }),
  });
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  return data;
};

export const signUp = async ({ email, password, role, full_name, phone, company }) => {
  const data = await request("/auth/v1/signup", {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({
      email,
      password,
      data: { role, full_name, phone, company },
    }),
  });
  if (data?.access_token) sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  return data;
};

export const getCurrentUser = async () => request("/auth/v1/user", { headers: authHeader() });

export const getMyProfile = async () => {
  const user = await getCurrentUser();
  const rows = await query("profiles", `select=*&id=eq.${encodeURIComponent(user.id)}&limit=1`);
  return rows[0] || null;
};

export const redirectPathForRole = (role) => {
  if (role === "admin") return "/admin";
  if (role === "driver") return "/convoyeur";
  return "/client";
};

export const createRow = (table, row) => request(`/rest/v1/${table}`, {
  method: "POST",
  headers: { Prefer: "return=representation" },
  body: JSON.stringify(row),
}).then((rows) => rows[0]);

export const updateRow = (table, id, row) => request(`/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
  method: "PATCH",
  headers: { Prefer: "return=representation" },
  body: JSON.stringify(row),
}).then((rows) => rows[0]);

export const deleteRow = (table, id) => request(`/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
  method: "DELETE",
});

export const listProfiles = () => query("profiles", "select=*&order=created_at.desc");
export const listDrivers = () => query("profiles", "select=*&role=eq.driver&order=full_name.asc");
export const listClients = () => query("profiles", "select=*&role=eq.client&order=created_at.desc");

export const listMissions = () => query("missions", "select=*&order=created_at.desc");
export const listMyMissions = (profileId) => query("missions", `select=*&client_id=eq.${encodeURIComponent(profileId)}&order=created_at.desc`);
export const listDriverMissions = (profileId) => query("missions", `select=*&driver_id=eq.${encodeURIComponent(profileId)}&order=scheduled_date.asc`);
export const createMission = (mission) => createRow("missions", mission);
export const updateMission = (id, mission) => updateRow("missions", id, mission);
export const deleteMission = (id) => deleteRow("missions", id);

export const listQuotes = () => query("quotes", "select=*&order=created_at.desc");
export const listMyQuotes = (profileId) => query("quotes", `select=*&client_id=eq.${encodeURIComponent(profileId)}&order=created_at.desc`);
export const createQuote = (quote) => createRow("quotes", quote);
export const updateQuote = (id, quote) => updateRow("quotes", id, quote);

export const listInvoices = () => query("invoices", "select=*&order=created_at.desc");
export const listMyInvoices = (profileId) => query("invoices", `select=*&client_id=eq.${encodeURIComponent(profileId)}&order=created_at.desc`);
export const createInvoice = (invoice) => createRow("invoices", invoice);
export const updateInvoice = (id, invoice) => updateRow("invoices", id, invoice);

export const listDocuments = () => query("documents", "select=*&order=created_at.desc");
export const listMyDocuments = (profileId) => query("documents", `select=*&owner_id=eq.${encodeURIComponent(profileId)}&order=created_at.desc`);
export const createDocument = (document) => createRow("documents", document);

export const listMissionPhotos = (missionId) => query("mission_photos", `select=*&mission_id=eq.${encodeURIComponent(missionId)}&order=created_at.desc`);
export const createMissionPhoto = (photo) => createRow("mission_photos", photo);

export const listTestimonials = () => query("testimonials", "select=*&order=created_at.desc");
export const createTestimonial = (testimonial) => createRow("testimonials", testimonial);
export const updateTestimonial = (id, testimonial) => updateRow("testimonials", id, testimonial);
export const deleteTestimonial = (id) => deleteRow("testimonials", id);

export const listSiteContent = () => query("site_content", "select=*&order=section.asc");
export const upsertSiteContent = (row) => request("/rest/v1/site_content", {
  method: "POST",
  headers: { Prefer: "resolution=merge-duplicates,return=representation" },
  body: JSON.stringify(row),
}).then((rows) => rows[0]);

export const uploadFile = async (bucket, path, file) => {
  if (!isSupabaseConfigured) throw new Error("Supabase n'est pas configure.");
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      ...authHeader(),
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true",
    },
    body: file,
  });
  if (!res.ok) throw new Error(await res.text());
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
};

export const trackVisitorEvent = (eventName, metadata = {}) => {
  if (!isSupabaseConfigured) return Promise.resolve(null);
  return request("/rest/v1/visitor_events", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      event_name: eventName,
      path: window.location.pathname,
      referrer: document.referrer || null,
      metadata,
    }),
  }).catch(() => null);
};
