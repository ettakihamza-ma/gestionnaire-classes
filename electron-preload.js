const { contextBridge, ipcRenderer } = require('electron');

// Exposer des APIs sécurisées au processus de rendu
contextBridge.exposeInMainWorld('electronAPI', {
  // Gestion des fichiers
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  writeFile: (filePath, data) => ipcRenderer.invoke('write-file', filePath, data),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  
  // Écouter les événements du menu
  onMenuExport: (callback) => ipcRenderer.on('menu-export', callback),
  onMenuImport: (callback) => ipcRenderer.on('menu-import', callback),
  onToggleDarkMode: (callback) => ipcRenderer.on('toggle-dark-mode', callback),
  onRunDiagnostic: (callback) => ipcRenderer.on('run-diagnostic', callback),
  
  // Nettoyer les listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  
  // Informations sur l'environnement
  isElectron: true,
  platform: process.platform,
  version: process.versions.electron
});

// Améliorer localStorage pour Electron si nécessaire
window.addEventListener('DOMContentLoaded', () => {
  // Ajouter une classe pour identifier que nous sommes dans Electron
  document.body.classList.add('electron-app');
  
  // Améliorer la gestion des erreurs
  window.addEventListener('error', (event) => {
    console.error('Erreur dans l\'application:', event.error);
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise rejetée:', event.reason);
  });
});
