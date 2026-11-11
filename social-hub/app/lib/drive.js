// Integración con Google Drive (OAuth 2.0 de Google Identity Services + Drive API v3).
// Los archivos NO se copian: se guardan referencias (ID de Drive) y se muestran desde Drive.
import { config, setState, getState } from './store.js';

const SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
const API = 'https://www.googleapis.com/drive/v3';
const FIELDS = 'id,name,mimeType,thumbnailLink,iconLink,webViewLink,modifiedTime,size,parents,videoMediaMetadata,imageMediaMetadata(width,height)';
const KEY = 'social-hub-drive-token';

export const driveConfigured = () => !!config.googleClientId;

let tokenClient = null;
let gisLoading = null;
function loadGis() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (!gisLoading) gisLoading = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
    s.onload = res; s.onerror = () => rej(new Error('No se pudo cargar el inicio de sesión de Google.'));
    document.head.appendChild(s);
  });
  return gisLoading;
}

function savedToken() {
  try { const t = JSON.parse(sessionStorage.getItem(KEY) || 'null'); return t && t.exp > Date.now() + 60000 ? t : null; } catch { return null; }
}
export const driveConnected = () => !!savedToken();

export async function connectDrive({ silent = false } = {}) {
  if (!driveConfigured()) throw new Error('Falta configurar el ID de cliente de Google (config.js).');
  await loadGis();
  return new Promise((resolve, reject) => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: config.googleClientId,
      scope: SCOPE,
      callback: (r) => {
        if (r.error) { reject(new Error(r.error_description || r.error)); return; }
        const t = { access_token: r.access_token, exp: Date.now() + (Number(r.expires_in) || 3600) * 1000 };
        try { sessionStorage.setItem(KEY, JSON.stringify(t)); } catch {}
        setState({ driveConnected: true });
        resolve(t);
      },
      error_callback: (e) => reject(new Error(e?.message || 'Autorización de Google cancelada.'))
    });
    tokenClient.requestAccessToken({ prompt: silent ? '' : (getState().driveEverConnected ? '' : 'consent'), hint: getState().me?.email });
  });
}
export function disconnectDrive() {
  const t = savedToken();
  if (t && window.google?.accounts?.oauth2) window.google.accounts.oauth2.revoke(t.access_token, () => {});
  try { sessionStorage.removeItem(KEY); } catch {}
  setState({ driveConnected: false });
}

async function api(path, params = {}) {
  let t = savedToken();
  if (!t) t = await connectDrive({ silent: true });
  const url = new URL(API + path);
  Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
  const res = await fetch(url, { headers: { Authorization: `Bearer ${t.access_token}` } });
  if (res.status === 401) { try { sessionStorage.removeItem(KEY); } catch {} setState({ driveConnected: false }); throw new Error('La sesión de Google Drive ha caducado. Pulsa «Conectar Google Drive».'); }
  if (res.status === 403 || res.status === 404) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error?.message || 'Tu cuenta de Google no tiene acceso a esta carpeta. Pide que la compartan contigo.');
  }
  if (!res.ok) throw new Error('Error de Google Drive (' + res.status + ')');
  return res.json();
}

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
export async function listFolder(folderId, pageToken) {
  return api('/files', {
    q: `'${esc(folderId)}' in parents and trashed = false`,
    fields: `nextPageToken,files(${FIELDS})`, pageSize: 200, pageToken,
    orderBy: 'folder,modifiedTime desc', supportsAllDrives: true, includeItemsFromAllDrives: true
  });
}
export async function searchDrive(text, { mime } = {}) {
  let q = `trashed = false and (name contains '${esc(text)}' or fullText contains '${esc(text)}')`;
  if (mime === 'image') q += " and mimeType contains 'image/'";
  if (mime === 'video') q += " and mimeType contains 'video/'";
  return api('/files', { q, fields: `files(${FIELDS})`, pageSize: 100, supportsAllDrives: true, includeItemsFromAllDrives: true });
}
export async function getFile(id) { return api('/files/' + encodeURIComponent(id), { fields: FIELDS, supportsAllDrives: true }); }

// URLs de visualización (funcionan para quien tenga sesión de Google con acceso al archivo)
export const driveThumb = (id, w = 600) => `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w${w}`;
export const driveView = (id) => `https://drive.google.com/file/d/${encodeURIComponent(id)}/view`;
export const drivePreview = (id) => `https://drive.google.com/file/d/${encodeURIComponent(id)}/preview`;
export const driveFolderUrl = (id) => `https://drive.google.com/drive/folders/${encodeURIComponent(id)}`;
export const isFolder = (f) => f.mimeType === 'application/vnd.google-apps.folder';

// Convierte un archivo de Drive en una referencia para guardar en la base de datos
export function driveRef(f) {
  return {
    source: 'drive', drive_file_id: f.id, name: f.name, mime_type: f.mimeType,
    web_url: f.webViewLink || driveView(f.id), thumbnail_url: null, size_bytes: f.size ? Number(f.size) : null
  };
}
