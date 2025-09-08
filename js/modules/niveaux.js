/**
 * Module Niveaux - Gestion des niveaux et classes
 */
class NiveauxModule {
    constructor(dataManager, schoolManager) {
        this.dataManager = dataManager;
        this.schoolManager = schoolManager;
        this.currentEditingNiveau = null;
        this.currentEditingClasse = null;
    }

    /**
     * Rendu de la section niveaux
     */
    render() {
        const section = document.getElementById('niveaux-section');
        section.innerHTML = `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">Gestion des Niveaux et Classes</h2>
                    <button id="add-niveau-btn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                        <i class="fas fa-plus"></i>
                        <span>Ajouter un niveau</span>
                    </button>
                </div>
                
                <div id="niveaux-list" class="space-y-4">
                    ${this.renderNiveauxList()}
                </div>
            </div>
            
            ${this.renderNiveauModal()}
            ${this.renderClasseModal()}
        `;
        
        this.setupEventListeners();
    }

    /**
     * Rendu de la liste des niveaux
     */
    renderNiveauxList() {
        if (!this.dataManager.data.niveaux.length) {
            return `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-school text-4xl mb-4"></i>
                    <p class="text-lg">Aucun niveau créé</p>
                    <p>Commencez par ajouter un niveau (CP, CE1, CE2, etc.)</p>
                </div>
            `;
        }

        return this.dataManager.data.niveaux.map(niveau => `
            <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-layer-group text-blue-600"></i>
                        <h3 class="text-lg font-semibold text-gray-800">${escapeHtml(niveau.nom)}</h3>
                        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                            ${niveau.classes ? niveau.classes.length : 0} classe(s)
                        </span>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="niveauxModule.editNiveau('${niveau.id}')" 
                                class="text-blue-600 hover:text-blue-800 p-2">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="confirmAction('Supprimer ce niveau et toutes ses classes ?', () => niveauxModule.deleteNiveau('${niveau.id}'))" 
                                class="text-red-600 hover:text-red-800 p-2">
                            <i class="fas fa-trash"></i>
                        </button>
                        <button onclick="niveauxModule.addClasse('${niveau.id}')" 
                                class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
                            <i class="fas fa-plus"></i> Classe
                        </button>
                    </div>
                </div>
                
                ${niveau.classes && niveau.classes.length > 0 ? `
                    <div class="ml-8 space-y-2">
                        ${niveau.classes.map(classe => `
                            <div class="flex justify-between items-center bg-white p-3 rounded border">
                                <div class="flex items-center space-x-3">
                                    <i class="fas fa-users text-green-600"></i>
                                    <span class="font-medium">${escapeHtml(classe.nom)}</span>
                                    <span class="text-gray-500 text-sm">
                                        ${classe.eleves ? classe.eleves.length : 0} élève(s)
                                    </span>
                                </div>
                                <div class="flex space-x-2">
                                    <button onclick="niveauxModule.editClasse('${niveau.id}', '${classe.id}')" 
                                            class="text-blue-600 hover:text-blue-800 p-1">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button onclick="confirmAction('Supprimer cette classe ?', () => niveauxModule.deleteClasse('${niveau.id}', '${classe.id}'))" 
                                            class="text-red-600 hover:text-red-800 p-1">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    /**
     * Rendu du modal niveau
     */
    renderNiveauModal() {
        return `
            <div id="niveau-modal" class="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
                <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 id="niveau-modal-title" class="text-lg font-semibold">Ajouter un niveau</h3>
                        <button onclick="hideModal('niveau-modal')" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <form id="niveau-form" onsubmit="niveauxModule.handleNiveauSubmit(event)">
                        <div class="mb-4">
                            <label for="niveau-nom" class="block text-sm font-medium text-gray-700 mb-2">
                                Nom du niveau *
                            </label>
                            <input type="text" id="niveau-nom" name="nom" required 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   placeholder="Ex: CP, CE1, CE2..."
                                   maxlength="${MAX_LENGTHS.NIVEAU_NOM}">
                        </div>
                        
                        <div class="flex justify-end space-x-3">
                            <button type="button" onclick="hideModal('niveau-modal')" 
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
     * Rendu du modal classe
     */
    renderClasseModal() {
        return `
            <div id="classe-modal" class="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
                <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 id="classe-modal-title" class="text-lg font-semibold">Ajouter une classe</h3>
                        <button onclick="hideModal('classe-modal')" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <form id="classe-form" onsubmit="niveauxModule.handleClasseSubmit(event)">
                        <div class="mb-4">
                            <label for="classe-nom" class="block text-sm font-medium text-gray-700 mb-2">
                                Nom de la classe *
                            </label>
                            <input type="text" id="classe-nom" name="nom" required 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                   placeholder="Ex: CP A, CE1 B..."
                                   maxlength="${MAX_LENGTHS.CLASSE_NOM}">
                        </div>
                        
                        <div class="flex justify-end space-x-3">
                            <button type="button" onclick="hideModal('classe-modal')" 
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
        document.getElementById('add-niveau-btn').addEventListener('click', () => {
            this.currentEditingNiveau = null;
            document.getElementById('niveau-modal-title').textContent = 'Ajouter un niveau';
            clearForm('niveau-form');
            showModal('niveau-modal');
        });
    }

    /**
     * Gestion de la soumission du formulaire niveau
     */
    handleNiveauSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const nom = formData.get('nom').trim();

        if (!nom) {
            showToast('Le nom du niveau est requis', 'error');
            return;
        }

        if (this.currentEditingNiveau) {
            this.updateNiveau(this.currentEditingNiveau, nom);
        } else {
            this.createNiveau(nom);
        }

        hideModal('niveau-modal');
        this.render();
    }

    /**
     * Gestion de la soumission du formulaire classe
     */
    handleClasseSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const nom = formData.get('nom').trim();

        if (!nom) {
            showToast('Le nom de la classe est requis', 'error');
            return;
        }

        if (this.currentEditingClasse) {
            this.updateClasse(this.currentEditingClasse.niveauId, this.currentEditingClasse.classeId, nom);
        } else {
            this.createClasse(this.currentEditingNiveau, nom);
        }

        hideModal('classe-modal');
        this.render();
    }

    /**
     * Créer un nouveau niveau
     */
    createNiveau(nom) {
        const niveau = {
            id: this.dataManager.generateId('niveau'),
            nom: nom,
            classes: []
        };

        this.dataManager.data.niveaux.push(niveau);
        this.dataManager.saveData();
        
        // Mettre à jour le dashboard
        if (this.schoolManager.updateDashboard) {
            this.schoolManager.updateDashboard();
        }
        
        showToast(SUCCESS_MESSAGES.CREATED, 'success');
    }

    /**
     * Mettre à jour un niveau
     */
    updateNiveau(niveauId, nom) {
        const niveau = this.dataManager.data.niveaux.find(n => n.id === niveauId);
        if (niveau) {
            niveau.nom = nom;
            this.dataManager.saveData();
            
            // Mettre à jour le dashboard
            if (this.schoolManager.updateDashboard) {
                this.schoolManager.updateDashboard();
            }
            
            showToast(SUCCESS_MESSAGES.SAVED, 'success');
        }
    }

    /**
     * Supprimer un niveau
     */
    deleteNiveau(niveauId) {
        const index = this.dataManager.data.niveaux.findIndex(n => n.id === niveauId);
        if (index !== -1) {
            this.dataManager.data.niveaux.splice(index, 1);
            this.dataManager.saveData();
            this.render();
            // Mettre à jour le dashboard
            if (this.schoolManager.updateDashboard) {
                this.schoolManager.updateDashboard();
            }
            showToast(SUCCESS_MESSAGES.DELETED, 'success');
        }
    }

    /**
     * Éditer un niveau
     */
    editNiveau(niveauId) {
        const niveau = this.dataManager.data.niveaux.find(n => n.id === niveauId);
        if (niveau) {
            this.currentEditingNiveau = niveauId;
            document.getElementById('niveau-modal-title').textContent = 'Modifier le niveau';
            document.getElementById('niveau-nom').value = niveau.nom;
            showModal('niveau-modal');
        }
    }

    /**
     * Ajouter une classe à un niveau
     */
    addClasse(niveauId) {
        this.currentEditingNiveau = niveauId;
        this.currentEditingClasse = null;
        document.getElementById('classe-modal-title').textContent = 'Ajouter une classe';
        clearForm('classe-form');
        showModal('classe-modal');
    }

    /**
     * Créer une nouvelle classe
     */
    createClasse(niveauId, nom) {
        const niveau = this.dataManager.data.niveaux.find(n => n.id === niveauId);
        if (niveau) {
            if (!niveau.classes) niveau.classes = [];
            
            const classe = {
                id: this.dataManager.generateId('classe'),
                nom: nom,
                eleves: [],
                groupes: {},
                cahierJournal: [],
                taches: []
            };

            niveau.classes.push(classe);
            this.dataManager.saveData();
            
            // Mettre à jour le dashboard
            if (this.schoolManager.updateDashboard) {
                this.schoolManager.updateDashboard();
            }
            
            showToast(SUCCESS_MESSAGES.CREATED, 'success');
        }
    }

    /**
     * Éditer une classe
     */
    editClasse(niveauId, classeId) {
        const niveau = this.dataManager.data.niveaux.find(n => n.id === niveauId);
        const classe = niveau?.classes?.find(c => c.id === classeId);
        
        if (classe) {
            this.currentEditingClasse = { niveauId, classeId };
            document.getElementById('classe-modal-title').textContent = 'Modifier la classe';
            document.getElementById('classe-nom').value = classe.nom;
            showModal('classe-modal');
        }
    }

    /**
     * Mettre à jour une classe
     */
    updateClasse(niveauId, classeId, nom) {
        const niveau = this.dataManager.data.niveaux.find(n => n.id === niveauId);
        const classe = niveau?.classes?.find(c => c.id === classeId);
        
        if (classe) {
            classe.nom = nom;
            this.dataManager.saveData();
            
            // Mettre à jour le dashboard
            if (this.schoolManager.updateDashboard) {
                this.schoolManager.updateDashboard();
            }
            
            showToast(SUCCESS_MESSAGES.SAVED, 'success');
        }
    }

    /**
     * Supprimer une classe
     */
    deleteClasse(niveauId, classeId) {
        const niveau = this.dataManager.data.niveaux.find(n => n.id === niveauId);
        if (niveau && niveau.classes) {
            const index = niveau.classes.findIndex(c => c.id === classeId);
            if (index !== -1) {
                niveau.classes.splice(index, 1);
                this.dataManager.saveData();
                this.render();
                
                // Mettre à jour le dashboard
                if (this.schoolManager.updateDashboard) {
                    this.schoolManager.updateDashboard();
                }
                
                showToast(SUCCESS_MESSAGES.DELETED, 'success');
            }
        }
    }
}
