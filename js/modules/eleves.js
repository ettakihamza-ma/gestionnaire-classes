/**
 * Module Élèves - Gestion des élèves et groupes
 */
class ElevesModule {
    constructor(dataManager, schoolManager) {
        this.dataManager = dataManager;
        this.schoolManager = schoolManager;
        this.selectedClasseId = null;
        this.selectedNiveauId = null;
        this.currentView = VIEWS.ELEVES.ALL;
        this.currentEditingEleve = null;
    }

    /**
     * Rendu de la section élèves
     */
    render() {
        const section = document.getElementById('eleves-section');
        section.innerHTML = `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">Gestion des Élèves</h2>
                </div>
                
                <!-- Barre de recherche d'élèves -->
                <div class="mb-6">
                    <div class="relative">
                        <input type="text" id="student-search" placeholder="Rechercher un élève par nom ou prénom..." 
                               class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i class="fas fa-search text-gray-400"></i>
                        </div>
                        <button id="clear-search" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 hidden">
                            <i class="fas fa-times"></i>
                        </button>
                        <button id="search-button" class="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-600 hover:text-blue-800">
                            <i class="fas fa-search"></i>
                        </button>
                    </div>
                    <div id="search-info" class="text-sm text-gray-500 mt-2 hidden">
                        <i class="fas fa-info-circle mr-1"></i>
                        <span id="search-results-count"></span>
                    </div>
                </div>
                
                <div class="mb-6" id="classe-selector-container">
                    <label for="classe-selector" class="block text-sm font-medium text-gray-700 mb-2">
                        Sélectionner une classe
                    </label>
                    <select id="classe-selector" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Choisir une classe</option>
                        ${this.renderClasseOptions()}
                    </select>
                </div>

                <div id="eleves-controls" class="hidden mb-6 flex flex-wrap gap-3">
                    <button id="add-eleve-btn" disabled
                            class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                        <i class="fas fa-user-plus"></i>
                        <span>Ajouter élève</span>
                    </button>
                    <button id="generate-groups-btn" disabled
                            class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                        <i class="fas fa-sort-alpha-down"></i>
                        <span>Groupes alphabétiques</span>
                    </button>
                </div>

                <div id="eleves-view-controls" class="hidden mb-4 flex flex-wrap gap-2">
                    <button class="eleves-view-btn px-4 py-2 text-sm rounded bg-blue-100 text-blue-700" data-view="all">
                        Tous les élèves
                    </button>
                    <button class="eleves-view-btn px-4 py-2 text-sm rounded text-gray-600 hover:bg-gray-100" data-view="groupe1">
                        Groupe 1
                    </button>
                    <button class="eleves-view-btn px-4 py-2 text-sm rounded text-gray-600 hover:bg-gray-100" data-view="groupe2">
                        Groupe 2
                    </button>
                </div>
                
                <div id="eleves-content">
                    ${this.renderElevesPlaceholder()}
                </div>
            </div>
            
            ${this.renderEleveModal()}
        `;
        
        this.setupEventListeners();
    }

    /**
     * Rendu des options de classes
     */
    renderClasseOptions() {
        return this.dataManager.data.niveaux.map(niveau => 
            niveau.classes?.map(classe => 
                `<option value="${niveau.id}:${classe.id}">${niveau.nom} - ${classe.nom}</option>`
            ).join('') || ''
        ).join('');
    }

    /**
     * Rendu du placeholder élèves
     */
    renderElevesPlaceholder() {
        return `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-users text-4xl mb-4"></i>
                <p class="text-lg">Sélectionnez une classe</p>
                <p>Vous pourrez ensuite gérer les élèves et leurs groupes</p>
            </div>
        `;
    }

