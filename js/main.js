/**
 * Main.js - Point d'entrée principal de l'application
 * Orchestration des modules et gestion de la navigation
 */
class SchoolManager {
    constructor() {
        this.currentSection = 'dashboard'; // Défaut au tableau de bord
        this.dataManager = new DataManager();
        
        // ⚠️ PROTECTION ANTI-BOUCLE INFINIE
        this._isNavigating = false;
        
        // Initialiser les services
        this.validationService = new ValidationService();
        this.uiService = new UIService();
        
        // Les modules seront initialisés dans init() après le chargement des données
        this.niveauxModule = null;
        this.elevesModule = null;
        this.cahierModule = null;
        this.progressionModule = null;
        this.importExportModule = null;
        this.parametresModule = null;
        
        // Composants UI
        this.navigationComponent = null;
        
        // Exposer les services globalement
        window.validationService = this.validationService;
        window.uiService = this.uiService;
        window.schoolManager = this;
        
        // ⚠️ IMPORTANT: Exposer l'instance pour la navigation HTML IMMÉDIATEMENT
        window.app = this;
        
        // ⚠️ DEBUG: Vérifier que l'exposition fonctionne
        console.log('📋 window.app exposé:', !!window.app);
        console.log('📋 window.app.showSection disponible:', !!(window.app && window.app.showSection));
    }

    /**
     * Initialiser l'application
     */
    init() {
        try {
            console.log('🚀 Initialisation de l\'application...');

            // ⚠️ IMPORTANT: Initialiser le système de thème en premier
            console.log('🎨 Initialisation du système de thème...');
            initializeTheme();

            // ⚠️ IMPORTANT: Charger les données UNIQUEMENT si elles ne sont pas déjà chargées
            if (!this.dataManager.data || !this.dataManager.data.config) {
                console.log('🔄 Chargement des données depuis localStorage...');
                this.dataManager.loadData();
                console.log('📊 Données chargées:', this.dataManager.data);
            } else {
                console.log('✅ Données déjà chargées depuis le constructeur');
            }
            
            // ⚠️ CRITIQUE: Initialiser les modules APRÈS le chargement des données
            this.initializeModules();

            // ⚠️ IMPORTANT: TOUJOURS S'ASSURER QUE LA SIDEBAR EST VISIBLE
            this.ensureSidebarVisible();

            // Configurer la navigation
            this.setupNavigation();
                    
            // Initialiser le composant de navigation
            this.initializeNavigationComponent();
            
            // ⚠️ IMPORTANT: Configurer le menu mobile dès l'initialisation
            this.setupMobileMenu();

            // ⚠️ IMPORTANT: Vérifier si l'onboarding est vraiment nécessaire
            if (this.needsOnboarding()) {
                console.log('🚀 Démarrage de l\'onboarding...');
                this.showOnboarding();
            } else {
                console.log('✅ Utilisateur déjà configuré, affichage normal');
                // Par défaut, afficher le tableau de bord
                this.currentSection = 'dashboard';
                
                // ⚠️ IMPORTANT: S'assurer que toutes les sections sont cachées sauf dashboard
                document.querySelectorAll('.section-content').forEach(section => {
                    if (section.id !== 'dashboard-section') {
                        section.classList.add('hidden');
                    }
                });
                
                // Afficher le dashboard
                this.showSection('dashboard');
            }

        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
            this.uiService.showToast('Erreur lors du chargement de l\'application', 'error');
            
            // En cas d'erreur critique, recharger la page
            setTimeout(() => {
                console.log('🔄 Rechargement forcé en raison d\'une erreur d\'initialisation');
                window.location.reload();
            }, 2000);
        }

        this.updateDashboard();

        console.log('📚 Gestionnaire de Classes - Application initialisée');
        console.log('Données chargées:', this.dataManager.data);
    }
    
    /**
     * Initialiser tous les modules avec les données chargées
     */
    initializeModules() {
        console.log('🛠️ Initialisation des modules...');
        
        try {
            // Initialiser tous les modules avec les données correctement chargées
            this.niveauxModule = new NiveauxModule(this.dataManager, this);
            this.elevesModule = new ElevesModule(this.dataManager, this);
            this.cahierModule = new CahierModule(this.dataManager, this);
            this.calendrierModule = new CalendrierModule(this.dataManager, this);
            this.importExportModule = new ImportExportModule(this.dataManager, this);
            this.parametresModule = new ParametresModule(this.dataManager, this);
            
            // Exposer les modules globalement pour les appels depuis HTML
            window.niveauxModule = this.niveauxModule;
            window.elevesModule = this.elevesModule;
            window.cahierModule = this.cahierModule;
            window.calendrierModule = this.calendrierModule;
            window.importExportModule = this.importExportModule;
            window.parametresModule = this.parametresModule;
            
            console.log('✅ Modules initialisés avec succès');
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation des modules:', error);
            throw error; // Relancer l'erreur pour déclencher le rechargement
        }
    }

    /**
     * ⚠️ FONCTION CRITIQUE: S'assurer que la sidebar est toujours visible
     * Cette fonction DOIT être appelée à chaque fois qu'on manipule la sidebar
     */
    ensureSidebarVisible() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            // Forcer la visibilité
            sidebar.style.display = 'block';
            sidebar.style.visibility = 'visible';
            sidebar.style.opacity = '1';
            
            // S'assurer que le z-index est correct
            sidebar.style.zIndex = '40';
            
