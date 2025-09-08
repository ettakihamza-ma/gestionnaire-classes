/**
 * Module Progression - Suivi des compétences et présences
 */
class ProgressionModule {
    constructor(dataManager, schoolManager) {
        this.dataManager = dataManager;
        this.schoolManager = schoolManager;
        this.selectedClasseId = null;
        this.selectedNiveauId = null;
        this.currentView = 'competences';
        this.currentEditingEleve = null;
        this.selectedDate = new Date().toISOString().split('T')[0];
        this.currentMatiere = null;
        this.editingCompetence = null;
    }

    /**
     * Rendu de la section progression
     */
    render() {
        const section = document.getElementById('progression-section');
        section.innerHTML = `
            <div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-sm border border-blue-200 p-6">
                <div class="flex justify-between items-center mb-8">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-800 mb-2">Suivi de Progression</h2>
                        <p class="text-gray-600">Gérez les compétences et présences de vos élèves</p>
                    </div>
                    <div class="text-right">
                        <div class="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <i class="fas fa-chart-line text-white text-2xl"></i>
                        </div>
                    </div>
                </div>
                
                <div class="mb-8">
                    <label for="progression-classe-selector" class="block text-sm font-medium text-gray-700 mb-3">
                        Sélectionner une classe
                    </label>
                    <select id="progression-classe-selector" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm">
                        <option value="">Choisir une classe</option>
                        ${this.renderClasseOptions()}
                    </select>
                </div>

                <div id="progression-controls">
                    <!-- Navigation par cartes modernes -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <!-- Carte Compétences -->
                        <div class="progression-card bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105" data-view="competences">
                            <div class="flex items-center mb-4">
                                <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-4">
                                    <i class="fas fa-award text-white text-xl"></i>
                                </div>
                                <div>
                                    <h3 class="text-lg font-semibold text-green-800">Compétences</h3>
                                    <p class="text-sm text-green-600">Évaluer les élèves</p>
                                </div>
                            </div>
                            <p class="text-sm text-gray-600 mb-3">Suivez et évaluez les compétences de vos élèves par matière</p>
                            <div class="flex items-center text-green-700 font-medium">
                                <span class="mr-2">Accéder</span>
                                <i class="fas fa-arrow-right"></i>
                            </div>
                        </div>

                        <!-- Carte Gestion Compétences -->
                        <div class="progression-card bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105" data-view="gestion-competences">
                            <div class="flex items-center mb-4">
                                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-sky-600 rounded-lg flex items-center justify-center mr-4">
                                    <i class="fas fa-cogs text-white text-xl"></i>
                                </div>
                                <div>
                                    <h3 class="text-lg font-semibold text-blue-800">Gestion</h3>
                                    <p class="text-sm text-blue-600">Configurer compétences</p>
                                </div>
                            </div>
                            <p class="text-sm text-gray-600 mb-3">Créez et organisez vos compétences par matière et domaine</p>
                            <div class="flex items-center text-blue-700 font-medium">
                                <span class="mr-2">Configurer</span>
                                <i class="fas fa-arrow-right"></i>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Note informative sur les présences -->
                    <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                        <div class="flex items-center space-x-3">
                            <i class="fas fa-info-circle text-orange-600"></i>
                            <div>
                                <h4 class="font-medium text-orange-800">Prise de présence</h4>
                                <p class="text-sm text-orange-700">
                                    Les présences sont maintenant gérées directement dans le <strong>Cahier Journal</strong>. 
                                    Lors de la création d'une entrée, vous pourrez renseigner à la fois les informations de séance et les présences.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="progression-content">${this.renderProgressionPlaceholder()}</div>
                
                <!-- Modal de gestion des compétences -->
                <div id="competence-modal" class="modal">
                    <div class="modal-content">
                        <div class="flex justify-between items-center mb-4">
                            <h3 id="competence-modal-title" class="text-lg font-semibold">Nouvelle compétence</h3>
                            <button class="close-modal text-gray-500 hover:text-gray-700">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <form id="competence-form">
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Matière *</label>
                                <select id="competence-matiere" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                                    <option value="">Sélectionner une matière</option>
                                    ${this.getUserMatieres().map(matiere => `<option value="${matiere}">${matiere}</option>`).join('')}
                                </select>
                            </div>
                            
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Catégorie/Domaine *</label>
                                <input type="text" id="competence-categorie" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Présentation PowerPoint, Lecture et compréhension..." required>
                                <p class="text-xs text-gray-500 mt-1">Regroupez vos compétences par thème ou domaine pour une meilleure organisation</p>
                            </div>
                            
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nom de la compétence *</label>
                                <input type="text" id="competence-nom" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Insertion d'images, Utilisation du curseur..." required>
                            </div>
                            
                            <div class="mb-6">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Description (optionnel)</label>
                                <textarea id="competence-description" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" placeholder="Description détaillée de la compétence"></textarea>
                            </div>
                            
                            <div class="flex justify-end space-x-3">
                                <button type="button" class="close-modal px-4 py-2 text-gray-600 hover:text-gray-800">Annuler</button>
                                <button type="submit" class="btn-primary">Enregistrer</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        this.setupEventListeners();
    }

    /**
     * Récupérer les matières de l'utilisateur
     */
    getUserMatieres() {
        const userMatieres = this.dataManager.data.matieres || [];
        // Si aucune matière définie, utiliser toutes les matières
        return userMatieres.length > 0 ? userMatieres : MATIERES;
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
     * Rendu du placeholder
     */
    renderProgressionPlaceholder() {
        return `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-chart-line text-4xl mb-4"></i>
                <p class="text-lg">Sélectionnez une classe</p>
                <p>Vous pourrez ensuite suivre les compétences et présences des élèves</p>
            </div>
        `;
    }

    /**
     * Rendu de la vue compétences
     */
    renderCompetencesView() {
        const classe = this.getSelectedClasse();
        if (!classe || !classe.eleves || classe.eleves.length === 0) {
            return `
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-award text-4xl mb-4"></i>
                    <p class="text-lg">Aucun élève dans cette classe</p>
                    <p>Ajoutez des élèves pour commencer le suivi des compétences</p>
                </div>
            `;
        }

        return `
            <div class="space-y-4">
                ${classe.eleves.map(eleve => `
                    <div class="border border-gray-200 rounded-lg p-4">
                        <div class="flex justify-between items-center mb-3">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <i class="fas fa-user text-blue-600"></i>
                                </div>
                                <h4 class="font-semibold text-gray-800">
                                    ${escapeHtml(eleve.prenom)} ${escapeHtml(eleve.nom)}
                                </h4>
                            </div>
                            <button onclick="progressionModule.editCompetences('${eleve.id}')" 
                                    class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                                <i class="fas fa-edit"></i> Évaluer
                            </button>
                        </div>
                        
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            ${COMPETENCES_DEFAUT.map(competence => {
                                const niveau = eleve.competences?.[competence] || 'non_acquis';
                                const config = COMPETENCES_NIVEAUX[niveau];
                                return `
                                    <div class="text-center">
                                        <div class="text-sm font-medium text-gray-700 mb-1">
                                            ${COMPETENCES_LABELS[competence]}
                                        </div>
                                        <span class="inline-block px-2 py-1 rounded-full text-xs ${config.bg} ${config.color}">
                                            ${config.label}
                                        </span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Rendu de la vue gestion des compétences avec UX améliorée
     */
    renderGestionCompetencesView() {
        const classe = this.getSelectedClasse();
        const competencesPersonnalisees = this.getCompetencesPersonnalisees();
        
        return `
            <div class="space-y-6">
                <!-- En-tête avec bouton toujours visible -->
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-800">Gestion des Compétences</h3>
                    <div class="flex space-x-3">
                        <button id="add-competence-btn" class="btn-primary flex items-center space-x-2">
                            <i class="fas fa-plus"></i>
                            <span>Nouvelle compétence</span>
                        </button>
                        <button id="toggle-quick-add" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                            <i class="fas fa-lightning-bolt"></i>
                            <span>Ajout rapide</span>
                        </button>
                    </div>
                </div>
                
                <!-- Section d'ajout rapide (masquée par défaut) -->
                <div id="quick-add-section" class="hidden bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="text-lg font-medium text-blue-800 flex items-center">
                            <i class="fas fa-rocket text-blue-600 mr-2"></i>
                            Ajout rapide de compétences
                        </h4>
                        <button id="close-quick-add" class="text-gray-500 hover:text-gray-700 p-1">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Matière *</label>
                            <select id="quick-matiere" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Sélectionner une matière</option>
                                ${this.getUserMatieres().map(matiere => `<option value="${matiere}">${matiere}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Catégorie/Domaine *</label>
                            <input type="text" id="quick-categorie" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Présentation, Lecture...">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nom de la compétence *</label>
                            <div class="flex space-x-2">
                                <input type="text" id="quick-nom" class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Insertion d'images">
                                <button id="quick-save-btn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-4 text-sm text-blue-600">
                        <p><i class="fas fa-info-circle mr-1"></i> Ajoutez rapidement plusieurs compétences en remplissant les champs et en cliquant sur le bouton +</p>
                    </div>
                </div>

                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div class="flex items-start space-x-3">
                        <i class="fas fa-lightbulb text-blue-600 mt-1"></i>
                        <div>
                            <h4 class="font-medium text-blue-900">Organisation recommandée</h4>
                            <p class="text-sm text-blue-700 mt-1">
                                Organisez vos compétences par <strong>matière</strong> puis par <strong>catégorie/domaine</strong>. 
                                Par exemple : Informatique → Présentation PowerPoint → Insertion d'images, Insertion de texte, Animations...
                            </p>
                        </div>
                    </div>
                </div>
                
                ${this.renderCompetencesByMatiere(competencesPersonnalisees)}
            </div>
        `;
    }
    
    /**
     * Rendu des compétences par matière avec structure hiérarchique
     */
    renderCompetencesByMatiere(competencesPersonnalisees) {
        const matieres = Object.keys(competencesPersonnalisees);
        
        if (matieres.length === 0) {
            return `
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <i class="fas fa-clipboard-list text-gray-400 text-3xl mb-3"></i>
                    <h4 class="text-lg font-medium text-gray-600 mb-2">Aucune compétence personnalisée</h4>
                    <p class="text-gray-500">Commencez par créer vos propres compétences en cliquant sur "Nouvelle compétence".</p>
                </div>
            `;
        }
        
        return matieres.map(matiere => {
            const domainesMatiere = competencesPersonnalisees[matiere];
            const totalCompetences = Object.values(domainesMatiere).reduce((total, domaine) => total + (Array.isArray(domaine) ? domaine.length : 0), 0);
            
            return `
                <div class="bg-white border border-gray-200 rounded-lg">
                    <div class="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <h4 class="font-medium text-gray-800 flex items-center">
                            <i class="fas fa-book text-blue-600 mr-2"></i>
                            ${matiere}
                        </h4>
                        <span class="text-sm text-gray-500">${totalCompetences} compétence(s) dans ${Object.keys(domainesMatiere).length} domaine(s)</span>
                    </div>
                    <div class="p-4">
                        <div class="space-y-4">
                            ${Object.keys(domainesMatiere).map(domaine => {
                                const competencesDomaine = domainesMatiere[domaine];
                                if (!Array.isArray(competencesDomaine) || competencesDomaine.length === 0) return '';
                                
                                return `
                                    <div class="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                        <div class="flex items-center justify-between mb-3">
                                            <h5 class="font-medium text-blue-900 flex items-center">
                                                <i class="fas fa-folder text-orange-500 mr-2 text-sm"></i>
                                                ${domaine}
                                            </h5>
                                            <span class="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                                ${competencesDomaine.length} compétence(s)
                                            </span>
                                        </div>
                                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                            ${competencesDomaine.map(comp => this.renderCompetenceCard(comp, matiere, domaine)).join('')}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    /**
     * Rendu d'une carte compétence avec support hiérarchique
     */
    renderCompetenceCard(competence, matiere, domaine = null) {
        return `
            <div class="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <h5 class="font-medium text-gray-800 text-sm">${competence.nom}</h5>
                        ${competence.description ? `<p class="text-xs text-gray-600 mt-1">${competence.description}</p>` : ''}
                        ${domaine ? `<p class="text-xs text-blue-600 mt-1 flex items-center"><i class="fas fa-tag mr-1"></i>${domaine}</p>` : ''}
                    </div>
                    <div class="flex space-x-1 ml-2">
                        <button class="edit-competence-btn text-blue-600 hover:text-blue-800 p-1 rounded" 
                                data-matiere="${matiere}" 
                                data-domaine="${domaine || ''}" 
                                data-competence="${competence.id}"
                                title="Éditer la compétence">
                            <i class="fas fa-edit text-xs"></i>
                        </button>
                        <button class="delete-competence-btn text-red-600 hover:text-red-800 p-1 rounded" 
                                data-matiere="${matiere}" 
                                data-domaine="${domaine || ''}" 
                                data-competence="${competence.id}"
                                title="Supprimer la compétence">
                            <i class="fas fa-trash text-xs"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Rendu des exemples de compétences
     */
    renderExemplesCompetences() {
        return `
            <div class="mt-3 space-y-2">
                ${Object.keys(COMPETENCES_EXEMPLES).map(matiere => `
                    <details class="text-sm">
                        <summary class="cursor-pointer font-medium text-blue-800 hover:text-blue-900">${matiere}</summary>
                        <ul class="mt-2 ml-4 space-y-1">
                            ${COMPETENCES_EXEMPLES[matiere].map(comp => `<li class="text-blue-600">• ${comp}</li>`).join('')}
                        </ul>
                    </details>
                `).join('')}
            </div>
        `;
    }

    /**
     * Rendu de la vue compétences
     */
    renderCompetencesView() {
        const classe = this.getSelectedClasse();
        const competencesPersonnalisees = this.getCompetencesPersonnalisees();
        
        if (!classe || !classe.eleves || classe.eleves.length === 0) {
            return '<p class="text-gray-500 text-center py-8">Aucun élève dans cette classe</p>';
        }
        
        if (Object.keys(competencesPersonnalisees).length === 0) {
            return `
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                    <i class="fas fa-exclamation-triangle text-yellow-600 text-2xl mb-3"></i>
                    <h4 class="text-lg font-medium text-yellow-800 mb-2">Aucune compétence définie</h4>
                    <p class="text-yellow-700 mb-4">Vous devez d'abord définir des compétences pour pouvoir évaluer vos élèves.</p>
                    <button onclick="document.querySelector('[data-view=\"gestion-competences\"]').click()" class="btn-primary">
                        Gérer les compétences
                    </button>
                </div>
            `;
        }

        return `
            <div class="space-y-6">
                ${Object.keys(competencesPersonnalisees).map(matiere => this.renderMatiereCompetencesTable(matiere, competencesPersonnalisees[matiere], classe.eleves)).join('')}
            </div>
        `;
    }
    
    /**
     * Rendu du tableau de compétences par matière
     */
    renderMatiereCompetencesTable(matiere, competencesMatiere, eleves) {
        // Convertir la structure hiérarchique en liste plate pour le tableau
        let competencesList = [];
        
        if (Array.isArray(competencesMatiere)) {
            // Format ancien (liste plate)
            competencesList = competencesMatiere;
        } else if (typeof competencesMatiere === 'object' && competencesMatiere !== null) {
            // Format hiérarchique (Matière -> Domaine -> Compétences)
            Object.keys(competencesMatiere).forEach(domaine => {
                const competencesDomaine = competencesMatiere[domaine];
                if (Array.isArray(competencesDomaine)) {
                    competencesList.push(...competencesDomaine);
                }
            });
        }
        
        if (competencesList.length === 0) {
            return `
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <i class="fas fa-exclamation-triangle text-yellow-600 text-xl mb-2"></i>
                    <h4 class="text-yellow-800 font-medium mb-1">Aucune compétence pour ${matiere}</h4>
                    <p class="text-yellow-700 text-sm">Ajoutez des compétences dans la section "Gérer Compétences"</p>
                </div>
            `;
        }
        
        return `
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h4 class="font-semibold text-gray-800 flex items-center">
                        <i class="fas fa-book text-blue-600 mr-2"></i>
                        ${matiere}
                    </h4>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left font-medium text-gray-700 border-r border-gray-200">Nom</th>
                                ${competencesList.map(comp => `
                                    <th class="px-2 py-3 text-center font-medium text-gray-700 border-r border-gray-200 min-w-24">
                                        <div class="text-xs">${comp.nom}</div>
                                    </th>
                                `).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${eleves.map(eleve => this.renderEleveCompetencesRow(eleve, matiere, competencesList)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    /**
     * Rendu d'une ligne d'élève avec compétences
     */
    renderEleveCompetencesRow(eleve, matiere, competences) {
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium border-r border-gray-200">${eleve.prenom} ${eleve.nom}</td>
                ${competences.map(competence => {
                    const competenceKey = `${matiere}_${competence.id}`;
                    const niveau = eleve.competences?.[competenceKey] || 'non_acquis';
                    const config = COMPETENCES_NIVEAUX[niveau];
                    
                    return `
                        <td class="px-2 py-3 text-center border-r border-gray-200">
                            <select class="competence-select w-full text-xs rounded px-1 py-1 ${config.bg} ${config.color} border-0 focus:ring-1 focus:ring-blue-500" 
                                    data-eleve="${eleve.id}" data-competence="${competenceKey}">
                                ${Object.keys(COMPETENCES_NIVEAUX).map(niv => `
                                    <option value="${niv}" ${niveau === niv ? 'selected' : ''}>
                                        ${COMPETENCES_NIVEAUX[niv].label}
                                    </option>
                                `).join('')}
                            </select>
                        </td>
                    `;
                }).join('')}
            </tr>
        `;
    }

    /**
     * Rendu de la vue présences avec mise en page grille horizontale et filtrage par groupe
     */
    renderPresenceView() {
        const classe = this.getSelectedClasse();
        if (!classe || !classe.eleves || classe.eleves.length === 0) {
            return `
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-calendar-check text-4xl mb-4"></i>
                    <p class="text-lg">Aucun élève dans cette classe</p>
                    <p>Ajoutez des élèves pour commencer le suivi des présences</p>
                </div>
            `;
        }
        
        // Récupérer la configuration des groupes
        const classConfig = this.dataManager.data.config?.classConfig || { mode: 'complete' };
        const isGroupMode = classConfig.mode === 'groups';
        
        // Obtenir les groupes disponibles
        const hasGroups = classe.eleves.some(e => e.groupe && e.groupe.trim() !== '');
        const groupesDisponibles = hasGroups ? ['Groupe1', 'Groupe2'] : [];
        
        // Déterminer le filtre par défaut selon la configuration
        let currentFilter = 'all';
        if (isGroupMode && groupesDisponibles.length > 0) {
            currentFilter = 'Groupe1'; // Par défaut sur Groupe1 en mode groupe
        }
        
        // Utiliser le filtre actuel s'il existe déjà
        if (this.currentPresenceFilter) {
            currentFilter = this.currentPresenceFilter;
        } else {
            // Première fois : définir le filtre selon la configuration
            this.currentPresenceFilter = currentFilter;
        }
        
        // Obtenir les élèves à afficher selon le filtre actuel
        let elevesToShow = classe.eleves;
        if (currentFilter !== 'all') {
            elevesToShow = classe.eleves.filter(eleve => eleve.groupe === currentFilter);
        }
        
        // Récupérer les informations de la classe sélectionnée
        const niveau = this.dataManager.data.niveaux.find(n => n.id === this.selectedNiveauId);
        const classeInfo = niveau?.classes?.find(c => c.id === this.selectedClasseId);
        const classeDisplayName = classeInfo ? `${niveau.nom} - ${classeInfo.nom}` : 'Classe inconnue';
        
        // Déterminer le texte d'affichage du groupe actuel
        let currentGroupDisplay = 'Toute la classe';
        if (currentFilter !== 'all') {
            currentGroupDisplay = currentFilter.replace('Groupe', 'Groupe ');
        }

        return `
            <div class="space-y-4">
                <!-- Informations de la classe sélectionnée -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-3">
                            <i class="fas fa-school text-blue-600 text-lg"></i>
                            <div>
                                <h3 class="font-medium text-blue-800">Classe sélectionnée</h3>
                                <p class="text-sm text-blue-700">${classeDisplayName}</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-4">
                            <div class="text-sm text-blue-600">
                                <i class="fas fa-users mr-1"></i>
                                ${classe.eleves.length} élève${classe.eleves.length > 1 ? 's' : ''}
                            </div>
                            <button id="change-class-btn" class="btn-secondary text-sm px-3 py-1 flex items-center space-x-1">
                                <i class="fas fa-exchange-alt"></i>
                                <span>Changer de classe</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Sélecteur de groupe unique -->
                ${groupesDisponibles.length > 0 ? `
                    <div class="bg-white border border-gray-200 rounded-lg p-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <i class="fas fa-filter text-purple-600 text-lg"></i>
                                <div>
                                    <h4 class="font-medium text-gray-800">Groupe actuel</h4>
                                    <p class="text-sm text-gray-600">Sélectionnez le groupe pour la prise de présence</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <label for="group-selector" class="text-sm font-medium text-gray-700">Afficher :</label>
                                <select id="group-selector" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                                    <option value="all" ${currentFilter === 'all' ? 'selected' : ''}>Toute la classe (${classe.eleves.length})</option>
                                    ${groupesDisponibles.map(groupe => `
                                        <option value="${groupe}" ${currentFilter === groupe ? 'selected' : ''}>
                                            ${groupe.replace('Groupe', 'Groupe ')} (${classe.eleves.filter(e => e.groupe === groupe).length})
                                        </option>
                                    `).join('')}
                                </select>
                            </div>
                        </div>
                        
                        <div class="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <p class="text-sm text-purple-700">
                                <i class="fas fa-eye mr-1"></i>
                                Actuellement : <strong>${currentGroupDisplay}</strong> (${elevesToShow.length} élève${elevesToShow.length > 1 ? 's' : ''})
                            </p>
                        </div>
                    </div>
                ` : ''}
                
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-info-circle text-blue-600"></i>
                        <div>
                            <h4 class="font-medium text-blue-800">Prise de présence rapide</h4>
                            <p class="text-sm text-blue-700">
                                Cliquez sur chaque élève pour marquer sa présence/absence. 
                                ${isGroupMode ? 'Le filtrage par groupe est activé selon votre configuration.' : ''}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div id="eleves-presence-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    ${this.renderElevesPresenceGrid(elevesToShow)}
                </div>
                
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div class="flex items-center space-x-4">
                            <div class="text-sm text-gray-600">
                                <strong>Date:</strong> ${this.dataManager.formatDate(this.selectedDate)}
                            </div>
                            <div class="flex items-center space-x-6">
                                <div class="flex items-center space-x-2">
                                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <span class="text-sm font-medium text-green-700">
                                        Présents: <span id="presents-count">${elevesToShow.filter(e => e.presence?.[this.selectedDate]).length}</span>
                                    </span>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <span class="text-sm font-medium text-red-700">
                                        Absents: <span id="absents-count">${elevesToShow.filter(e => !e.presence?.[this.selectedDate]).length}</span>
                                    </span>
                                </div>
                                <div class="text-sm text-gray-600">
                                    <strong>Total affiché:</strong> <span id="total-count">${elevesToShow.length}</span> élèves
                                </div>
                            </div>
                        </div>
                        
                        <div class="flex items-center space-x-3">
                            <button id="mark-filtered-present-btn" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center space-x-2">
                                <i class="fas fa-check-double"></i>
                                <span>Tous présents (filtrés)</span>
                            </button>
                            <div class="text-sm text-gray-500">
                                💡 <em>Utilisez les filtres pour gérer vos groupes</em>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Rendu de la grille des élèves pour les présences
     */
    renderElevesPresenceGrid(eleves) {
        return eleves.map(eleve => {
            const isPresent = eleve.presence?.[this.selectedDate] || false;
            return `
                <div class="eleve-presence-card bg-white border-2 rounded-lg p-3 hover:shadow-md transition-all duration-200 cursor-pointer ${
                    isPresent 
                        ? 'border-green-400 bg-green-50 hover:border-green-500' 
                        : 'border-red-400 bg-red-50 hover:border-red-500'
                }" data-eleve-id="${eleve.id}">
                    <div class="text-center">
                        <div class="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center transition-colors duration-200 ${
                            isPresent 
                                ? 'bg-green-200 text-green-700' 
                                : 'bg-red-200 text-red-700'
                        }">
                            <i class="fas fa-user text-lg"></i>
                        </div>
                        <h5 class="font-medium text-gray-800 text-sm leading-tight mb-1">
                            ${escapeHtml(eleve.prenom)}
                        </h5>
                        <p class="text-xs text-gray-600 mb-1">
                            ${escapeHtml(eleve.nom)}
                        </p>
                        ${eleve.groupe ? `
                            <p class="text-xs text-blue-600 mb-2">
                                <i class="fas fa-users mr-1"></i>${eleve.groupe.replace('Groupe', 'Groupe ')}
                            </p>
                        ` : ''}
                        <div class="flex items-center justify-center space-x-1">
                            <div class="w-3 h-3 rounded-full transition-colors duration-200 ${
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
    }

    /**
     * Rendu de la vue graphiques
     */
    renderGraphiquesView() {
        const classe = this.getSelectedClasse();
        if (!classe || !classe.eleves || classe.eleves.length === 0) {
            return `
                <div class="text-center py-12 text-gray-500">
                    <i class="fas fa-chart-bar text-4xl mb-4"></i>
                    <p class="text-lg">Aucun élève dans cette classe</p>
                    <p>Ajoutez des élèves pour voir les statistiques</p>
                </div>
            `;
        }

        const stats = this.calculateCompetenceStats(classe);

        return `
            <div class="space-y-6">
                <h3 class="text-lg font-semibold text-gray-800">Progression par compétence</h3>
                
                ${COMPETENCES_DEFAUT.map(competence => {
                    const competenceStats = stats[competence];
                    const total = competenceStats.acquis + competenceStats.en_cours + competenceStats.non_acquis;
                    
                    return `
                        <div class="bg-gray-50 rounded-lg p-4">
                            <div class="flex justify-between items-center mb-3">
                                <h4 class="font-medium text-gray-800">${COMPETENCES_LABELS[competence]}</h4>
                                <span class="text-sm text-gray-600">${total} élève(s)</span>
                            </div>
                            
                            <div class="space-y-2">
                                <div class="flex justify-between items-center text-sm">
                                    <span class="text-green-600">Acquis</span>
                                    <span>${competenceStats.acquis} (${total > 0 ? Math.round(competenceStats.acquis / total * 100) : 0}%)</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-green-500 h-2 rounded-full transition-all duration-300" 
                                         style="width: ${total > 0 ? competenceStats.acquis / total * 100 : 0}%"></div>
                                </div>
                                
                                <div class="flex justify-between items-center text-sm">
                                    <span class="text-orange-600">En cours</span>
                                    <span>${competenceStats.en_cours} (${total > 0 ? Math.round(competenceStats.en_cours / total * 100) : 0}%)</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-orange-500 h-2 rounded-full transition-all duration-300" 
                                         style="width: ${total > 0 ? competenceStats.en_cours / total * 100 : 0}%"></div>
                                </div>
                                
                                <div class="flex justify-between items-center text-sm">
                                    <span class="text-red-600">Non acquis</span>
                                    <span>${competenceStats.non_acquis} (${total > 0 ? Math.round(competenceStats.non_acquis / total * 100) : 0}%)</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-2">
                                    <div class="bg-red-500 h-2 rounded-full transition-all duration-300" 
                                         style="width: ${total > 0 ? competenceStats.non_acquis / total * 100 : 0}%"></div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * Calculer les statistiques de compétences
     */
    calculateCompetenceStats(classe) {
        const stats = {};
        
        COMPETENCES_DEFAUT.forEach(competence => {
            stats[competence] = {
                acquis: 0,
                en_cours: 0,
                non_acquis: 0
            };
        });

        classe.eleves.forEach(eleve => {
            COMPETENCES_DEFAUT.forEach(competence => {
                const niveau = eleve.competences?.[competence] || 'non_acquis';
                if (stats[competence][niveau] !== undefined) {
                    stats[competence][niveau]++;
                }
            });
        });
        
        return stats;
    }

    /**
     * Rendu du modal de progression
     */
    renderProgressionModal() {
        return `
            <div id="progression-modal" class="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
                <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 id="progression-modal-title" class="text-lg font-semibold">Évaluer les compétences</h3>
                        <button onclick="hideModal('progression-modal')" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <form id="progression-form" onsubmit="progressionModule.handleProgressionSubmit(event)">
                        <div id="progression-eleve-name" class="mb-4 text-center font-medium text-gray-800"></div>
                        
                        <div class="space-y-4 mb-4">
                            ${COMPETENCES_DEFAUT.map(competence => `
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-2">
                                        ${COMPETENCES_LABELS[competence]}
                                    </label>
                                    <select id="competence-${competence}" name="${competence}" 
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="non_acquis">Non acquis</option>
                                        <option value="en_cours">En cours d'acquisition</option>
                                        <option value="acquis">Acquis</option>
                                    </select>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="mb-4">
                            <label for="progression-commentaires" class="block text-sm font-medium text-gray-700 mb-2">
                                Commentaires
                            </label>
                            <textarea id="progression-commentaires" name="commentaires" rows="2"
                                      class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="Notes sur les progrès de l'élève..."></textarea>
                        </div>
                        
                        <div class="flex justify-end space-x-3">
                            <button type="button" onclick="hideModal('progression-modal')" 
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
        const classeSelector = document.getElementById('progression-classe-selector');
        if (classeSelector) {
            classeSelector.addEventListener('change', (e) => {
                this.selectClasse(e.target.value);
            });
        }

        // Navigation par cartes au lieu de boutons
        document.querySelectorAll('.progression-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const view = e.currentTarget.dataset.view;
                this.switchView(view);
            });
        });

        // Contrôles de présence
        const dateInput = document.getElementById('presence-date');
        if (dateInput) {
            dateInput.addEventListener('change', (e) => {
                this.selectedDate = e.target.value;
                this.updateProgressionView();
            });
        }

        const markAllBtn = document.getElementById('mark-all-present-btn');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', () => {
                this.markAllPresent();
            });
        }
        
        // Modal de compétences
        this.setupCompetenceModal();
    }
    