    /**
     * Rendu de la liste des élèves
     */
    renderElevesList() {
        const classe = this.getSelectedClasse();
        if (!classe || !classe.eleves || classe.eleves.length === 0) {
            return `
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-user-plus text-4xl mb-4"></i>
                    <p class="text-lg">Aucun élève dans cette classe</p>
                    <p>Commencez par ajouter des élèves</p>
                </div>
            `;
        }

        let filteredEleves = classe.eleves;
        if (this.currentView === VIEWS.ELEVES.GROUPE1) {
            filteredEleves = classe.eleves.filter(e => e.groupe === 'Groupe1');
        } else if (this.currentView === VIEWS.ELEVES.GROUPE2) {
            filteredEleves = classe.eleves.filter(e => e.groupe === 'Groupe2');
        }

        if (filteredEleves.length === 0) {
            return `
                <div class="text-center py-8 text-gray-500">
                    <p>Aucun élève dans ce groupe</p>
                </div>
            `;
        }

        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${filteredEleves.map(eleve => {
                    const attendanceStats = this.getAttendanceStatsForStudent(eleve);
                    const attendanceRate = attendanceStats.totalSessions > 0 ? 
                        ((attendanceStats.totalSessions - attendanceStats.absences) / attendanceStats.totalSessions * 100).toFixed(1) : 100;
                    
                    return `
                        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div class="flex justify-between items-start mb-3">
                                <div class="flex items-center space-x-3">
                                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <i class="fas fa-user text-blue-600"></i>
                                    </div>
                                    <div>
                                        <h4 class="font-semibold text-gray-800">
                                            ${escapeHtml(eleve.prenom)} ${escapeHtml(eleve.nom)}
                                        </h4>
                                        <p class="text-sm text-gray-500">
                                            ${eleve.groupe ? `<span class="bg-${eleve.groupe === 'Groupe1' ? 'green' : 'blue'}-100 text-${eleve.groupe === 'Groupe1' ? 'green' : 'blue'}-800 px-2 py-1 rounded-full text-xs">${eleve.groupe}</span>` : '<span class="text-gray-400">Aucun groupe</span>'}
                                        </p>
                                    </div>
                                </div>
                                <div class="flex space-x-1">
                                    <button onclick="elevesModule.showStudentAttendanceDetails('${eleve.id}')" 
                                            class="text-green-600 hover:text-green-800 p-1" title="Voir les absences">
                                        <i class="fas fa-calendar-check"></i>
                                    </button>
                                    <button onclick="elevesModule.editEleve('${eleve.id}')" 
                                            class="text-blue-600 hover:text-blue-800 p-1">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="confirmAction('Supprimer cet élève ?', () => elevesModule.deleteEleve('${eleve.id}'))" 
                                            class="text-red-600 hover:text-red-800 p-1">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Statistiques d'assiduité -->
                            <div class="bg-gray-50 border border-gray-200 rounded p-3 mb-3">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-sm font-medium text-gray-700">
                                        <i class="fas fa-chart-line mr-1"></i>
                                        Assiduité
                                    </span>
                                    <span class="text-sm font-bold ${
                                        attendanceRate >= 90 ? 'text-green-600' : 
                                        attendanceRate >= 75 ? 'text-orange-600' : 'text-red-600'
                                    }">
                                        ${attendanceRate}%
                                    </span>
                                </div>
                                <div class="grid grid-cols-3 gap-2 text-center text-xs">
                                    <div>
                                        <div class="font-medium text-blue-600">${attendanceStats.totalSessions}</div>
                                        <div class="text-gray-500">Séances</div>
                                    </div>
                                    <div>
                                        <div class="font-medium text-red-600">${attendanceStats.absences}</div>
                                        <div class="text-gray-500">Absences</div>
                                    </div>
                                    <div>
                                        <div class="font-medium text-green-600">${attendanceStats.totalSessions - attendanceStats.absences}</div>
                                        <div class="text-gray-500">Présences</div>
                                    </div>
                                </div>
                                ${attendanceStats.absenceDates.length > 0 ? `
                                    <div class="mt-2 pt-2 border-t border-gray-300">
                                        <div class="text-xs text-red-600">
                                            <i class="fas fa-exclamation-triangle mr-1"></i>
                                            Dernière absence: ${new Date(attendanceStats.absenceDates[0].date).toLocaleDateString('fr-FR')}
                                        </div>
                                    </div>
                                ` : `
                                    <div class="mt-2 pt-2 border-t border-gray-300">
                                        <div class="text-xs text-green-600">
                                            <i class="fas fa-check-circle mr-1"></i>
                                            Aucune absence
                                        </div>
                                    </div>
                                `}
                            </div>
                            
                            ${eleve.commentaires ? `
                                <div class="bg-gray-50 p-2 rounded text-sm text-gray-600">
                                    <i class="fas fa-comment-alt mr-1"></i>
                                    ${truncateText(escapeHtml(eleve.commentaires), 50)}
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div class="mt-6 text-center text-sm text-gray-500">
                Total: ${filteredEleves.length} élève(s)
                ${this.currentView === VIEWS.ELEVES.ALL ? this.renderGroupsStats(classe) : ''}
            </div>
        `;
    }

    /**
     * Calculer les statistiques d'assiduité pour un élève
     */
    getAttendanceStatsForStudent(eleve) {
        const classe = this.getSelectedClasse();
        if (!classe || !classe.cahierJournal) {
            return { totalSessions: 0, absences: 0, absenceDates: [] };
        }

        let totalSessions = 0;
        let absences = 0;
        let absenceDates = [];

        // Parcourir toutes les entrées du cahier journal
        classe.cahierJournal.forEach(entree => {
            if (entree.attendance) {
                // Nouveau format avec scope
                const { scope, data, temporaryStudents } = entree.attendance;
                
                // Vérifier si l'élève était dans le scope principal
                const wasInMainScope = data.hasOwnProperty(eleve.id);
                
                // Vérifier si l'élève était temporaire pour cette séance
                const wasTemporary = temporaryStudents && temporaryStudents.hasOwnProperty(eleve.id);
                
                if (wasInMainScope || wasTemporary) {
                    totalSessions++;
                    
                    let wasPresent = false;
                    if (wasInMainScope) {
                        wasPresent = data[eleve.id];
                    } else if (wasTemporary) {
                        wasPresent = temporaryStudents[eleve.id].present;
                    }
                    
                    if (!wasPresent) {
                        absences++;
                        absenceDates.push({
                            date: entree.date,
                            scope: scope,
                            isTemporary: wasTemporary
                        });
                    }
                }
            } else if (eleve.presence && eleve.presence.hasOwnProperty(entree.date)) {
                // Ancien format - fallback
                totalSessions++;
                if (!eleve.presence[entree.date]) {
                    absences++;
                    absenceDates.push({
                        date: entree.date,
                        scope: 'all',
                        isTemporary: false
                    });
                }
            }
        });

        return {
            totalSessions,
            absences,
            absenceDates: absenceDates.sort((a, b) => new Date(b.date) - new Date(a.date)) // Plus récent en premier
        };
    }

    /**
     * Afficher les détails d'assiduité d'un élève
     */
    showStudentAttendanceDetails(eleveId) {
        const classe = this.getSelectedClasse();
        if (!classe) return;
        
        const eleve = classe.eleves.find(e => e.id === eleveId);
        if (!eleve) return;
        
        const stats = this.getAttendanceStatsForStudent(eleve);
        const attendanceRate = stats.totalSessions > 0 ? ((stats.totalSessions - stats.absences) / stats.totalSessions * 100).toFixed(1) : 100;
        
        const modal = document.createElement('div');
        modal.className = 'modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <h3 class="text-lg font-semibold">État d'assiduité</h3>
                        <p class="text-sm text-gray-600">${escapeHtml(eleve.prenom)} ${escapeHtml(eleve.nom)}</p>
                    </div>
                    <button onclick="this.closest('.modal').remove()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="grid grid-cols-3 gap-4 mb-6">
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-blue-600">${stats.totalSessions}</div>
                        <div class="text-sm text-gray-600">Séances totales</div>
                    </div>
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-red-600">${stats.absences}</div>
                        <div class="text-sm text-gray-600">Absences</div>
                    </div>
                    <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-green-600">${attendanceRate}%</div>
                        <div class="text-sm text-gray-600">Taux de présence</div>
                    </div>
                </div>
                
                ${stats.absenceDates.length > 0 ? `
                    <div class="border-t border-gray-200 pt-4">
                        <h4 class="font-medium text-gray-800 mb-3 flex items-center">
                            <i class="fas fa-calendar-times text-red-600 mr-2"></i>
                            Détail des absences
                        </h4>
                        <div class="space-y-2 max-h-60 overflow-y-auto">
                            ${stats.absenceDates.map(absence => {
                                const formattedDate = new Date(absence.date).toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                });
                                const scopeLabel = absence.scope === 'all' ? 'Toute la classe' : absence.scope;
                                
                                return `
                                    <div class="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                                        <div class="flex items-center space-x-3">
                                            <i class="fas fa-calendar-times text-red-500"></i>
                                            <div>
                                                <div class="font-medium text-gray-800">${formattedDate}</div>
                                                <div class="text-sm text-gray-600">
                                                    ${scopeLabel}
                                                    ${absence.isTemporary ? '<span class="text-orange-600 ml-2"><i class="fas fa-exchange-alt mr-1"></i>Invité</span>' : ''}
                                                </div>
                                            </div>
                                        </div>
                                        <span class="text-xs text-red-600 font-medium">ABSENT</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : `
                    <div class="text-center py-8 text-green-600">
                        <i class="fas fa-check-circle text-4xl mb-2"></i>
                        <p class="font-medium">Aucune absence enregistrée</p>
                        <p class="text-sm text-gray-600">Cet élève a été présent à toutes les séances</p>
                    </div>
                `}
                
                <div class="flex justify-center pt-4 border-t border-gray-200 mt-4">
                    <button onclick="this.closest('.modal').remove()" class="btn-secondary px-6 py-2">
                        Fermer
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * Rendu des statistiques de groupes
     */
    renderGroupsStats(classe) {
        const groupe1Count = classe.eleves.filter(e => e.groupe === 'Groupe1').length;
        const groupe2Count = classe.eleves.filter(e => e.groupe === 'Groupe2').length;
        const sansGroupeCount = classe.eleves.filter(e => !e.groupe).length;

        return `
            <br>
            Groupe 1: ${groupe1Count} | Groupe 2: ${groupe2Count} | Sans groupe: ${sansGroupeCount}
        `;
    }

    /**
     * Rendu du modal élève
     */
    renderEleveModal() {
        return `
            <div id="eleve-modal" class="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
                <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 id="eleve-modal-title" class="text-lg font-semibold">Ajouter un élève</h3>
                        <button onclick="hideModal('eleve-modal')" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <form id="eleve-form" onsubmit="elevesModule.handleEleveSubmit(event)">
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label for="eleve-prenom" class="block text-sm font-medium text-gray-700 mb-2">
                                    Prénom *
                                </label>
                                <input type="text" id="eleve-prenom" name="prenom" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                       maxlength="${MAX_LENGTHS.ELEVE_PRENOM}">
                            </div>
                            <div>
                                <label for="eleve-nom" class="block text-sm font-medium text-gray-700 mb-2">
                                    Nom *
                                </label>
                                <input type="text" id="eleve-nom" name="nom" required 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                       maxlength="${MAX_LENGTHS.ELEVE_NOM}">
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <label for="eleve-groupe" class="block text-sm font-medium text-gray-700 mb-2">
                                Groupe
                            </label>
                            <select id="eleve-groupe" name="groupe" 
                                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Aucun groupe</option>
                                <option value="Groupe1">Groupe 1</option>
                                <option value="Groupe2">Groupe 2</option>
                            </select>
                        </div>
                        
                        <div class="mb-4">
                            <label for="eleve-commentaires" class="block text-sm font-medium text-gray-700 mb-2">
                                Commentaires
                            </label>
                            <textarea id="eleve-commentaires" name="commentaires" rows="3"
                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="Notes sur l'élève..."
                                      maxlength="${MAX_LENGTHS.COMMENTAIRE}"></textarea>
                        </div>
                        
                        <div class="flex justify-end space-x-3">
                            <button type="button" onclick="hideModal('eleve-modal')" 
                                    class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                                Annuler
                            </button>
                            <button type="submit" 
                                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                Enregistrer
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    /**
     * Configuration des event listeners
     */
    setupEventListeners() {
        // Sélecteur de classe
        document.getElementById('classe-selector').addEventListener('change', (e) => {
            this.selectClasse(e.target.value);
        });

        // Bouton ajouter élève
        document.getElementById('add-eleve-btn').addEventListener('click', () => {
            this.showAddEleveModal();
        });

        // Bouton génération groupes aléatoires
        document.getElementById('generate-groups-btn').addEventListener('click', () => {
            this.generateRandomGroups();
        });

        // Boutons de vue
        document.querySelectorAll('.eleves-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });
        
        // Barre de recherche d'élèves
        const searchInput = document.getElementById('student-search');
        const searchButton = document.getElementById('search-button');
        const clearSearchButton = document.getElementById('clear-search');
        
        if (searchInput) {
            // Recherche en temps réel lors de la saisie
            searchInput.addEventListener('input', (e) => {
                const value = searchInput.value.trim();
                
                // Recherche automatique (entrée ou champ vide)
                this.searchStudents(value);
                
                // Afficher/masquer le bouton d'effacement
                if (value !== '') {
                    clearSearchButton.classList.remove('hidden');
                    searchButton.classList.add('hidden');
                } else {
                    clearSearchButton.classList.add('hidden');
                    searchButton.classList.remove('hidden');
                }
            });
            
            // Recherche en appuyant sur Entrée (conservé pour compatibilité)
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.searchStudents(searchInput.value);
                }
            });
        }
        
        // Bouton de recherche
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                this.searchStudents(searchInput.value);
            });
        }
        
        // Bouton pour effacer la recherche
        if (clearSearchButton) {
            clearSearchButton.addEventListener('click', () => {
                searchInput.value = '';
                clearSearchButton.classList.add('hidden');
                searchButton.classList.remove('hidden');
                document.getElementById('search-info').classList.add('hidden');
                document.getElementById('classe-selector-container').classList.remove('hidden');
                document.getElementById('eleves-view-controls').classList.add('hidden');
                document.getElementById('eleves-controls').classList.add('hidden');
                document.getElementById('eleves-content').innerHTML = this.renderElevesPlaceholder();
                this.selectedClasseId = null;
                this.selectedNiveauId = null;
            });
        }
    }

