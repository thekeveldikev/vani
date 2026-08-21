'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('vaniDesktop', Object.freeze({
  istDesktop: true,
  version: process.versions.electron,
  konfiguration: () => ipcRenderer.invoke('vani:konfiguration'),
  geheimnisLesen: (profilId) => ipcRenderer.invoke('vani:geheimnis-lesen', profilId),
  geheimnisSpeichern: (wert, profilId) => ipcRenderer.invoke('vani:geheimnis-speichern', wert, profilId),
  geheimnisLoeschen: (profilId) => ipcRenderer.invoke('vani:geheimnis-loeschen', profilId),
  updateSuchen: () => ipcRenderer.invoke('vani:update-suchen'),
  updateInstallieren: () => ipcRenderer.invoke('vani:update-installieren'),
  updateStatus: (fn) => {
    if (typeof fn !== 'function') return () => {};
    const empfang = (_event, status) => fn(status);
    ipcRenderer.on('vani:update-status', empfang);
    return () => ipcRenderer.removeListener('vani:update-status', empfang);
  }
}));
