/**
 * Module Cahier Journal - Gestion du cahier journal électronique
 */
class CahierModule {
    constructor(dataManager, schoolManager) {
        this.dataManager = dataManager;
        this.schoolManager = schoolManager;
        this.selectedClasseId = null;
        this.selectedNiveauId = null;
        this.currentView = VIEWS.CAHIER.LISTE;
        this.currentEditingEntree = null;
        this.searchTerm = '';
    }

    /**
     * Rendu de la section cahier journal
     */
    render() {
        const section = document.getElementById('cahier-section');
        section.innerHTML = `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">Cahier Journal</h2>
                </div>
                
                <!-- Étape 1: Sélection du niveau -->
                <div class="mb-6">
                    <label for="cahier-niveau-selector" class="block text-sm font-medium text-gray-700 mb-2">
                        1. Sélectionner le niveau
                    </label>
                    <select id="cahier-niveau-selector" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Choisir un niveau</option>
                        ${this.renderNiveauOptions()}
                    </select>
                </div>

                <!-- Étape 2: Sélection de la classe (masquée par défaut) -->
                <div id="classe-selection-container" class="hidden mb-6">
                    <label for="cahier-classe-selector" class="block text-sm font-medium text-gray-700 mb-2">
                        2. Sélectionner la classe
                    </label>
                    <select id="cahier-classe-selector" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Choisir une classe</option>
                    </select>
                </div>

                <!-- Contrôles du cahier (masqués par défaut) -->
                <div id="cahier-controls" class="hidden mb-6 space-y-4">
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <i class="fas fa-info-circle text-blue-600"></i>
                                <div>
                                    <h3 class="font-medium text-blue-800">Nouvelle entrée de cahier journal</h3>
                                    <p class="text-sm text-blue-700">Cette entrée comprendra les informations de la séance ET la prise de présence</p>
                                </div>
                            </div>
                            <button id="add-entree-btn" 
                                    class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-medium">
                                <i class="fas fa-plus"></i>
                                <span>Nouvelle entrée complète</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="flex flex-wrap gap-3 items-center">
                        <div class="flex-1 min-w-64">
                            <input type="text" id="cahier-search" placeholder="Rechercher dans les entrées..."
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div class="flex gap-2">
                            <button class="cahier-view-btn px-4 py-2 text-sm rounded bg-blue-100 text-blue-700" data-view="liste">
                                Liste
                            </button>
                        </div>
                    </div>
                </div>
                
                <div id="cahier-content">
                    ${this.renderCahierPlaceholder()}
                </div>
            </div>
            
            ${this.renderEntreeModal()}
        `;
        
        this.setupEventListeners();
    }

    /**
     * Rendu des options de niveaux
     */
    renderNiveauOptions() {
        return this.dataManager.data.niveaux.map(niveau => 
            `<option value="${niveau.id}">${niveau.nom}</option>`
        ).join('');
    }

    /**
     * Rendu des options de classes pour un niveau donné
     */
    renderClasseOptionsForNiveau(niveauId) {
        const niveau = this.dataManager.data.niveaux.find(n => n.id === niveauId);
        if (!niveau || !niveau.classes) return '';
        
        return niveau.classes.map(classe => 
            `<option value="${classe.id}">${classe.nom}</option>`
        ).join('');
    }

    /**
     * Rendu des options de classes (méthode héritée pour compatibilité)
     */
    renderClasseOptions() {
        return this.dataManager.data.niveaux.map(niveau => 
            niveau.classes?.map(classe => 
                `<option value="${niveau.id}:${classe.id}">${niveau.nom} - ${classe.nom}</option>`
            ).join('') || ''
        ).join('');
    }

    /**
     * Rendu du placeholder
     */
    renderCahierPlaceholder() {
        return `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-book text-4xl mb-4"></i>
                <p class="text-lg">Sélectionnez un niveau puis une classe</p>
                <p>Vous pourrez ensuite créer des entrées de cahier journal avec prise de présence intégrée</p>
            </div>
        `;
    }