    /**
     * Sélectionner une classe
     */
    selectClasse(value) {
        if (!value) {
            this.selectedClasseId = null;
            this.selectedNiveauId = null;
            document.getElementById('eleves-controls').classList.add('hidden');
            document.getElementById('eleves-view-controls').classList.add('hidden');
            document.getElementById('eleves-content').innerHTML = this.renderElevesPlaceholder();
            return;
        }

        const [niveauId, classeId] = value.split(':');
        this.selectedNiveauId = niveauId;
        this.selectedClasseId = classeId;
        
        document.getElementById('eleves-controls').classList.remove('hidden');
        document.getElementById('eleves-view-controls').classList.remove('hidden');
        document.getElementById('add-eleve-btn').disabled = false;
        document.getElementById('generate-groups-btn').disabled = false;
        
        this.updateElevesView();
    }

    /**
     * Changer de vue
     */
    switchView(view) {
        this.currentView = view;
        
        // Mise à jour des boutons
        document.querySelectorAll('.eleves-view-btn').forEach(btn => {
            if (btn.dataset.view === view) {
                btn.className = 'eleves-view-btn px-4 py-2 text-sm rounded bg-blue-100 text-blue-700';
            } else {
                btn.className = 'eleves-view-btn px-4 py-2 text-sm rounded text-gray-600 hover:bg-gray-100';
            }
        });

        this.updateElevesView();
    }

