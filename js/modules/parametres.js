/**
 * Module Paramètres - Gestion des paramètres utilisateur
 */
class ParametresModule {
    constructor(dataManager, schoolManager) {
        this.dataManager = dataManager;
        this.schoolManager = schoolManager;
    }

    /**
     * Rendu de la section paramètres
     */
    render() {
        const section = document.getElementById('parametres-section');
        if (!section) {
            console.error('❌ Section parametres-section non trouvée');
            return;
        }
        
        const userData = this.dataManager.data.config.user || {};
        const userMatieres = this.dataManager.data.matieres || [];
        
        // ⚠️ IMPORTANT: Remplacer TOUT le contenu de la section
        section.innerHTML = `
            <div class="bg-white rounded-lg shadow">
                <div class="p-6 border-b">
                    <h3 class="text-lg font-semibold">Paramètres</h3>
                    <p class="text-gray-600 mt-1">Gérez vos informations personnelles et vos préférences</p>
                </div>
                <div class="p-6">
                    <div class="space-y-8">
            <div class="space-y-8">
                <!-- Informations personnelles -->
                <div class="bg-gray-50 rounded-lg p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                            <i class="fas fa-user text-blue-600 mr-2"></i>
                            Informations personnelles
                        </h3>
                        <button id="edit-user-info-btn" class="btn-secondary text-sm px-3 py-1">
                            <i class="fas fa-edit mr-1"></i>
                            Modifier
                        </button>
                    </div>
                    
                    <div id="user-info-display">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-600 mb-1">Prénom</label>
                                <p class="text-gray-800">${userData.prenom || 'Non défini'}</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-600 mb-1">Nom</label>
                                <p class="text-gray-800">${userData.nom || 'Non défini'}</p>
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-600 mb-1">École</label>
                                <p class="text-gray-800">${userData.ecole || 'Non définie'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div id="user-info-edit" class="hidden">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="edit-prenom" class="block text-sm font-medium text-gray-600 mb-1">Prénom *</label>
                                <input type="text" id="edit-prenom" value="${userData.prenom || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label for="edit-nom" class="block text-sm font-medium text-gray-600 mb-1">Nom *</label>
                                <input type="text" id="edit-nom" value="${userData.nom || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div class="md:col-span-2">
                                <label for="edit-ecole" class="block text-sm font-medium text-gray-600 mb-1">École</label>
                                <input type="text" id="edit-ecole" value="${userData.ecole || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>
                        
                        <div class="flex justify-end space-x-3 mt-4">
                            <button id="cancel-user-edit-btn" class="btn-secondary px-4 py-2">
                                <i class="fas fa-times mr-1"></i>
                                Annuler
                            </button>
                            <button id="save-user-info-btn" class="btn-primary px-4 py-2">
                                <i class="fas fa-save mr-1"></i>
                                Sauvegarder
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Matières enseignées -->
                <div class="bg-gray-50 rounded-lg p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                            <i class="fas fa-book text-green-600 mr-2"></i>
                            Matières enseignées
                        </h3>
                        <button id="edit-matieres-btn" class="btn-secondary text-sm px-3 py-1">
                            <i class="fas fa-edit mr-1"></i>
                            Modifier
                        </button>
                    </div>
                    
                    <div id="matieres-display">
                        ${userMatieres.length > 0 ? `
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                ${userMatieres.map(matiere => `
                                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                        <i class="fas fa-graduation-cap mr-1"></i>
                                        ${matiere}
                                    </span>
                                `).join('')}
                            </div>
                        ` : `
                            <p class="text-gray-500 italic">Aucune matière configurée</p>
                        `}
                    </div>
                    
                    <div id="matieres-edit" class="hidden">
                        <div class="mb-4">
                            <p class="text-gray-600 text-sm mb-3">Sélectionnez les matières que vous enseignez :</p>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                ${MATIERES.map(matiere => `
                                    <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                        <input type="checkbox" class="matiere-edit-checkbox mr-3" value="${matiere}" ${userMatieres.includes(matiere) ? 'checked' : ''}>
                                        <span class="text-gray-800">${matiere}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="mb-4">
                            <div class="flex items-center mb-2">
                                <input type="checkbox" id="autre-matiere-edit-checkbox" class="mr-2" ${userMatieres.some(m => !MATIERES.includes(m)) ? 'checked' : ''}>
                                <label for="autre-matiere-edit-checkbox" class="text-sm font-medium text-gray-700">Autre matière</label>
                            </div>
                            <input type="text" id="custom-matiere-edit" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Philosophie, Informatique..." value="${userMatieres.filter(m => !MATIERES.includes(m)).join(', ')}" ${userMatieres.some(m => !MATIERES.includes(m)) ? '' : 'disabled'}>
                        </div>
                        
                        <div class="flex justify-end space-x-3">
                            <button id="cancel-matieres-edit-btn" class="btn-secondary px-4 py-2">
                                <i class="fas fa-times mr-1"></i>
                                Annuler
                            </button>
                            <button id="save-matieres-btn" class="btn-primary px-4 py-2">
                                <i class="fas fa-save mr-1"></i>
                                Sauvegarder
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Configuration classe/groupe -->
                <div class="bg-gray-50 rounded-lg p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                            <i class="fas fa-users text-purple-600 mr-2"></i>
                            Configuration classe/groupe
                        </h3>
                        <button id="edit-class-config-btn" class="btn-secondary text-sm px-3 py-1">
                            <i class="fas fa-edit mr-1"></i>
                            Modifier
                        </button>
                    </div>
                    
                    <div id="class-config-display">
                        ${this.renderClassConfigDisplay()}
                    </div>
                    
                    <div id="class-config-edit" class="hidden">
                        ${this.renderClassConfigEdit()}
                    </div>
                </div>

                <!-- Actions avancées -->
                <div class="bg-gray-50 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <i class="fas fa-tools text-orange-600 mr-2"></i>
                        Actions avancées
                    </h3>
                    
                    <div class="space-y-4">
                        <div class="flex items-center justify-between p-4 bg-white rounded-lg border">
                            <div>
                                <h4 class="font-medium text-gray-800">Réinitialiser la configuration</h4>
                                <p class="text-sm text-gray-600">Relancer l'assistant de première configuration</p>
                            </div>
                            <button id="reset-onboarding-btn" class="btn-warning px-4 py-2">
                                <i class="fas fa-redo mr-1"></i>
                                Relancer
                            </button>
                        </div>
                        
                        <div class="flex items-center justify-between p-4 bg-white rounded-lg border">
                            <div>
                                <h4 class="font-medium text-gray-800">Réinitialiser toutes les données</h4>
                                <p class="text-sm text-gray-600 text-red-600">⚠️ Cette action supprimera définitivement toutes vos données</p>
                            </div>
                            <button id="reset-all-data-btn" class="btn-danger px-4 py-2">
                                <i class="fas fa-trash mr-1"></i>
                                Réinitialiser
                            </button>
                        </div>
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
        // Modification des informations utilisateur
        document.getElementById('edit-user-info-btn')?.addEventListener('click', () => {
            this.toggleUserInfoEdit(true);
        });

        document.getElementById('cancel-user-edit-btn')?.addEventListener('click', () => {
            this.toggleUserInfoEdit(false);
        });

        document.getElementById('save-user-info-btn')?.addEventListener('click', () => {
            this.saveUserInfo();
        });

        // Modification des matières
        document.getElementById('edit-matieres-btn')?.addEventListener('click', () => {
            this.toggleMatieresEdit(true);
        });

        document.getElementById('cancel-matieres-edit-btn')?.addEventListener('click', () => {
            this.toggleMatieresEdit(false);
        });

        document.getElementById('save-matieres-btn')?.addEventListener('click', () => {
            this.saveMatieres();
        });
        
        // Modification de la configuration classe/groupe
        document.getElementById('edit-class-config-btn')?.addEventListener('click', () => {
            this.toggleClassConfigEdit(true);
        });

        document.getElementById('cancel-class-config-edit-btn')?.addEventListener('click', () => {
            this.toggleClassConfigEdit(false);
        });

        document.getElementById('save-class-config-btn')?.addEventListener('click', () => {
            this.saveClassConfig();
        });
        
        // Gérer l'activation/désactivation du champ groupe
        document.querySelectorAll('input[name="class-mode-edit"]').forEach(radio => {
            radio.addEventListener('change', () => {
                const groupInput = document.getElementById('groupe-principal-edit');
                if (groupInput) {
                    groupInput.disabled = radio.value !== 'groups';
                    if (radio.value !== 'groups') {
                        groupInput.value = '';
                    }
                }
            });
        });

        // Gestion du champ "autre matière" dans l'édition
        const autreCheckbox = document.getElementById('autre-matiere-edit-checkbox');
        const customInput = document.getElementById('custom-matiere-edit');
        
        autreCheckbox?.addEventListener('change', () => {
            customInput.disabled = !autreCheckbox.checked;
            if (!autreCheckbox.checked) {
                customInput.value = '';
            }
        });

        // Actions avancées
        document.getElementById('reset-onboarding-btn')?.addEventListener('click', () => {
            this.resetOnboarding();
        });

        document.getElementById('reset-all-data-btn')?.addEventListener('click', () => {
            this.resetAllData();
        });
    }