    /**
     * Rendu des entrées du cahier avec informations de présence
     */
    renderEntreesList() {
        const classe = this.getSelectedClasse();
        if (!classe || !classe.cahierJournal || classe.cahierJournal.length === 0) {
            return `
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-calendar-plus text-4xl mb-4"></i>
                    <p class="text-lg">Aucune entrée dans le cahier</p>
                    <p>Commencez par ajouter une entrée complète (séance + présence)</p>
                </div>
            `;
        }

        let entries = classe.cahierJournal;
        
        // Filtrer par recherche
        if (this.searchTerm) {
            entries = entries.filter(entree => 
                entree.objectifs?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                entree.activites?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                entree.observations?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                entree.matieres?.some(m => m.toLowerCase().includes(this.searchTerm.toLowerCase()))
            );
        }

        // Trier par date décroissante
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (entries.length === 0) {
            return `
                <div class="text-center py-8 text-gray-500">
                    <p>Aucune entrée ne correspond à votre recherche</p>
                </div>
            `;
        }

        return `
            <div class="space-y-4">
                ${entries.map(entree => {
                    // Calculer les statistiques de présence pour cette date
                    const attendanceStats = this.getAttendanceStatsForDate(entree.date);
                    
                    return `
                        <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div class="flex justify-between items-start mb-3">
                                <div class="flex items-center space-x-3">
                                    <div class="text-lg font-semibold text-blue-600">
                                        ${this.dataManager.formatDate(entree.date)}
                                    </div>
                                    ${entree.horaires ? `
                                        <span class="text-sm text-gray-500">
                                            ${escapeHtml(entree.horaires)}
                                        </span>
                                    ` : ''}
                                    
                                    <!-- Indicateur de présence -->
                                    <div class="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded">
                                        <i class="fas fa-users text-gray-600 text-xs"></i>
                                        <span class="text-xs text-green-600 font-medium">${attendanceStats.present}</span>
                                        <span class="text-xs text-gray-500">/</span>
                                        <span class="text-xs text-gray-600">${attendanceStats.total}</span>
                                        <span class="text-xs text-gray-500">présents</span>
                                    </div>
                                </div>
                                <div class="flex space-x-2">
                                    <button onclick="cahierModule.viewAttendanceDetails('${entree.date}')" 
                                            class="text-green-600 hover:text-green-800 p-1" title="Voir les présences">
                                        <i class="fas fa-calendar-check"></i>
                                    </button>
                                    <button onclick="cahierModule.editEntree('${entree.id}')" 
                                            class="text-blue-600 hover:text-blue-800 p-1" title="Modifier">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="confirmAction('Supprimer cette entrée ?', () => cahierModule.deleteEntree('${entree.id}'))" 
                                            class="text-red-600 hover:text-red-800 p-1" title="Supprimer">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            
                            ${entree.matieres && entree.matieres.length > 0 ? `
                                <div class="flex flex-wrap gap-1 mb-3">
                                    ${entree.matieres.map(matiere => `
                                        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                            ${escapeHtml(matiere)}
                                        </span>
                                    `).join('')}
                                </div>
                            ` : ''}
                            
                            <div class="space-y-2 text-sm">
                                ${entree.objectifs ? `
                                    <div>
                                        <span class="font-medium text-green-700">Objectifs:</span>
                                        <p class="text-gray-700">${escapeHtml(entree.objectifs)}</p>
                                    </div>
                                ` : ''}
                                
                                ${entree.activites ? `
                                    <div>
                                        <span class="font-medium text-blue-700">Activités:</span>
                                        <p class="text-gray-700">${escapeHtml(entree.activites)}</p>
                                    </div>
                                ` : ''}
                                
                                ${entree.observations ? `
                                    <div>
                                        <span class="font-medium text-orange-700">Observations:</span>
                                        <p class="text-gray-700">${escapeHtml(entree.observations)}</p>
                                    </div>
                                ` : ''}
                                
                                ${entree.liens ? `
                                    <div>
                                        <span class="font-medium text-purple-700">Ressources:</span>
                                        <p class="text-gray-700">${escapeHtml(entree.liens)}</p>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div class="mt-6 text-center text-sm text-gray-500">
                Total: ${entries.length} entrée(s)
                ${this.searchTerm ? ` (filtré par "${this.searchTerm}")` : ''}
            </div>
        `;
    }
    
    /**
     * Obtenir les statistiques de présence pour une date donnée
     */
    getAttendanceStatsForDate(date) {
        const classe = this.getSelectedClasse();
        if (!classe || !classe.eleves) {
            return { present: 0, absent: 0, total: 0 };
        }
        
        // Vérifier s'il y a des données d'assiduité dans le nouveau format
        const entree = classe.cahierJournal?.find(e => e.date === date);
        if (entree && entree.attendance) {
            const { data, temporaryStudents } = entree.attendance;
            
            // Compter les élèves du scope principal
            const scopePresent = Object.values(data).filter(isPresent => isPresent).length;
            const scopeTotal = Object.keys(data).length;
            
            // Compter les élèves temporaires
            const tempPresent = temporaryStudents ? Object.values(temporaryStudents).filter(temp => temp.present).length : 0;
            const tempTotal = temporaryStudents ? Object.keys(temporaryStudents).length : 0;
            
            // Totaux combinés
            const present = scopePresent + tempPresent;
            const total = scopeTotal + tempTotal;
            const absent = total - present;
            
            return { present, absent, total };
        }
        
        // Fallback vers l'ancien format
        const present = classe.eleves.filter(e => e.presence?.[date]).length;
        const total = classe.eleves.length;
        const absent = total - present;
        
        return { present, absent, total };
    }
    
    /**
     * Afficher les détails de présence pour une date
     */
    viewAttendanceDetails(date) {
        const classe = this.getSelectedClasse();
        if (!classe || !classe.eleves) return;
        
        // Récupérer les données d'assiduité selon le nouveau format
        const entree = classe.cahierJournal?.find(e => e.date === date);
        let presents = [];
        let absents = [];
        let scopeLabel = "Toute la classe";
        let temporaryStudents = {};
        
        if (entree && entree.attendance) {
            // Nouveau format avec scope
            const { scope, data, temporaryStudents: tempStudents } = entree.attendance;
            scopeLabel = scope === 'all' ? 'Toute la classe' : scope;
            temporaryStudents = tempStudents || {};
            
            // Filtrer les élèves selon les données enregistrées
            Object.entries(data).forEach(([eleveId, isPresent]) => {
                const eleve = classe.eleves.find(e => e.id === eleveId);
                if (eleve) {
                    if (isPresent) {
                        presents.push(eleve);
                    } else {
                        absents.push(eleve);
                    }
                }
            });
            
            // Ajouter les élèves temporaires
            if (temporaryStudents) {
                Object.entries(temporaryStudents).forEach(([eleveId, tempData]) => {
                    const eleve = classe.eleves.find(e => e.id === eleveId);
                    if (eleve) {
                        // Marquer comme temporaire
                        const tempEleve = { ...eleve, isTemporary: true, originalGroup: tempData.originalGroup };
                        if (tempData.present) {
                            presents.push(tempEleve);
                        } else {
                            absents.push(tempEleve);
                        }
                    }
                });
            }
        } else {
            // Fallback vers l'ancien format
            presents = classe.eleves.filter(e => e.presence?.[date]);
            absents = classe.eleves.filter(e => !e.presence?.[date]);
        }
        
        const stats = { 
            present: presents.length, 
            absent: absents.length, 
            total: presents.length + absents.length 
        };
        
        const modal = document.createElement('div');
        modal.className = 'modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <h3 class="text-lg font-semibold">Détails de l'assiduité</h3>
                        <p class="text-sm text-gray-600">${this.dataManager.formatDate(date)} - ${scopeLabel}</p>
                    </div>
                    <button onclick="this.closest('.modal').remove()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-blue-800">
                            <i class="fas fa-users mr-1"></i>
                            Groupe concerné: <strong>${scopeLabel}</strong>
                        </span>
                        <span class="text-sm text-blue-700">
                            ${stats.present} présents / ${stats.total} élèves concernés
                        </span>
                    </div>
                    ${Object.keys(temporaryStudents || {}).length > 0 ? `
                        <div class="mt-2 pt-2 border-t border-blue-200">
                            <span class="text-xs text-orange-700">
                                <i class="fas fa-user-plus mr-1"></i>
                                + ${Object.keys(temporaryStudents).length} élève(s) temporaire(s) ajouté(s)
                            </span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 class="font-medium text-green-800 mb-3 flex items-center">
                            <i class="fas fa-check-circle text-green-600 mr-2"></i>
                            Présents (${stats.present})
                        </h4>
                        <div class="space-y-2">
                            ${presents.map(eleve => `
                                <div class="flex items-center space-x-2">
                                    <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span class="text-sm">${escapeHtml(eleve.prenom)} ${escapeHtml(eleve.nom)}</span>
                                    ${eleve.isTemporary 
                                        ? `<span class="text-xs text-orange-600 ml-auto"><i class="fas fa-exchange-alt mr-1"></i>Invité (${eleve.originalGroup})</span>` 
                                        : (eleve.groupe ? `<span class="text-xs text-blue-600 ml-auto">${eleve.groupe}</span>` : '')
                                    }
                                </div>
                            `).join('')}
                            ${presents.length === 0 ? '<p class="text-sm text-gray-500 italic">Aucun élève présent</p>' : ''}
                        </div>
                    </div>
                    
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 class="font-medium text-red-800 mb-3 flex items-center">
                            <i class="fas fa-times-circle text-red-600 mr-2"></i>
                            Absents (${stats.absent})
                        </h4>
                        <div class="space-y-2">
                            ${absents.map(eleve => `
                                <div class="flex items-center space-x-2">
                                    <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span class="text-sm">${escapeHtml(eleve.prenom)} ${escapeHtml(eleve.nom)}</span>
                                    ${eleve.isTemporary 
                                        ? `<span class="text-xs text-orange-600 ml-auto"><i class="fas fa-exchange-alt mr-1"></i>Invité (${eleve.originalGroup})</span>` 
                                        : (eleve.groupe ? `<span class="text-xs text-blue-600 ml-auto">${eleve.groupe}</span>` : '')
                                    }
                                </div>
                            `).join('')}
                            ${absents.length === 0 ? '<p class="text-sm text-gray-500 italic">Aucun élève absent</p>' : ''}
                        </div>
                    </div>
                </div>
                
                <div class="mt-4 text-center">
                    <button onclick="this.closest('.modal').remove()" class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                        Fermer
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    /**
     * Rendu du modal d'entrée avec prise de présence intégrée
     */
    renderEntreeModal() {
        // Récupérer les matières de l'enseignant
        const userMatieres = this.dataManager.data.matieres || [];
        const competencesPersonnalisees = this.dataManager.data.competencesPersonnalisees || {};
        
        // Si aucune matière définie (onboarding non fait), utiliser toutes les matières
        const matieresToShow = userMatieres.length > 0 ? userMatieres : MATIERES;
        
        return `
            <div id="entree-modal" class="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden overflow-y-auto">
                <div class="bg-white rounded-lg p-6 w-full max-w-5xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-6">
                        <h3 id="entree-modal-title" class="text-xl font-semibold text-gray-800">Nouvelle entrée complète</h3>
                        <button onclick="hideModal('entree-modal')" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <form id="entree-form" onsubmit="cahierModule.handleEntreeSubmit(event)">
                        <!-- Section 1: Informations de la séance -->
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h4 class="text-lg font-medium text-blue-800 mb-4 flex items-center">
                                <i class="fas fa-chalkboard-teacher text-blue-600 mr-2"></i>
                                1. Informations de la séance
                            </h4>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label for="entree-date" class="block text-sm font-medium text-gray-700 mb-2">
                                        Date *
                                    </label>
                                    <input type="date" id="entree-date" name="date" required 
                                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                           value="${new Date().toISOString().split('T')[0]}">
                                </div>
                                <div>
                                    <label for="entree-horaires" class="block text-sm font-medium text-gray-700 mb-2">
                                        Horaires *
                                    </label>
                                    <input type="text" id="entree-horaires" name="horaires" required
                                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                           placeholder="Ex: 8h30-12h, 13h30-16h">
                                </div>
                            </div>
                            
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                    ${userMatieres.length > 0 ? 'Vos matières' : 'Matières concernées'}
                                </label>
                                ${userMatieres.length === 0 ? `
                                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                                        <div class="flex items-start space-x-2">
                                            <i class="fas fa-info-circle text-yellow-600 mt-0.5"></i>
                                            <div>
                                                <p class="text-sm text-yellow-800 font-medium">Configuration incomplète</p>
                                                <p class="text-xs text-yellow-700">Vous n'avez pas encore sélectionné vos matières. Vous pouvez les configurer dans les paramètres.</p>
                                            </div>
                                        </div>
                                    </div>
                                ` : ''}
                                <div class="grid grid-cols-2 gap-2">
                                    ${matieresToShow.map(matiere => `
                                        <label class="flex items-center space-x-2">
                                            <input type="checkbox" name="matieres" value="${matiere}"
                                                   class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                                            <span class="text-sm">${matiere}</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                            
                            ${Object.keys(competencesPersonnalisees).length > 0 ? `
                                <div class="mb-4">
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        Compétences concernées (optionnel)
                                    </label>
                                    <div class="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                                        ${Object.keys(competencesPersonnalisees).map(matiere => {
                                            const domaines = competencesPersonnalisees[matiere];
                                            return `
                                                <div class="mb-3">
                                                    <h4 class="font-medium text-gray-800 text-sm mb-2 flex items-center">
                                                        <i class="fas fa-book text-blue-600 mr-1 text-xs"></i>
                                                        ${matiere}
                                                    </h4>
                                                    ${Object.keys(domaines).map(domaine => {
                                                        const competences = domaines[domaine];
                                                        if (!Array.isArray(competences) || competences.length === 0) return '';
                                                        return `
                                                            <div class="ml-4 mb-2">
                                                                <h5 class="text-xs font-medium text-gray-700 mb-1">
                                                                    <i class="fas fa-folder text-orange-500 mr-1"></i>
                                                                    ${domaine}
                                                                </h5>
                                                                <div class="ml-4 space-y-1">
                                                                    ${competences.map(comp => `
                                                                        <label class="flex items-center space-x-2">
                                                                            <input type="checkbox" name="competences" value="${comp.id}"
                                                                                   class="rounded border-gray-300 text-green-600 focus:ring-green-500 text-xs">
                                                                            <span class="text-xs text-gray-700">${comp.nom}</span>
                                                                        </label>
                                                                    `).join('')}
                                                                </div>
                                                            </div>
                                                        `;
                                                    }).join('')}
                                                </div>
                                            `;
                                        }).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="mb-4">
                                <label for="entree-objectifs" class="block text-sm font-medium text-gray-700 mb-2">
                                    Objectifs *
                                </label>
                                <textarea id="entree-objectifs" name="objectifs" rows="3" required
                                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          placeholder="Objectifs pédagogiques de la séance..."
                                          maxlength="${MAX_LENGTHS.OBJECTIFS}"></textarea>
                            </div>
                            
                            <div class="mb-4">
                                <label for="entree-activites" class="block text-sm font-medium text-gray-700 mb-2">
                                    Activités *
                                </label>
                                <textarea id="entree-activites" name="activites" rows="4" required
                                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          placeholder="Description des activités menées..."
                                          maxlength="${MAX_LENGTHS.ACTIVITES}"></textarea>
                            </div>
                            
                            <div class="mb-4">
                                <label for="entree-observations" class="block text-sm font-medium text-gray-700 mb-2">
                                    Observations
                                </label>
                                <textarea id="entree-observations" name="observations" rows="2"
                                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          placeholder="Remarques, difficultés rencontrées..."
                                          maxlength="${MAX_LENGTHS.OBSERVATIONS}"></textarea>
                            </div>
                            
                            <div class="mb-4">
                                <label for="entree-liens" class="block text-sm font-medium text-gray-700 mb-2">
                                    Ressources et liens
                                </label>
                                <textarea id="entree-liens" name="liens" rows="2"
                                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          placeholder="Liens vers des ressources, documents utilisés..."></textarea>
                            </div>
                        </div>
                        
                        <!-- Section 2: Prise de présence -->
                        <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <h4 class="text-lg font-medium text-green-800 mb-4 flex items-center">
                                <i class="fas fa-calendar-check text-green-600 mr-2"></i>
                                2. Prise de présence
                            </h4>
                            
                            <div class="mb-4">
                                <div class="flex items-center justify-between mb-3">
                                    <div class="flex items-center space-x-3">
                                        <span class="text-sm font-medium text-gray-700">Date de présence:</span>
                                        <span id="attendance-date-display" class="text-sm text-green-700 font-medium">-</span>
                                    </div>
                                    <div class="flex items-center space-x-4">
                                        <button type="button" id="mark-all-present" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
                                            <i class="fas fa-check-double mr-1"></i>
                                            Tous présents
                                        </button>
                                        <button type="button" id="mark-all-absent" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
                                            <i class="fas fa-times-circle mr-1"></i>
                                            Tous absents
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Sélecteur de groupe -->
                                <div id="group-filter-container" class="mb-4 hidden">
                                    <div class="bg-white border border-gray-200 rounded-lg p-3">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center space-x-3">
                                                <i class="fas fa-filter text-purple-600 text-lg"></i>
                                                <div>
                                                    <h5 class="font-medium text-gray-800">Filtre par groupe</h5>
                                                    <p class="text-sm text-gray-600">Sélectionnez le groupe pour la prise de présence</p>
                                                </div>
                                            </div>
                                            <div class="flex items-center space-x-2">
                                                <label for="attendance-group-selector" class="text-sm font-medium text-gray-700">Afficher :</label>
                                                <select id="attendance-group-selector" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                                                    <option value="all">Toute la classe</option>
                                                    <!-- Les options de groupe seront ajoutées dynamiquement -->
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="bg-green-100 border border-green-300 rounded p-3 mb-4">
                                    <p class="text-sm text-green-700">
                                        <i class="fas fa-info-circle mr-1"></i>
                                        Cliquez sur chaque élève pour marquer sa présence ou son absence. La date de présence correspond automatiquement à la date de la séance.
                                    </p>
                                </div>
                                
                                <div id="attendance-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    <!-- Les élèves seront affichés ici dynamiquement -->
                                </div>
                                
                                <div id="attendance-stats" class="mt-4 bg-gray-50 border border-gray-200 rounded p-3 text-center">
                                    <div class="flex justify-center items-center space-x-6 text-sm">
                                        <div class="flex items-center space-x-2">
                                            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <span class="text-green-700">Présents: <span id="present-count">0</span></span>
                                        </div>
                                        <div class="flex items-center space-x-2">
                                            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                                            <span class="text-red-700">Absents: <span id="absent-count">0</span></span>
                                        </div>
                                        <div class="flex items-center space-x-2">
                                            <div class="w-3 h-3 bg-gray-500 rounded-full"></div>
                                            <span class="text-gray-700">Total: <span id="total-count">0</span></span>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Section 3: Élèves temporaires -->
                                <div id="temporary-students-section" class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <h5 class="text-md font-medium text-yellow-800 mb-3 flex items-center">
                                        <i class="fas fa-user-plus text-yellow-600 mr-2"></i>
                                        Élèves temporaires pour cette séance
                                    </h5>
                                    <p class="text-sm text-yellow-700 mb-3">
                                        Ajoutez des élèves d'autres groupes qui participent exceptionnellement à cette séance.
                                    </p>
                                    
                                    <div class="flex items-center space-x-3 mb-4">
                                        <select id="temporary-student-selector" class="flex-1 px-3 py-2 border border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500">
                                            <option value="">Sélectionnez un élève d'un autre groupe...</option>
                                            <!-- Les options seront ajoutées dynamiquement -->
                                        </select>
                                        <button type="button" id="add-temporary-student-btn" class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md flex items-center space-x-2">
                                            <i class="fas fa-plus"></i>
                                            <span>Ajouter</span>
                                        </button>
                                    </div>
                                    
                                    <div id="temporary-students-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        <!-- Les élèves temporaires seront affichés ici -->
                                    </div>
                                    
                                    <div id="no-temporary-students" class="text-center py-4 text-yellow-600">
                                        <i class="fas fa-info-circle mr-1"></i>
                                        <span class="text-sm">Aucun élève temporaire ajouté</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex justify-end space-x-3">
                            <button type="button" onclick="hideModal('entree-modal')" 
                                    class="px-6 py-3 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                                Annuler
                            </button>
                            <button type="submit" 
                                    class="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
                                <i class="fas fa-save mr-2"></i>
                                Enregistrer l'entrée complète
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
        // Sélecteur de niveau
        document.getElementById('cahier-niveau-selector').addEventListener('change', (e) => {
            this.selectNiveau(e.target.value);
        });

        // Sélecteur de classe
        document.getElementById('cahier-classe-selector').addEventListener('change', (e) => {
            this.selectClasse(e.target.value);
        });

        // Bouton nouvelle entrée
        document.getElementById('add-entree-btn').addEventListener('click', () => {
            this.showAddEntreeModal();
        });

        // Recherche avec débounce
        const searchInput = document.getElementById('cahier-search');
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchTerm = e.target.value;
                this.updateCahierView();
            }, 300);
        });

        // Boutons de vue
        document.querySelectorAll('.cahier-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });
    }

    /**
     * Sélectionner un niveau
     */
    selectNiveau(niveauId) {
        const classeContainer = document.getElementById('classe-selection-container');
        const classeSelector = document.getElementById('cahier-classe-selector');
        const cahierControls = document.getElementById('cahier-controls');
        
        if (!niveauId) {
            // Réinitialiser si aucun niveau sélectionné
            classeContainer.classList.add('hidden');
            cahierControls.classList.add('hidden');
            this.selectedNiveauId = null;
            this.selectedClasseId = null;
            document.getElementById('cahier-content').innerHTML = this.renderCahierPlaceholder();
            return;
        }
        
        this.selectedNiveauId = niveauId;
        this.selectedClasseId = null; // Réinitialiser la classe sélectionnée
        
        // Afficher le sélecteur de classe et le remplir
        classeContainer.classList.remove('hidden');
        classeSelector.innerHTML = `
            <option value="">Choisir une classe</option>
            ${this.renderClasseOptionsForNiveau(niveauId)}
        `;
        
        // Masquer les contrôles tant qu'aucune classe n'est sélectionnée
        cahierControls.classList.add('hidden');
        document.getElementById('cahier-content').innerHTML = this.renderCahierPlaceholder();
    }

    /**
     * Sélectionner une classe (méthode mise à jour)
     */
    selectClasse(classeId) {
        if (!classeId || !this.selectedNiveauId) {
            this.selectedClasseId = null;
            document.getElementById('cahier-controls').classList.add('hidden');
            document.getElementById('cahier-content').innerHTML = this.renderCahierPlaceholder();
            return;
        }

        this.selectedClasseId = classeId;
        
        document.getElementById('cahier-controls').classList.remove('hidden');
        this.updateCahierView();
    }

    /**
     * Changer de vue
     */
    switchView(view) {
        // Forcer la vue liste car les autres vues sont supprimées
        this.currentView = 'liste';
        
        // Mise à jour des boutons
        document.querySelectorAll('.cahier-view-btn').forEach(btn => {
            if (btn.dataset.view === 'liste') {
                btn.className = 'cahier-view-btn px-4 py-2 text-sm rounded bg-blue-100 text-blue-700';
            } else {
                btn.className = 'cahier-view-btn px-4 py-2 text-sm rounded text-gray-600 hover:bg-gray-100';
            }
        });

        this.updateCahierView();
    }

    /**
     * Mettre à jour la vue du cahier
     */
    updateCahierView() {
        const content = document.getElementById('cahier-content');
        if (!content) return;
        
        // Toujours afficher la vue liste car les autres vues ont été supprimées
        content.innerHTML = this.renderEntreesList();
    }

    /**
     * Rendu de la vue semaine
     */
    renderWeekView() {
        const entries = this.getFilteredEntries();
        const currentDate = new Date();
        const startOfWeek = this.getStartOfWeek(currentDate);
        
        // Créer un tableau des 7 jours de la semaine
        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            weekDays.push(day);
        }
        
        return `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                <div class="grid grid-cols-7 gap-0 border-b border-gray-200">
                    ${weekDays.map(day => {
                        const dateStr = day.toISOString().split('T')[0];
                        const dayEntries = entries.filter(entry => entry.date === dateStr);
                        const isToday = this.isSameDay(day, currentDate);
                        
                        return `
                            <div class="p-3 border-r border-gray-200 last:border-r-0 min-h-32 ${
                                isToday ? 'bg-blue-50' : 'bg-white'
                            }">
                                <div class="text-center mb-2">
                                    <div class="text-xs text-gray-500 uppercase">
                                        ${day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                                    </div>
                                    <div class="text-lg font-semibold ${
                                        isToday ? 'text-blue-600' : 'text-gray-800'
                                    }">
                                        ${day.getDate()}
                                    </div>
                                </div>
                                <div class="space-y-1">
                                    ${dayEntries.map(entry => `
                                        <div class="bg-blue-100 text-blue-800 text-xs p-1 rounded cursor-pointer hover:bg-blue-200" 
                                             onclick="window.cahierModule.editEntree('${entry.id}')">
                                            <div class="font-medium truncate">${escapeHtml(entry.matiere)}</div>
                                            <div class="truncate">${escapeHtml(entry.titre)}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <div class="mt-6 text-center text-sm text-gray-500">
                Semaine du ${startOfWeek.toLocaleDateString('fr-FR')} au ${weekDays[6].toLocaleDateString('fr-FR')}
            </div>
        `;
    }

    /**
     * Rendu de la vue mois
     */
    renderMonthView() {
        const entries = this.getFilteredEntries();
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Premier jour du mois
        const firstDay = new Date(year, month, 1);
        // Dernier jour du mois
        const lastDay = new Date(year, month + 1, 0);
        
        // Premier lundi de la grille (peut être dans le mois précédent)
        const startDate = new Date(firstDay);
        const firstDayOfWeek = firstDay.getDay();
        const daysToSubtract = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Lundi = 0
        startDate.setDate(firstDay.getDate() - daysToSubtract);
        
        // Créer la grille de 6 semaines (42 jours)
        const calendarDays = [];
        for (let i = 0; i < 42; i++) {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);
            calendarDays.push(day);
        }
        
        return `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                <!-- En-tête du mois -->
                <div class="p-4 border-b border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-800 text-center">
                        ${currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </h3>
                </div>
                
                <!-- En-tête des jours de la semaine -->
                <div class="grid grid-cols-7 gap-0 border-b border-gray-200">
                    ${['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => `
                        <div class="p-2 text-center text-sm font-medium text-gray-600 bg-gray-50 border-r border-gray-200 last:border-r-0">
                            ${day}
                        </div>
                    `).join('')}
                </div>
                
                <!-- Grille du calendrier -->
                <div class="grid grid-cols-7 gap-0">
                    ${calendarDays.map(day => {
                        const dateStr = day.toISOString().split('T')[0];
                        const dayEntries = entries.filter(entry => entry.date === dateStr);
                        const isCurrentMonth = day.getMonth() === month;
                        const isToday = this.isSameDay(day, currentDate);
                        
                        return `
                            <div class="p-2 border-r border-b border-gray-200 last:border-r-0 min-h-24 ${
                                !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                            } ${
                                isToday ? 'bg-blue-50' : ''
                            }">
                                <div class="text-sm font-medium mb-1 ${
                                    isToday ? 'text-blue-600' : ''
                                }">
                                    ${day.getDate()}
                                </div>
                                <div class="space-y-1">
                                    ${dayEntries.slice(0, 2).map(entry => `
                                        <div class="bg-blue-100 text-blue-800 text-xs p-1 rounded cursor-pointer hover:bg-blue-200" 
                                             onclick="window.cahierModule.editEntree('${entry.id}')">
                                            <div class="font-medium truncate">${escapeHtml(entry.matiere)}</div>
                                        </div>
                                    `).join('')}
                                    ${dayEntries.length > 2 ? `
                                        <div class="text-xs text-gray-500">+${dayEntries.length - 2} autre(s)</div>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Obtenir le début de la semaine (lundi)
     */
    getStartOfWeek(date) {
        const start = new Date(date);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Lundi
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);
        return start;
    }

    /**
     * Vérifier si deux dates sont le même jour
     */
    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
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
     * Afficher le modal d'ajout d'entrée avec prise de présence intégrée
     */
    showAddEntreeModal() {
        this.currentEditingEntree = null;
        const modalTitle = document.getElementById('entree-modal-title');
        modalTitle.textContent = 'Nouvelle entrée complète';
        
        clearForm('entree-form');
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('entree-date').value = today;
        
        // Initialiser la grille de présence
        this.initializeAttendanceGrid(today);
        
        showModal('entree-modal');
        
        // Écouter les changements de date pour mettre à jour la présence
        document.getElementById('entree-date').addEventListener('change', (e) => {
            this.updateAttendanceDate(e.target.value);
        });
        
        // Événements pour les boutons de présence
        document.getElementById('mark-all-present').addEventListener('click', () => {
            this.markAllAttendance(true);
        });
        
        document.getElementById('mark-all-absent').addEventListener('click', () => {
            this.markAllAttendance(false);
        });
    }
    
    /**
     * Initialiser la grille de présence
     */
    initializeAttendanceGrid(date) {
        const classe = this.getSelectedClasse();
        if (!classe || !classe.eleves) {
            document.getElementById('attendance-grid').innerHTML = `
                <div class="col-span-full text-center py-8 text-gray-500">
                    <i class="fas fa-users text-2xl mb-2"></i>
                    <p>Aucun élève dans cette classe</p>
                </div>
            `;
            return;
        }
        
        // Initialiser le tracking des scopes utilisés pour cette session
        if (!this.usedScopesThisSession) {
            this.usedScopesThisSession = new Set();
        }
        
        // Charger les données d'assiduité existantes si on est en mode édition
        const entree = classe.cahierJournal?.find(e => e.date === date);
        let initialScope = 'all';
        
        if (entree && entree.attendance) {
            // Utiliser le scope enregistré
            initialScope = entree.attendance.scope;
            
            // Marquer ce scope comme utilisé (car il a des données sauvegardées)
            this.usedScopesThisSession.add(initialScope);
            
            // Restaurer les données dans eleve.presence pour compatibilité
            Object.entries(entree.attendance.data).forEach(([eleveId, isPresent]) => {
                const eleve = classe.eleves.find(e => e.id === eleveId);
                if (eleve) {
                    if (!eleve.presence) eleve.presence = {};
                    eleve.presence[date] = isPresent;
                }
            });
        }
        
        // Configurer le sélecteur de groupe
        this.setupGroupSelectorForAttendance(classe);
        
        // Mettre à jour l'affichage de la date
        document.getElementById('attendance-date-display').textContent = this.dataManager.formatDate(date);
        
        // Initialiser avec le scope approprié
        // En mode création, utiliser la configuration de l'onboarding pour définir le défaut
        if (!entree || !entree.attendance) {
            // Mode création : définir le scope par défaut selon la configuration onboarding
            const hasGroups = classe.eleves.some(e => e.groupe && e.groupe.trim() !== '');
            
            // Vérifier la configuration de l'onboarding
            const classConfig = this.dataManager.data.config?.classConfig;
            
            if (hasGroups && classConfig) {
                // Si l'utilisateur a choisi "classe complète" dans l'onboarding
                if (classConfig.mode === 'complete') {
                    initialScope = 'all'; // Toute la classe par défaut
                    console.log('📋 Onboarding: Classe complète → Défaut = "Toute la classe"');
                } else {
                    initialScope = 'Groupe1'; // Groupe 1 par défaut
                    console.log('📋 Onboarding: Demi-classe → Défaut = "Groupe1"');
                }
            } else {
                // Fallback si pas de configuration onboarding
                initialScope = hasGroups ? 'Groupe1' : 'all';
                console.log('📋 Fallback: Pas de config onboarding, défaut =', initialScope);
            }
        }
        
        this.currentAttendanceFilter = initialScope;
        
        // Mettre à jour le sélecteur pour afficher le bon scope
        const groupSelector = document.getElementById('attendance-group-selector');
        if (groupSelector) {
            groupSelector.value = initialScope;
        }
        
        // En mode création, initialiser tous les élèves du scope comme absents par défaut
        if (!entree || !entree.attendance) {
            this.initializeDefaultAttendance(date, initialScope);
        }
        
        // Initialiser la section des élèves temporaires
        this.setupTemporaryStudentsSection(date);
        
        this.updateAttendanceGridWithFilter(date);
    }
    
    /**
     * Initialiser l'assiduité par défaut pour un scope donné
     */
    initializeDefaultAttendance(date, scope) {
        const classe = this.getSelectedClasse();
        if (!classe || !classe.eleves) return;
        
        // IMPORTANT: Nettoyer d'abord toutes les données pour cette date
        classe.eleves.forEach(eleve => {
            if (eleve.presence && eleve.presence[date] !== undefined) {
                delete eleve.presence[date];
            }
        });
        
        // Déterminer les élèves concernés par le scope UNIQUEMENT
        const elevesToInitialize = scope === 'all' 
            ? classe.eleves 
            : classe.eleves.filter(e => e.groupe === scope);
        
        // Marquer UNIQUEMENT les élèves concernés comme absents par défaut
        elevesToInitialize.forEach(eleve => {
            if (!eleve.presence) eleve.presence = {};
            eleve.presence[date] = false; // Absent par défaut
        });
    }
    
    /**
     * Changer de scope d'assiduité en écrasant les données précédentes
     */
    switchAttendanceScope(date, newScope) {
        const classe = this.getSelectedClasse();
        if (!classe || !classe.eleves) return;
        
        // Vérifier s'il y a des données d'assiduité existantes pour cette date
        const entree = classe.cahierJournal?.find(e => e.date === date);
        
        if (entree && entree.attendance && entree.attendance.scope === newScope) {
            // Si on revient au même scope, recharger les données existantes
            this.currentAttendanceFilter = newScope;
            this.loadAttendanceDataForScope(date, entree.attendance);
        } else {
            // Effacer toutes les données de présence pour cette date
            classe.eleves.forEach(eleve => {
                if (eleve.presence && eleve.presence[date] !== undefined) {
                    delete eleve.presence[date];
                }
            });
            
            // Mettre à jour le scope actuel
            this.currentAttendanceFilter = newScope;
            
            // Initialiser le nouveau scope avec tous les élèves absents par défaut
            this.initializeDefaultAttendance(date, newScope);
        }
        
        // Mettre à jour l'affichage
        this.updateAttendanceGridWithFilter(date);
        
        // Mettre à jour le sélecteur d'élèves temporaires
        this.populateTemporaryStudentSelector();
    }
    
    /**
     * Charger les données d'assiduité pour un scope spécifique
     */
    loadAttendanceDataForScope(date, attendanceData) {
        const classe = this.getSelectedClasse();
        if (!classe || !classe.eleves || !attendanceData) return;
            
        // Nettoyer toutes les données de présence existantes
        classe.eleves.forEach(eleve => {
            if (eleve.presence && eleve.presence[date] !== undefined) {
                delete eleve.presence[date];
            }
        });
            
        // Charger les données du scope principal
        Object.entries(attendanceData.data).forEach(([eleveId, isPresent]) => {
            const eleve = classe.eleves.find(e => e.id === eleveId);
            if (eleve) {
                if (!eleve.presence) eleve.presence = {};
                eleve.presence[date] = isPresent;
            }
        });
            
        // Recharger les élèves temporaires s'ils existent
        if (attendanceData.temporaryStudents) {
            // Nettoyer la grille temporaire existante
            const grid = document.getElementById('temporary-students-grid');
            if (grid) {
                grid.innerHTML = '';
            }
                
            // Recharger les élèves temporaires
            Object.entries(attendanceData.temporaryStudents).forEach(([eleveId, tempData]) => {
                const eleve = classe.eleves.find(e => e.id === eleveId);
                if (eleve) {
                    this.addTemporaryStudentToGrid(eleve, tempData.present);
                }
            });
                
            this.updateTemporaryStudentsDisplay();
        }
        
        // Mettre à jour le sélecteur d'élèves temporaires
        this.populateTemporaryStudentSelector();
    }
    
    /**
     * Configurer la section des élèves temporaires
     */
    setupTemporaryStudentsSection(date) {
        const classe = this.getSelectedClasse();
        if (!classe || !classe.eleves) return;
        
        // Remplir le sélecteur avec les élèves d'autres groupes
        this.populateTemporaryStudentSelector();
        
        // Charger les élèves temporaires existants
        this.loadTemporaryStudents(date);
        
        // Ajouter les event listeners
        document.getElementById('add-temporary-student-btn').addEventListener('click', () => {
            this.addTemporaryStudent(date);
        });
    }
    
    /**
     * Remplir le sélecteur d'élèves temporaires
     */
    populateTemporaryStudentSelector() {
        const classe = this.getSelectedClasse();
        const currentScope = this.currentAttendanceFilter || 'all';
        const selector = document.getElementById('temporary-student-selector');
        
        if (!classe || !classe.eleves) {
            selector.innerHTML = '<option value="">Aucun élève disponible</option>';
            return;
        }
        
        // Élèves disponibles : ceux qui ne sont PAS dans le scope actuel
        let availableStudents = [];
        if (currentScope === 'all') {
            // Si scope = toute la classe, aucun élève temporaire possible
            availableStudents = [];
        } else {
            // Élèves des autres groupes (pas du groupe actuel)
            availableStudents = classe.eleves.filter(e => e.groupe && e.groupe !== currentScope);
        }
        
        if (availableStudents.length === 0) {
            selector.innerHTML = '<option value="">Aucun élève d\'autre groupe disponible</option>';
            return;
        }
        
        selector.innerHTML = `
            <option value="">Sélectionnez un élève d'un autre groupe...</option>
            ${availableStudents.map(eleve => `
                <option value="${eleve.id}">${eleve.prenom} ${eleve.nom} (${eleve.groupe || 'Sans groupe'})</option>
            `).join('')}
        `;
    }
    
    /**
     * Charger les élèves temporaires existants
     */
    loadTemporaryStudents(date) {
        const classe = this.getSelectedClasse();
        const entree = classe?.cahierJournal?.find(e => e.date === date);
        
        if (entree && entree.attendance && entree.attendance.temporaryStudents) {
            Object.entries(entree.attendance.temporaryStudents).forEach(([eleveId, data]) => {
                const eleve = classe.eleves.find(e => e.id === eleveId);
                if (eleve) {
                    this.addTemporaryStudentToGrid(eleve, data.present);
                }
            });
        }
        
        this.updateTemporaryStudentsDisplay();
    }
    
    /**
     * Ajouter un élève temporaire
     */
    addTemporaryStudent(date) {
        const selector = document.getElementById('temporary-student-selector');
        const eleveId = selector.value;
        
        if (!eleveId) return;
        
        const classe = this.getSelectedClasse();
        const eleve = classe?.eleves?.find(e => e.id === eleveId);
        
        if (!eleve) return;
        
        // Ajouter à la grille (absent par défaut)
        this.addTemporaryStudentToGrid(eleve, false);
        
        // Remettre le sélecteur à zéro
        selector.value = '';
        
        // Mettre à jour l'affichage
        this.updateTemporaryStudentsDisplay();
    }
    
    /**
     * Ajouter un élève à la grille temporaire
     */
    addTemporaryStudentToGrid(eleve, isPresent = false) {
        const grid = document.getElementById('temporary-students-grid');
        
        // Vérifier s'il n'est pas déjà présent
        if (document.querySelector(`[data-temp-eleve-id="${eleve.id}"]`)) {
            return;
        }
        
        const card = document.createElement('div');
        card.className = `temp-eleve-card bg-white border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 ${
            isPresent 
                ? 'border-green-400 bg-green-50 hover:border-green-500' 
                : 'border-red-400 bg-red-50 hover:border-red-500'
        }`;
        card.dataset.tempEleveId = eleve.id;
        
        card.innerHTML = `
            <div class="text-center">
                <div class="w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center transition-colors duration-200 ${
                    isPresent ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
                }">
                    <i class="fas fa-user text-sm"></i>
                </div>
                <h6 class="font-medium text-gray-800 text-sm leading-tight mb-1">
                    ${escapeHtml(eleve.prenom)}
                </h6>
                <p class="text-xs text-gray-600 mb-1">
                    ${escapeHtml(eleve.nom)}
                </p>
                <p class="text-xs text-orange-600 mb-2">
                    <i class="fas fa-exchange-alt mr-1"></i>${eleve.groupe || 'Sans groupe'}
                </p>
                <div class="flex items-center justify-center space-x-1">
                    <div class="w-2 h-2 rounded-full transition-colors duration-200 ${
                        isPresent ? 'bg-green-500' : 'bg-red-500'
                    }"></div>
                    <span class="text-xs font-medium transition-colors duration-200 ${
                        isPresent ? 'text-green-700' : 'text-red-700'
                    }">
                        ${isPresent ? 'Présent' : 'Absent'}
                    </span>
                </div>
                <button class="mt-2 text-xs text-red-600 hover:text-red-800" onclick="cahierModule.removeTemporaryStudent('${eleve.id}')">
                    <i class="fas fa-times mr-1"></i>Retirer
                </button>
            </div>
        `;
        
        // Event listener pour toggle présence
        card.addEventListener('click', (e) => {
            if (e.target.closest('button')) return; // Éviter le toggle si on clique sur "Retirer"
            this.toggleTemporaryStudentAttendance(eleve.id);
        });
        
        grid.appendChild(card);
    }
    
    /**
     * Basculer la présence d'un élève temporaire
     */
    toggleTemporaryStudentAttendance(eleveId) {
        const card = document.querySelector(`[data-temp-eleve-id="${eleveId}"]`);
        if (!card) return;
        
        const isCurrentlyPresent = card.classList.contains('border-green-400');
        const newPresent = !isCurrentlyPresent;
        
        // Mettre à jour l'apparence
        if (newPresent) {
            card.className = 'temp-eleve-card bg-white border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 border-green-400 bg-green-50 hover:border-green-500';
        } else {
            card.className = 'temp-eleve-card bg-white border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 border-red-400 bg-red-50 hover:border-red-500';
        }
        
        // Mettre à jour le contenu
        const elements = card.querySelectorAll('[class*="bg-green"], [class*="bg-red"], [class*="text-green"], [class*="text-red"]');
        elements.forEach(el => {
            if (newPresent) {
                el.className = el.className.replace(/bg-red-\d+|text-red-\d+/g, '').replace(/bg-green-\d+|text-green-\d+/g, '');
                if (el.classList.contains('w-8')) el.classList.add('bg-green-200', 'text-green-700');
                if (el.classList.contains('w-2')) el.classList.add('bg-green-500');
                if (el.querySelector('span')) el.classList.add('text-green-700');
            } else {
                el.className = el.className.replace(/bg-green-\d+|text-green-\d+/g, '').replace(/bg-red-\d+|text-red-\d+/g, '');
                if (el.classList.contains('w-8')) el.classList.add('bg-red-200', 'text-red-700');
                if (el.classList.contains('w-2')) el.classList.add('bg-red-500');
                if (el.querySelector('span')) el.classList.add('text-red-700');
            }
        });
        
        // Mettre à jour le texte de statut
        const statusSpan = card.querySelector('span:last-child');
        if (statusSpan) {
            statusSpan.textContent = newPresent ? 'Présent' : 'Absent';
        }
    }
    
    /**
     * Retirer un élève temporaire
     */
    removeTemporaryStudent(eleveId) {
        const card = document.querySelector(`[data-temp-eleve-id="${eleveId}"]`);
        if (card) {
            card.remove();
            this.updateTemporaryStudentsDisplay();
        }
    }
    
    /**
     * Mettre à jour l'affichage de la section temporaire
     */
    updateTemporaryStudentsDisplay() {
        const grid = document.getElementById('temporary-students-grid');
        const noStudentsDiv = document.getElementById('no-temporary-students');
        const hasTemporaryStudents = grid.children.length > 0;
        
        if (hasTemporaryStudents) {
            noStudentsDiv.style.display = 'none';
            grid.style.display = 'grid';
        } else {
            noStudentsDiv.style.display = 'block';
            grid.style.display = 'none';
        }
    }
    
    /**
     * Configurer le sélecteur de groupe pour l'attendance
     */
    setupGroupSelectorForAttendance(classe) {
        const groupFilterContainer = document.getElementById('group-filter-container');
        const groupSelector = document.getElementById('attendance-group-selector');
        
        // Vérifier s'il y a des groupes dans la classe
        const hasGroups = classe.eleves.some(e => e.groupe && e.groupe.trim() !== '');
        
        if (hasGroups) {
            // Afficher le sélecteur de groupe
            groupFilterContainer.classList.remove('hidden');
            
            // Obtenir les groupes disponibles
            const groupesDisponibles = [...new Set(classe.eleves
                .filter(e => e.groupe && e.groupe.trim() !== '')
                .map(e => e.groupe)
            )].sort();
            
            // Mettre à jour les options
            groupSelector.innerHTML = `
                <option value="all">Toute la classe (${classe.eleves.length})</option>
                ${groupesDisponibles.map(groupe => {
                    const count = classe.eleves.filter(e => e.groupe === groupe).length;
                    return `<option value="${groupe}">${groupe} (${count})</option>`;
                }).join('')}
            `;
            
            // Ajouter l'événement de changement avec logique de remplacement
            groupSelector.addEventListener('change', (e) => {
                const newScope = e.target.value;
                const oldScope = this.currentAttendanceFilter;
                const date = document.getElementById('entree-date').value;
                
                // Si pas de changement, ne rien faire
                if (newScope === oldScope) return;
                
                // Vérifier s'il y a des données existantes pour ce scope
                const classe = this.getSelectedClasse();
                const entree = classe?.cahierJournal?.find(e => e.date === date);
                
                // Vérifier si on a déjà des données sauvegardées pour ce scope
                let hasExistingDataForScope = false;
                if (entree && entree.attendance) {
                    // Si on change vers le scope qui était déjà sauvegardé
                    hasExistingDataForScope = (entree.attendance.scope === newScope);
                }
                
                // Vérifier si ce scope a déjà été utilisé dans cette session
                const wasUsedThisSession = this.usedScopesThisSession?.has(newScope);
                
                if (hasExistingDataForScope || wasUsedThisSession) {
                    // Il y a des données existantes pour ce scope - les charger directement
                    console.log(`Chargement des données existantes pour ${newScope}`);
                    this.switchAttendanceScope(date, newScope);
                    
                    // Marquer ce scope comme utilisé dans cette session
                    if (!this.usedScopesThisSession) {
                        this.usedScopesThisSession = new Set();
                    }
                    this.usedScopesThisSession.add(newScope);
                } else {
                    // Pas de données existantes - demander confirmation car cela va créer/écraser
                    const scopeLabel = newScope === 'all' ? 'toute la classe' : newScope;
                    const oldScopeLabel = oldScope === 'all' ? 'toute la classe' : oldScope;
                    
                    if (confirm(`Changer vers "${scopeLabel}" va écraser l'assiduité déjà saisie pour "${oldScopeLabel}". Continuer ?`)) {
                        this.switchAttendanceScope(date, newScope);
                        
                        // Marquer ce scope comme utilisé dans cette session
                        if (!this.usedScopesThisSession) {
                            this.usedScopesThisSession = new Set();
                        }
                        this.usedScopesThisSession.add(newScope);
                    } else {
                        // Annuler le changement
                        e.target.value = oldScope;
                    }
                }
            });
        } else {
            // Masquer le sélecteur de groupe
            groupFilterContainer.classList.add('hidden');
        }
    }
    
    /**
     * Mettre à jour la grille d'attendance avec le filtre
     */
    updateAttendanceGridWithFilter(date) {
        const classe = this.getSelectedClasse();
        if (!classe || !classe.eleves) return;
        
        // Filtrer les élèves selon la sélection
        let elevesToShow = classe.eleves;
        if (this.currentAttendanceFilter && this.currentAttendanceFilter !== 'all') {
            elevesToShow = classe.eleves.filter(eleve => eleve.groupe === this.currentAttendanceFilter);
        }
        
        // Créer la grille des élèves
        const attendanceGrid = document.getElementById('attendance-grid');
        attendanceGrid.innerHTML = elevesToShow.map(eleve => {
            const isPresent = eleve.presence?.[date] || false;
            return `
                <div class="eleve-attendance-card bg-white border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                    isPresent 
                        ? 'border-green-400 bg-green-50 hover:border-green-500' 
                        : 'border-red-400 bg-red-50 hover:border-red-500'
                }" data-eleve-id="${eleve.id}">
                    <div class="text-center">
                        <div class="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center transition-colors duration-200 ${
                            isPresent 
                                ? 'bg-green-200 text-green-700' 
                                : 'bg-red-200 text-red-700'
                        }">
                            <i class="fas fa-user text-sm"></i>
                        </div>
                        <h5 class="font-medium text-gray-800 text-sm leading-tight mb-1">
                            ${escapeHtml(eleve.prenom)}
                        </h5>
                        <p class="text-xs text-gray-600 mb-2">
                            ${escapeHtml(eleve.nom)}
                        </p>
                        ${eleve.groupe ? `
                            <p class="text-xs text-blue-600 mb-2">
                                <i class="fas fa-users mr-1"></i>${eleve.groupe}
                            </p>
                        ` : ''}
                        <div class="flex items-center justify-center space-x-1">
                            <div class="w-2 h-2 rounded-full transition-colors duration-200 ${
                                isPresent ? 'bg-green-500' : 'bg-red-500'
                            }"></div>
                            <span class="text-xs font-medium transition-colors duration-200 ${
                                isPresent ? 'text-green-700' : 'text-red-700'
                            }">
                                ${isPresent ? 'Présent' : 'Absent'}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Ajouter les événements de clic
        document.querySelectorAll('.eleve-attendance-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const eleveId = e.currentTarget.dataset.eleveId;
                this.toggleAttendanceInModal(eleveId, date);
            });
        });
        
        // Mettre à jour les statistiques
        this.updateAttendanceStats(elevesToShow, date);
    }
    
    /**
     * Basculer la présence d'un élève dans le modal
     */
    toggleAttendanceInModal(eleveId, date) {
        const classe = this.getSelectedClasse();
        const eleve = classe?.eleves?.find(e => e.id === eleveId);
        
        if (eleve) {
            if (!eleve.presence) eleve.presence = {};
            eleve.presence[date] = !eleve.presence[date];
            
            // Rafraîchir l'affichage avec le filtre actuel
            this.updateAttendanceGridWithFilter(date);
        }
    }
    
    /**
     * Marquer tous les élèves présents ou absents
     */
    markAllAttendance(isPresent) {
        const classe = this.getSelectedClasse();
        if (!classe || !classe.eleves) return;
        
        const date = document.getElementById('entree-date').value;
        if (!date) return;
        
        // Obtenir les élèves à affecter selon le filtre actuel
        let elevesToMark = classe.eleves;
        if (this.currentAttendanceFilter && this.currentAttendanceFilter !== 'all') {
            elevesToMark = classe.eleves.filter(eleve => eleve.groupe === this.currentAttendanceFilter);
        }
        
        elevesToMark.forEach(eleve => {
            if (!eleve.presence) eleve.presence = {};
            eleve.presence[date] = isPresent;
        });
        
        // Rafraîchir l'affichage
        this.updateAttendanceGridWithFilter(date);
    }
    
    /**
     * Mettre à jour la date de présence
     */
    updateAttendanceDate(newDate) {
        // Utiliser la nouvelle méthode avec filtre si elle existe
        if (this.currentAttendanceFilter !== undefined) {
            this.updateAttendanceGridWithFilter(newDate);
        } else {
            this.initializeAttendanceGrid(newDate);
        }
    }
    
    /**
     * Mettre à jour les statistiques de présence
     */
    updateAttendanceStats(eleves, date) {
        const present = eleves.filter(e => e.presence?.[date]).length;
        const absent = eleves.filter(e => !e.presence?.[date]).length;
        const total = eleves.length;
        
        document.getElementById('present-count').textContent = present;
        document.getElementById('absent-count').textContent = absent;
        document.getElementById('total-count').textContent = total;
    }

    /**
     * Éditer une entrée
     */
    editEntree(entreeId) {
        const classe = this.getSelectedClasse();
        const entree = classe?.cahierJournal?.find(e => e.id === entreeId);
        
        if (entree) {
            this.currentEditingEntree = entreeId;
            document.getElementById('entree-modal-title').textContent = 'Modifier l\'entrée';
            
            document.getElementById('entree-date').value = this.dataManager.formatDateForInput(entree.date);
            document.getElementById('entree-horaires').value = entree.horaires || '';
            document.getElementById('entree-objectifs').value = entree.objectifs || '';
            document.getElementById('entree-activites').value = entree.activites || '';
            document.getElementById('entree-observations').value = entree.observations || '';
            document.getElementById('entree-liens').value = entree.liens || '';
            
            // Cocher les matières
            document.querySelectorAll('input[name="matieres"]').forEach(checkbox => {
                checkbox.checked = entree.matieres?.includes(checkbox.value) || false;
            });
            
            // Cocher les compétences si elles existent
            document.querySelectorAll('input[name="competences"]').forEach(checkbox => {
                checkbox.checked = entree.competences?.includes(checkbox.value) || false;
            });
            
            // Initialiser la grille de présence avec la date de l'entrée
            this.initializeAttendanceGrid(entree.date);
            
            // Écouter les changements de date pour mettre à jour la présence
            document.getElementById('entree-date').addEventListener('change', (e) => {
                this.updateAttendanceDate(e.target.value);
            });
            
            // Événements pour les boutons de présence
            document.getElementById('mark-all-present').addEventListener('click', () => {
                this.markAllAttendance(true);
            });
            
            document.getElementById('mark-all-absent').addEventListener('click', () => {
                this.markAllAttendance(false);
            });
            
            showModal('entree-modal');
        }
    }

    /**
     * Gestion de la soumission du formulaire avec données de présence intégrées
     */
    handleEntreeSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        
        const entreeData = {
            date: formData.get('date'),
            horaires: formData.get('horaires').trim(),
            objectifs: formData.get('objectifs').trim(),
            activites: formData.get('activites').trim(),
            observations: formData.get('observations').trim(),
            liens: formData.get('liens').trim(),
            matieres: formData.getAll('matieres'),
            competences: formData.getAll('competences')
        };

        if (!entreeData.date || !entreeData.objectifs || !entreeData.activites) {
            showToast('La date, les objectifs et les activités sont requis', 'error');
            return;
        }

        // Sauvegarder les données de présence en même temps
        // IMPORTANT: Créer d'abord l'entrée, puis sauvegarder l'assiduité
        if (this.currentEditingEntree) {
            this.updateEntree(this.currentEditingEntree, entreeData);
            // Pour l'édition, sauvegarder après la mise à jour
            this.saveAttendanceData(entreeData.date);
        } else {
            // Pour la création, créer l'entrée puis sauvegarder l'assiduité
            this.createEntree(entreeData);
            this.saveAttendanceData(entreeData.date);
        }

        hideModal('entree-modal');
        // Nettoyer le tracking des scopes utilisés pour la prochaine session
        this.usedScopesThisSession = new Set();
        this.updateCahierView();
        
        // Si un modal de détails d'assiduité est ouvert, le fermer pour que l'utilisateur puisse voir les changements
        const existingModal = document.querySelector('.modal');
        if (existingModal && existingModal.innerHTML.includes('Présences du')) {
            existingModal.remove();
            // Optionnel: rouvrir automatiquement avec les nouvelles données
            setTimeout(() => {
                this.viewAttendanceDetails(entreeData.date);
            }, 300);
        }
    }
    
    /**
     * Sauvegarder les données de présence avec le nouveau format
     */
    saveAttendanceData(date) {
        const classe = this.getSelectedClasse();
        if (!classe || !classe.eleves) return;
        
        // Obtenir le scope actuel (groupe sélectionné)
        const currentScope = this.currentAttendanceFilter || 'all';
        
        // Collecter UNIQUEMENT les données d'assiduité des élèves concernés par le scope
        const attendanceData = {};
        const elevesToInclude = currentScope === 'all' 
            ? classe.eleves 
            : classe.eleves.filter(e => e.groupe === currentScope);
        
        // Ne prendre que les élèves du scope actuel
        elevesToInclude.forEach(eleve => {
            if (eleve.presence && eleve.presence[date] !== undefined) {
                attendanceData[eleve.id] = eleve.presence[date];
            }
        });
        
        // Collecter les élèves temporaires
        const temporaryStudents = {};
        const tempCards = document.querySelectorAll('.temp-eleve-card');
        tempCards.forEach(card => {
            const eleveId = card.dataset.tempEleveId;
            const isPresent = card.classList.contains('border-green-400');
            const eleve = classe.eleves.find(e => e.id === eleveId);
            if (eleve) {
                temporaryStudents[eleveId] = {
                    originalGroup: eleve.groupe,
                    present: isPresent
                };
            }
        });
        
        // Trouver l'entrée correspondante dans le cahier journal
        let entree = classe.cahierJournal?.find(e => e.date === date);
        if (entree) {
            // Stocker dans le nouveau format avec le bon scope ET les élèves temporaires
            entree.attendance = {
                scope: currentScope,
                data: attendanceData,
                temporaryStudents: Object.keys(temporaryStudents).length > 0 ? temporaryStudents : undefined
            };
        } else {
            // Si aucune entrée trouvée, il y a un problème de timing
            console.warn(`Aucune entrée trouvée pour la date ${date}. Scope: ${currentScope}`);
        }
        
        this.dataManager.saveData();
        
        const presentCount = Object.values(attendanceData).filter(present => present).length;
        const tempPresentCount = Object.values(temporaryStudents).filter(temp => temp.present).length;
        const totalCount = Object.keys(attendanceData).length;
        const totalTempCount = Object.keys(temporaryStudents).length;
        const scopeLabel = currentScope === 'all' ? 'Toute la classe' : currentScope;
        
        let message = `Présences enregistrées: ${presentCount}/${totalCount} élèves présents (${scopeLabel})`;
        if (totalTempCount > 0) {
            message += ` + ${tempPresentCount}/${totalTempCount} élèves temporaires`;
        }
        
        showToast(message, 'success');
    }

    /**
     * Créer une nouvelle entrée
     */
    createEntree(entreeData) {
        const classe = this.getSelectedClasse();
        if (!classe) return;

        const entree = {
            id: this.dataManager.generateId('entree'),
            ...entreeData
        };

        if (!classe.cahierJournal) classe.cahierJournal = [];
        classe.cahierJournal.push(entree);
        
        this.dataManager.saveData();
        showToast(SUCCESS_MESSAGES.CREATED, 'success');
    }

    /**
     * Mettre à jour une entrée
     */
    updateEntree(entreeId, entreeData) {
        const classe = this.getSelectedClasse();
        const entree = classe?.cahierJournal?.find(e => e.id === entreeId);
        
        if (entree) {
            Object.assign(entree, entreeData);
            this.dataManager.saveData();
            showToast(SUCCESS_MESSAGES.SAVED, 'success');
        }
    }

    /**
     * Supprimer une entrée
     */
    deleteEntree(entreeId) {
        const classe = this.getSelectedClasse();
        if (!classe || !classe.cahierJournal) return;

        const index = classe.cahierJournal.findIndex(e => e.id === entreeId);
        if (index !== -1) {
            classe.cahierJournal.splice(index, 1);
            this.dataManager.saveData();
            this.updateCahierView();
            showToast(SUCCESS_MESSAGES.DELETED, 'success');
        }
    }
}
