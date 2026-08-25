'use strict';

const { app, BrowserWindow, protocol, net, shell, session, ipcMain, safeStorage } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

protocol.registerSchemesAsPrivileged([{
  scheme: 'vani',
  privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true }
}]);

const APP_ID = 'de.vani.schreibzuhause';
let fenster = null;
let updater = null;
const OEFFENTLICHE_DATEIEN = new Set(['index.html', 'manifest.json', 'sw.js', 'robots.txt']);
const OEFFENTLICHE_ORDNER = new Set(['icons', 'vendor', 'klang', 'sticker', 'autoren']);
const OEFFENTLICHE_EINLESUNG = new Set(['einlesung/einlesung.enc', 'einlesung/umschlag.json']);

function oeffentlicherPfad(p) {
  const relativ = String(p || '').replace(/\\/g, '/').replace(/^\/+/, '');
  const teile = relativ.split('/');
  if (!relativ || relativ.includes('\0') || teile.some((x) => !x || x === '.' || x === '..')) return null;
  if (teile.length === 1 && OEFFENTLICHE_DATEIEN.has(relativ)) return relativ;
  if (OEFFENTLICHE_EINLESUNG.has(relativ)) return relativ;
  return OEFFENTLICHE_ORDNER.has(teile[0]) ? relativ : null;
}

function appWurzel() { return app.getAppPath(); }
function istVaniAbsender(event) {
  try {
    const u = new URL(event.senderFrame.url);
    return u.protocol === 'vani:' && u.hostname === 'app';
  }
  catch (_) { return false; }
}
function geheimnisPfad(profilId) {
  const id = String(profilId || 'legacy').replace(/[^a-z0-9_-]/gi, '').slice(0, 80) || 'legacy';
  return path.join(app.getPath('userData'), id === 'legacy' ? 'privater-bereich.bin' : 'privater-bereich-' + id + '.bin');
}
function ladeKonfiguration() {
  try {
    const datei = path.join(__dirname, 'config.json');
    const roh = JSON.parse(fs.readFileSync(datei, 'utf8'));
    return {
      syncServerUrl: typeof roh.syncServerUrl === 'string' ? roh.syncServerUrl : '',
      updateUrl: typeof roh.updateUrl === 'string' ? roh.updateUrl : ''
    };
  } catch (_) { return { syncServerUrl: '', updateUrl: '' }; }
}
function sendeUpdateStatus(status) {
  if (fenster && !fenster.isDestroyed()) fenster.webContents.send('vani:update-status', status);
}
function richteUpdaterEin() {
  if (!app.isPackaged) return;
  const url = ladeKonfiguration().updateUrl;
  if (!/^https:\/\//i.test(url)) return;
  try {
    const electronUpdater = require('electron-updater');
    const Optionen = { provider: 'generic', url };
    if (process.platform === 'win32') updater = new electronUpdater.NsisUpdater(Optionen);
    else if (process.platform === 'darwin') updater = new electronUpdater.MacUpdater(Optionen);
    else updater = new electronUpdater.AppImageUpdater(Optionen);
    updater.autoDownload = true;
    updater.autoInstallOnAppQuit = true;
    updater.on('checking-for-update', () => sendeUpdateStatus({ art: 'prueft' }));
    updater.on('update-not-available', () => sendeUpdateStatus({ art: 'aktuell', version: app.getVersion() }));
    updater.on('update-available', (info) => sendeUpdateStatus({ art: 'gefunden', version: String(info.version || '') }));
    updater.on('download-progress', (p) => sendeUpdateStatus({ art: 'laedt', prozent: Math.round(p.percent || 0) }));
    updater.on('update-downloaded', (info) => sendeUpdateStatus({ art: 'bereit', version: String(info.version || '') }));
    updater.on('error', () => sendeUpdateStatus({ art: 'fehler' }));
    setTimeout(() => updater.checkForUpdates().catch(() => {}), 15000);
  } catch (_) { updater = null; }
}

async function registriereProtokoll() {
  protocol.handle('vani', async (anfrage) => {
    let relativ;
    try {
      const url = new URL(anfrage.url);
      if (url.hostname !== 'app') return new Response('Nicht erlaubt', { status: 403 });
      relativ = oeffentlicherPfad(decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html');
      if (!relativ) return new Response('Nicht erlaubt', { status: 403 });
    } catch (_) { return new Response('Kaputte Adresse', { status: 400 }); }
    const wurzel = path.resolve(appWurzel());
    const datei = path.resolve(wurzel, relativ);
    if (datei !== wurzel && !datei.startsWith(wurzel + path.sep)) return new Response('Nicht erlaubt', { status: 403 });
    try { return await net.fetch(pathToFileURL(datei).toString()); }
    catch (_) { return new Response('Nicht da', { status: 404 }); }
  });
}

function baueFenster() {
  fenster = new BrowserWindow({
    width: 1320,
    height: 900,
    minWidth: 760,
    minHeight: 560,
    backgroundColor: '#efe7d8',
    title: 'VANI',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });
  fenster.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//i.test(url)) shell.openExternal(url).catch(() => {});
    return { action: 'deny' };
  });
  fenster.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('vani://app/')) event.preventDefault();
  });
  fenster.once('ready-to-show', () => { if (!process.argv.includes('--smoke')) fenster.show(); });
  fenster.on('closed', () => { fenster = null; });
  fenster.loadURL('vani://app/index.html?desktop=1');
}