    /**
     * Basculer l'édition des informations utilisateur
     */
    toggleUserInfoEdit(edit) {
        const display = document.getElementById('user-info-display');
        const editForm = document.getElementById('user-info-edit');
        
        if (edit) {
            display.classList.add('hidden');
            editForm.classList.remove('hidden');
        } else {
            display.classList.remove('hidden');
            editForm.classList.add('hidden');
        }
    }

    /**
     * Sauvegarder les informations utilisateur
     */
    saveUserInfo() {
        const prenom = document.getElementById('edit-prenom').value.trim();
        const nom = document.getElementById('edit-nom').value.trim();
        const ecole = document.getElementById('edit-ecole').value.trim();

        if (!prenom || !nom) {
            showToast('Le prénom et le nom sont obligatoires', 'error');
            return;
        }

        // Sauvegarder dans les données
        this.dataManager.data.config.user = { prenom, nom, ecole };
        this.dataManager.saveData();

        showToast('Informations sauvegardées avec succès', 'success');
        this.toggleUserInfoEdit(false);
        this.render(); // Re-rendre pour afficher les nouveaux données
    }

    /**
     * Basculer l'édition des matières
     */
    toggleMatieresEdit(edit) {
        const display = document.getElementById('matieres-display');
        const editForm = document.getElementById('matieres-edit');
        
        if (edit) {
            display.classList.add('hidden');
            editForm.classList.remove('hidden');
        } else {
            display.classList.remove('hidden');
            editForm.classList.add('hidden');
        }
    }

