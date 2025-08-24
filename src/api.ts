
let API_BASE = 'http://10.0.2.2:4000';
let TOKEN = null;
export function setApiBase(v){ API_BASE=v; }
export function setToken(t){ TOKEN=t; }
async function request(path, method='GET', body) {
  const headers = { 'Content-Type': 'application/json' };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;
  const res = await fetch(`${API_BASE}${path}`, { method, headers, body: body?JSON.stringify(body):undefined });
  if (!res.ok) throw new Error(await res.text() || 'API error');
  return res.json();
}
export const apiGet = (p)=>request(p,'GET');
export const apiPost = (p,b)=>request(p,'POST',b);
