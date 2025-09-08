/**
 * DataManager - Gestionnaire de données avec localStorage
 */
class DataManager {
    constructor() {
        this.storageKey = 'schoolData';
        this.data = this.loadData();
    }

    /**
     * Initialiser les données par défaut
     */
    initializeDefaultData() {
        console.log('🏗️ DataManager.initializeDefaultData() - Création des données par défaut');
        const defaultData = {
            niveaux: [],
            matieres: [],
            config: {
                firstLaunch: true,
                setupCompleted: false,
                version: '1.0.0'
            }
        };
        console.log('✅ Données par défaut créées:', defaultData);
        console.log('🔍 Config par défaut:', defaultData.config);
        return defaultData;
    }

    /**
     * Charge les données depuis localStorage
     */
    loadData() {
        try {
            console.log('🔄 DataManager.loadData() - Chargement des données...');
            const stored = localStorage.getItem(this.storageKey);

            if (stored) {
                console.log('✅ Données trouvées dans localStorage:', stored.substring(0, 100) + '...');
                const parsedData = JSON.parse(stored);
                console.log('📊 Données parsées:', parsedData);
                console.log('🔍 Config dans les données parsées:', parsedData.config);
                return parsedData;
            } else {
                console.log('⚠️ Aucune donnée dans localStorage, utilisation des données par défaut');
                return this.initializeDefaultData();
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des données:', error);
            console.log('🔄 Retour aux données par défaut suite à l\'erreur');
            return this.initializeDefaultData();
        }
    }

    /**
     * Sauvegarde les données dans localStorage
     */
    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            return true;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            return false;
        }
    }

    /**
     * Réinitialise toutes les données
     */
    resetData() {
        this.data = this.initializeDefaultData();
        this.saveData();
    }

    /**
     * Obtenir les données par défaut (alias pour initializeDefaultData)
     */
    getDefaultData() {
        return this.initializeDefaultData();
    }

    /**
     * Force le redémarrage de l'onboarding (pour testing)
     */
    forceOnboarding() {
        this.data.config.firstLaunch = true;
        this.data.config.setupCompleted = false;
        this.saveData();
        console.log('🔄 Onboarding forcé - rechargez la page');
    }

    /**
     * Efface complètement les données localStorage (pour testing)
     */
    clearStorage() {
        localStorage.removeItem(this.storageKey);
        this.data = this.initializeDefaultData();
        console.log('🗑️ Storage effacé - rechargez la page');
    }

    /**
     * Génère un ID unique
     */
    generateId(prefix = 'item') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Formate une date pour l'affichage
     */
    formatDate(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        if (!date || isNaN(date)) {
            return '';
        }
        return date.toLocaleDateString('fr-FR');
    }

    /**
     * Formate une date pour les inputs
     */
    formatDateForInput(date) {
        if (typeof date === 'string') {
            return date.split('T')[0];
        }
        if (!date || isNaN(date)) {
            return '';
        }
        return date.toISOString().split('T')[0];
    }
    
    /**
     * Filtrer les élèves selon la configuration de groupe de l'enseignant
     * Utilisé pour respecter l'affectation de groupe lors de l'affichage des données d'assiduité
     */
    filterStudentsByTeacherConfig(students) {
        if (!students || !Array.isArray(students)) {
            return [];
        }
        
        const classConfig = this.data.config?.classConfig || { mode: 'complete' };
        
        // Si l'enseignant gère la classe complète, retourner tous les élèves
        if (classConfig.mode === 'complete') {
            return students;
        }
        
        // Si l'enseignant travaille par groupes, filtrer selon les règles métier
        if (classConfig.mode === 'groups') {
            // Par défaut, afficher seulement le Groupe1 (le groupe principal de l'enseignant)
            // Mais permettre la visualisation complète si nécessaire
            const hasGroups = students.some(s => s.groupe && s.groupe.trim() !== '');
            
            if (hasGroups) {
                // Retourner seulement les élèves du Groupe1 par défaut
                return students.filter(student => student.groupe === 'Groupe1');
            }
        }
        
        // Fallback: retourner tous les élèves
        return students;
    }
    
    /**
     * Obtenir les élèves filtrés pour l'affichage des présences historiques
     * Cette méthode respecte la configuration de l'enseignant
     */
    getFilteredStudentsForAttendance(classe, targetGroup = null) {
        if (!classe || !classe.eleves) {
            return [];
        }
        
        const classConfig = this.data.config?.classConfig || { mode: 'complete' };
        
        // Si un groupe cible est spécifié, l'utiliser
        if (targetGroup && targetGroup !== 'all') {
            return classe.eleves.filter(eleve => eleve.groupe === targetGroup);
        }
        
        // Sinon, utiliser la configuration de l'enseignant
        return this.filterStudentsByTeacherConfig(classe.eleves);
    }
}