    /**
     * Mettre à jour la vue des élèves
     */
    updateElevesView() {
        document.getElementById('eleves-content').innerHTML = this.renderElevesList();
    }

    /**
     * Obtenir la classe sélectionnée
     */
    getSelectedClasse() {
        if (!this.selectedNiveauId || !this.selectedClasseId) return null;
        
        const niveau = this.dataManager.data.niveaux.find(n => n.id === this.selectedNiveauId);
        return niveau?.classes?.find(c => c.id === this.selectedClasseId);
    }

    /**
     * Afficher le modal d'ajout d'élève
     */
    showAddEleveModal() {
        this.currentEditingEleve = null;
        document.getElementById('eleve-modal-title').textContent = 'Ajouter un élève';
        clearForm('eleve-form');
        showModal('eleve-modal');
    }

    /**
     * Éditer un élève
     */
    editEleve(eleveId) {
        const classe = this.getSelectedClasse();
        const eleve = classe?.eleves?.find(e => e.id === eleveId);
        
        if (eleve) {
            this.currentEditingEleve = eleveId;
            document.getElementById('eleve-modal-title').textContent = 'Modifier l\'élève';
            document.getElementById('eleve-prenom').value = eleve.prenom || '';
            document.getElementById('eleve-nom').value = eleve.nom || '';
            document.getElementById('eleve-groupe').value = eleve.groupe || '';
            document.getElementById('eleve-commentaires').value = eleve.commentaires || '';
            showModal('eleve-modal');
        }
    }