    /**
     * Sauvegarder les matières
     */
    saveMatieres() {
        const checkboxes = document.querySelectorAll('.matiere-edit-checkbox');
        const autreCheckbox = document.getElementById('autre-matiere-edit-checkbox');
        const customInput = document.getElementById('custom-matiere-edit');

        const selectedMatieres = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        // Ajouter les matières personnalisées
        if (autreCheckbox.checked && customInput.value.trim()) {
            const customMatieres = customInput.value.split(',')
                .map(m => m.trim())
                .filter(m => m.length > 0);
            selectedMatieres.push(...customMatieres);
        }

        if (selectedMatieres.length === 0) {
            showToast('Vous devez sélectionner au moins une matière', 'error');
            return;
        }

        // Sauvegarder dans les données
        this.dataManager.data.matieres = selectedMatieres;
        this.dataManager.saveData();

        showToast('Matières sauvegardées avec succès', 'success');
        this.toggleMatieresEdit(false);
        this.render(); // Re-rendre pour afficher les nouvelles données
    }

    /**
     * Réinitialiser la configuration (relancer l'onboarding)
     */
    resetOnboarding() {
        if (confirm('Êtes-vous sûr de vouloir relancer la configuration initiale ?\n\nVos données existantes seront conservées, mais vous devrez refaire la configuration.')) {
            this.dataManager.data.config.firstLaunch = true;
            this.dataManager.data.config.setupCompleted = false;
            this.dataManager.saveData();
            
            showToast('Configuration réinitialisée. Rechargez la page.', 'success');
            
            // Recharger la page après un délai
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    }

    /**
     * Réinitialiser toutes les données
     */
    resetAllData() {
        if (confirm('⚠️ ATTENTION: Cette action supprimera définitivement toutes vos données (niveaux, classes, élèves, cahier journal, etc.).\n\nÊtes-vous absolument certain de vouloir continuer ?')) {
            if (confirm('Dernière confirmation: Toutes les données seront perdues. Continuer ?')) {
                this.dataManager.resetData();
                showToast('Toutes les données ont été réinitialisées', 'success', 3000);
                
                // Recharger la page après un délai
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }
        }
    }
    
    /**
     * Afficher/masquer l'édition de la configuration classe
     */
    toggleClassConfigEdit(edit) {
        const display = document.getElementById('class-config-display');
        const editForm = document.getElementById('class-config-edit');
        
        if (edit) {
            display.classList.add('hidden');
            editForm.classList.remove('hidden');
        } else {
            display.classList.remove('hidden');
            editForm.classList.add('hidden');
        }
    }
    
    /**
     * Rendu de l'affichage de la configuration classe
     */
    renderClassConfigDisplay() {
        const classConfig = this.dataManager.data.config?.classConfig || { mode: 'complete' };
        
        if (classConfig.mode === 'groups') {
            return `
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-user-friends text-green-600"></i>
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-800">Travail par groupes</h4>
                        <p class="text-sm text-gray-600">
                            ${classConfig.groupePrincipal ? 
                                `Groupe principal: <strong>${classConfig.groupePrincipal}</strong>` : 
                                'Aucun groupe principal défini'
                            }
                        </p>
                    </div>
                </div>
                <div class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p class="text-sm text-blue-700">
                        <i class="fas fa-info-circle mr-1"></i>
                        Les présences afficheront ${classConfig.groupePrincipal ? `le groupe "${classConfig.groupePrincipal}"` : 'les groupes'} par défaut
                    </p>
                </div>
            `;
        } else {
            return `
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-users text-blue-600"></i>
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-800">Classe complète</h4>
                        <p class="text-sm text-gray-600">Gestion de tous les élèves pour les présences</p>
                    </div>
                </div>
                <div class="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p class="text-sm text-green-700">
                        <i class="fas fa-check-circle mr-1"></i>
                        Les présences afficheront tous les élèves par défaut
                    </p>
                </div>
            `;
        }
    }
    
    /**
     * Rendu du formulaire d'édition de la configuration classe
     */
    renderClassConfigEdit() {
        const classConfig = this.dataManager.data.config?.classConfig || { mode: 'complete' };
        
        return `
            <div class="space-y-4">
                <p class="text-gray-600 text-sm">Choisissez comment vous gérez votre classe pour les présences :</p>
                
                <div class="space-y-3">
                    <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <input type="radio" name="class-mode-edit" value="complete" class="mr-3" ${
                            classConfig.mode === 'complete' ? 'checked' : ''
                        }>
                        <div class="flex items-center space-x-3">
                            <i class="fas fa-users text-blue-600"></i>
                            <div>
                                <h4 class="font-medium text-gray-800">Classe complète</h4>
                                <p class="text-sm text-gray-600">Je gère tous les élèves de la classe pour les présences</p>
                            </div>
                        </div>
                    </label>
                    
                    <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <input type="radio" name="class-mode-edit" value="groups" class="mr-3" ${
                            classConfig.mode === 'groups' ? 'checked' : ''
                        }>
                        <div class="flex-1">
                            <div class="flex items-center space-x-3 mb-2">
                                <i class="fas fa-user-friends text-green-600"></i>
                                <div>
                                    <h4 class="font-medium text-gray-800">Travail par groupes</h4>
                                    <p class="text-sm text-gray-600">Je travaille avec des groupes spécifiques (demi-classe, ateliers, etc.)</p>
                                </div>
                            </div>
                            <div class="ml-8">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nom de votre groupe principal (optionnel)</label>
                                <input type="text" id="groupe-principal-edit" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                       placeholder="Ex: Groupe A, Demi-classe 1, Atelier math..." 
                                       value="${classConfig.groupePrincipal || ''}" ${
                                           classConfig.mode !== 'groups' ? 'disabled' : ''
                                       }>
                                <p class="text-xs text-gray-500 mt-1">Ce groupe sera sélectionné par défaut dans les présences</p>
                            </div>
                        </div>
                    </label>
                </div>
                
                <div class="flex justify-end space-x-3 mt-4">
                    <button id="cancel-class-config-edit-btn" class="btn-secondary px-4 py-2">
                        <i class="fas fa-times mr-1"></i>
                        Annuler
                    </button>
                    <button id="save-class-config-btn" class="btn-primary px-4 py-2">
                        <i class="fas fa-save mr-1"></i>
                        Sauvegarder
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Sauvegarder la configuration classe
     */
    saveClassConfig() {
        const mode = document.querySelector('input[name="class-mode-edit"]:checked')?.value || 'complete';
        const groupePrincipal = document.getElementById('groupe-principal-edit').value.trim();
        
        const classConfig = {
            mode: mode,
            groupePrincipal: mode === 'groups' ? (groupePrincipal || null) : null
        };
        
        // Sauvegarder dans les données
        if (!this.dataManager.data.config) {
            this.dataManager.data.config = {};
        }
        this.dataManager.data.config.classConfig = classConfig;
        this.dataManager.saveData();
        
        showToast('Configuration classe sauvegardée avec succès', 'success');
        this.toggleClassConfigEdit(false);
        this.render(); // Re-rendre pour afficher les nouvelles données
    }
}
