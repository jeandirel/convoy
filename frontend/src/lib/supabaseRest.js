const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
const SESSION_KEY = "gc_supabase_session";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

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

const request = async (path, options = {}) => {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase n'est pas configuré sur Vercel.");
  }

  const session = getStoredSession();
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
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

export const supabaseLogin = async (email, password) => {
  const data = await request("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  return data;
};

export const listRecords = () => request("/rest/v1/business_records?select=*&order=updated_at.desc");

export const createRecord = (record) => request("/rest/v1/business_records", {
  method: "POST",
  headers: { Prefer: "return=representation" },
  body: JSON.stringify(record),
}).then((rows) => rows[0]);

export const updateRecord = (id, record) => request(`/rest/v1/business_records?id=eq.${id}`, {
  method: "PATCH",
  headers: { Prefer: "return=representation" },
  body: JSON.stringify(record),
}).then((rows) => rows[0]);

export const deleteRecord = (id) => request(`/rest/v1/business_records?id=eq.${id}`, {
  method: "DELETE",
});

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