    /**
     * Gestion de la soumission du formulaire élève
     */
    handleEleveSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        const eleveData = {
            prenom: formData.get('prenom').trim(),
            nom: formData.get('nom').trim(),
            groupe: formData.get('groupe') || null,
            commentaires: formData.get('commentaires').trim()
        };

        if (!eleveData.prenom || !eleveData.nom) {
            showToast('Le prénom et le nom sont requis', 'error');
            return;
        }

        if (this.currentEditingEleve) {
            this.updateEleve(this.currentEditingEleve, eleveData);
        } else {
            this.createEleve(eleveData);
        }

        hideModal('eleve-modal');
        this.updateElevesView();
    }

    /**
     * Créer un nouvel élève
     */
    createEleve(eleveData) {
        const classe = this.getSelectedClasse();
        if (!classe) return;

        const eleve = {
            id: this.dataManager.generateId('eleve'),
            ...eleveData,
            competences: {},
            presence: {}
        };

        if (!classe.eleves) classe.eleves = [];
        classe.eleves.push(eleve);
        
        this.dataManager.saveData();
        
        // Mettre à jour le dashboard
        if (this.schoolManager.updateDashboard) {
            this.schoolManager.updateDashboard();
        }
        
        showToast(SUCCESS_MESSAGES.CREATED, 'success');
    }

    /**
     * Mettre à jour un élève
     */
    updateEleve(eleveId, eleveData) {
        const classe = this.getSelectedClasse();
        const eleve = classe?.eleves?.find(e => e.id === eleveId);
        
        if (eleve) {
            Object.assign(eleve, eleveData);
            this.dataManager.saveData();
            
            // Mettre à jour le dashboard
            if (this.schoolManager.updateDashboard) {
                this.schoolManager.updateDashboard();
            }
            
            showToast(SUCCESS_MESSAGES.SAVED, 'success');
        }
    }

    /**
     * Supprimer un élève
     */
    deleteEleve(eleveId) {
        const classe = this.getSelectedClasse();
        if (!classe || !classe.eleves) return;

        const index = classe.eleves.findIndex(e => e.id === eleveId);
        if (index !== -1) {
            classe.eleves.splice(index, 1);
            this.dataManager.saveData();
            this.updateElevesView();
            
            // Mettre à jour le dashboard
            if (this.schoolManager.updateDashboard) {
                this.schoolManager.updateDashboard();
            }
            
            showToast(SUCCESS_MESSAGES.DELETED, 'success');
        }
    }

    /**
     * Générer des groupes par ordre alphabétique
     */
    generateRandomGroups() {
        const classe = this.getSelectedClasse();
        if (!classe || !classe.eleves || classe.eleves.length < 2) {
            showToast('Il faut au moins 2 élèves pour créer des groupes', 'error');
            return;
        }

        if (!confirm('Diviser la classe en deux groupes selon l\'ordre alphabétique ?')) {
            return;
        }

        // Trier les élèves par ordre alphabétique (nom puis prénom)
        const sortedStudents = [...classe.eleves].sort((a, b) => {
            const nameA = `${a.nom} ${a.prenom}`.toLowerCase();
            const nameB = `${b.nom} ${b.prenom}`.toLowerCase();
            return nameA.localeCompare(nameB, 'fr', { numeric: true, sensitivity: 'base' });
        });
        
        const half = Math.ceil(sortedStudents.length / 2);

        // Assigner aux groupes selon l'ordre alphabétique
        sortedStudents.forEach((eleve, index) => {
            eleve.groupe = index < half ? 'Groupe1' : 'Groupe2';
        });

        this.dataManager.saveData();
        this.updateElevesView();
        
        // Mettre à jour le dashboard
        if (this.schoolManager.updateDashboard) {
            this.schoolManager.updateDashboard();
        }
        
        showToast('Groupes créés par ordre alphabétique', 'success');
    }

    /**
     * Rechercher des élèves par nom ou prénom
     */
    searchStudents(query) {
        query = query.trim().toLowerCase();
        
        if (query === '') {
            // Si la recherche est vide, réinitialiser la vue
            document.getElementById('search-info').classList.add('hidden');
            document.getElementById('classe-selector-container').classList.remove('hidden');
            if (!this.selectedClasseId) {
                document.getElementById('eleves-view-controls').classList.add('hidden');
                document.getElementById('eleves-controls').classList.add('hidden');
                document.getElementById('eleves-content').innerHTML = this.renderElevesPlaceholder();
            } else {
                this.updateElevesView();
            }
            return;
        }
        
        // Rechercher les élèves dans toutes les classes
        const results = [];
        let classesWithResults = new Set();
        
        this.dataManager.data.niveaux.forEach(niveau => {
            if (niveau.classes) {
                niveau.classes.forEach(classe => {
                    if (classe.eleves && classe.eleves.length > 0) {
                        const matchingEleves = classe.eleves.filter(eleve => {
                            const fullName = `${eleve.prenom} ${eleve.nom}`.toLowerCase();
                            const reverseName = `${eleve.nom} ${eleve.prenom}`.toLowerCase();
                            return fullName.includes(query) || reverseName.includes(query);
                        });
                        
                        if (matchingEleves.length > 0) {
                            classesWithResults.add(`${niveau.nom} - ${classe.nom}`);
                            matchingEleves.forEach(eleve => {
                                results.push({
                                    eleve: eleve,
                                    classe: classe,
                                    niveau: niveau
                                });
                            });
                        }
                    }
                });
            }
        });
        
        // Afficher les résultats
        document.getElementById('search-info').classList.remove('hidden');
        document.getElementById('search-results-count').textContent = 
            `${results.length} élève(s) trouvé(s) dans ${classesWithResults.size} classe(s)`;
        
        document.getElementById('classe-selector-container').classList.add('hidden');
        document.getElementById('eleves-view-controls').classList.add('hidden');
        document.getElementById('eleves-controls').classList.add('hidden');
        
        if (results.length === 0) {
            document.getElementById('eleves-content').innerHTML = `
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-search text-4xl mb-4"></i>
                    <p class="text-lg">Aucun élève trouvé pour "${escapeHtml(query)}"</p>
                    <p>Essayez avec un autre terme de recherche</p>
                </div>
            `;
        } else {
            document.getElementById('eleves-content').innerHTML = this.renderSearchResults(results, query);
        }
    }
    
    /**
     * Rendu des résultats de recherche
     */
    renderSearchResults(results, query) {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${results.map(result => {
                    const { eleve, classe, niveau } = result;
                    const attendanceStats = this.getAttendanceStatsForStudent(eleve, classe);
                    const attendanceRate = attendanceStats.totalSessions > 0 ? 
                        ((attendanceStats.totalSessions - attendanceStats.absences) / attendanceStats.totalSessions * 100).toFixed(1) : 100;
                    
                    return `
                        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div class="flex justify-between items-start mb-3">
                                <div class="flex items-center space-x-3">
                                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <i class="fas fa-user text-blue-600"></i>
                                    </div>
                                    <div>
                                        <h4 class="font-semibold text-gray-800">
                                            ${escapeHtml(eleve.prenom)} ${escapeHtml(eleve.nom)}
                                        </h4>
                                        <p class="text-sm text-gray-500">
                                            ${eleve.groupe ? `<span class="bg-${eleve.groupe === 'Groupe1' ? 'green' : 'blue'}-100 text-${eleve.groupe === 'Groupe1' ? 'green' : 'blue'}-800 px-2 py-1 rounded-full text-xs">${eleve.groupe}</span>` : '<span class="text-gray-400">Aucun groupe</span>'}
                                        </p>
                                    </div>
                                </div>
                                <div class="flex space-x-1">
                                    <button onclick="elevesModule.showStudentAttendanceDetails('${eleve.id}', '${classe.id}', '${niveau.id}')" 
                                            class="text-green-600 hover:text-green-800 p-1" title="Voir les absences">
                                        <i class="fas fa-calendar-check"></i>
                                    </button>
                                    <button onclick="elevesModule.editEleve('${eleve.id}', '${classe.id}', '${niveau.id}')" 
                                            class="text-blue-600 hover:text-blue-800 p-1">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Informations sur la classe -->
                            <div class="bg-blue-50 border border-blue-200 rounded p-2 mb-3">
                                <div class="text-sm text-blue-700">
                                    <i class="fas fa-school mr-1"></i>
                                    ${escapeHtml(niveau.nom)} - ${escapeHtml(classe.nom)}
                                </div>
                            </div>
                            
                            <!-- Statistiques d'assiduité -->
                            <div class="bg-gray-50 border border-gray-200 rounded p-3 mb-3">
                                <div class="flex items-center justify-between mb-2">
                                    <span class="text-sm font-medium text-gray-700">
                                        <i class="fas fa-chart-line mr-1"></i>
                                        Assiduité
                                    </span>
                                    <span class="text-sm font-bold ${
                                        attendanceRate >= 90 ? 'text-green-600' : 
                                        attendanceRate >= 75 ? 'text-orange-600' : 'text-red-600'
                                    }">
                                        ${attendanceRate}%
                                    </span>
                                </div>
                                <div class="grid grid-cols-3 gap-2 text-center text-xs">
                                    <div>
                                        <div class="font-medium text-blue-600">${attendanceStats.totalSessions}</div>
                                        <div class="text-gray-500">Séances</div>
                                    </div>
                                    <div>
                                        <div class="font-medium text-red-600">${attendanceStats.absences}</div>
                                        <div class="text-gray-500">Absences</div>
                                    </div>
                                    <div>
                                        <div class="font-medium text-green-600">${attendanceStats.totalSessions - attendanceStats.absences}</div>
                                        <div class="text-gray-500">Présences</div>
                                    </div>
                                </div>
                                ${attendanceStats.absenceDates.length > 0 ? `
                                    <div class="mt-2 pt-2 border-t border-gray-300">
                                        <div class="text-xs text-red-600">
                                            <i class="fas fa-exclamation-triangle mr-1"></i>
                                            Dernière absence: ${new Date(attendanceStats.absenceDates[0].date).toLocaleDateString('fr-FR')}
                                        </div>
                                    </div>
                                ` : `
                                    <div class="mt-2 pt-2 border-t border-gray-300">
                                        <div class="text-xs text-green-600">
                                            <i class="fas fa-check-circle mr-1"></i>
                                            Aucune absence
                                        </div>
                                    </div>
                                `}
                            </div>
                            
                            ${eleve.commentaires ? `
                                <div class="bg-gray-50 p-2 rounded text-sm text-gray-600">
                                    <i class="fas fa-comment-alt mr-1"></i>
                                    ${truncateText(escapeHtml(eleve.commentaires), 50)}
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div class="mt-6 text-center text-sm text-gray-500">
                Total: ${results.length} élève(s)
            </div>
        `;
    }
    
    /**
     * Obtenir les statistiques d'assiduité pour un élève (version pour recherche)
     */
    getAttendanceStatsForStudent(eleve, specificClasse = null) {
        const classe = specificClasse || this.getSelectedClasse();
        if (!classe || !classe.cahierJournal) {
            return { totalSessions: 0, absences: 0, absenceDates: [] };
        }

        let totalSessions = 0;
        let absences = 0;
        let absenceDates = [];

        // Parcourir toutes les entrées du cahier journal
        classe.cahierJournal.forEach(entree => {
            if (entree.attendance) {
                // Nouveau format avec scope
                const { scope, data, temporaryStudents } = entree.attendance;
                
                // Vérifier si l'élève était dans le scope principal
                const wasInMainScope = data.hasOwnProperty(eleve.id);
                
                // Vérifier si l'élève était temporaire pour cette séance
                const wasTemporary = temporaryStudents && temporaryStudents.hasOwnProperty(eleve.id);
                
                if (wasInMainScope || wasTemporary) {
                    totalSessions++;
                    
                    let wasPresent = false;
                    if (wasInMainScope) {
                        wasPresent = data[eleve.id];
                    } else if (wasTemporary) {
                        wasPresent = temporaryStudents[eleve.id].present;
                    }
                    
                    if (!wasPresent) {
                        absences++;
                        absenceDates.push({
                            date: entree.date,
                            scope: scope,
                            isTemporary: wasTemporary
                        });
                    }
                }
            } else if (eleve.presence && eleve.presence.hasOwnProperty(entree.date)) {
                // Ancien format - fallback
                totalSessions++;
                if (!eleve.presence[entree.date]) {
                    absences++;
                    absenceDates.push({
                        date: entree.date,
                        scope: 'all',
                        isTemporary: false
                    });
                }
            }
        });

        return {
            totalSessions,
            absences,
            absenceDates: absenceDates.sort((a, b) => new Date(b.date) - new Date(a.date)) // Plus récent en premier
        };
    }
    
    /**
     * Afficher les détails d'assiduité d'un élève (pour résultats de recherche)
     */
    showStudentAttendanceDetails(eleveId, classeId = null, niveauId = null) {
        // Si classeId et niveauId sont fournis, c'est un élève trouvé via recherche
        let classe = this.getSelectedClasse();
        let eleve = null;
        
        if (classeId && niveauId) {
            const niveau = this.dataManager.data.niveaux.find(n => n.id === niveauId);
            if (niveau) {
                classe = niveau.classes.find(c => c.id === classeId);
            }
        }
        
        if (!classe) return;
        
        eleve = classe.eleves.find(e => e.id === eleveId);
        if (!eleve) return;
        
        const stats = this.getAttendanceStatsForStudent(eleve, classe);
        const attendanceRate = stats.totalSessions > 0 ? ((stats.totalSessions - stats.absences) / stats.totalSessions * 100).toFixed(1) : 100;
        
        const modal = document.createElement('div');
        modal.className = 'modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <h3 class="text-lg font-semibold">État d'assiduité</h3>
                        <p class="text-sm text-gray-600">${escapeHtml(eleve.prenom)} ${escapeHtml(eleve.nom)}</p>
                    </div>
                    <button onclick="this.closest('.modal').remove()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="grid grid-cols-3 gap-4 mb-6">
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-blue-600">${stats.totalSessions}</div>
                        <div class="text-sm text-gray-600">Séances totales</div>
                    </div>
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-red-600">${stats.absences}</div>
                        <div class="text-sm text-gray-600">Absences</div>
                    </div>
                    <div class="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <div class="text-2xl font-bold text-green-600">${attendanceRate}%</div>
                        <div class="text-sm text-gray-600">Taux de présence</div>
                    </div>
                </div>
                
                ${stats.absenceDates.length > 0 ? `
                    <div class="border-t border-gray-200 pt-4">
                        <h4 class="font-medium text-gray-800 mb-3 flex items-center">
                            <i class="fas fa-calendar-times text-red-600 mr-2"></i>
                            Détail des absences
                        </h4>
                        <div class="space-y-2 max-h-60 overflow-y-auto">
                            ${stats.absenceDates.map(absence => {
                                const formattedDate = new Date(absence.date).toLocaleDateString('fr-FR', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                });
                                const scopeLabel = absence.scope === 'all' ? 'Toute la classe' : absence.scope;
                                
                                return `
                                    <div class="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                                        <div class="flex items-center space-x-3">
                                            <i class="fas fa-calendar-times text-red-500"></i>
                                            <div>
                                                <div class="font-medium text-gray-800">${formattedDate}</div>
                                                <div class="text-sm text-gray-600">
                                                    ${scopeLabel}
                                                    ${absence.isTemporary ? '<span class="text-orange-600 ml-2"><i class="fas fa-exchange-alt mr-1"></i>Invité</span>' : ''}
                                                </div>
                                            </div>
                                        </div>
                                        <span class="text-xs text-red-600 font-medium">ABSENT</span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                ` : `
                    <div class="text-center py-8 text-green-600">
                        <i class="fas fa-check-circle text-4xl mb-2"></i>
                        <p class="font-medium">Aucune absence enregistrée</p>
                        <p class="text-sm text-gray-600">Cet élève a été présent à toutes les séances</p>
                    </div>
                `}
                
                <div class="flex justify-center pt-4 border-t border-gray-200 mt-4">
                    <button onclick="this.closest('.modal').remove()" class="btn-secondary px-6 py-2">
                        Fermer
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    /**
     * Éditer un élève (version pour résultats de recherche)
     */
    editEleve(eleveId, classeId = null, niveauId = null) {
        // Si classeId et niveauId sont fournis, sélectionner d'abord la classe
        if (classeId && niveauId) {
            this.selectedNiveauId = niveauId;
            this.selectedClasseId = classeId;
            
            // Mettre à jour le sélecteur de classe
            const classeSelector = document.getElementById('classe-selector');
            if (classeSelector) {
                classeSelector.value = `${niveauId}:${classeId}`;
            }
            
            document.getElementById('classe-selector-container').classList.remove('hidden');
            document.getElementById('search-info').classList.add('hidden');
            document.getElementById('eleves-controls').classList.remove('hidden');
            document.getElementById('eleves-view-controls').classList.remove('hidden');
            document.getElementById('add-eleve-btn').disabled = false;
            document.getElementById('generate-groups-btn').disabled = false;
            
            this.updateElevesView();
        }
        
        const classe = this.getSelectedClasse();
        const eleve = classe?.eleves?.find(e => e.id === eleveId);
        
        if (eleve) {
            this.currentEditingEleve = eleveId;
            document.getElementById('eleve-modal-title').textContent = 'Modifier l\'élève';
            document.getElementById('eleve-prenom').value = eleve.prenom || '';
            document.getElementById('eleve-nom').value = eleve.nom || '';
            document.getElementById('eleve-groupe').value = eleve.groupe || '';
            document.getElementById('eleve-commentaires').value = eleve.commentaires || '';
            showModal('eleve-modal');
        }
    }
}