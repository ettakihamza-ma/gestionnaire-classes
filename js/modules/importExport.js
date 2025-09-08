/**
 * Module Import/Export - Gestion des imports/exports Excel
 */
class ImportExportModule {
    constructor(dataManager, schoolManager) {
        this.dataManager = dataManager;
        this.schoolManager = schoolManager;
    }

    /**
     * Rendu de la section import/export
     */
    render() {
        const section = document.getElementById('import-export-section');
        section.innerHTML = `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">Import / Export Excel</h2>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Section Export -->
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-download text-blue-600 mr-2"></i>
                            Export des données
                        </h3>
                        
                        <div class="space-y-3">
                            <button id="export-all-btn" 
                                    class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2">
                                <i class="fas fa-file-excel"></i>
                                <span>Exporter toutes les données</span>
                            </button>
                            
                            <!-- Bouton spécial Electron pour export avec dialogue natif -->
                            <button id="export-electron-btn" 
                                    class="electron-only w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 hidden">
                                <i class="fas fa-desktop"></i>
                                <span>📁 Exporter avec sélection de dossier</span>
                            </button>
                            
                            <button id="export-by-class-btn" 
                                    class="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2">
                                <i class="fas fa-users"></i>
                                <span>Exporter par classe</span>
                            </button>
                            
                            <button id="export-presence-btn" 
                                    class="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2">
                                <i class="fas fa-calendar-check"></i>
                                <span>Exporter les présences</span>
                            </button>
                            
                            <button id="export-holidays-btn" 
                                    class="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2">
                                <i class="fas fa-umbrella-beach"></i>
                                <span>Exporter les vacances</span>
                            </button>
                            
                            <button id="export-notes-btn" 
                                    class="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2">
                                <i class="fas fa-sticky-note"></i>
                                <span>Exporter les notes</span>
                            </button>
                        </div>
                        
                        <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                            <h4 class="font-medium text-blue-800 mb-2">📋 Modèles Excel</h4>
                            <p class="text-sm text-blue-700 mb-3">
                                Téléchargez des modèles pour faciliter l'import de vos données
                            </p>
                            <div class="flex flex-wrap gap-2">
                                <button id="download-eleves-template-btn" 
                                        class="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded text-sm">
                                    <i class="fas fa-file-download mr-1"></i>
                                    Modèle Élèves
                                </button>
                                <button id="download-classes-template-btn" 
                                        class="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded text-sm">
                                    <i class="fas fa-file-download mr-1"></i>
                                    Modèle Classes
                                </button>
                                <button id="download-holidays-template-btn" 
                                        class="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded text-sm">
                                    <i class="fas fa-file-download mr-1"></i>
                                    Modèle Vacances
                                </button>
                                <button id="download-attendance-template-btn" 
                                        class="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded text-sm">
                                    <i class="fas fa-file-download mr-1"></i>
                                    Modèle Présences
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Section Import -->
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <i class="fas fa-upload text-green-600 mr-2"></i>
                            Import de données
                        </h3>
                        
                        <div class="space-y-4">
                            <div>
                                <label for="import-file" class="block text-sm font-medium text-gray-700 mb-2">
                                    Sélectionner un fichier Excel
                                </label>
                                <input type="file" id="import-file" accept=".xlsx,.xls" 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            
                            <div>
                                <label for="import-type" class="block text-sm font-medium text-gray-700 mb-2">
                                    Type d'import
                                </label>
                                <select id="import-type" 
                                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="merge">Fusionner avec les données existantes</option>
                                    <option value="complete">Remplacement complet (⚠️ supprime tout)</option>
                                    <option value="eleves-only">Élèves uniquement</option>
                                    <option value="holidays-only">Vacances uniquement</option>
                                    <option value="notes-only">Notes uniquement</option>
                                    <option value="presence-only">Présences uniquement</option>
                                    <option value="cahier-only">Cahier journal uniquement</option>
                                </select>
                            </div>
                            
                            <button id="import-btn" disabled 
                                    class="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <span>Importer les données</span>
                            </button>
                            
                            <!-- Bouton spécial Electron pour import avec dialogue natif -->
                            <button id="import-electron-btn" 
                                    class="electron-only w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 hidden">
                                <i class="fas fa-desktop"></i>
                                <span>📁 Importer avec sélection de fichier</span>
                            </button>
                        </div>
                        
                        <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h4 class="text-sm font-medium text-yellow-800 mb-2">⚠️ Important</h4>
                            <ul class="text-sm text-yellow-700 space-y-1">
                                <li>• Utilisez les modèles fournis pour éviter les erreurs</li>
                                <li>• Sauvegardez vos données avant un import complet</li>
                                <li>• Vérifiez le format des colonnes (dates, noms, etc.)</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <!-- Zone de statut avec progress bar -->
                <div id="export-import-status" class="hidden mt-6">
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div class="flex items-center mb-3">
                            <i class="fas fa-spinner fa-spin text-blue-600 mr-3"></i>
                            <span id="status-message" class="text-blue-800">Opération en cours...</span>
                        </div>
                        <div id="progress-container" class="hidden">
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div id="progress-bar" class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                            </div>
                            <div class="flex justify-between text-xs text-gray-600 mt-1">
                                <span id="progress-text">Démarrage...</span>
                                <span id="progress-percent">0%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.setupEventListeners();
    }

    /**
     * Configuration des event listeners
     */
    setupEventListeners() {
        // Gestion du fichier d'import
        const importFile = document.getElementById('import-file');
        const importBtn = document.getElementById('import-btn');
        
        if (importFile) {
            importFile.addEventListener('change', (e) => {
                importBtn.disabled = !e.target.files.length;
            });
        }

        // Boutons d'export
        document.getElementById('export-all-btn').addEventListener('click', () => {
            this.exportAllData();
        });

        document.getElementById('export-by-class-btn').addEventListener('click', () => {
            this.exportByClass();
        });

        document.getElementById('export-presence-btn').addEventListener('click', () => {
            this.exportPresence();
        });
        
        document.getElementById('export-holidays-btn').addEventListener('click', () => {
            this.exportHolidays();
        });
        
        document.getElementById('export-notes-btn').addEventListener('click', () => {
            this.exportNotes();
        });

        // Boutons de téléchargement de modèles
        document.getElementById('download-eleves-template-btn').addEventListener('click', () => {
            this.downloadTemplate('eleves');
        });

        document.getElementById('download-classes-template-btn').addEventListener('click', () => {
            this.downloadTemplate('classes');
        });
        
        document.getElementById('download-holidays-template-btn').addEventListener('click', () => {
            this.downloadTemplate('holidays');
        });
        
        document.getElementById('download-attendance-template-btn').addEventListener('click', () => {
            this.downloadTemplate('attendance');
        });

        // Bouton d'import
        document.getElementById('import-btn').addEventListener('click', () => {
            this.importData();
        });
        
        // Boutons spéciaux Electron (masqués par défaut)
        this.setupElectronButtons();
    }
    
    /**
     * Configuration des boutons spécifiques à Electron
     */
    setupElectronButtons() {
        // Vérifier si nous sommes dans Electron
        if (window.electronAPI) {
            // Afficher les boutons Electron
            const electronButtons = document.querySelectorAll('.electron-only');
            electronButtons.forEach(btn => {
                btn.classList.remove('hidden');
            });
            
            // Gestionnaire pour export Electron
            const exportElectronBtn = document.getElementById('export-electron-btn');
            if (exportElectronBtn) {
                exportElectronBtn.addEventListener('click', async () => {
                    await this.exportWithElectronDialog();
                });
            }
            
            // Gestionnaire pour import Electron
            const importElectronBtn = document.getElementById('import-electron-btn');
            if (importElectronBtn) {
                importElectronBtn.addEventListener('click', async () => {
                    await this.importWithElectronDialog();
                });
            }
        }
    }
    
    /**
     * Export avec dialogue natif Electron
     */
    async exportWithElectronDialog() {
        if (!window.electronAPI) {
            this.showStatus('Fonction disponible uniquement dans l\'application desktop', 'error');
            return;
        }
        
        try {
            this.showStatus('Préparation de l\'export...');
            
            // Utiliser la logique existante d'exportAllData pour créer le workbook
            const wb = XLSX.utils.book_new();
            
            // Feuille des niveaux et classes
            const niveauxData = [];
            this.dataManager.data.niveaux.forEach(niveau => {
                if (niveau.classes) {
                    niveau.classes.forEach(classe => {
                        niveauxData.push({
                            'Niveau': niveau.nom,
                            'Classe': classe.nom,
                            'ID Niveau': niveau.id,
                            'ID Classe': classe.id,
                            'Nombre d\'élèves': classe.eleves ? classe.eleves.length : 0
                        });
                    });
                }
            });
            
            if (niveauxData.length > 0) {
                const niveauxWs = XLSX.utils.json_to_sheet(niveauxData);
                XLSX.utils.book_append_sheet(wb, niveauxWs, 'Niveaux et Classes');
            }
            
            // Feuille des élèves (logique simplifiée pour l'exemple)
            const elevesData = [];
            this.dataManager.data.niveaux.forEach(niveau => {
                if (niveau.classes) {
                    niveau.classes.forEach(classe => {
                        if (classe.eleves) {
                            classe.eleves.forEach(eleve => {
                                elevesData.push({
                                    'Niveau': niveau.nom,
                                    'Classe': classe.nom,
                                    'Nom': eleve.nom,
                                    'Prénom': eleve.prenom,
                                    'Groupe': eleve.groupe || 'Non assigné'
                                });
                            });
                        }
                    });
                }
            });
            
            if (elevesData.length > 0) {
                const elevesWs = XLSX.utils.json_to_sheet(elevesData);
                XLSX.utils.book_append_sheet(wb, elevesWs, 'Élèves');
            }
            
            // Afficher le dialogue de sauvegarde natif
            const result = await window.electronAPI.showSaveDialog({
                title: 'Exporter toutes les données scolaires',
                defaultPath: `donnees-classes-${new Date().toISOString().split('T')[0]}.xlsx`,
                filters: [
                    { name: 'Fichiers Excel', extensions: ['xlsx'] },
                    { name: 'Tous les fichiers', extensions: ['*'] }
                ]
            });
            
            if (!result.canceled && result.filePath) {
                // Convertir le workbook en buffer
                const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
                
                // Sauvegarder avec l'API Electron
                const writeResult = await window.electronAPI.writeFile(result.filePath, buffer);
                
                if (writeResult.success) {
                    this.showStatus(`Données exportées avec succès vers: ${result.filePath}`, 'success');
                } else {
                    throw new Error(writeResult.error);
                }
            } else {
                this.showStatus('Export annulé par l\'utilisateur', 'info');
            }
        } catch (error) {
            console.error('Erreur lors de l\'export Electron:', error);
            this.showStatus('Erreur lors de l\'export: ' + error.message, 'error');
        }
    }
    
    /**
     * Import avec dialogue natif Electron
     */
    async importWithElectronDialog() {
        if (!window.electronAPI) {
            this.showStatus('Fonction disponible uniquement dans l\'application desktop', 'error');
            return;
        }
        
        try {
            // Afficher le dialogue d'ouverture natif
            const result = await window.electronAPI.showOpenDialog({
                title: 'Importer des données scolaires',
                filters: [
                    { name: 'Fichiers Excel', extensions: ['xlsx', 'xls'] },
                    { name: 'Tous les fichiers', extensions: ['*'] }
                ],
                properties: ['openFile']
            });
            
            if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
                const filePath = result.filePaths[0];
                this.showStatus(`Lecture du fichier: ${filePath}...`);
                
                // Lire le fichier avec l'API Electron
                const readResult = await window.electronAPI.readFile(filePath);
                
                if (readResult.success) {
                    // Convertir en format lisible par XLSX
                    const workbook = XLSX.read(readResult.data, { type: 'buffer' });
                    
                    // Demander le type d'import
                    const importType = await this.selectImportType();
                    if (importType) {
                        // Utiliser la fonction d'import existante
                        await this.traiterFichierImport(workbook, filePath, importType);
                        this.showStatus(`Données importées avec succès depuis: ${filePath}`, 'success');
                    } else {
                        this.showStatus('Import annulé par l\'utilisateur', 'info');
                    }
                } else {
                    throw new Error(readResult.error);
                }
            } else {
                this.showStatus('Import annulé par l\'utilisateur', 'info');
            }
        } catch (error) {
            console.error('Erreur lors de l\'import Electron:', error);
            this.showStatus('Erreur lors de l\'import: ' + error.message, 'error');
        }
    }
    
    /**
     * Dialogue pour sélectionner le type d'import
     */
    async selectImportType() {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.innerHTML = `
                <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <h3 class="text-lg font-bold mb-4">Type d'import</h3>
                    <div class="space-y-3">
                        <label class="flex items-center">
                            <input type="radio" name="import-type" value="merge" checked class="mr-2">
                            Fusionner avec les données existantes
                        </label>
                        <label class="flex items-center">
                            <input type="radio" name="import-type" value="complete" class="mr-2">
                            Remplacement complet (⚠️ supprime tout)
                        </label>
                        <label class="flex items-center">
                            <input type="radio" name="import-type" value="eleves-only" class="mr-2">
                            Élèves uniquement
                        </label>
                        <label class="flex items-center">
                            <input type="radio" name="import-type" value="holidays-only" class="mr-2">
                            Vacances uniquement
                        </label>
                    </div>
                    <div class="flex justify-end gap-3 mt-6">
                        <button id="cancel-import" class="px-4 py-2 bg-gray-300 rounded">Annuler</button>
                        <button id="confirm-import" class="px-4 py-2 bg-blue-600 text-white rounded">Importer</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.querySelector('#cancel-import').onclick = () => {
                document.body.removeChild(modal);
                resolve(null);
            };
            
            modal.querySelector('#confirm-import').onclick = () => {
                const selected = modal.querySelector('input[name="import-type"]:checked');
                const importType = selected ? selected.value : 'merge';
                document.body.removeChild(modal);
                resolve(importType);
            };
        });
    }

    /**
     * Export de toutes les données
     */
    exportAllData() {
        this.showStatus('Génération du fichier Excel...');
        
        try {
            const wb = XLSX.utils.book_new();
            
            // Feuille des niveaux et classes
            const niveauxData = [];
            this.dataManager.data.niveaux.forEach(niveau => {
                if (niveau.classes) {
                    niveau.classes.forEach(classe => {
                        niveauxData.push({
                            'Niveau': niveau.nom,
                            'Classe': classe.nom,
                            'ID Niveau': niveau.id,
                            'ID Classe': classe.id,
                            'Nombre d\'élèves': classe.eleves ? classe.eleves.length : 0
                        });
                    });
                }
            });
            
            if (niveauxData.length > 0) {
                const niveauxWs = XLSX.utils.json_to_sheet(niveauxData);
                XLSX.utils.book_append_sheet(wb, niveauxWs, 'Niveaux et Classes');
            }
            
            // Feuille des élèves
            const elevesData = [];
            this.dataManager.data.niveaux.forEach(niveau => {
                if (niveau.classes) {
                    niveau.classes.forEach(classe => {
                        if (classe.eleves) {
                            classe.eleves.forEach(eleve => {
                                // Compter les absences
                                let absenceCount = 0;
                                let absenceDates = [];
                                
                                if (eleve.presence) {
                                    Object.entries(eleve.presence).forEach(([date, present]) => {
                                        if (!present) {
                                            absenceCount++;
                                            const formattedDate = new Date(date).toLocaleDateString('fr-FR');
                                            absenceDates.push(formattedDate);
                                        }
                                    });
                                }
                                
                                elevesData.push({
                                    'Niveau': niveau.nom,
                                    'Classe': classe.nom,
                                    'Prénom': eleve.prenom,
                                    'Nom': eleve.nom,
                                    'Groupe': eleve.groupe || '',
                                    'Commentaires': eleve.commentaires || '',
                                    'Nombre d\'absences': absenceCount,
                                    'Dates d\'absence': absenceDates.join(', ')
                                });
                            });
                        }
                    });
                }
            });
            
            if (elevesData.length > 0) {
                const elevesWs = XLSX.utils.json_to_sheet(elevesData);
                XLSX.utils.book_append_sheet(wb, elevesWs, 'Élèves');
            }
            
            // Feuille du cahier journal
            const cahierData = [];
            this.dataManager.data.niveaux.forEach(niveau => {
                if (niveau.classes) {
                    niveau.classes.forEach(classe => {
                        if (classe.cahierJournal) {
                            classe.cahierJournal.forEach(entree => {
                                const matieres = entree.matieres || [];
                                cahierData.push({
                                    'Niveau': niveau.nom,
                                    'Classe': classe.nom,
                                    'Date': entree.date,
                                    'Matières': matieres.join(', '),
                                    'Horaires': entree.horaires || '',
                                    'Objectifs': entree.objectifs || '',
                                    'Activités': entree.activites || '',
                                    'Observations': entree.observations || ''
                                });
                            });
                        }
                    });
                }
            });
            
            if (cahierData.length > 0) {
                const cahierWs = XLSX.utils.json_to_sheet(cahierData);
                XLSX.utils.book_append_sheet(wb, cahierWs, 'Cahier Journal');
            }
            
            // Feuille des présences
            const presenceData = [];
            this.dataManager.data.niveaux.forEach(niveau => {
                if (niveau.classes) {
                    niveau.classes.forEach(classe => {
                        if (classe.eleves) {
                            classe.eleves.forEach(eleve => {
                                if (eleve.presence) {
                                    Object.entries(eleve.presence).forEach(([date, present]) => {
                                        presenceData.push({
                                            'Niveau': niveau.nom,
                                            'Classe': classe.nom,
                                            'Prénom': eleve.prenom,
                                            'Nom': eleve.nom,
                                            'Date': new Date(date).toLocaleDateString('fr-FR'),
                                            'Présent': present ? 'Oui' : 'Non'
                                        });
                                    });
                                }
                            });
                        }
                    });
                }
            });
            
            if (presenceData.length > 0) {
                const presenceWs = XLSX.utils.json_to_sheet(presenceData);
                XLSX.utils.book_append_sheet(wb, presenceWs, 'Présences');
            }
            
            // Feuille des vacances
            const calendarModule = window.calendrierModule;
            if (calendarModule && calendarModule.holidays && calendarModule.holidays.length > 0) {
                const holidaysData = calendarModule.holidays.map(holiday => ({
                    'ID': holiday.id,
                    'Nom': holiday.name,
                    'Dates': holiday.dates,
                    'Durée': holiday.duration
                }));
                
                const holidaysWs = XLSX.utils.json_to_sheet(holidaysData);
                XLSX.utils.book_append_sheet(wb, holidaysWs, 'Vacances');
            }
            
            // Feuille des notes
            if (calendarModule && calendarModule.notes && Object.keys(calendarModule.notes).length > 0) {
                const notesData = [];
                Object.entries(calendarModule.notes).forEach(([date, content]) => {
                    notesData.push({
                        'Date': date,
                        'Contenu': content
                    });
                });
                
                const notesWs = XLSX.utils.json_to_sheet(notesData);
                XLSX.utils.book_append_sheet(wb, notesWs, 'Notes');
            }
            
            const filename = `gestionnaire_classes_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, filename);
            
            this.showStatus('Export terminé avec succès !', 'success', 3000);
        } catch (error) {
            console.error('Erreur lors de l\'export:', error);
            this.showStatus('Erreur lors de l\'export', 'error', 5000);
        }
    }

    /**
     * Export par classe
     */
    exportByClass() {
        const options = [];
        this.dataManager.data.niveaux.forEach(niveau => {
            if (niveau.classes) {
                niveau.classes.forEach(classe => {
                    options.push({
                        value: `${niveau.id}:${classe.id}`,
                        text: `${niveau.nom} - ${classe.nom}`
                    });
                });
            }
        });

        if (options.length === 0) {
            showToast('Aucune classe disponible pour l\'export.', 'error');
            return;
        }

        // Create a more user-friendly prompt message
        const promptMessage = `Classes disponibles:\n${options.map((opt, i) => `${i + 1}. ${opt.text}`).join('\n')}\n\nVeuillez entrer le numéro de la classe à exporter (1-${options.length}):`;
        const selection = prompt(promptMessage);
        
        if (selection === null) {
            // User cancelled the prompt
            return;
        }
        
        const selectedIndex = parseInt(selection) - 1;

        if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= options.length) {
            showToast('Numéro de classe invalide. Veuillez entrer un numéro valide.', 'error');
            return;
        }

        const [niveauId, classeId] = options[selectedIndex].value.split(':');
        this.exportSingleClass(niveauId, classeId);
    }

    /**
     * Export d'une classe unique
     */
    exportSingleClass(niveauId, classeId) {
        this.showStatus('Export de la classe en cours...');
        
        try {
            const niveau = this.dataManager.data.niveaux.find(n => n.id === niveauId);
            const classe = niveau.classes.find(c => c.id === classeId);
            
            const wb = XLSX.utils.book_new();
            
            // Élèves de la classe
            if (classe.eleves && classe.eleves.length > 0) {
                // Trier les élèves par nom puis prénom (ordre alphabétique français)
                const sortedEleves = [...classe.eleves].sort((a, b) => {
                    if (a.nom !== b.nom) {
                        return a.nom.localeCompare(b.nom, 'fr', { numeric: true, sensitivity: 'base' });
                    }
                    return a.prenom.localeCompare(b.prenom, 'fr', { numeric: true, sensitivity: 'base' });
                });
                
                // Traiter les données d'assiduité pour chaque élève
                const elevesData = sortedEleves.map((eleve, index) => {
                    // Compter les absences
                    let absenceCount = 0;
                    let absenceDates = [];
                    
                    if (eleve.presence) {
                        Object.entries(eleve.presence).forEach(([date, present]) => {
                            if (!present) {
                                absenceCount++;
                                // Formater la date pour l'affichage
                                const formattedDate = new Date(date).toLocaleDateString('fr-FR');
                                absenceDates.push(formattedDate);
                            }
                        });
                    }
                    
                    return {
                        'N°': index + 1,
                        'Nom': eleve.nom,
                        'Prénom': eleve.prenom,
                        'Groupe': eleve.groupe || '',
                        'Commentaires': eleve.commentaires || '',
                        'Nombre d\'absences': absenceCount,
                        'Dates d\'absence': absenceDates.join(', ')
                    };
                });
                
                // Ajouter la feuille des élèves en premier pour qu'elle s'ouvre par défaut
                const elevesWs = XLSX.utils.json_to_sheet(elevesData);
                XLSX.utils.book_append_sheet(wb, elevesWs, 'Liste des élèves');
                
                // Créer une feuille détaillée des présences
                const presenceData = [];
                sortedEleves.forEach(eleve => {
                    if (eleve.presence && Object.keys(eleve.presence).length > 0) {
                        Object.entries(eleve.presence).forEach(([date, present]) => {
                            presenceData.push({
                                'Nom': eleve.nom,
                                'Prénom': eleve.prenom,
                                'Groupe': eleve.groupe || '',
                                'Date': new Date(date).toLocaleDateString('fr-FR'),
                                'Statut': present ? 'Présent' : 'Absent'
                            });
                        });
                    }
                });
                
                if (presenceData.length > 0) {
                    // Trier par date, puis par nom
                    presenceData.sort((a, b) => {
                        const dateA = new Date(a.Date.split('/').reverse().join('-'));
                        const dateB = new Date(b.Date.split('/').reverse().join('-'));
                        
                        if (dateA - dateB !== 0) {
                            return dateA - dateB;
                        }
                        
                        if (a.Nom !== b.Nom) {
                            return a.Nom.localeCompare(b.Nom, 'fr', { numeric: true, sensitivity: 'base' });
                        }
                        
                        return a.Prénom.localeCompare(b.Prénom, 'fr', { numeric: true, sensitivity: 'base' });
                    });
                    
                    const presenceWs = XLSX.utils.json_to_sheet(presenceData);
                    XLSX.utils.book_append_sheet(wb, presenceWs, 'Détail des présences');
                }
            } else {
                // Si aucun élève n'est trouvé, créer une feuille vide avec un message
                const emptyData = [{'Message': 'Aucun élève trouvé dans cette classe'}];
                const emptyWs = XLSX.utils.json_to_sheet(emptyData);
                XLSX.utils.book_append_sheet(wb, emptyWs, 'Liste des élèves');
            }
            
            // Informations de la classe (ajoutée en dernier)
            const classInfo = [{
                'Niveau': niveau.nom,
                'Classe': classe.nom,
                'Nombre d\'élèves': classe.eleves ? classe.eleves.length : 0,
                'Date d\'export': new Date().toLocaleDateString('fr-FR')
            }];
            const infoWs = XLSX.utils.json_to_sheet(classInfo);
            XLSX.utils.book_append_sheet(wb, infoWs, 'Informations');
            
            const filename = `${niveau.nom}_${classe.nom}_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, filename);
            
            this.showStatus('Export de la classe terminé !', 'success', 3000);
        } catch (error) {
            console.error('Erreur lors de l\'export de la classe:', error);
            this.showStatus('Erreur lors de l\'export', 'error', 5000);
        }
    }

    /**
     * Export des présences
     */
    exportPresence() {
        this.showStatus('Export des présences en cours...');
        
        try {
            const presenceData = this.preparePresenceData();
            
            if (presenceData.length === 0) {
                showToast('Aucune donnée de présence à exporter.', 'error');
                this.hideStatus();
                return;
            }
            
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(presenceData);
            XLSX.utils.book_append_sheet(wb, ws, 'Présences');
            
            const filename = `presences_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, filename);
            
            this.showStatus('Export des présences terminé !', 'success', 3000);
        } catch (error) {
            console.error('Erreur lors de l\'export des présences:', error);
            this.showStatus('Erreur lors de l\'export', 'error', 5000);
        }
    }

    /**
     * Import de données depuis Excel
     */
    importData() {
        const fileInput = document.getElementById('import-file');
        const importType = document.getElementById('import-type').value;
        
        if (!fileInput.files.length) {
            showToast('Veuillez sélectionner un fichier à importer.', 'error');
            return;
        }

        if (importType === 'complete' && !confirm('L\'import complet remplacera toutes vos données actuelles. Êtes-vous sûr ?')) {
            return;
        }

        this.showStatus('Lecture du fichier...');
        this.showProgress(10, 'Chargement du fichier Excel');
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        // Simuler la progression de lecture du fichier
        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                const percentLoaded = Math.round((e.loaded / e.total) * 30) + 10;
                this.showProgress(percentLoaded, 'Lecture du fichier en cours...');
            }
        };
        
        reader.onload = (e) => {
            try {
                this.showProgress(50, 'Analyse du fichier Excel...');
                
                setTimeout(() => {
                    const workbook = XLSX.read(e.target.result, { type: 'binary' });
                    this.processImport(workbook, importType);
                }, 300);
                
            } catch (error) {
                console.error('Erreur lors de l\'import:', error);
                this.showStatus('Erreur lors de l\'import du fichier', 'error', 5000);
                this.hideProgress();
                showToast('Erreur lors de l\'import du fichier', 'error');
            }
        };
        
        reader.onerror = () => {
            this.showStatus('Erreur lors de la lecture du fichier', 'error', 5000);
            this.hideProgress();
            showToast('Erreur lors de la lecture du fichier', 'error');
        };
        
        reader.readAsBinaryString(file);
    }

    /**
     * Traitement de l'import
     */
    processImport(workbook, importType) {
        try {
            this.showProgress(60, 'Préparation des données...');
            
            if (importType === 'complete') {
                // Reset des données existantes
                this.dataManager.data = this.dataManager.getDefaultData();
                this.showProgress(70, 'Réinitialisation des données...');
            }

            let totalSheets = workbook.SheetNames.length;
            let processedSheets = 0;
            let importedEleves = 0;
            let importedNiveaux = 0;
            let importedHolidays = 0;
            let importedNotes = 0;
            let importedPresences = 0;
            let importedCahier = 0;

            // Traiter chaque feuille
            workbook.SheetNames.forEach((sheetName, index) => {
                const sheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(sheet);
                
                const progress = 70 + Math.round((index / totalSheets) * 20);
                this.showProgress(progress, `Traitement feuille: ${sheetName}`);
                
                switch (sheetName.toLowerCase()) {
                    case 'élèves':
                    case 'eleves':
                    case 'liste des élèves':
                        if (importType === 'eleves-only' || importType === 'merge' || importType === 'complete') {
                            importedEleves += this.importEleves(data, importType);
                        }
                        break;
                    case 'niveaux et classes':
                    case 'niveaux':
                    case 'informations':
                        if (importType === 'eleves-only' || importType === 'merge' || importType === 'complete') {
                            importedNiveaux += this.importNiveaux(data);
                        }
                        break;
                    case 'vacances':
                        if (importType === 'holidays-only' || importType === 'merge' || importType === 'complete') {
                            importedHolidays += this.importHolidays(data);
                        }
                        break;
                    case 'notes':
                        if (importType === 'notes-only' || importType === 'merge' || importType === 'complete') {
                            importedNotes += this.importNotes(data);
                        }
                        break;
                    case 'présences':
                    case 'presences':
                    case 'détail des présences':
                    case 'detail des presences':
                        if (importType === 'presence-only' || importType === 'merge' || importType === 'complete') {
                            importedPresences += this.importPresences(data);
                        }
                        break;
                    case 'cahier journal':
                    case 'cahier':
                        if (importType === 'cahier-only' || importType === 'merge' || importType === 'complete') {
                            importedCahier += this.importCahier(data);
                        }
                        break;
                }
                processedSheets++;
            });

            this.showProgress(95, 'Sauvegarde des données...');
            this.dataManager.saveData();
            
            // Sauvegarder les notes du calendrier si nécessaire
            if (importedNotes > 0) {
                const calendarModule = window.calendrierModule;
                if (calendarModule) {
                    calendarModule.saveNotes();
                }
            }
            
            this.showProgress(100, 'Import terminé !');
            
            // Message de succès détaillé
            const summary = [];
            if (importedEleves > 0) summary.push(`${importedEleves} élève(s)`);
            if (importedNiveaux > 0) summary.push(`${importedNiveaux} niveau(x)`);
            if (importedHolidays > 0) summary.push(`${importedHolidays} vacance(s)`);
            if (importedNotes > 0) summary.push(`${importedNotes} note(s)`);
            if (importedPresences > 0) summary.push(`${importedPresences} présence(s)`);
            if (importedCahier > 0) summary.push(`${importedCahier} entrée(s) de cahier`);
            
            const message = `Import terminé avec succès ! ${summary.length > 0 ? `Importé: ${summary.join(', ')}` : ''}`;
            
            setTimeout(() => {
                this.showStatus(message, 'success', 4000);
                this.hideProgress();
                
                // Toast notification pour l'utilisateur
                showToast(message, 'success', 4000);
                
                // Rafraîchir l'affichage et mettre à jour le dashboard
                this.refreshAllSections();
                
                // Reset le formulaire d'import
                this.resetImportForm();
                
            }, 500);
            
        } catch (error) {
            console.error('Erreur lors du traitement de l\'import:', error);
            this.showStatus('Erreur lors du traitement des données', 'error', 5000);
            this.hideProgress();
            showToast('Erreur lors du traitement des données', 'error');
        }
    }

    /**
     * Import des élèves
     */
    importEleves(data, importType) {
        let importedCount = 0;
        
        data.forEach(row => {
            if (row.Prénom && row.Nom && row.Niveau && row.Classe) {
                // Trouver ou créer le niveau et la classe
                let niveau = this.dataManager.data.niveaux.find(n => n.nom === row.Niveau);
                if (!niveau) {
                    niveau = {
                        id: this.dataManager.generateId('niveau'),
                        nom: row.Niveau,
                        classes: []
                    };
                    this.dataManager.data.niveaux.push(niveau);
                }

                let classe = niveau.classes.find(c => c.nom === row.Classe);
                if (!classe) {
                    classe = {
                        id: this.dataManager.generateId('classe'),
                        nom: row.Classe,
                        eleves: [],
                        groupes: {},
                        cahierJournal: [],
                        taches: []
                    };
                    niveau.classes.push(classe);
                }

                // Vérifier si l'élève existe déjà (éviter les doublons)
                const existingEleve = classe.eleves.find(e => 
                    e.prenom === row.Prénom && e.nom === row.Nom
                );

                if (!existingEleve || importType === 'complete') {
                    // Ajouter l'élève
                    const eleve = {
                        id: this.dataManager.generateId('eleve'),
                        prenom: row.Prénom,
                        nom: row.Nom,
                        groupe: row.Groupe || null,
                        commentaires: row.Commentaires || '',
                        competences: {},
                        presence: {}
                    };

                    // Import des compétences si disponibles
                    if (row.Lecture) eleve.competences.lecture = row.Lecture;
                    if (row.Mathématiques) eleve.competences.maths = row.Mathématiques;
                    if (row.Écriture) eleve.competences.ecriture = row.Écriture;
                    if (row.Oral) eleve.competences.oral = row.Oral;

                    if (existingEleve) {
                        // Remplacer l'élève existant
                        const index = classe.eleves.indexOf(existingEleve);
                        classe.eleves[index] = eleve;
                    } else {
                        // Ajouter le nouvel élève
                        classe.eleves.push(eleve);
                    }
                    
                    importedCount++;
                }
            }
        });
        
        return importedCount;
    }

    /**
     * Import des niveaux
     */
    importNiveaux(data) {
        data.forEach(row => {
            if (row.Niveau) {
                let niveau = this.dataManager.data.niveaux.find(n => n.nom === row.Niveau);
                if (!niveau) {
                    niveau = {
                        id: this.dataManager.generateId('niveau'),
                        nom: row.Niveau,
                        classes: []
                    };
                    this.dataManager.data.niveaux.push(niveau);
                }
            }
        });
    }

    preparePresenceData() {
        const data = [];
        this.dataManager.data.niveaux.forEach(niveau => {
            if (niveau.classes) {
                niveau.classes.forEach(classe => {
                    if (classe.eleves) {
                        classe.eleves.forEach(eleve => {
                            if (eleve.presence) {
                                Object.entries(eleve.presence).forEach(([date, present]) => {
                                    data.push({
                                        'Niveau': niveau.nom,
                                        'Classe': classe.nom,
                                        'Prénom': eleve.prenom,
                                        'Nom': eleve.nom,
                                        'Date': date,
                                        'Présent': present ? 'Oui' : 'Non'
                                    });
                                });
                            }
                        });
                    }
                });
            }
        });
        return data;
    }

    /**
     * Import des présences
     */
    importPresences(data) {
        let importedCount = 0;
        
        try {
            data.forEach(row => {
                // Vérifier les données nécessaires
                if (row.Nom && row.Prénom && row.Date) {
                    let niveau, classe, eleve;
                    
                    // Trouver l'élève basé sur le nom et prénom (et éventuellement classe/niveau)
                    this.dataManager.data.niveaux.forEach(n => {
                        if (row.Niveau && n.nom !== row.Niveau) return; // Passer si le niveau ne correspond pas
                        
                        n.classes.forEach(c => {
                            if (row.Classe && c.nom !== row.Classe) return; // Passer si la classe ne correspond pas
                            
                            const foundEleve = c.eleves.find(e => 
                                e.nom === row.Nom && e.prenom === row.Prénom
                            );
                            
                            if (foundEleve) {
                                niveau = n;
                                classe = c;
                                eleve = foundEleve;
                            }
                        });
                    });
                    
                    if (eleve) {
                        // Format de date: vérifier si c'est JJ/MM/AAAA ou AAAA-MM-JJ
                        let dateStr = row.Date;
                        if (dateStr.includes('/')) {
                            // Convertir JJ/MM/AAAA en AAAA-MM-JJ
                            const parts = dateStr.split('/');
                            if (parts.length === 3) {
                                dateStr = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                            }
                        }
                        
                        // Définir la présence
                        if (!eleve.presence) {
                            eleve.presence = {};
                        }
                        
                        // Déterminer si l'élève était présent
                        let present = true;
                        if (row.Présent !== undefined) {
                            present = row.Présent === 'Oui' || row.Présent === true;
                        } else if (row.Statut !== undefined) {
                            present = row.Statut === 'Présent';
                        }
                        
                        eleve.presence[dateStr] = present;
                        importedCount++;
                    }
                }
            });
        } catch (error) {
            console.error('Erreur lors de l\'import des présences:', error);
            showToast('Erreur lors de l\'import des présences', 'error');
        }
        
        return importedCount;
    }

    /**
     * Import du cahier journal
     */
    importCahier(data) {
        let importedCount = 0;
        
        try {
            data.forEach(row => {
                // Vérifier les données nécessaires
                if (row.Niveau && row.Classe && row.Date) {
                    // Trouver le niveau et la classe
                    let niveau = this.dataManager.data.niveaux.find(n => n.nom === row.Niveau);
                    if (!niveau) {
                        niveau = {
                            id: this.dataManager.generateId('niveau'),
                            nom: row.Niveau,
                            classes: []
                        };
                        this.dataManager.data.niveaux.push(niveau);
                    }

                    let classe = niveau.classes.find(c => c.nom === row.Classe);
                    if (!classe) {
                        classe = {
                            id: this.dataManager.generateId('classe'),
                            nom: row.Classe,
                            eleves: [],
                            groupes: {},
                            cahierJournal: [],
                            taches: []
                        };
                        niveau.classes.push(classe);
                    }
                    
                    // Vérifier si l'entrée existe déjà
                    const existingEntree = classe.cahierJournal.find(e => 
                        e.date === row.Date && 
                        e.horaires === row.Horaires
                    );
                    
                    if (!existingEntree) {
                        // Créer une nouvelle entrée
                        const matieres = row.Matières ? row.Matières.split(',').map(m => m.trim()) : [];
                        
                        const entree = {
                            id: this.dataManager.generateId('entree'),
                            date: row.Date,
                            horaires: row.Horaires || '',
                            matieres: matieres,
                            objectifs: row.Objectifs || '',
                            activites: row.Activités || '',
                            observations: row.Observations || ''
                        };
                        
                        classe.cahierJournal.push(entree);
                        importedCount++;
                    }
                }
            });
        } catch (error) {
            console.error('Erreur lors de l\'import du cahier journal:', error);
            showToast('Erreur lors de l\'import du cahier journal', 'error');
        }
        
        return importedCount;
    }

    /**
     * Export des vacances
     */
    exportHolidays() {
        this.showStatus('Export des vacances en cours...');
        
        try {
            // Accéder aux données de vacances via le module calendrier
            const calendarModule = window.calendrierModule;
            if (!calendarModule) {
                throw new Error('Module calendrier non disponible');
            }
            
            const holidaysData = calendarModule.holidays.map(holiday => ({
                'ID': holiday.id,
                'Nom': holiday.name,
                'Dates': holiday.dates,
                'Durée': holiday.duration
            }));
            
            if (holidaysData.length === 0) {
                showToast('Aucune donnée de vacances à exporter.', 'error');
                this.hideStatus();
                return;
            }
            
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(holidaysData);
            XLSX.utils.book_append_sheet(wb, ws, 'Vacances');
            
            const filename = `vacances_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, filename);
            
            this.showStatus('Export des vacances terminé !', 'success', 3000);
        } catch (error) {
            console.error('Erreur lors de l\'export des vacances:', error);
            this.showStatus('Erreur lors de l\'export des vacances', 'error', 5000);
        }
    }

    /**
     * Export des notes
     */
    exportNotes() {
        this.showStatus('Export des notes en cours...');
        
        try {
            // Accéder aux données de notes via le module calendrier
            const calendarModule = window.calendrierModule;
            if (!calendarModule) {
                throw new Error('Module calendrier non disponible');
            }
            
            const notesData = [];
            Object.entries(calendarModule.notes).forEach(([date, content]) => {
                notesData.push({
                    'Date': date,
                    'Contenu': content
                });
            });
            
            if (notesData.length === 0) {
                this.showStatus('Aucune note à exporter.', 'info', 3000);
                return;
            }
            
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(notesData);
            XLSX.utils.book_append_sheet(wb, ws, 'Notes');
            
            const filename = `notes_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, filename);
            
            this.showStatus('Export des notes terminé !', 'success', 3000);
        } catch (error) {
            console.error('Erreur lors de l\'export des notes:', error);
            this.showStatus('Erreur lors de l\'export des notes', 'error', 5000);
        }
    }

    /**
     * Téléchargement de modèles
     */
    downloadTemplate(type) {
        const wb = XLSX.utils.book_new();
        
        if (type === 'eleves') {
            const template = [
                {
                    'Niveau': 'CP',
                    'Classe': 'CP A',
                    'Prénom': 'Jean',
                    'Nom': 'Dupont',
                    'Groupe': 'Groupe1',
                    'Commentaires': 'Bon élève'
                }
            ];
            const ws = XLSX.utils.json_to_sheet(template);
            XLSX.utils.book_append_sheet(wb, ws, 'Élèves');
            XLSX.writeFile(wb, 'modele_eleves.xlsx');
        } else if (type === 'classes') {
            const template = [
                {
                    'Niveau': 'CP',
                    'Classe': 'CP A',
                    'Description': 'Classe de CP section A'
                },
                {
                    'Niveau': 'CE1',
                    'Classe': 'CE1 A',
                    'Description': 'Classe de CE1 section A'
                }
            ];
            const ws = XLSX.utils.json_to_sheet(template);
            XLSX.utils.book_append_sheet(wb, ws, 'Classes');
            XLSX.writeFile(wb, 'modele_classes.xlsx');
        } else if (type === 'holidays') {
            const template = [
                {
                    'ID': 1,
                    'Nom': 'Vacances d\'été',
                    'Dates': 'Du 1er juillet au 31 août 2025',
                    'Durée': '62 jours'
                },
                {
                    'ID': 2,
                    'Nom': 'Vacances de Noël',
                    'Dates': '20-31 décembre 2025',
                    'Durée': '12 jours'
                }
            ];
            const ws = XLSX.utils.json_to_sheet(template);
            XLSX.utils.book_append_sheet(wb, ws, 'Vacances');
            XLSX.writeFile(wb, 'modele_vacances.xlsx');
        } else if (type === 'attendance') {
            const today = new Date().toISOString().split('T')[0];
            const template = [
                {
                    'Niveau': 'CP',
                    'Classe': 'CP A',
                    'Prénom': 'Jean',
                    'Nom': 'Dupont',
                    'Date': today,
                    'Statut': 'Présent'
                },
                {
                    'Niveau': 'CP',
                    'Classe': 'CP A',
                    'Prénom': 'Marie',
                    'Nom': 'Martin',
                    'Date': today,
                    'Statut': 'Absent'
                }
            ];
            const ws = XLSX.utils.json_to_sheet(template);
            XLSX.utils.book_append_sheet(wb, ws, 'Présences');
            
            // Ajouter une feuille d'aide
            const helpText = [
                {
                    'Information': 'Ce modèle est compatible avec l\'export "Exporter les présences" et "Exporter par classe".',
                    'Format date': 'Les dates peuvent être au format AAAA-MM-JJ ou JJ/MM/AAAA.',
                    'Statut': 'Les valeurs acceptées sont "Présent" ou "Absent", ou "Oui"/"Non" dans la colonne "Présent".'
                }
            ];
            const helpWs = XLSX.utils.json_to_sheet(helpText);
            XLSX.utils.book_append_sheet(wb, helpWs, 'Aide');
            
            XLSX.writeFile(wb, 'modele_presences.xlsx');
        } else if (type === 'cahier') {
            const today = new Date().toISOString().split('T')[0];
            const template = [
                {
                    'Niveau': 'CP',
                    'Classe': 'CP A',
                    'Date': today,
                    'Matières': 'Mathématiques, Français',
                    'Horaires': '09:00 - 10:30',
                    'Objectifs': 'Comprendre les additions à deux chiffres',
                    'Activités': 'Exercices de calcul mental et travaux de groupe',
                    'Observations': 'La classe a bien participé'
                }
            ];
            const ws = XLSX.utils.json_to_sheet(template);
            XLSX.utils.book_append_sheet(wb, ws, 'Cahier Journal');
            
            // Ajouter une feuille d'aide
            const helpText = [
                {
                    'Information': 'Ce modèle est compatible avec l\'export "Exporter toutes les données".',
                    'Format date': 'Les dates doivent être au format AAAA-MM-JJ.',
                    'Matières': 'Séparez les matières par des virgules.'
                }
            ];
            const helpWs = XLSX.utils.json_to_sheet(helpText);
            XLSX.utils.book_append_sheet(wb, helpWs, 'Aide');
            
            XLSX.writeFile(wb, 'modele_cahier.xlsx');
        } else if (type === 'notes') {
            const today = new Date().toISOString().split('T')[0];
            const template = [
                {
                    'Date': today,
                    'Contenu': 'Réunion avec les parents à 17h'
                }
            ];
            const ws = XLSX.utils.json_to_sheet(template);
            XLSX.utils.book_append_sheet(wb, ws, 'Notes');
            XLSX.writeFile(wb, 'modele_notes.xlsx');
        }
    }

    /**
     * Import des vacances
     */
    importHolidays(data) {
        let importedCount = 0;
        
        try {
            // Accéder aux données de vacances via le module calendrier
            const calendarModule = window.calendrierModule;
            if (!calendarModule) {
                throw new Error('Module calendrier non disponible');
            }
            
            // Remplacer ou fusionner les données de vacances
            if (data && data.length > 0) {
                // Convertir les données Excel en format de vacances
                const holidays = data.map((row, index) => ({
                    id: row.ID || (index + 1),
                    name: row.Nom || `Vacance ${index + 1}`,
                    dates: row.Dates || '',
                    duration: row.Durée || ''
                }));
                
                // Mettre à jour les vacances dans le module calendrier
                calendarModule.holidays = holidays;
                importedCount = holidays.length;
            }
        } catch (error) {
            console.error('Erreur lors de l\'import des vacances:', error);
            showToast('Erreur lors de l\'import des vacances', 'error');
        }
        
        return importedCount;
    }

    /**
     * Import des notes
     */
    importNotes(data) {
        let importedCount = 0;
        
        try {
            // Accéder aux données de notes via le module calendrier
            const calendarModule = window.calendrierModule;
            if (!calendarModule) {
                throw new Error('Module calendrier non disponible');
            }
            
            // Remplacer ou fusionner les données de notes
            if (data && data.length > 0) {
                // Convertir les données Excel en format de notes
                const notes = {};
                data.forEach(row => {
                    if (row.Date && row.Contenu) {
                        notes[row.Date] = row.Contenu;
                        importedCount++;
                    }
                });
                
                // Mettre à jour les notes dans le module calendrier
                calendarModule.notes = notes;
            } else {
                this.showStatus('Aucune note à importer.', 'info', 3000);
                return 0;
            }
        } catch (error) {
            console.error('Erreur lors de l\'import des notes:', error);
            this.showStatus('Erreur lors de l\'import des notes', 'error', 5000);
            showToast('Erreur lors de l\'import des notes', 'error');
        }
        
        return importedCount;
    }

    showStatus(message, type = 'info', autoHide = 0) {
        const statusDiv = document.getElementById('export-import-status');
        const messageEl = document.getElementById('status-message');
        
        if (statusDiv && messageEl) {
            messageEl.textContent = message;
            statusDiv.classList.remove('hidden');
            
            // Changer la couleur selon le type
            const container = statusDiv.querySelector('div');
            container.className = type === 'success' ? 'bg-green-50 border border-green-200 rounded-lg p-4' :
                                 type === 'error' ? 'bg-red-50 border border-red-200 rounded-lg p-4' :
                                 'bg-blue-50 border border-blue-200 rounded-lg p-4';
            
            const icon = statusDiv.querySelector('i');
            icon.className = type === 'success' ? 'fas fa-check-circle text-green-600 mr-3' :
                            type === 'error' ? 'fas fa-exclamation-triangle text-red-600 mr-3' :
                            'fas fa-spinner fa-spin text-blue-600 mr-3';

            if (autoHide > 0) {
                setTimeout(() => this.hideStatus(), autoHide);
            }
        }
    }

    showProgress(percent, text) {
        const progressContainer = document.getElementById('progress-container');
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        const progressPercent = document.getElementById('progress-percent');
        
        if (progressContainer && progressBar && progressText && progressPercent) {
            progressContainer.classList.remove('hidden');
            progressBar.style.width = `${percent}%`;
            progressText.textContent = text;
            progressPercent.textContent = `${percent}%`;
            
            // Changer la couleur de la barre selon le pourcentage
            if (percent >= 100) {
                progressBar.className = 'bg-green-600 h-2 rounded-full transition-all duration-300';
            } else if (percent >= 75) {
                progressBar.className = 'bg-blue-600 h-2 rounded-full transition-all duration-300';
            } else {
                progressBar.className = 'bg-blue-500 h-2 rounded-full transition-all duration-300';
            }
        }
    }

    hideProgress() {
        const progressContainer = document.getElementById('progress-container');
        if (progressContainer) {
            progressContainer.classList.add('hidden');
        }
    }

    refreshAllSections() {
        // Rafraîchir le dashboard avec les nouveaux totaux
        if (this.schoolManager.updateDashboard) {
            this.schoolManager.updateDashboard();
        }
        
        // Rafraîchir la section actuelle
        if (this.schoolManager.currentSection) {
            this.schoolManager.showSection(this.schoolManager.currentSection);
        }
    }

    resetImportForm() {
        // Reset le formulaire d'import
        const fileInput = document.getElementById('import-file');
        const importBtn = document.getElementById('import-btn');
        
        if (fileInput) {
            fileInput.value = '';
        }
        
        if (importBtn) {
            importBtn.disabled = true;
        }
    }

    hideStatus() {
        const statusDiv = document.getElementById('export-import-status');
        if (statusDiv) {
            statusDiv.classList.add('hidden');
        }
        this.hideProgress();
    }
}