            console.log('✅ Sidebar forcée à être visible'); // Debug pour vérifier
        } else {
            console.error('❌ Impossible de trouver la sidebar !');
        }
    }

    /**
     * Initialiser le composant de navigation
     */
    initializeNavigationComponent() {
        // Désactiver temporairement le composant Navigation pour éviter les conflits
        // La navigation HTML existante fonctionne correctement
        console.log('✅ Navigation component initialization skipped - using HTML navigation');
        
        // S'assurer que la navigation HTML est bien configurée
        this.setupHTMLNavigation();
    }
    
    /**
     * Configurer la navigation HTML existante
     */
    setupHTMLNavigation() {
        // NE PAS ajouter de listeners supplémentaires - les onclick HTML fonctionnent déjà
        // Juste s'assurer que window.app.showSection est disponible
        console.log('✅ Navigation HTML ready - using existing onclick handlers');
    }

    /**
     * ⚠️ FONCTION CRITIQUE: Détermine si l'onboarding est nécessaire
     * PROBLÈME RÉSOLU: Validation stricte pour empêcher la ré-apparition de l'onboarding
     * SOLUTION: Vérification complète et stricte des données de configuration
     */
    needsOnboarding() {
        console.log('🔍 === DÉBUT VÉRIFICATION ONBOARDING (VERSION CORRIGÉE) ===');
        
        // ⚠️ VÉRIFICATION DE SÉCURITÉ: S'assurer que les données sont chargées
        if (!this.dataManager || !this.dataManager.data) {
            console.warn('⚠️ DataManager ou data non disponibles - forcer onboarding');
            return true;
        }

        const config = this.dataManager.data.config;
        const userData = config && config.user ? config.user : null;
        const matieres = this.dataManager.data.matieres;

        // ⚠️ VÉRIFICATION DE SÉCURITÉ: Config doit exister
        if (!config) {
            console.warn('⚠️ Config non disponible - forcer onboarding');
            return true;
        }

        console.log('🔍 Détails de vérification onboarding (version corrigée):', {
            'Config existe': !!config,
            'firstLaunch': config.firstLaunch,
            'setupCompleted': config.setupCompleted,
            'userData existe': !!userData,
            'userData.prenom': userData?.prenom,
            'userData.nom': userData?.nom,
            'matieres définies': !!matieres && matieres.length > 0,
            'nombre matieres': matieres?.length || 0
        });

        // ✅ CONDITION STRICTE 1: firstLaunch doit être explicitement false
        if (config.firstLaunch !== false) {
            console.log('⚠️ firstLaunch n\'est pas explicitement false:', config.firstLaunch);
            return true;
        }

        // ✅ CONDITION STRICTE 2: setupCompleted doit être explicitement true
        if (config.setupCompleted !== true) {
            console.log('⚠️ setupCompleted n\'est pas explicitement true:', config.setupCompleted);
            return true;
        }

        // ✅ CONDITION STRICTE 3: Données utilisateur complètes obligatoires
        if (!userData || !userData.prenom || !userData.nom || 
            userData.prenom.trim() === '' || userData.nom.trim() === '') {
            console.log('⚠️ Données utilisateur manquantes ou incomplètes:', {
                'userData existe': !!userData,
                'prénom valide': !!(userData && userData.prenom && userData.prenom.trim()),
                'nom valide': !!(userData && userData.nom && userData.nom.trim())
            });
            return true;
        }

        // ✅ CONDITION STRICTE 4: Au moins une matière doit être configurée
        if (!matieres || !Array.isArray(matieres) || matieres.length === 0) {
            console.log('⚠️ Aucune matière configurée:', matieres);
            return true;
        }

        console.log('✅ TOUTES LES VÉRIFICATIONS PASSÉES - Onboarding terminé correctement');
        console.log('🔍 === FIN VÉRIFICATION ONBOARDING ===');
        return false;
    }

    /**
     * Configuration de la navigation (remplacée par le composant Navigation)
     */
    setupNavigation() {
        // Cette fonction est désormais remplacée par le composant Navigation
        // Garder pour compatibilité si nécessaire
        /*
        document.querySelectorAll('[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('[data-section]').dataset.section;
                this.showSection(section);
            });
        });
        */
    }

    /**
     * Configuration du menu mobile
     */
    setupMobileMenu() {
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobile-overlay');
        
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
        
        // Bouton de fermeture du sidebar - setup dynamique
        this.setupCloseSidebarButton();
        
        // Fermer le menu en cliquant sur l'overlay
        if (overlay) {
            overlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }
        
        // Fermer le menu avec la touche Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });
        
        // Gérer le redimensionnement de la fenêtre
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) { // lg breakpoint
                this.closeMobileMenu();
            }
        });
    }
    
    /**
     * Configurer le bouton de fermeture de la sidebar (peut être créé dynamiquement)
     */
    setupCloseSidebarButton() {
        const setupCloseBtn = () => {
            const closeBtn = document.getElementById('close-sidebar');
            if (closeBtn && !closeBtn.hasAttribute('data-listener-added')) {
                closeBtn.addEventListener('click', () => {
                    this.closeMobileMenu();
                });
                closeBtn.setAttribute('data-listener-added', 'true');
            }
        };
        
        // Setup immédiat
        setupCloseBtn();
        
        // Observer les changements DOM pour le bouton dynamique
        const observer = new MutationObserver(() => {
            setupCloseBtn();
        });
        
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            observer.observe(sidebar, { childList: true, subtree: true });
        }
    }

    /**
     * Basculer l'état du menu mobile
     */
    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobile-overlay');
        
        if (sidebar && overlay) {
            const isOpen = !sidebar.classList.contains('-translate-x-full');
            
            if (isOpen) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }
    }

    /**
     * Ouvrir le menu mobile
     */
    openMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobile-overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
            document.body.classList.add('overflow-hidden'); // Empêcher le scroll
        }
    }

    /**
     * Fermer le menu mobile
     */
    closeMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobile-overlay');
        
        if (sidebar && overlay) {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }
    }

    /**
     * Afficher une section spécifique (version améliorée)
     */
    showSection(sectionName) {
        // ⚠️ PROTECTION ANTI-BOUCLE INFINIE
        if (this._isNavigating) {
            console.warn(`⚠️ Navigation déjà en cours, ignorant showSection(${sectionName})`);
            return;
        }
        
        this._isNavigating = true;
        
        console.log(`🔄 === DÉBUT showSection(${sectionName}) ===`);
        
        try {
            // Vérification préliminaire que l'application est bien initialisée
            if (!this.dataManager || !this.dataManager.data) {
                console.error('❌ DataManager non initialisé lors de showSection');
                showToast('Application non initialisée. Rechargement...', 'error', 2000);
                setTimeout(() => window.location.reload(), 2000);
                return;
            }
            
            // Vérifier que les modules sont initialisés AVANT de procéder
            if (!this.modulesInitialized()) {
                console.warn('⚠️ Modules non initialisés lors de showSection, réinitialisation...');
                try {
                    this.initializeModules();
                    console.log('✅ Modules réinitialisés avec succès');
                } catch (error) {
                    console.error('❌ Échec critique de la réinitialisation des modules:', error);
                    showToast('Erreur de chargement. Rechargement de la page...', 'error', 2000);
                    setTimeout(() => window.location.reload(), 2000);
                    return;
                }
            }
            
            this.currentSection = sectionName;
            const targetSectionName = sectionName;
            
            console.log(`🔄 Affichage de la section: ${sectionName} -> ${targetSectionName}`);
            
            // Masquer toutes les sections IMMÉDIATEMENT avec double protection
            document.querySelectorAll('.section-content').forEach(section => {
                section.classList.add('hidden');
                section.style.display = 'none'; // Force en cas de problème CSS
            });
            
            // Afficher la section demandée IMMÉDIATEMENT
            const targetSection = document.getElementById(`${targetSectionName}-section`);
            if (targetSection) {
                targetSection.classList.remove('hidden');
                targetSection.style.display = 'block'; // Force l'affichage
                console.log(`✅ Section ${targetSectionName}-section affichée`);
                
                // Animation légère après affichage
                setTimeout(() => {
                    if (this.uiService && this.uiService.animateIn) {
                        this.uiService.animateIn(targetSection, 'fade-in');
                    }
                }, 50);
            } else {
                console.error(`❌ Section ${targetSectionName}-section introuvable dans le DOM`);
                return;
            }
            
            // Rendu du contenu de la section AVANT les animations
            this.renderSection(sectionName);
            
            // Mettre à jour la navigation
            this.updateNavigation(sectionName);
            
            // Mettre à jour le titre de la page
            this.updatePageTitle(sectionName);
            
            // Scroll fluide vers la section
            this.scrollToSection(targetSectionName);
            
            // Fermer le menu mobile s'il est ouvert
            this.closeMobileMenu();
            
            console.log(`✅ === FIN showSection(${sectionName}) ===`);
            
        } catch (error) {
            console.error(`❌ Erreur dans showSection(${sectionName}):`, error);
            showToast(`Erreur lors de l'affichage de la section ${sectionName}`, 'error');
            
            // En cas d'erreur, essayer d'afficher le dashboard
            if (sectionName !== 'dashboard') {
                console.log('🔄 Tentative de retour au dashboard suite à une erreur');
                this.forceDisplayDashboard();
            }
        } finally {
            // ⚠️ TOUJOURS libérer le verrou de navigation
            setTimeout(() => {
                this._isNavigating = false;
            }, 100);
        }
    }

    /**
     * Scroll fluide vers une section
     */
    scrollToSection(sectionName) {
        const targetSection = document.getElementById(`${sectionName}-section`);
        const mainContent = document.querySelector('main');
        
        if (targetSection && mainContent) {
            // Scroll fluide vers le haut du contenu principal
            mainContent.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            
            // Alternative: scroll vers la section spécifique si elle existe
            setTimeout(() => {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        }
    }

    /**
     * Mettre à jour le titre de la page
     */
    updatePageTitle(sectionName) {
        const titleElement = document.getElementById('page-title');
        if (titleElement) {
            const titles = {
                'dashboard': 'Tableau de bord',
                'niveaux': 'Gestion des Niveaux et Classes',
                'eleves': 'Gestion des Élèves',
                'cahier': 'Cahier Journal',
                'calendrier': 'Calendrier & Agenda',
                'progression': 'Suivi de la Progression',
                'import-export': 'Import/Export',
                'parametres': 'Paramètres'
            };
            
            titleElement.textContent = titles[sectionName] || 'Tableau de bord';
        }
    }

    /**
     * Mettre à jour l'état de la navigation
     */
    updateNavigation(activeSection) {
        // Mettre à jour la navigation HTML directement
        const navButtons = document.querySelectorAll('#sidebar button');
        navButtons.forEach(button => {
            // Récupérer la section de ce bouton
            const onclickAttr = button.getAttribute('onclick');
            if (onclickAttr && onclickAttr.includes('showSection')) {
                const match = onclickAttr.match(/showSection\('([^']+)'\)/);
                if (match) {
                    const section = match[1];
                    const isActive = section === activeSection;
                    
                    // Supprimer toutes les classes d'état
                    button.classList.remove('bg-blue-700', 'text-white', 'hover:bg-blue-700');
                    
                    if (isActive) {
                        // Style actif
                        button.classList.add('bg-blue-700', 'text-white');
                        console.log(`✅ Bouton navigation ${section} marqué comme actif`);
                    } else {
                        // Style inactif
                        button.classList.add('hover:bg-blue-700');
                    }
                }
            }
        });
    }

    /**
     * Rendu du contenu de section
     */
    renderSection(sectionName) {
        console.log(`🎨 === DÉBUT renderSection(${sectionName}) ===`);
        
        // S'assurer que les modules sont initialisés avant de les utiliser
        if (!this.modulesInitialized()) {
            console.warn('⚠️ Modules non initialisés, tentative de réinitialisation...');
            try {
                this.initializeModules();
            } catch (error) {
                console.error('❌ Échec de la réinitialisation des modules:', error);
                this.uiService.showToast('Erreur de chargement. Rechargement de la page...', 'error', 2000);
                setTimeout(() => window.location.reload(), 2000);
                return;
            }
        }
        
        try {
            // ⚠️ IMPORTANT: Fermer TOUS les modals AVANT le rendu pour éviter l'auto-ouverture
            this.closeAllModals();
            
            // ⚠️ IMPORTANT: Attendre un court délai pour s'assurer que la section est affichée
            // et s'assurer que les DOM elements sont prêts
            setTimeout(() => {
                // Vérifier que la section existe avant de rendre
                const sectionElement = document.getElementById(`${sectionName}-section`);
                if (!sectionElement) {
                    console.error(`❌ Section ${sectionName}-section n'existe pas dans le DOM`);
                    return;
                }
                
                // ⚠️ DEBUG: Vérifier l'état de la section avant rendu
                console.log(`🔍 Section ${sectionName} avant rendu:`, {
                    visible: !sectionElement.classList.contains('hidden'),
                    innerHTML: sectionElement.innerHTML.substring(0, 100) + '...',
                    clientHeight: sectionElement.clientHeight
                });
                
                switch (sectionName) {
                    case 'dashboard':
                        console.log('🎨 Rendu dashboard...');
                        this.renderDashboard();
                        break;
                    case 'niveaux':
                        console.log('🎨 Rendu niveaux...');
                        try {
                            this.niveauxModule.render();
                            // ⚠️ IMPORTANT: S'assurer que les modals sont cachés
                            setTimeout(() => {
                                const modals = ['niveau-modal', 'classe-modal'];
                                modals.forEach(modalId => {
                                    const modal = document.getElementById(modalId);
                                    if (modal && !modal.classList.contains('hidden')) {
                                        modal.classList.add('hidden');
                                    }
                                });
                            }, 50);
                            console.log('✅ Module niveaux rendu');
                        } catch (error) {
                            console.error('❌ Erreur module niveaux:', error);
                        }
                        break;
                    case 'eleves':
                        console.log('🎨 Rendu eleves...');
                        try {
                            this.elevesModule.render();
                            // ⚠️ IMPORTANT: S'assurer que les modals sont cachés
                            setTimeout(() => {
                                const modal = document.getElementById('eleve-modal');
                                if (modal && !modal.classList.contains('hidden')) {
                                    modal.classList.add('hidden');
                                }
                            }, 50);
                            console.log('✅ Module eleves rendu');
                        } catch (error) {
                            console.error('❌ Erreur module eleves:', error);
                        }
                        break;
                    case 'cahier':
                        console.log('🎨 Rendu cahier...');
                        try {
                            this.cahierModule.render();
                            // ⚠️ IMPORTANT: S'assurer que les modals sont cachés
                            setTimeout(() => {
                                const modal = document.getElementById('entree-modal');
                                if (modal && !modal.classList.contains('hidden')) {
                                    modal.classList.add('hidden');
                                }
                            }, 50);
                            console.log('✅ Module cahier rendu');
                        } catch (error) {
                            console.error('❌ Erreur module cahier:', error);
                        }
                        break;
                    case 'calendrier':
                        console.log('🎨 Rendu calendrier...');
                        try {
                            this.calendrierModule.render();
                            // ⚠️ IMPORTANT: S'assurer que les modals sont cachés
                            setTimeout(() => {
                                const modal = document.getElementById('event-modal');
                                if (modal && !modal.classList.contains('hidden')) {
                                    modal.classList.add('hidden');
                                }
                            }, 50);
                            console.log('✅ Module calendrier rendu');
                        } catch (error) {
                            console.error('❌ Erreur module calendrier:', error);
                        }
                        break;
                    case 'import-export':
                        console.log('🎨 Rendu import-export...');
                        try {
                            this.importExportModule.render();
                            // ⚠️ IMPORTANT: S'assurer que les modals sont cachés
                            setTimeout(() => {
                                const modals = ['import-modal', 'export-modal'];
                                modals.forEach(modalId => {
                                    const modal = document.getElementById(modalId);
                                    if (modal && !modal.classList.contains('hidden')) {
                                        modal.classList.add('hidden');
                                    }
                                });
                            }, 50);
                            console.log('✅ Module import-export rendu');
                        } catch (error) {
                            console.error('❌ Erreur module import-export:', error);
                        }
                        break;
                    case 'parametres':
                        console.log('🎨 Rendu parametres...');
                        try {
                            this.parametresModule.render();
                            // ⚠️ IMPORTANT: S'assurer que les modals sont cachés
                            setTimeout(() => {
                                const modals = ['user-info-modal', 'matiere-modal', 'backup-modal'];
                                modals.forEach(modalId => {
                                    const modal = document.getElementById(modalId);
                                    if (modal && !modal.classList.contains('hidden')) {
                                        modal.classList.add('hidden');
                                        console.log(`✅ Modal ${modalId} fermé`);
                                    }
                                });
                            }, 50);
                            console.log('✅ Module parametres rendu');
                        } catch (error) {
                            console.error('❌ Erreur module parametres:', error);
                        }
                        break;
                    default:
                        console.warn(`⚠️ Section inconnue: ${sectionName}, redirection vers dashboard`);
                        this.renderDashboard();
                        break;
                }
                
                console.log(`✅ Rendu de la section ${sectionName} terminé`);
                
                // ⚠️ Sécurité supplémentaire: fermer à nouveau tous les modals après le rendu
                setTimeout(() => {
                    this.closeAllModals();
                }, 100);
                
                // ⚠️ DEBUG: Vérifier l'état de la section après rendu
                setTimeout(() => {
                    const afterRenderSection = document.getElementById(`${sectionName}-section`);
                    if (afterRenderSection) {
                        console.log(`🔍 Section ${sectionName} après rendu:`, {
                            visible: !afterRenderSection.classList.contains('hidden'),
                            innerHTML: afterRenderSection.innerHTML.substring(0, 200) + '...',
                            clientHeight: afterRenderSection.clientHeight,
                            hasContent: afterRenderSection.innerHTML.trim().length > 0
                        });
                    }
                }, 10);
                
            }, 150); // Délai légèrement plus long pour être sûr que tout est prêt
            
        } catch (error) {
            console.error(`❌ Erreur lors du rendu de la section ${sectionName}:`, error);
            this.uiService.showToast(`Erreur lors du chargement de la section ${sectionName}`, 'error');
            // En cas d'erreur, revenir au dashboard
            if (sectionName !== 'dashboard') {
                console.log('🔄 Retour au dashboard suite à une erreur');
                this.renderDashboard();
            }
        }
        
        console.log(`✅ === FIN renderSection(${sectionName}) ===`);
    }
    
    /**
     * Fermer tous les modals pour éviter les auto-ouvertures
     */
    closeAllModals() {
        const commonModalIds = [
            // Niveaux et classes
            'niveau-modal', 'classe-modal',
            // Élèves
            'eleve-modal',
            // Cahier journal
            'entree-modal',
            // Calendrier
            'event-modal',
            // Import/Export
            'import-modal', 'export-modal',
            // Paramètres
            'user-info-modal', 'backup-modal'
        ];
        
        commonModalIds.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal && !modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
                console.log(`🚫 Modal ${modalId} fermé`);
            }
        });
        
        // Fermer également les modals génériques
        document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
            modal.classList.add('hidden');
        });
        
        console.log('🚫 Tous les modals fermés');
    }

    /**
     * Vérifier si tous les modules sont initialisés
     */
    modulesInitialized() {
        const allModulesExist = this.niveauxModule && 
               this.elevesModule && 
               this.cahierModule && 
               this.calendrierModule &&
               this.importExportModule && 
               this.parametresModule;
        
        if (!allModulesExist) {
            console.warn('⚠️ Modules manquants détectés:', {
                niveauxModule: !!this.niveauxModule,
                elevesModule: !!this.elevesModule,
                cahierModule: !!this.cahierModule,
                calendrierModule: !!this.calendrierModule,
                importExportModule: !!this.importExportModule,
                parametresModule: !!this.parametresModule
            });
        }
        
        return allModulesExist;
    }

    /**
     * Rendu du tableau de bord (section par défaut)
     */
    renderDashboard() {
        const section = document.getElementById('dashboard-section');
        if (!section) {
            console.error('❌ Section dashboard-section introuvable dans le DOM');
            return;
        }

        // Le contenu du dashboard est déjà dans le HTML, on met juste à jour les statistiques
        this.updateDashboard();
        
        console.log('✅ Dashboard rendu avec succès');
    }

    /**
     * Calculer les statistiques générales
     */
    calculateStats() {
        const stats = {
            niveaux: 0,
            classes: 0,
            eleves: 0,
            cahierEntrees: 0
        };

        this.dataManager.data.niveaux.forEach(niveau => {
            stats.niveaux++;
            
            if (niveau.classes) {
                niveau.classes.forEach(classe => {
                    stats.classes++;
                    
                    if (classe.eleves) {
                        stats.eleves += classe.eleves.length;
                    }
                    
                    if (classe.cahierJournal) {
                        stats.cahierEntrees += classe.cahierJournal.length;
                    }
                });
            }
        });

        return stats;
    }

    /**
     * Mettre à jour le dashboard principal
     */
    updateDashboard() {
        const stats = this.calculateStats();
        
        // Mettre à jour le message de bienvenue avec le nom de l'enseignant
        this.updateWelcomeMessage();
        
        // Mettre à jour les activités récentes
        this.updateRecentActivities();
        
        // Mettre à jour les compteurs du dashboard principal
        const totalNiveaux = document.getElementById('total-niveaux');
        const totalClasses = document.getElementById('total-classes');
        const totalEleves = document.getElementById('total-eleves');
        const totalTaches = document.getElementById('total-taches');
        
        if (totalNiveaux) totalNiveaux.textContent = stats.niveaux;
        if (totalClasses) totalClasses.textContent = stats.classes;
        if (totalEleves) totalEleves.textContent = stats.eleves;
        if (totalTaches) totalTaches.textContent = stats.cahierEntrees;
        
        // Animation des compteurs
        this.animateCounters(stats);
        
        console.log('Dashboard mis à jour:', stats);
    }

    /**
     * Animation des compteurs du dashboard
     */
    animateCounters(stats) {
        const counters = [
            { element: document.getElementById('total-niveaux'), target: stats.niveaux },
            { element: document.getElementById('total-classes'), target: stats.classes },
            { element: document.getElementById('total-eleves'), target: stats.eleves },
            { element: document.getElementById('total-taches'), target: stats.cahierEntrees }
        ];

        counters.forEach(counter => {
            if (counter.element) {
                const current = parseInt(counter.element.textContent) || 0;
                this.animateNumber(counter.element, current, counter.target, 300);
            }
        });
    }

    /**
     * Animation d'un nombre
     */
    animateNumber(element, start, end, duration) {
        if (start === end) return;
        
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }

    /**
     * Mettre à jour le message de bienvenue avec le nom de l'enseignant
     */
    updateWelcomeMessage() {
        const teacherWelcome = document.getElementById('teacher-welcome');
        if (teacherWelcome && this.dataManager.data.config && this.dataManager.data.config.user) {
            const user = this.dataManager.data.config.user;
            const prenom = user.prenom || '';
            const nom = user.nom || '';
            
            if (prenom && nom) {
                teacherWelcome.textContent = `Bonjour ${prenom} ${nom} !`;
            } else if (prenom) {
                teacherWelcome.textContent = `Bonjour ${prenom} !`;
            } else {
                teacherWelcome.textContent = 'Bonjour !';
            }
            console.log('✅ Message de bienvenue mis à jour:', teacherWelcome.textContent);
        }
    }

    /**
     * Mettre à jour les activités récentes avec les 8 dernières séances
     */
    updateRecentActivities() {
        const recentActivitiesContainer = document.getElementById('recent-activities');
        if (!recentActivitiesContainer) {
            console.warn('⚠️ Container recent-activities non trouvé');
            return;
        }

        // Récupérer toutes les entrées du cahier journal
        const allEntries = [];
        
        this.dataManager.data.niveaux.forEach(niveau => {
            if (niveau.classes) {
                niveau.classes.forEach(classe => {
                    if (classe.cahierJournal && Array.isArray(classe.cahierJournal)) {
                        classe.cahierJournal.forEach(entree => {
                            allEntries.push({
                                ...entree,
                                classe: classe.nom,
                                niveau: niveau.nom
                            });
                        });
                    }
                });
            }
        });

        // Trier par date (plus récent en premier) et prendre les 8 dernières
        const recentEntries = allEntries
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 8);

        if (recentEntries.length === 0) {
            recentActivitiesContainer.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-clock text-gray-400 text-2xl mb-2"></i>
                    <p class="text-gray-500 text-sm">Aucune séance enregistrée</p>
                    <p class="text-gray-400 text-xs mt-1">Créez votre première entrée de cahier journal</p>
                </div>
            `;
            return;
        }

        // Générer le HTML des activités récentes
        recentActivitiesContainer.innerHTML = recentEntries.map(entree => {
            const matieres = entree.matieres && Array.isArray(entree.matieres) ? entree.matieres : [];
            const matiereText = matieres.length > 0 ? matieres.join(', ') : 'Matière non définie';
            const date = new Date(entree.date);
            const dateText = date.toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'short'
            });
            const timeAgo = this.getTimeAgo(date);
            
            return `
                <div class="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer"
                     onclick="window.app.showSection('cahier')" 
                     title="Voir les détails dans le cahier journal">
                    <div class="flex items-start justify-between">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center space-x-2 mb-1">
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    ${this.escapeHtml(matiereText)}
                                </span>
                                <span class="text-xs text-gray-500">${entree.classe || 'Classe inconnue'}</span>
                            </div>
                            <p class="text-sm text-gray-800 font-medium truncate mb-1">
                                ${this.escapeHtml(entree.objectifs || entree.activites || 'Séance du ' + dateText)}
                            </p>
                            <div class="flex items-center text-xs text-gray-500">
                                <i class="fas fa-calendar mr-1"></i>
                                <span>${dateText}</span>
                                ${entree.horaires ? `
                                    <span class="mx-1">•</span>
                                    <i class="fas fa-clock mr-1"></i>
                                    <span>${this.escapeHtml(entree.horaires)}</span>
                                ` : ''}
                            </div>
                        </div>
                        <div class="flex-shrink-0 ml-3">
                            <span class="text-xs text-gray-400">${timeAgo}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        console.log('✅ Activités récentes mises à jour:', recentEntries.length, 'séances affichées');
    }

    /**
     * Calculer le temps écoulé depuis une date
     */
    getTimeAgo(date) {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return "Aujourd'hui";
        } else if (diffDays === 1) {
            return "Hier";
        } else if (diffDays < 7) {
            return `Il y a ${diffDays}j`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `Il y a ${weeks}sem`;
        } else {
            const months = Math.floor(diffDays / 30);
            return `Il y a ${months}mois`;
        }
    }

    /**
     * Échapper le HTML pour éviter les injections
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Réinitialiser toutes les données
     */
    resetAllData() {
        if (confirm('⚠️ ATTENTION: Cette action supprimera définitivement toutes vos données (niveaux, classes, élèves, cahier journal, etc.).\n\nÊtes-vous absolument certain de vouloir continuer ?')) {
            if (confirm('Dernière confirmation: Toutes les données seront perdues. Continuer ?')) {
                this.dataManager.resetData();
                showToast('Toutes les données ont été réinitialisées', 'success', 3000);
                this.showSection(this.currentSection);
            }
        }
    }

    /**
     * Afficher l'onboarding pour les nouveaux utilisateurs
     */
    showOnboarding() {
        console.log('🔧 showOnboarding appelée - DÉBUT DEBUG');

        // ⚠️ IMPORTANT: S'assurer que l'ancien système d'onboarding n'interfère pas
        // SOLUTION: Forcer la suppression de tout contenu d'onboarding dans les sections
        const sections = ['niveaux-section', 'eleves-section', 'cahier-section', 'progression-section', 'import-export-section', 'parametres-section'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = 'none';
                console.log(`✅ Section ${sectionId} masquée`);
            }
        });

        // ⚠️ IMPORTANT: Supprimer tout contenu d'onboarding existant
        const existingOnboardingContent = document.querySelector('.onboarding-step, #onboarding-modal');
        if (existingOnboardingContent) {
            existingOnboardingContent.remove();
            console.log('🗑️ Ancien contenu d\'onboarding supprimé');
        }

        // Créer la modal d'onboarding
        console.log('🔧 Création de la nouvelle modal...');
        const onboardingModal = document.createElement('div');
        onboardingModal.id = 'onboarding-modal';
        onboardingModal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
        onboardingModal.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        onboardingModal.style.backdropFilter = 'blur(8px)';
        onboardingModal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
                <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10" onclick="window.app.closeOnboarding()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="p-8">
                    <div class="text-center mb-8">
                        <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-graduation-cap text-blue-600 text-3xl"></i>
                        </div>
                        <h1 class="text-3xl font-bold text-gray-900 mb-2">Bienvenue dans votre Gestionnaire de Classes !</h1>
                        <p class="text-gray-600">Configurons votre environnement d'enseignement en quelques étapes simples.</p>
                    </div>

                    <div id="onboarding-step-content">
                        ${this.renderOnboardingStep1()}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(onboardingModal);
        console.log('✅ Nouvelle modal d\'onboarding créée et ajoutée au DOM');

        // Forcer la visibilité avec !important
        onboardingModal.style.cssText += `
            display: flex !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 9999 !important;
            background-color: rgba(0, 0, 0, 0.6) !important;
            backdrop-filter: blur(8px) !important;
        `;

        console.log('🎨 Styles prioritaires appliqués à la modal');

        // Ajouter l'event listener pour fermer avec Escape
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', escapeHandler);
                this.closeOnboarding();
            }
        };
        document.addEventListener('keydown', escapeHandler);

        // Ajouter l'event listener pour fermer en cliquant sur le backdrop
        onboardingModal.addEventListener('click', (e) => {
            if (e.target === onboardingModal) {
                this.closeOnboarding();
            }
        });

        // Vérifier que le contenu est bien généré
        setTimeout(() => {
            const stepContent = document.getElementById('onboarding-step-content');
            if (stepContent) {
                console.log('✅ Contenu d\'onboarding généré:', stepContent.innerHTML.substring(0, 100) + '...');
            } else {
                console.error('❌ Contenu d\'onboarding non trouvé');
            }
        }, 100);

        this.setupOnboardingEventListeners();

        console.log('🚀 Modal d\'onboarding complètement initialisée avec arrière-plan flouté');
    }
    
    /**
     * Fermer la modal d'onboarding de manière sécurisée
     */
    closeOnboarding() {
        console.log('🚪 Fermeture de l\'onboarding...');
        
        const onboardingModal = document.getElementById('onboarding-modal');
        if (onboardingModal) {
            // Animation de sortie
            onboardingModal.style.opacity = '0';
            onboardingModal.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                // Supprimer complètement la modal du DOM
                onboardingModal.remove();
                console.log('✅ Modal d\'onboarding supprimée du DOM');
                
                // Restaurer le scroll du body
                document.body.style.overflow = 'auto';
                
                // ⚠️ IMPORTANT: Forcer l'affichage du dashboard après fermeture onboarding
                this.forceDisplayDashboard();
                
            }, 300);
        } else {
            // Si pas de modal, forcer quand même l'affichage du dashboard
            this.forceDisplayDashboard();
        }
    }
    
    /**
     * Forcer l'affichage du dashboard de manière robuste
     */
    forceDisplayDashboard() {
        console.log('🏠 Forçage de l\'affichage du dashboard...');
        
        // ⚠️ IMPORTANT: Attendre un délai pour que le DOM se stabilise
        setTimeout(() => {
            // 1. Masquer toutes les sections
            document.querySelectorAll('.section-content').forEach(section => {
                section.classList.add('hidden');
                section.style.display = 'none'; // Force même si CSS ne fonctionne pas
            });
            
            // 2. S'assurer que la sidebar est visible
            this.ensureSidebarVisible();
            
            // 3. Afficher explicitement le dashboard
            const dashboardSection = document.getElementById('dashboard-section');
            if (dashboardSection) {
                dashboardSection.classList.remove('hidden');
                dashboardSection.style.display = 'block';
                console.log('✅ Dashboard section rendue visible');
            } else {
                console.error('❌ Dashboard section non trouvée !');
            }
            
            // 4. Mettre à jour l'état interne
            this.currentSection = 'dashboard';
            
            // 5. Mettre à jour la navigation
            this.updateNavigation('dashboard');
            this.updatePageTitle('dashboard');
            
            // 6. Mettre à jour les données du dashboard
            this.updateDashboard();
            
            // 7. Fermer le menu mobile si ouvert
            this.closeMobileMenu();
            
            console.log('✅ Dashboard affiché avec succès après onboarding');
            
        }, 100);
    }
    
    /**
     * Étape 1: Informations personnelles
     */
    renderOnboardingStep1() {
        return `
            <div class="onboarding-step" data-step="1">
                <div class="flex items-center mb-6">
                    <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">1</div>
                    <h2 class="text-xl font-semibold text-gray-800">Commençons par faire connaissance !</h2>
                </div>
                
                <p class="text-gray-600 mb-6">Veuillez saisir vos informations personnelles pour personnaliser votre espace de travail.</p>
                
                <div class="space-y-4 mb-6">
                    <div>
                        <label for="user-prenom" class="block text-sm font-medium text-gray-700 mb-2">Prénom *</label>
                        <input type="text" id="user-prenom" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Hamza">
                    </div>
                    
                    <div>
                        <label for="user-nom" class="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                        <input type="text" id="user-nom" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: Ettaki">
                    </div>
                    
                    <div>
                        <label for="user-ecole" class="block text-sm font-medium text-gray-700 mb-2">École (optionnel)</label>
                        <input type="text" id="user-ecole" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ex: École primaire">
                    </div>
                </div>
                
                <div class="flex justify-end">
                    <button id="step1-next" class="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        Continuer
                        <i class="fas fa-arrow-right ml-2"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Étape 2: Sélection des matières
     */
    renderOnboardingStep2() {
        return `
            <div class="onboarding-step" data-step="2">
                <div class="flex items-center mb-6">
                    <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</div>
                    <h2 class="text-xl font-semibold text-gray-800">Quelles matières enseignez-vous ?</h2>
                </div>
                
                <p class="text-gray-600 mb-6">Sélectionnez les matières que vous enseignez. Vous pourrez en ajouter d'autres plus tard.</p>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    ${MATIERES.map(matiere => `
                        <label class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                            <input type="checkbox" class="matiere-checkbox mr-3" value="${matiere}">
                            <span class="text-gray-800">${matiere}</span>
                        </label>
                    `).join('')}
                </div>
                
                <div class="mb-6">
                    <div class="flex items-center mb-2">
                        <input type="checkbox" id="autre-matiere-checkbox" class="mr-2">
                        <label for="autre-matiere-checkbox" class="text-sm font-medium text-gray-700">Autre matière</label>
                    </div>
                    <input type="text" id="custom-matiere" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" placeholder="Ex: Philosophie, Informatique..." disabled>
                </div>
                
                <div class="flex justify-between">
                    <button id="step2-back" class="btn-secondary px-6 py-3">
                        <i class="fas fa-arrow-left mr-2"></i>
                        Retour
                    </button>
                    <button id="step2-next" class="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        Continuer
                        <i class="fas fa-arrow-right ml-2"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Étape 3: Configuration des compétences (optionnelle)
     */
    renderOnboardingStep3() {
        return `
            <div class="onboarding-step" data-step="3">
                <div class="flex items-center mb-6">
                    <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">3</div>
                    <h2 class="text-xl font-semibold text-gray-800">Configuration des compétences</h2>
                </div>
                
                <p class="text-gray-600 mb-6">Souhaitez-vous configurer les compétences maintenant ou plus tard ?</p>
                
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <div class="flex items-start">
                        <i class="fas fa-info-circle text-blue-600 text-xl mr-3 mt-1"></i>
                        <div>
                            <h3 class="font-semibold text-blue-800 mb-2">Information</h3>
                            <p class="text-blue-700 text-sm">
                                Les compétences vous permettent d'évaluer et de suivre les progrès de vos élèves dans chaque matière. 
                                Vous pourrez toujours ajouter, modifier ou supprimer des compétences depuis la section "Progression" de l'application.
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-4 mb-8">
                    <div class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" onclick="document.getElementById('config-now').checked = true; window.app.updateStep3Buttons()">
                        <input type="radio" name="competences-choice" id="config-now" class="mr-3" value="now">
                        <div>
                            <h4 class="font-medium text-gray-800">Configurer maintenant</h4>
                            <p class="text-sm text-gray-600">Définir les compétences pour chaque matière sélectionnée</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" onclick="document.getElementById('config-later').checked = true; window.app.updateStep3Buttons()">
                        <input type="radio" name="competences-choice" id="config-later" class="mr-3" value="later" checked>
                        <div>
                            <h4 class="font-medium text-gray-800">Configurer plus tard</h4>
                            <p class="text-sm text-gray-600">Commencer à utiliser l'application et configurer les compétences ultérieurement</p>
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-between">
                    <button id="step3-back" class="btn-secondary px-6 py-3">
                        <i class="fas fa-arrow-left mr-2"></i>
                        Retour
                    </button>
                    <button id="step3-continue" class="btn-primary px-6 py-3">
                        Continuer
                        <i class="fas fa-arrow-right ml-2"></i>
                    </button>
                    <button id="step3-finish" class="btn-primary px-6 py-3" style="display: none;">
                        Terminer la configuration
                        <i class="fas fa-check ml-2"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Update Step 3 buttons based on selection
     */
    updateStep3Buttons() {
        const configNow = document.getElementById('config-now');
        const configLater = document.getElementById('config-later');
        const continueBtn = document.getElementById('step3-continue');
        const finishBtn = document.getElementById('step3-finish');
        
        if (configNow && configLater && continueBtn && finishBtn) {
            if (configNow.checked) {
                // "Configurer maintenant" -> Afficher bouton Continuer
                continueBtn.style.display = 'block';
                finishBtn.style.display = 'none';
            } else if (configLater.checked) {
                // "Configurer plus tard" -> Afficher bouton Terminer
                continueBtn.style.display = 'none';
                finishBtn.style.display = 'block';
            }
        }
    }
    
    /**
     * Configuration des event listeners pour l'onboarding
     */
    setupOnboardingEventListeners() {
        this.currentOnboardingStep = 1;
        this.onboardingData = {
            matieres: [],
            matieresData: {},
            competencesData: {},
            classConfig: null
        };
        
        this.setupStep1Listeners();
    }
    
    /**
     * Listeners pour l'étape 1 (Informations personnelles)
     */
    setupStep1Listeners() {
        const prenomInput = document.getElementById('user-prenom');
        const nomInput = document.getElementById('user-nom');
        const ecoleInput = document.getElementById('user-ecole');
        const nextBtn = document.getElementById('step1-next');
        
        const updateNextButton = () => {
            const prenom = prenomInput.value.trim();
            const nom = nomInput.value.trim();
            nextBtn.disabled = !prenom || !nom;
        };
        
        prenomInput.addEventListener('input', updateNextButton);
        nomInput.addEventListener('input', updateNextButton);
        
        nextBtn.addEventListener('click', () => {
            const userData = {
                prenom: prenomInput.value.trim(),
                nom: nomInput.value.trim(),
                ecole: ecoleInput.value.trim()
            };
            
            this.onboardingData.user = userData;
            this.showOnboardingStep2();
        });
    }
    
    /**
     * Afficher l'étape 2
     */
    showOnboardingStep2() {
        const content = document.getElementById('onboarding-step-content');
        content.innerHTML = this.renderOnboardingStep2();
        this.setupStep2Listeners();
    }
    
    /**
     * Listeners pour l'étape 2 (Sélection des matières)
     */
    setupStep2Listeners() {
        const checkboxes = document.querySelectorAll('.matiere-checkbox');
        const autreCheckbox = document.getElementById('autre-matiere-checkbox');
        const customInput = document.getElementById('custom-matiere');
        const nextBtn = document.getElementById('step2-next');
        
        // Gérer le champ "autre matière"
        autreCheckbox.addEventListener('change', () => {
            customInput.disabled = !autreCheckbox.checked;
            if (!autreCheckbox.checked) {
                customInput.value = '';
            }
            updateNextButton();
        });
        
        const updateNextButton = () => {
            const selectedMatieres = Array.from(checkboxes).filter(cb => cb.checked).length;
            const hasAutre = autreCheckbox.checked && customInput.value.trim();
            nextBtn.disabled = selectedMatieres === 0 && !hasAutre;
        };
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateNextButton);
        });
        
        customInput.addEventListener('input', updateNextButton);
        
        // Boutons navigation
        document.getElementById('step2-back').addEventListener('click', () => {
            this.showOnboardingStep1();
        });
        
        document.getElementById('step2-next').addEventListener('click', () => {
            const selectedMatieres = Array.from(checkboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
            
            if (autreCheckbox.checked && customInput.value.trim()) {
                selectedMatieres.push(customInput.value.trim());
            }
            
            this.onboardingData.matieres = selectedMatieres;
            this.showOnboardingStep2Point5(); // New step for group configuration
        });
    }
    
    /**
     * Afficher l'étape 2.5 - Configuration classe/groupe
     */
    showOnboardingStep2Point5() {
        const content = document.getElementById('onboarding-step-content');
        content.innerHTML = this.renderOnboardingStep2Point5();
        this.setupStep2Point5Listeners();
    }
    
    /**
     * Étape 2.5: Configuration classe/groupe
     */
    renderOnboardingStep2Point5() {
        return `
            <div class="onboarding-step" data-step="2.5">
                <div class="flex items-center mb-6">
                    <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">2</div>
                    <h2 class="text-xl font-semibold text-gray-800">Configuration de la classe</h2>
                </div>
                
                <p class="text-gray-600 mb-6">Comment gérez-vous votre classe pour les présences ?</p>
                
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <div class="flex items-start">
                        <i class="fas fa-info-circle text-blue-600 text-xl mr-3 mt-1"></i>
                        <div>
                            <h3 class="font-semibold text-blue-800 mb-2">Simple et pratique</h3>
                            <p class="text-blue-700 text-sm">
                                Choisissez votre mode de travail. Vous pourrez toujours modifier cette configuration plus tard dans les paramètres. 
                                Vous pourrez toujours changer cette option temporairement lors de la prise de présence.
                            </p>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-4 mb-8">
                    <div class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" 
                         onclick="document.getElementById('classe-complete').checked = true">
                        <input type="radio" name="class-config" id="classe-complete" class="mr-3" value="complete">
                        <div class="flex-1">
                            <div class="flex items-center mb-2">
                                <i class="fas fa-users text-blue-600 mr-2"></i>
                                <h4 class="font-medium text-gray-800">Classe complète</h4>
                            </div>
                            <p class="text-sm text-gray-600">Je gère tous les élèves de la classe pour les présences</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" 
                         onclick="document.getElementById('demi-classe').checked = true">
                        <input type="radio" name="class-config" id="demi-classe" class="mr-3" value="groups" checked>
                        <div class="flex-1">
                            <div class="flex items-center mb-2">
                                <i class="fas fa-user-friends text-green-600 mr-2"></i>
                                <h4 class="font-medium text-gray-800">Demi-classe / Groupes</h4>
                            </div>
                            <p class="text-sm text-gray-600">Je travaille avec des groupes spécifiques (demi-classe, ateliers, etc.)</p>
                            <div class="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p class="text-sm text-green-700">
                                    <i class="fas fa-info-circle mr-1"></i>
                                    Les élèves seront automatiquement organisés en <strong>Groupe 1</strong> et <strong>Groupe 2</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-between">
                    <button id="step2-5-back" class="btn-secondary px-6 py-3">
                        <i class="fas fa-arrow-left mr-2"></i>
                        Retour
                    </button>
                    <button id="step2-5-next" class="btn-primary px-6 py-3">
                        Continuer
                        <i class="fas fa-arrow-right ml-2"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Listeners pour l'étape 2.5 (Configuration classe/groupe)
     */
    setupStep2Point5Listeners() {
        // Boutons navigation
        document.getElementById('step2-5-back').addEventListener('click', () => {
            this.showOnboardingStep2();
        });
        
        document.getElementById('step2-5-next').addEventListener('click', () => {
            // Sauvegarder la configuration
            const classConfig = {
                mode: document.querySelector('input[name="class-config"]:checked')?.value || 'groups',
                groupePrincipal: null // Toujours null maintenant, on utilise les groupes par défaut
            };
            
            this.onboardingData.classConfig = classConfig;
            this.finishOnboarding(); // Skip competencies and go directly to finish
        });
    }
    
    /**
     * Afficher la liste des leçons pour une matière
     */
    renderLeconsList(matiere) {
        const container = document.getElementById(`lecons-${matiere.replace(/\s+/g, '-')}`);
        const lecons = this.onboardingData.matieresData[matiere] || [];
        
        container.innerHTML = lecons.map(lecon => `
            <div class="flex items-center justify-between bg-blue-50 px-3 py-2 rounded">
                <span class="text-sm text-blue-800">${lecon}</span>
                <button class="text-red-600 hover:text-red-800 remove-lecon-btn" data-matiere="${matiere}" data-lecon="${lecon}">
                    <i class="fas fa-times text-xs"></i>
                </button>
            </div>
        `).join('');
        
        // Ajouter les listeners pour supprimer
        container.querySelectorAll('.remove-lecon-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const matiere = e.target.dataset.matiere;
                const lecon = e.target.dataset.lecon;
                const index = this.onboardingData.matieresData[matiere].indexOf(lecon);
                if (index > -1) {
                    this.onboardingData.matieresData[matiere].splice(index, 1);
                    this.renderLeconsList(matiere);
                }
            });
        });
    }
    
    /**
     * Afficher l'étape 3
     */
    showOnboardingStep3() {
        const content = document.getElementById('onboarding-step-content');
        content.innerHTML = this.renderOnboardingStep3();
        this.setupStep3Listeners();
    }
    
    /**
     * Listeners pour l'étape 3
     */
    setupStep3Listeners() {
        document.getElementById('step3-back').addEventListener('click', () => {
            this.showOnboardingStep2Point5();
        });
        
        // Gestion du bouton Continuer
        document.getElementById('step3-continue').addEventListener('click', () => {
            const choice = document.querySelector('input[name="competences-choice"]:checked')?.value;
            
            if (choice === 'now') {
                // Aller à l'étape 4 pour la configuration
                this.showOnboardingStep4();
            } else {
                // Terminer directement l'onboarding
                this.finishOnboarding();
            }
        });
        
        // Gestion du bouton Terminer (pour "plus tard")
        document.getElementById('step3-finish').addEventListener('click', () => {
            this.finishOnboarding();
        });
        
        // Écouter les changements de sélection pour mettre à jour les boutons
        document.querySelectorAll('input[name="competences-choice"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateStep3Buttons();
            });
        });
        
        // Initialiser l'affichage des boutons
        this.updateStep3Buttons();
    }
    
    /**
     * Mettre à jour l'affichage des boutons selon le choix
     */
    updateStep3Buttons() {
        const choice = document.querySelector('input[name="competences-choice"]:checked')?.value;
        const continueBtn = document.getElementById('step3-continue');
        const finishBtn = document.getElementById('step3-finish');
        
        if (choice === 'now') {
            // "Configurer maintenant" -> Afficher "Continuer"
            continueBtn.style.display = 'block';
            finishBtn.style.display = 'none';
        } else {
            // "Configurer plus tard" -> Afficher "Terminer la configuration"
            continueBtn.style.display = 'none';
            finishBtn.style.display = 'block';
        }
    }
    
    /**
     * Étape 4: Configuration des compétences par l'enseignant
     */
    renderOnboardingStep4() {
        const selectedMatieres = this.onboardingData.matieres || [];
        
        return `
            <div class="onboarding-step" data-step="4">
                <div class="flex items-center mb-6">
                    <div class="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">4</div>
                    <h2 class="text-xl font-semibold text-gray-800">Définissez vos compétences</h2>
                </div>
                
                <div class="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div class="flex items-start space-x-3">
                        <i class="fas fa-graduation-cap text-blue-600 text-xl mt-1"></i>
                        <div>
                            <h4 class="font-medium text-blue-900 mb-2">Organisation recommandée</h4>
                            <p class="text-sm text-blue-700 mb-3">
                                Créez vos compétences selon cette structure : <strong>Matière → Catégorie → Compétences spécifiques</strong>
                            </p>
                            <div class="bg-white bg-opacity-50 rounded p-3 text-sm">
                                <strong>Exemple :</strong> <span class="text-purple-700 font-semibold">Informatique</span>
                                <div class="ml-4 mt-2 space-y-1">
                                    <div>📁 <strong>Présentation PowerPoint</strong></div>
                                    <div class="ml-6 text-gray-700">
                                        • Insertion de texte • Insertion d'images • Animations • Transitions
                                    </div>
                                    <div>📁 <strong>Utilisation des outils</strong></div>
                                    <div class="ml-6 text-gray-700">
                                        • Maîtrise du clavier • Maîtrise de la souris • Navigation
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-6 mb-6">
                    ${selectedMatieres.map(matiere => {
                        return `
                            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <div class="bg-gradient-to-r from-gray-50 to-blue-50 px-4 py-3 border-b border-gray-200">
                                    <h4 class="font-semibold text-gray-800 flex items-center">
                                        <i class="fas fa-book text-blue-600 mr-2"></i>
                                        ${matiere}
                                    </h4>
                                </div>
                                <div class="p-4">
                                    <div class="mb-4">
                                        <h5 class="text-sm font-medium text-gray-700 mb-3 flex items-center">
                                            <i class="fas fa-folder text-orange-500 mr-2"></i>
                                            Créez vos catégories et compétences :
                                        </h5>
                                        
                                        <!-- Formulaire d'ajout de catégorie -->
                                        <div class="bg-gray-50 rounded-lg p-3 mb-3">
                                            <div class="flex items-center space-x-2 mb-2">
                                                <input type="text" 
                                                       id="new-category-${matiere.replace(/\s+/g, '-')}"
                                                       class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                       placeholder="Nom de la catégorie (ex: Présentation PowerPoint)">
                                                <button type="button" 
                                                        onclick="app.addCategoryToOnboarding('${matiere}')"
                                                        class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center">
                                                    <i class="fas fa-folder-plus mr-1"></i>
                                                    Catégorie
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <!-- Affichage des catégories créées -->
                                        <div id="categories-${matiere.replace(/\s+/g, '-')}" class="space-y-3">
                                            <!-- Les catégories seront ajoutées dynamiquement -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div class="flex items-start space-x-3">
                        <i class="fas fa-lightbulb text-green-600 text-lg mt-1"></i>
                        <div>
                            <h4 class="font-medium text-green-800 mb-2">🎓 Conseils pédagogiques</h4>
                            <ul class="text-sm text-green-700 space-y-1">
                                <li>• <strong>Regroupez</strong> les compétences similaires dans des catégories</li>
                                <li>• <strong>Soyez spécifique</strong> dans le nom de vos compétences</li>
                                <li>• <strong>Vous pourrez</strong> toujours modifier cette organisation plus tard</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="flex justify-between">
                    <button id="step4-back" class="btn-secondary px-6 py-3">
                        <i class="fas fa-arrow-left mr-2"></i>
                        Retour
                    </button>
                    <button id="step4-finish" class="btn-primary px-6 py-3">
                        Terminer la configuration
                        <i class="fas fa-check ml-2"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Afficher l'étape 4
     */
    showOnboardingStep4() {
        const content = document.getElementById('onboarding-step-content');
        content.innerHTML = this.renderOnboardingStep4();
        this.setupStep4Listeners();
        
        // Initialiser les compétences pour chaque matière
        if (!this.onboardingData.competencesData) {
            this.onboardingData.competencesData = {};
        }
        
        this.onboardingData.matieres.forEach(matiere => {
            if (!this.onboardingData.competencesData[matiere]) {
                this.onboardingData.competencesData[matiere] = [];
            }
        });
    }
    
    /**
     * Listeners pour l'étape 4
     */
    setupStep4Listeners() {
        document.getElementById('step4-back').addEventListener('click', () => {
            this.showOnboardingStep3();
        });
        
        document.getElementById('step4-finish').addEventListener('click', () => {
            this.finishOnboarding();
        });
        
        // Initialiser l'affichage des catégories pour chaque matière
        this.onboardingData.matieres.forEach(matiere => {
            // Initialiser la structure hiérarchique si nécessaire
            if (!this.onboardingData.competencesData) {
                this.onboardingData.competencesData = {};
            }
            if (!this.onboardingData.competencesData[matiere]) {
                this.onboardingData.competencesData[matiere] = {};
            }
            
            // Afficher les catégories existantes
            this.renderCategoriesForMatiere(matiere);
            
            // Événement pour ajouter des catégories avec Enter
            const categoryInput = document.getElementById(`new-category-${matiere.replace(/\s+/g, '-')}`);
            if (categoryInput) {
                categoryInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.addCategoryToOnboarding(matiere);
                    }
                });
            }
        });
    }
    
    /**
     * Ajouter une catégorie lors de l'onboarding
     */
    addCategoryToOnboarding(matiere) {
        const input = document.getElementById(`new-category-${matiere.replace(/\s+/g, '-')}`);
        const categoryName = input.value.trim();
        
        if (!categoryName) {
            showToast('Veuillez saisir un nom de catégorie', 'warning');
            return;
        }
        
        // Initialiser les données hiérarchiques si nécessaire
        if (!this.onboardingData.competencesData) {
            this.onboardingData.competencesData = {};
        }
        
        if (!this.onboardingData.competencesData[matiere]) {
            this.onboardingData.competencesData[matiere] = {};
        }
        
        // Vérifier si la catégorie existe déjà
        if (this.onboardingData.competencesData[matiere][categoryName]) {
            showToast('Cette catégorie existe déjà', 'warning');
            return;
        }
        
        // Créer la catégorie avec un tableau vide pour les compétences
        this.onboardingData.competencesData[matiere][categoryName] = [];
        
        input.value = '';
        
        // Rafraîchir l'affichage des catégories
        this.renderCategoriesForMatiere(matiere);
        
        showToast(`Catégorie "${categoryName}" créée`, 'success');
    }
    
    /**
     * Afficher les catégories pour une matière
     */
    renderCategoriesForMatiere(matiere) {
        const container = document.getElementById(`categories-${matiere.replace(/\s+/g, '-')}`);
        if (!container) return;
        
        const categories = this.onboardingData.competencesData[matiere] || {};
        
        container.innerHTML = Object.keys(categories).map(categoryName => {
            const competences = categories[categoryName] || [];
            return `
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div class="flex items-center justify-between mb-3">
                        <h6 class="font-medium text-blue-900 flex items-center">
                            <i class="fas fa-folder text-orange-500 mr-2"></i>
                            ${categoryName}
                        </h6>
                        <button type="button" 
                                onclick="app.removeCategoryFromOnboarding('${matiere}', '${categoryName}')"
                                class="text-red-600 hover:text-red-800 p-1 rounded"
                                title="Supprimer la catégorie">
                            <i class="fas fa-trash text-xs"></i>
                        </button>
                    </div>
                    
                    <!-- Formulaire d'ajout de compétence pour cette catégorie -->
                    <div class="bg-white rounded p-2 mb-2">
                        <div class="flex items-center space-x-2">
                            <input type="text" 
                                   id="new-competence-${matiere.replace(/\s+/g, '-')}-${categoryName.replace(/\s+/g, '-')}"
                                   class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                   placeholder="Nom de la compétence (ex: Insertion d'images)"
                                   onkeypress="if(event.key === 'Enter') app.addCompetenceToCategory('${matiere}', '${categoryName}')">
                            <button type="button" 
                                    onclick="app.addCompetenceToCategory('${matiere}', '${categoryName}')"
                                    class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Liste des compétences de cette catégorie -->
                    <div class="space-y-1">
                        ${competences.map((comp, index) => `
                            <div class="bg-white rounded px-2 py-1 flex items-center justify-between text-sm">
                                <span class="text-gray-800">${comp.nom}</span>
                                <button type="button" 
                                        onclick="app.removeCompetenceFromCategory('${matiere}', '${categoryName}', ${index})"
                                        class="text-red-600 hover:text-red-800 p-1">
                                    <i class="fas fa-times text-xs"></i>
                                </button>
                            </div>
                        `).join('')}
                        ${competences.length === 0 ? '<p class="text-xs text-gray-500 italic">Aucune compétence ajoutée</p>' : ''}
                    </div>
                </div>
            `;
        }).join('');
        
        if (Object.keys(categories).length === 0) {
            container.innerHTML = '<p class="text-sm text-gray-500 italic">Aucune catégorie créée</p>';
        }
    }
    
    /**
     * Ajouter une compétence à une catégorie
     */
    addCompetenceToCategory(matiere, categoryName) {
        const input = document.getElementById(`new-competence-${matiere.replace(/\s+/g, '-')}-${categoryName.replace(/\s+/g, '-')}`);
        const competenceName = input.value.trim();
        
        if (!competenceName) {
            showToast('Veuillez saisir un nom de compétence', 'warning');
            return;
        }
        
        // Ajouter la compétence à la catégorie
        const competence = {
            id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            nom: competenceName,
            description: '',
            matiere: matiere,
            categorie: categoryName
        };
        
        this.onboardingData.competencesData[matiere][categoryName].push(competence);
        
        input.value = '';
        
        // Rafraîchir l'affichage
        this.renderCategoriesForMatiere(matiere);
        
        showToast(`Compétence "${competenceName}" ajoutée`, 'success');
    }
    
    /**
     * Supprimer une catégorie
     */
    removeCategoryFromOnboarding(matiere, categoryName) {
        if (confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${categoryName}" et toutes ses compétences ?`)) {
            delete this.onboardingData.competencesData[matiere][categoryName];
            this.renderCategoriesForMatiere(matiere);
            showToast('Catégorie supprimée', 'success');
        }
    }
    
    /**
     * Supprimer une compétence d'une catégorie
     */
    removeCompetenceFromCategory(matiere, categoryName, index) {
        this.onboardingData.competencesData[matiere][categoryName].splice(index, 1);
        this.renderCategoriesForMatiere(matiere);
        showToast('Compétence supprimée', 'success');
    }
    
    /**
     * Retourner à l'étape 1
     */
    showOnboardingStep1() {
        const content = document.getElementById('onboarding-step-content');
        content.innerHTML = this.renderOnboardingStep1();
        this.setupStep1Listeners();
    }
    
    /**
     * Terminer la configuration
     */
    finishOnboarding() {
        console.log('🏁 Finalisation de l\'onboarding (version corrigée)...');
        
        // ⚠️ VÉRIFICATION DE SÉCURITÉ: S'assurer que les objets nécessaires existent
        if (!this.dataManager || !this.dataManager.data) {
            console.error('❌ Erreur: DataManager ou data non disponibles dans finishOnboarding');
            showToast('Erreur lors de la sauvegarde des données', 'error');
            return;
        }
        
        // ⚠️ VÉRIFICATION DE SÉCURITÉ: Créer l'objet config s'il n'existe pas
        if (!this.dataManager.data.config) {
            console.log('⚠️ Config non disponible - création de l\'objet config');
            this.dataManager.data.config = {};
        }
        
        // ⚠️ VÉRIFICATION DE SÉCURITÉ: Vérifier les données onboarding
        if (!this.onboardingData) {
            console.error('❌ Erreur: Données d\'onboarding manquantes');
            showToast('Erreur: Données de configuration manquantes', 'error');
            return;
        }
        
        // ✅ VALIDATION STRICTE: Vérifier les données utilisateur obligatoires
        const user = this.onboardingData.user;
        if (!user || !user.prenom || !user.nom || 
            user.prenom.trim() === '' || user.nom.trim() === '') {
            console.error('❌ Erreur: Informations utilisateur incomplètes:', user);
            showToast('Erreur: Prénom et nom obligatoires', 'error');
            return;
        }
        
        // ✅ VALIDATION STRICTE: Vérifier qu'au moins une matière est sélectionnée
        const matieres = this.onboardingData.matieres || [];
        if (!Array.isArray(matieres) || matieres.length === 0) {
            console.error('❌ Erreur: Aucune matière sélectionnée:', matieres);
            showToast('Erreur: Au moins une matière doit être sélectionnée', 'error');
            return;
        }
        
        console.log('💾 Début de la sauvegarde des données onboarding...');
        
        // ✅ SAUVEGARDE COMPLÈTE: Informations utilisateur
        this.dataManager.data.config.user = {
            prenom: user.prenom.trim(),
            nom: user.nom.trim(),
            ecole: (user.ecole || '').trim()
        };
        console.log('✅ Utilisateur sauvegardé:', this.dataManager.data.config.user);
        
        // ✅ SAUVEGARDE COMPLÈTE: Matières sélectionnées
        this.dataManager.data.matieres = matieres.filter(m => m && m.trim() !== '');
        console.log('✅ Matières sauvegardées:', this.dataManager.data.matieres);
        
        // ✅ SAUVEGARDE COMPLÈTE: Configuration classe/groupe
        if (this.onboardingData.classConfig) {
            this.dataManager.data.config.classConfig = this.onboardingData.classConfig;
            console.log('✅ Configuration classe sauvegardée:', this.dataManager.data.config.classConfig);
        }
        
        // ✅ SAUVEGARDE COMPLÈTE: Compétences personnalisées si configurées avec structure hiérarchique
        if (this.onboardingData.competencesData && Object.keys(this.onboardingData.competencesData).length > 0) {
            // Convertir la structure hiérarchique en format attendu par l'application
            const competencesFormatted = {};
            
            Object.keys(this.onboardingData.competencesData).forEach(matiere => {
                const categories = this.onboardingData.competencesData[matiere];
                
                if (Object.keys(categories).length > 0) {
                    competencesFormatted[matiere] = categories;
                }
            });
            
            if (Object.keys(competencesFormatted).length > 0) {
                this.dataManager.data.competencesPersonnalisees = competencesFormatted;
                console.log('✅ Compétences personnalisées avec structure hiérarchique sauvegardées:', competencesFormatted);
            }
        }
        
        // ✅ MARQUAGE CRITIQUE: Configuration terminée de manière stricte
        this.dataManager.data.config.firstLaunch = false;
        this.dataManager.data.config.setupCompleted = true;
        this.dataManager.data.config.onboardingCompletedAt = new Date().toISOString();
        this.dataManager.data.config.version = '1.0.0';
        
        console.log('💾 Configuration marquée comme terminée:', {
            firstLaunch: this.dataManager.data.config.firstLaunch,
            setupCompleted: this.dataManager.data.config.setupCompleted,
            onboardingCompletedAt: this.dataManager.data.config.onboardingCompletedAt
        });
        
        // ✅ SAUVEGARDE CRITIQUE: Persisté dans localStorage
        const saveSuccess = this.dataManager.saveData();
        if (!saveSuccess) {
            console.error('❌ Erreur lors de la sauvegarde dans localStorage');
            showToast('Erreur lors de la sauvegarde. Veuillez réessayer.', 'error');
            return;
        }
        
        console.log('✅ Données sauvegardées avec succès dans localStorage');
        console.log('📋 Données finales:', this.dataManager.data);
        
        // Afficher un message de succès
        showToast('Configuration terminée avec succès !', 'success', 3000);
        
        // Fermer la modal d'onboarding avec affichage forcé du dashboard
        this.closeOnboarding();
        
        // ⚠️ IMPORTANT: Réinitialisation post-onboarding
        setTimeout(() => {
            // Réinitialiser tous les modules après l'onboarding
            this.reinitializeModules();
            
            // S'assurer que la sidebar est visible
            this.ensureSidebarVisible();
            
            // ⚠️ IMPORTANT: Reconfigurer la navigation HTML après l'onboarding
            this.setupHTMLNavigation();
            
            // ⚠️ IMPORTANT: Configurer le menu mobile après l'onboarding
            this.setupMobileMenu();
            
            console.log('🎉 Onboarding complété avec succès !');
        }, 800);
    }
    
    /**
     * Réinitialiser tous les modules après l'onboarding
     */
    reinitializeModules() {
        console.log('🔄 Réinitialisation des modules après onboarding...');
        
        try {
            // Utiliser la méthode d'initialisation standard
            this.initializeModules();
            
            // Réinitialiser la navigation HTML
            this.setupHTMLNavigation();
            
            console.log('✅ Modules réinitialisés avec succès');
            
        } catch (error) {
            console.error('❌ Erreur lors de la réinitialisation des modules:', error);
            
            // En cas d'erreur, proposer un rechargement de la page
            console.log('🔄 Tentative de rechargement automatique de la page...');
            
            showToast('Finalisation de la configuration... Rechargement automatique', 'info', 2500);
            
            // Rechargement automatique après l'onboarding comme solution de secours
            setTimeout(() => {
                console.log('🔄 Rechargement automatique de la page pour finaliser la configuration');
                window.location.reload();
            }, 2500);
        }
    }
    
    /**
     * Export rapide des données en JSON
     */
    exportDataAsJSON() {
        try {
            const dataStr = JSON.stringify(this.dataManager.data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `gestionnaire_classes_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showToast('Sauvegarde JSON exportée', 'success', 3000);
        } catch (error) {
            console.error('Erreur export JSON:', error);
            showToast('Erreur lors de l\'export', 'error');
        }
    }

    /**
     * Import de données depuis JSON
     */
    importDataFromJSON(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (confirm('Remplacer toutes les données actuelles par celles du fichier importé ?')) {
                    this.dataManager.data = importedData;
                    this.dataManager.saveData();
                    showToast('Données importées avec succès', 'success', 3000);
                    this.showSection(this.currentSection);
                }
            } catch (error) {
                console.error('Erreur import JSON:', error);
                showToast('Fichier JSON invalide', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// === INITIALISATION DE L'APPLICATION ===

// ⚠️ IMPORTANTE: Fonction de secours pour la navigation avant que l'app soit prête
window.safeShowSection = function(section) {
    console.log('🔧 safeShowSection appelée pour:', section);
    
    // Si l'app est prête, utiliser la méthode normale
    if (window.app && window.app.showSection && typeof window.app.showSection === 'function') {
        console.log('✅ App prête, utilisation de window.app.showSection');
        window.app.showSection(section);
        return;
    }
    
    // Sinon, attendre que l'app soit prête avec retry
    console.log('⏳ App pas encore prête, attente...');
    let retryCount = 0;
    const maxRetries = 50; // 5 secondes max
    
    const waitForApp = () => {
        retryCount++;
        
        if (window.app && window.app.showSection && typeof window.app.showSection === 'function') {
            console.log('✅ App maintenant prête après', retryCount * 100, 'ms');
            window.app.showSection(section);
        } else if (retryCount < maxRetries) {
            setTimeout(waitForApp, 100);
        } else {
            console.error('❌ Timeout: App non initialisée après 5 secondes');
            showToast('Application en cours de chargement...', 'info', 2000);
        }
    };
    
    setTimeout(waitForApp, 100);
};

// Fonction temporaire pour éviter les erreurs lors du chargement (legacy)
window.showSection = window.safeShowSection;

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier que toutes les dépendances sont chargées
    if (typeof DataManager === 'undefined' || 
        typeof NiveauxModule === 'undefined' || 
        typeof ElevesModule === 'undefined') {
        console.error('Erreur: Modules requis non chargés');
        document.body.innerHTML = `
            <div class="min-h-screen flex items-center justify-center bg-red-50">
                <div class="text-center">
                    <i class="fas fa-exclamation-triangle text-red-600 text-4xl mb-4"></i>
                    <h1 class="text-xl font-bold text-red-800 mb-2">Erreur de Chargement</h1>
                    <p class="text-red-600">Certains modules requis n'ont pas pu être chargés.</p>
                    <p class="text-sm text-red-500 mt-2">Veuillez recharger la page.</p>
                </div>
            </div>
        `;
        return;
    }

    // Initialiser l'application
    try {
        const app = new SchoolManager();
        app.init();
        
        // Exposer globalement pour le débogage et les appels depuis HTML
        window.app = app;
        window.showSection = (section) => app.showSection(section);
        
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        if (typeof showToast !== 'undefined') {
            showToast('Erreur lors de l\'initialisation de l\'application', 'error');
        }
    }
});

// === FONCTIONS UTILITAIRES GLOBALES ===

/**
 * Afficher une confirmation avant fermeture si des données non sauvegardées
 */
window.addEventListener('beforeunload', (e) => {
    // Pour l'instant, on n'avertit pas car localStorage sauvegarde automatiquement
    // Dans le futur, on pourrait vérifier s'il y a des changements non sauvegardés
});

/**
 * Gestion des erreurs JavaScript non capturées
 */
window.addEventListener('error', (e) => {
    console.error('Erreur JavaScript:', e.error || e.message || 'Erreur inconnue');
    showToast('Une erreur inattendue s\'est produite', 'error');
});

/**
 * Gestion des rejets de promesses non capturés
 */
window.addEventListener('unhandledrejection', (e) => {
    console.error('Promesse rejetée:', e.reason);
    showToast('Erreur de traitement asynchrone', 'error');
});