ipcMain.handle('vani:konfiguration', (event) => {
  if (!istVaniAbsender(event)) throw new Error('Nicht erlaubt');
  return { ...ladeKonfiguration(), appVersion: app.getVersion(), platform: process.platform };
});
ipcMain.handle('vani:geheimnis-lesen', (event, profilId) => {
  if (!istVaniAbsender(event)) throw new Error('Nicht erlaubt');
  try {
    if (!safeStorage.isEncryptionAvailable()) return null;
    return JSON.parse(safeStorage.decryptString(fs.readFileSync(geheimnisPfad(profilId))));
  } catch (_) { return null; }
});
ipcMain.handle('vani:geheimnis-speichern', (event, wert, profilId) => {
  if (!istVaniAbsender(event) || !wert || typeof wert !== 'object') throw new Error('Nicht erlaubt');
  const text = JSON.stringify(wert);
  if (text.length > 16000 || !safeStorage.isEncryptionAvailable()) throw new Error('Geschützter Systemspeicher ist nicht verfügbar');
  const ziel = geheimnisPfad(profilId);
  const temp = ziel + '.neu';
  fs.mkdirSync(path.dirname(ziel), { recursive: true });
  fs.writeFileSync(temp, safeStorage.encryptString(text), { mode: 0o600 });
  fs.renameSync(temp, ziel);
  return true;
});
ipcMain.handle('vani:geheimnis-loeschen', (event, profilId) => {
  if (!istVaniAbsender(event)) throw new Error('Nicht erlaubt');
  try { fs.unlinkSync(geheimnisPfad(profilId)); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  return true;
});
/* Bücherordner: PDFs aus „Dokumente/VANI-Bücher", aus „buecher" neben der App
   oder aus dem Datenordner — nur lesen, nur dort. */
function buecherOrdner() {
  const liste = [];
  try { liste.push(path.join(app.getPath('documents'), 'VANI-Bücher')); } catch (_) {}
  try { liste.push(path.join(path.dirname(process.execPath), 'buecher')); } catch (_) {}
  try { liste.push(path.join(app.getPath('userData'), 'buecher')); } catch (_) {}
  return liste;
}
ipcMain.handle('vani:buecher-liste', (event) => {
  if (!istVaniAbsender(event)) throw new Error('Nicht erlaubt');
  const aus = [];
  for (const ordner of buecherOrdner()) {
    let eintraege = [];
    try { eintraege = fs.readdirSync(ordner); } catch (_) { continue; }
    for (const name of eintraege) {
      if (!/\.(pdf|epub)$/i.test(name)) continue;
      const pfad = path.join(ordner, name);
      try { const st = fs.statSync(pfad); if (st.isFile() && st.size <= 300 * 1024 * 1024) aus.push({ name, size: st.size, pfad, ordner }); } catch (_) {}
    }
  }
  return aus.slice(0, 500);
});
ipcMain.handle('vani:buch-lesen', (event, pfad) => {
  if (!istVaniAbsender(event) || typeof pfad !== 'string') throw new Error('Nicht erlaubt');
  const voll = path.resolve(pfad);
  const erlaubt = buecherOrdner().some((o) => { const w = path.resolve(o); return voll.startsWith(w + path.sep); });
  if (!erlaubt || !/\.(pdf|epub)$/i.test(voll)) throw new Error('Nicht erlaubt');
  const st = fs.statSync(voll);
  if (!st.isFile() || st.size > 300 * 1024 * 1024) throw new Error('Zu groß');
  return fs.readFileSync(voll);
});
ipcMain.handle('vani:update-suchen', async (event) => {
  if (!istVaniAbsender(event)) throw new Error('Nicht erlaubt');
  if (!updater) return { art: 'nicht-eingerichtet', version: app.getVersion() };
  await updater.checkForUpdates();
  return { art: 'prueft' };
});
ipcMain.handle('vani:update-installieren', (event) => {
  if (!istVaniAbsender(event)) throw new Error('Nicht erlaubt');
  if (!updater) return false;
  updater.quitAndInstall(false, true);
  return true;
});

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.setAppUserModelId(APP_ID);
  app.on('second-instance', () => {
    if (!fenster) return;
    if (fenster.isMinimized()) fenster.restore();
    fenster.focus();
  });
  app.whenReady().then(async () => {
    await registriereProtokoll();
    session.defaultSession.setPermissionRequestHandler((_wc, _permission, antwort) => antwort(false));
    session.defaultSession.setPermissionCheckHandler(() => false);
    baueFenster();
    richteUpdaterEin();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) baueFenster(); });
  });
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}