    /**
     * Configuration du modal des compétences
     */
    setupCompetenceModal() {
        const modal = document.getElementById('competence-modal');
        const form = document.getElementById('competence-form');
        
        // Fermer le modal
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeCompetenceModal();
            });
        });
        
        // Fermer en cliquant à l'extérieur
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeCompetenceModal();
            }
        });
        
        // Soumettre le formulaire
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCompetence();
        });
    }

    /**
     * Sélectionner une classe
     */
    selectClasse(value) {
        if (!value) {
            this.selectedClasseId = null;
            this.selectedNiveauId = null;
            document.getElementById('progression-controls').classList.add('hidden');
            document.getElementById('progression-content').innerHTML = this.renderProgressionPlaceholder();
            return;
        }

        const [niveauId, classeId] = value.split(':');
        this.selectedNiveauId = niveauId;
        this.selectedClasseId = classeId;
        
        document.getElementById('progression-controls').classList.remove('hidden');
        this.updateProgressionView();
    }

    /**
     * Changer de vue avec interface cartes
     */
    switchView(view) {
        this.currentView = view;
        
        // Mettre à jour l'apparence des cartes
        document.querySelectorAll('.progression-card').forEach(card => {
            const cardView = card.dataset.view;
            const isActive = cardView === view;
            
            if (isActive) {
                // Carte active - style accenté
                card.classList.add('ring-2', 'ring-blue-500', 'bg-blue-100');
                card.classList.remove('hover:scale-105');
            } else {
                // Carte inactive - style normal
                card.classList.remove('ring-2', 'ring-blue-500', 'bg-blue-100');
                card.classList.add('hover:scale-105');
            }
        });
        
        // Afficher/masquer les contrôles de présence
        const presenceControls = document.getElementById('presence-controls');
        if (presenceControls) {
            // Les présences sont maintenant gérées dans le cahier journal
            presenceControls.classList.add('hidden');
            presenceControls.classList.remove('animate-fade-in');
        }
        
        this.updateProgressionView();
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
     * Sauvegarder la progression d'un élève
     */
    saveProgression(eleveId, competences, commentaires) {
        const classe = this.getSelectedClasse();
        const eleve = classe?.eleves?.find(e => e.id === eleveId);
        
        if (eleve) {
            if (!eleve.competences) eleve.competences = {};
            Object.assign(eleve.competences, competences);
            
            if (commentaires) {
                eleve.commentairesProgression = commentaires;
            }
            
            this.dataManager.saveData();
            showToast(SUCCESS_MESSAGES.SAVED, 'success');
        }
    }

    /**
     * Basculer la présence d'un élève
     */
    togglePresence(eleveId) {
        const classe = this.getSelectedClasse();
        const eleve = classe?.eleves?.find(e => e.id === eleveId);
        
        if (eleve) {
            if (!eleve.presence) eleve.presence = {};
            eleve.presence[this.selectedDate] = !eleve.presence[this.selectedDate];
            
            this.dataManager.saveData();
            
            // Mettre à jour l'affichage immédiatement en vue présence
            if (this.currentView === 'presence') {
                // ✅ IMPORTANT: Préserver le filtre actuel
                const currentFilter = this.getCurrentPresenceFilter();
                let elevesToShow = classe.eleves;
                if (currentFilter !== 'all') {
                    elevesToShow = classe.eleves.filter(e => e.groupe === currentFilter);
                }
                
                const grid = document.getElementById('eleves-presence-grid');
                if (grid) {
                    grid.innerHTML = this.renderElevesPresenceGrid(elevesToShow);
                    
                    // Ré-attacher les événements de clic
                    setTimeout(() => {
                        document.querySelectorAll('.eleve-presence-card').forEach(card => {
                            card.addEventListener('click', (e) => {
                                const eleveId = e.currentTarget.dataset.eleveId;
                                this.togglePresence(eleveId);
                            });
                        });
                    }, 50);
                }
                
                // ✅ IMPORTANT: S'assurer que le sélecteur de groupe affiche le bon filtre
                const groupSelector = document.getElementById('group-selector');
                if (groupSelector) {
                    groupSelector.value = currentFilter;
                }
                
                // Mettre à jour les statistiques avec les élèves filtrés
                this.updatePresenceStats(elevesToShow);
            } else {
                this.updateProgressionView();
            }
        }
    }

    /**
     * Mettre à jour la vue de progression selon la vue actuelle
     */
    updateProgressionView() {
        const contentDiv = document.getElementById('progression-content');
        if (!contentDiv) return;
        
        let content = '';
        
        switch (this.currentView) {
            case 'competences':
                content = this.renderCompetencesView();
                break;
            case 'gestion-competences':
                content = this.renderGestionCompetencesView();
                this.setupGestionCompetencesEvents();
                break;
            case 'graphiques':
                content = this.renderGraphiquesView();
                break;
            default:
                content = this.renderProgressionPlaceholder();
        }
        
        contentDiv.innerHTML = content;
        
        // Configurer les événements spécifiques à la vue
        this.setupViewSpecificEvents();
    }

    /**
     * Configurer les événements pour la gestion des compétences avec UX améliorée
     */
    setupGestionCompetencesEvents() {
        // Événement pour ajouter une nouvelle compétence (modal complet)
        setTimeout(() => {
            const addBtn = document.getElementById('add-competence-btn');
            if (addBtn) {
                addBtn.addEventListener('click', () => {
                    this.openCompetenceModal();
                });
            }
            
            // Événements pour l'ajout rapide
            const toggleQuickAddBtn = document.getElementById('toggle-quick-add');
            const closeQuickAddBtn = document.getElementById('close-quick-add');
            const quickAddSection = document.getElementById('quick-add-section');
            const quickSaveBtn = document.getElementById('quick-save-btn');
            const quickNomInput = document.getElementById('quick-nom');
            
            if (toggleQuickAddBtn && quickAddSection) {
                toggleQuickAddBtn.addEventListener('click', () => {
                    quickAddSection.classList.toggle('hidden');
                    if (!quickAddSection.classList.contains('hidden')) {
                        // Focus sur le premier champ vide
                        const matiereSelect = document.getElementById('quick-matiere');
                        if (matiereSelect && !matiereSelect.value) {
                            matiereSelect.focus();
                        } else {
                            document.getElementById('quick-categorie')?.focus();
                        }
                    }
                });
            }
            
            if (closeQuickAddBtn && quickAddSection) {
                closeQuickAddBtn.addEventListener('click', () => {
                    quickAddSection.classList.add('hidden');
                });
            }
            
            if (quickSaveBtn) {
                quickSaveBtn.addEventListener('click', () => {
                    this.saveQuickCompetence();
                });
            }
            
            if (quickNomInput) {
                quickNomInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.saveQuickCompetence();
                    }
                });
            }
            
            // Événements pour éditer/supprimer des compétences
            document.querySelectorAll('.edit-competence-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const matiere = e.target.closest('.edit-competence-btn').dataset.matiere;
                    const domaine = e.target.closest('.edit-competence-btn').dataset.domaine;
                    const competenceId = e.target.closest('.edit-competence-btn').dataset.competence;
                    this.editCompetence(matiere, competenceId, domaine);
                });
            });
            
            document.querySelectorAll('.delete-competence-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const matiere = e.target.closest('.delete-competence-btn').dataset.matiere;
                    const domaine = e.target.closest('.delete-competence-btn').dataset.domaine;
                    const competenceId = e.target.closest('.delete-competence-btn').dataset.competence;
                    this.deleteCompetence(matiere, competenceId, domaine);
                });
            });
        }, 100);
    }

    /**
     * Configurer les événements spécifiques à chaque vue
     */
    setupViewSpecificEvents() {
        setTimeout(() => {
            // ✅ IMPORTANT: Masquer le formulaire d'ajout rapide si on n'est pas en vue gestion-competences
            const quickAddSection = document.getElementById('quick-add-section');
            if (quickAddSection && this.currentView !== 'gestion-competences') {
                quickAddSection.classList.add('hidden');
            }
            
            if (this.currentView === 'competences') {
                // Événements pour les sélecteurs de compétences
                document.querySelectorAll('.competence-select').forEach(select => {
                    select.addEventListener('change', (e) => {
                        const eleveId = e.target.dataset.eleve;
                        const competenceKey = e.target.dataset.competence;
                        const niveau = e.target.value;
                        
                        this.saveCompetenceQuick(eleveId, competenceKey, niveau);
                    });
                });
            }
            
            if (this.currentView === 'presence') {
                // Événements pour la vue présence
                
                // Bouton changer de classe
                const changeClassBtn = document.getElementById('change-class-btn');
                if (changeClassBtn) {
                    changeClassBtn.addEventListener('click', () => {
                        // Faire défiler vers le haut pour voir le sélecteur de classe
                        document.getElementById('progression-classe-selector').scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                        // Optionnel: Focus sur le sélecteur
                        setTimeout(() => {
                            document.getElementById('progression-classe-selector').focus();
                        }, 500);
                    });
                }
                
                // Sélecteur de groupe
                const groupSelector = document.getElementById('group-selector');
                if (groupSelector) {
                    groupSelector.addEventListener('change', (e) => {
                        const selectedGroup = e.target.value;
                        this.filterPresenceByGroup(selectedGroup === 'all' ? null : selectedGroup);
                    });
                }
                
                // Événements de clic sur les élèves pour basculer la présence
                document.querySelectorAll('.eleve-presence-card').forEach(card => {
                    card.addEventListener('click', (e) => {
                        const eleveId = e.currentTarget.dataset.eleveId;
                        this.togglePresence(eleveId);
                    });
                });
                
                // Bouton pour marquer présents les élèves filtrés
                const markFilteredBtn = document.getElementById('mark-filtered-present-btn');
                if (markFilteredBtn) {
                    markFilteredBtn.addEventListener('click', () => {
                        this.markFilteredPresent();
                    });
                }
            }
        }, 100);
    }

    /**
     * Sauvegarder rapidement une compétence
     */
    saveCompetenceQuick(eleveId, competenceKey, niveau) {
        const classe = this.getSelectedClasse();
        const eleve = classe?.eleves?.find(e => e.id === eleveId);
        
        if (eleve) {
            if (!eleve.competences) eleve.competences = {};
            eleve.competences[competenceKey] = niveau;
            
            this.dataManager.saveData();
            
            // Mettre à jour la couleur du sélecteur
            const select = document.querySelector(`[data-eleve="${eleveId}"][data-competence="${competenceKey}"]`);
            if (select) {
                const config = COMPETENCES_NIVEAUX[niveau];
                select.className = `competence-select w-full text-xs rounded px-1 py-1 ${config.bg} ${config.color} border-0 focus:ring-1 focus:ring-blue-500`;
            }
        }
    }

    /**
     * Ouvrir le modal de compétence avec support hiérarchique
     */
    openCompetenceModal(matiere = null, competenceData = null, domaine = null) {
        this.currentMatiere = matiere;
        this.currentCategorie = domaine;
        this.editingCompetence = competenceData;
        
        const modal = document.getElementById('competence-modal');
        const title = document.getElementById('competence-modal-title');
        const matiereSelect = document.getElementById('competence-matiere');
        const categorieInput = document.getElementById('competence-categorie');
        const nomInput = document.getElementById('competence-nom');
        const descriptionInput = document.getElementById('competence-description');
        
        if (competenceData) {
            title.textContent = 'Modifier la compétence';
            matiereSelect.value = matiere || competenceData.matiere || '';
            categorieInput.value = domaine || competenceData.domaine || '';
            nomInput.value = competenceData.nom || '';
            descriptionInput.value = competenceData.description || '';
        } else {
            title.textContent = 'Nouvelle compétence';
            matiereSelect.value = matiere || '';
            categorieInput.value = domaine || '';
            nomInput.value = '';
            descriptionInput.value = '';
        }
        
        modal.classList.remove('hidden');
        
        // Focus sur le premier champ vide
        setTimeout(() => {
            if (!matiereSelect.value) {
                matiereSelect.focus();
            } else if (!categorieInput.value) {
                categorieInput.focus();
            } else {
                nomInput.focus();
            }
        }, 100);
    }

    /**
     * Fermer le modal de compétence
     */
    closeCompetenceModal() {
        const modal = document.getElementById('competence-modal');
        modal.classList.add('hidden');
        this.currentMatiere = null;
        this.currentCategorie = null;
        this.editingCompetence = null;
    }

    /**
     * Sauvegarder une compétence personnalisée avec support hiérarchique
     */
    saveCompetence() {
        const matiere = document.getElementById('competence-matiere').value;
        const categorie = document.getElementById('competence-categorie').value.trim();
        const nom = document.getElementById('competence-nom').value.trim();
        const description = document.getElementById('competence-description').value.trim();
        
        if (!matiere || !categorie || !nom) {
            showToast('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }
        
        // Initialiser la structure hiérarchique si nécessaire
        if (!this.dataManager.data.competencesPersonnalisees) {
            this.dataManager.data.competencesPersonnalisees = {};
        }
        
        if (!this.dataManager.data.competencesPersonnalisees[matiere]) {
            this.dataManager.data.competencesPersonnalisees[matiere] = {};
        }
        
        if (!this.dataManager.data.competencesPersonnalisees[matiere][categorie]) {
            this.dataManager.data.competencesPersonnalisees[matiere][categorie] = [];
        }
        
        const competenceData = {
            id: this.editingCompetence?.id || this.dataManager.generateId('competence'),
            nom: nom,
            description: description,
            matiere: matiere,
            domaine: categorie
        };
        
        if (this.editingCompetence) {
            // Modifier une compétence existante
            const oldCategorie = this.editingCompetence.domaine || this.currentCategorie;
            const oldMatiere = this.currentMatiere;
            
            // Supprimer de l'ancienne position si matière ou catégorie a changé
            if (oldMatiere && oldCategorie && 
                this.dataManager.data.competencesPersonnalisees[oldMatiere] && 
                this.dataManager.data.competencesPersonnalisees[oldMatiere][oldCategorie]) {
                
                const oldIndex = this.dataManager.data.competencesPersonnalisees[oldMatiere][oldCategorie]
                    .findIndex(c => c.id === this.editingCompetence.id);
                
                if (oldIndex !== -1) {
                    this.dataManager.data.competencesPersonnalisees[oldMatiere][oldCategorie].splice(oldIndex, 1);
                    
                    // Nettoyer la catégorie vide
                    if (this.dataManager.data.competencesPersonnalisees[oldMatiere][oldCategorie].length === 0) {
                        delete this.dataManager.data.competencesPersonnalisees[oldMatiere][oldCategorie];
                    }
                }
            }
            
            // Ajouter à la nouvelle position
            this.dataManager.data.competencesPersonnalisees[matiere][categorie].push(competenceData);
        } else {
            // Ajouter une nouvelle compétence
            this.dataManager.data.competencesPersonnalisees[matiere][categorie].push(competenceData);
        }
        
        this.dataManager.saveData();
        this.closeCompetenceModal();
        this.updateProgressionView();
        
        showToast('Compétence sauvegardée avec succès', 'success');
    }

    /**
     * Sauvegarder une compétence via l'ajout rapide
     */
    saveQuickCompetence() {
        const matiere = document.getElementById('quick-matiere').value;
        const categorie = document.getElementById('quick-categorie').value.trim();
        const nom = document.getElementById('quick-nom').value.trim();
        
        if (!matiere || !categorie || !nom) {
            showToast('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }
        
        // Initialiser la structure hiérarchique si nécessaire
        if (!this.dataManager.data.competencesPersonnalisees) {
            this.dataManager.data.competencesPersonnalisees = {};
        }
        
        if (!this.dataManager.data.competencesPersonnalisees[matiere]) {
            this.dataManager.data.competencesPersonnalisees[matiere] = {};
        }
        
        if (!this.dataManager.data.competencesPersonnalisees[matiere][categorie]) {
            this.dataManager.data.competencesPersonnalisees[matiere][categorie] = [];
        }
        
        const competenceData = {
            id: this.dataManager.generateId('competence'),
            nom: nom,
            description: '',
            matiere: matiere,
            domaine: categorie
        };
        
        // Ajouter la nouvelle compétence
        this.dataManager.data.competencesPersonnalisees[matiere][categorie].push(competenceData);
        
        this.dataManager.saveData();
        this.updateProgressionView();
        
        // Vider seulement le nom pour permettre l'ajout rapide de plusieurs compétences
        document.getElementById('quick-nom').value = '';
        document.getElementById('quick-nom').focus();
        
        showToast(`Compétence "${nom}" ajoutée dans ${categorie}`, 'success');
    }

    /**
     * Éditer une compétence avec support hiérarchique
     */
    editCompetence(matiere, competenceId, domaine = null) {
        let competence = null;
        let foundDomaine = null;
        
        // Rechercher la compétence dans la structure hiérarchique
        const competencesMatiere = this.dataManager.data.competencesPersonnalisees?.[matiere];
        if (!competencesMatiere) return;
        
        if (domaine && competencesMatiere[domaine] && Array.isArray(competencesMatiere[domaine])) {
            // Recherche directe dans le domaine spécifié
            competence = competencesMatiere[domaine].find(c => c.id === competenceId);
            if (competence) foundDomaine = domaine;
        } else {
            // Recherche dans tous les domaines de la matière
            for (const [dom, competencesList] of Object.entries(competencesMatiere)) {
                if (Array.isArray(competencesList)) {
                    competence = competencesList.find(c => c.id === competenceId);
                    if (competence) {
                        foundDomaine = dom;
                        break;
                    }
                }
            }
        }
        
        if (competence && foundDomaine) {
            this.currentCategorie = foundDomaine;
            this.openCompetenceModal(matiere, competence, foundDomaine);
        }
    }

    /**
     * Supprimer une compétence avec support hiérarchique
     */
    deleteCompetence(matiere, competenceId, domaine = null) {
        if (!confirm('Supprimer cette compétence ? Cette action est irréversible.')) {
            return;
        }
        
        const competencesMatiere = this.dataManager.data.competencesPersonnalisees?.[matiere];
        if (!competencesMatiere) return;
        
        let deleted = false;
        
        if (domaine && competencesMatiere[domaine] && Array.isArray(competencesMatiere[domaine])) {
            // Suppression directe dans le domaine spécifié
            const index = competencesMatiere[domaine].findIndex(c => c.id === competenceId);
            if (index !== -1) {
                competencesMatiere[domaine].splice(index, 1);
                
                // Nettoyer le domaine vide
                if (competencesMatiere[domaine].length === 0) {
                    delete competencesMatiere[domaine];
                }
                deleted = true;
            }
        } else {
            // Recherche dans tous les domaines de la matière
            for (const [dom, competencesList] of Object.entries(competencesMatiere)) {
                if (Array.isArray(competencesList)) {
                    const index = competencesList.findIndex(c => c.id === competenceId);
                    if (index !== -1) {
                        competencesList.splice(index, 1);
                        
                        // Nettoyer le domaine vide
                        if (competencesList.length === 0) {
                            delete competencesMatiere[dom];
                        }
                        deleted = true;
                        break;
                    }
                }
            }
        }
        
        if (deleted) {
            this.dataManager.saveData();
            this.updateProgressionView();
            showToast('Compétence supprimée', 'success');
        } else {
            showToast('Compétence non trouvée', 'error');
        }
    }

    /**
     * Obtenir les compétences personnalisées
     */
    getCompetencesPersonnalisees() {
        return this.dataManager.data.competencesPersonnalisees || {};
    }
    
    /**
     * Rendu des modèles de compétences hiérarchiques
     */
    renderModeleCompetences() {
        return `
            <div class="space-y-4">
                ${Object.keys(COMPETENCES_STRUCTURE).map(matiere => `
                    <details class="bg-white border border-gray-200 rounded-lg">
                        <summary class="cursor-pointer p-3 font-medium text-gray-800 hover:bg-gray-50 rounded-lg">
                            <i class="fas fa-book text-blue-600 mr-2"></i>
                            ${matiere}
                        </summary>
                        <div class="p-3 pt-0">
                            ${Object.keys(COMPETENCES_STRUCTURE[matiere]).map(domaine => `
                                <div class="mb-4 last:mb-0">
                                    <div class="flex items-center justify-between mb-2">
                                        <h5 class="font-medium text-gray-700 flex items-center">
                                            <i class="fas fa-folder text-orange-500 mr-2 text-sm"></i>
                                            ${domaine}
                                        </h5>
                                        <button class="import-domaine-btn text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded" 
                                                data-matiere="${matiere}" data-domaine="${domaine}">
                                            <i class="fas fa-download mr-1"></i>
                                            Importer ce domaine
                                        </button>
                                    </div>
                                    <div class="ml-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                                        ${COMPETENCES_STRUCTURE[matiere][domaine].map(competence => `
                                            <div class="text-sm text-gray-600 flex items-center">
                                                <i class="fas fa-check-circle text-green-500 mr-2 text-xs"></i>
                                                ${competence}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </details>
                `).join('')}
            </div>
        `;
    }
    
    /**
     * Importer un domaine de compétences depuis les modèles (version hiérarchique)
     */
    importerDomaine(matiere, domaine) {
        if (!COMPETENCES_STRUCTURE[matiere] || !COMPETENCES_STRUCTURE[matiere][domaine]) {
            showToast('Domaine non trouvé', 'error');
            return;
        }
        
        const competencesList = COMPETENCES_STRUCTURE[matiere][domaine];
        
        // Initialiser la structure hiérarchique si nécessaire
        if (!this.dataManager.data.competencesPersonnalisees) {
            this.dataManager.data.competencesPersonnalisees = {};
        }
        
        if (!this.dataManager.data.competencesPersonnalisees[matiere]) {
            this.dataManager.data.competencesPersonnalisees[matiere] = {};
        }
        
        if (!this.dataManager.data.competencesPersonnalisees[matiere][domaine]) {
            this.dataManager.data.competencesPersonnalisees[matiere][domaine] = [];
        }
        
        // Ajouter les compétences du domaine avec structure hiérarchique
        let compteurAjoutes = 0;
        competencesList.forEach(competenceNom => {
            const existe = this.dataManager.data.competencesPersonnalisees[matiere][domaine]
                .some(c => c.nom === competenceNom);
                
            if (!existe) {
                this.dataManager.data.competencesPersonnalisees[matiere][domaine].push({
                    id: this.dataManager.generateId('competence'),
                    nom: competenceNom,
                    description: `Compétence du domaine "${domaine}" en ${matiere}`,
                    domaine: domaine,
                    matiere: matiere
                });
                compteurAjoutes++;
            }
        });
        
        this.dataManager.saveData();
        this.updateProgressionView();
        
        if (compteurAjoutes > 0) {
            showToast(`${compteurAjoutes} compétences importées pour le domaine "${domaine}"`, 'success');
        } else {
            showToast('Toutes les compétences de ce domaine sont déjà présentes', 'info');
        }
    }

    /**
     * Marquer tous les élèves présents
     */
    markAllPresent() {
        const classe = this.getSelectedClasse();
        if (!classe || !classe.eleves) return;

        if (!confirm(`Marquer tous les élèves présents le ${this.dataManager.formatDate(this.selectedDate)} ?`)) {
            return;
        }
        
        classe.eleves.forEach(eleve => {
            if (!eleve.presence) eleve.presence = {};
            eleve.presence[this.selectedDate] = true;
        });

        this.dataManager.saveData();
        this.updateProgressionView();
        showToast('Tous les élèves ont été marqués présents', 'success');
    }
    
    /**
     * Marquer présents les élèves actuellement filtrés
     */
    markFilteredPresent() {
        const classe = this.getSelectedClasse();
        if (!classe || !classe.eleves) return;
        
        // Obtenir les élèves actuellement affichés
        const currentFilter = this.getCurrentPresenceFilter();
        let elevesToMark = [];
        
        if (currentFilter === 'all') {
            elevesToMark = classe.eleves;
        } else {
            elevesToMark = classe.eleves.filter(eleve => eleve.groupe === currentFilter);
        }
        
        const filterLabel = currentFilter === 'all' ? 'tous les élèves' : `les élèves du groupe ${currentFilter}`;
        
        if (!confirm(`Marquer ${filterLabel} présents le ${this.dataManager.formatDate(this.selectedDate)} ?`)) {
            return;
        }
        
        elevesToMark.forEach(eleve => {
            if (!eleve.presence) eleve.presence = {};
            eleve.presence[this.selectedDate] = true;
        });

        this.dataManager.saveData();
        
        // Mettre à jour l'affichage immédiatement
        let elevesToShow = classe.eleves;
        if (currentFilter !== 'all') {
            elevesToShow = classe.eleves.filter(e => e.groupe === currentFilter);
        }
        
        const grid = document.getElementById('eleves-presence-grid');
        if (grid) {
            grid.innerHTML = this.renderElevesPresenceGrid(elevesToShow);
            
            // Ré-attacher les événements de clic
            setTimeout(() => {
                document.querySelectorAll('.eleve-presence-card').forEach(card => {
                    card.addEventListener('click', (e) => {
                        const eleveId = e.currentTarget.dataset.eleveId;
                        this.togglePresence(eleveId);
                    });
                });
            }, 50);
        }
        
        // Mettre à jour les statistiques avec les élèves filtrés
        this.updatePresenceStats(elevesToShow);
        showToast(`${elevesToMark.length} élève(s) marqué(s) présent(s)`, 'success');
    }
    
    /**
     * Filtrer les présences par groupe
     */
    filterPresenceByGroup(groupe = null) {
        const classe = this.getSelectedClasse();
        if (!classe || !classe.eleves) return;
        
        let elevesToShow = [];
        
        if (!groupe) {
            // Afficher tous les élèves
            elevesToShow = classe.eleves;
            this.currentPresenceFilter = 'all';
        } else {
            // Filtrer par groupe
            elevesToShow = classe.eleves.filter(eleve => eleve.groupe === groupe);
            this.currentPresenceFilter = groupe;
        }
        
        // Mettre à jour l'affichage de la grille
        const grid = document.getElementById('eleves-presence-grid');
        if (grid) {
            grid.innerHTML = this.renderElevesPresenceGrid(elevesToShow);
            
            // Ré-attacher les événements de clic sur les élèves
            setTimeout(() => {
                document.querySelectorAll('.eleve-presence-card').forEach(card => {
                    card.addEventListener('click', (e) => {
                        const eleveId = e.currentTarget.dataset.eleveId;
                        this.togglePresence(eleveId);
                    });
                });
            }, 50);
        }
        
        // Mettre à jour le sélecteur de groupe
        const groupSelector = document.getElementById('group-selector');
        if (groupSelector) {
            groupSelector.value = groupe || 'all';
        }
        
        // Mettre à jour les statistiques
        this.updatePresenceStats(elevesToShow);
    }
    
    /**
     * Obtenir le filtre de présence actuel
     */
    getCurrentPresenceFilter() {
        return this.currentPresenceFilter || 'all';
    }
    
    /**
     * Mettre à jour les statistiques de présence
     */
    updatePresenceStats(eleves = null) {
        const classe = this.getSelectedClasse();
        if (!classe) return;
        
        const elevesToCount = eleves || classe.eleves;
        
        const presents = elevesToCount.filter(e => e.presence?.[this.selectedDate]).length;
        const absents = elevesToCount.filter(e => !e.presence?.[this.selectedDate]).length;
        const total = elevesToCount.length;
        
        // Mettre à jour les compteurs dans l'interface
        const presentsEl = document.getElementById('presents-count');
        const absentsEl = document.getElementById('absents-count');
        const totalEl = document.getElementById('total-count');
        
        if (presentsEl) presentsEl.textContent = presents;
        if (absentsEl) absentsEl.textContent = absents;
        if (totalEl) totalEl.textContent = total;
    }
}
