/**
 * Module Theme - Gestion du mode sombre/clair
 */
class ThemeModule {
    constructor() {
        this.currentTheme = this.getStoredTheme() || this.getSystemPreference();
        this.initializeTheme();
    }

    /**
     * Initialiser le système de thème
     */
    initializeTheme() {
        this.applyTheme(this.currentTheme);
        this.createThemeToggle();
        this.watchSystemChanges();
    }

    /**
     * Obtenir la préférence système
     */
    getSystemPreference() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    /**
     * Obtenir le thème stocké
     */
    getStoredTheme() {
        return localStorage.getItem('app-theme');
    }

    /**
     * Stocker le thème
     */
    setStoredTheme(theme) {
        localStorage.setItem('app-theme', theme);
    }

    /**
     * Appliquer un thème
     */
    applyTheme(theme) {
        const html = document.documentElement;
        const body = document.body;

        // Supprimer les classes de thème existantes
        html.classList.remove('theme-light', 'theme-dark');
        body.classList.remove('theme-light', 'theme-dark');

        // Ajouter la nouvelle classe de thème
        html.classList.add(`theme-${theme}`);
        body.classList.add(`theme-${theme}`);

        // Mettre à jour l'attribut data-theme pour CSS
        html.setAttribute('data-theme', theme);

        this.currentTheme = theme;
        this.setStoredTheme(theme);
        this.updateThemeToggle();
    }

    /**
     * Basculer entre les thèmes
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        
        // Animation de transition
        this.animateThemeTransition();
        
        // Toast de confirmation
        if (typeof showToast === 'function') {
            showToast(`Mode ${newTheme === 'dark' ? 'sombre' : 'clair'} activé`, 'success');
        }
    }

    /**
     * Animation de transition entre thèmes
     */
    animateThemeTransition() {
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    /**
     * Créer le bouton de basculement de thème
     */
    createThemeToggle() {
        // Vérifier si le toggle existe déjà
        if (document.getElementById('theme-toggle')) return;

        const themeToggle = document.createElement('button');
        themeToggle.id = 'theme-toggle';
        themeToggle.className = 'theme-toggle-btn';
        themeToggle.setAttribute('aria-label', 'Basculer le thème');
        themeToggle.innerHTML = this.getToggleIcon();
        
        themeToggle.addEventListener('click', () => this.toggleTheme());

        // Ajouter le toggle à la navigation
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            const nav = sidebar.querySelector('nav ul');
            if (nav) {
                const themeItem = document.createElement('li');
                themeItem.className = 'theme-toggle-container';
                themeItem.appendChild(themeToggle);
                nav.appendChild(themeItem);
            }
        }
    }

    /**
     * Obtenir l'icône du toggle selon le thème actuel
     */
    getToggleIcon() {
        const isDark = this.currentTheme === 'dark';
        return `
            <div class="theme-toggle-content">
                <i class="fas ${isDark ? 'fa-sun' : 'fa-moon'}"></i>
                <span class="theme-toggle-text">${isDark ? 'Mode clair' : 'Mode sombre'}</span>
            </div>
        `;
    }

    /**
     * Mettre à jour l'affichage du toggle
     */
    updateThemeToggle() {
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.innerHTML = this.getToggleIcon();
        }
    }

    /**
     * Surveiller les changements système
     */
    watchSystemChanges() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            // Ne changer automatiquement que si aucune préférence n'est stockée
            if (!this.getStoredTheme()) {
                this.applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    /**
     * Obtenir le thème actuel
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * Définir un thème spécifique
     */
    setTheme(theme) {
        if (['light', 'dark'].includes(theme)) {
            this.applyTheme(theme);
        }
    }

    /**
     * Réinitialiser au thème système
     */
    resetToSystem() {
        localStorage.removeItem('app-theme');
        this.applyTheme(this.getSystemPreference());
        
        if (typeof showToast === 'function') {
            showToast('Thème réinitialisé aux préférences système', 'success');
        }
    }

    /**
     * Obtenir les variables CSS du thème actuel
     */
    getThemeVariables() {
        const isDark = this.currentTheme === 'dark';
        
        return {
            // Couleurs de fond
            bgPrimary: isDark ? '#1a1a1a' : '#ffffff',
            bgSecondary: isDark ? '#2d2d2d' : '#f9fafb',
            bgTertiary: isDark ? '#3d3d3d' : '#f3f4f6',
            
            // Couleurs de texte
            textPrimary: isDark ? '#ffffff' : '#1f2937',
            textSecondary: isDark ? '#d1d5db' : '#6b7280',
            textTertiary: isDark ? '#9ca3af' : '#9ca3af',
            
            // Couleurs de bordure
            borderPrimary: isDark ? '#374151' : '#e5e7eb',
            borderSecondary: isDark ? '#4b5563' : '#d1d5db',
            
            // Couleurs d'accent (restent cohérentes)
            accentPrimary: '#3b82f6',
            accentSecondary: '#10b981',
            accentWarning: '#f59e0b',
            accentDanger: '#ef4444',
            
            // Ombres
            shadowLight: isDark ? '0 2px 8px rgba(0, 0, 0, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
            shadowMedium: isDark ? '0 4px 16px rgba(0, 0, 0, 0.4)' : '0 4px 16px rgba(0, 0, 0, 0.12)',
            shadowHeavy: isDark ? '0 8px 32px rgba(0, 0, 0, 0.5)' : '0 8px 32px rgba(0, 0, 0, 0.15)'
        };
    }
}

// Instance globale
let themeModule;

/**
 * Initialiser le module de thème
 */
function initializeTheme() {
    themeModule = new ThemeModule();
    return themeModule;
}

/**
 * Fonctions utilitaires globales
 */
function toggleTheme() {
    if (themeModule) {
        themeModule.toggleTheme();
    }
}

function getCurrentTheme() {
    return themeModule ? themeModule.getCurrentTheme() : 'light';
}

function setTheme(theme) {
    if (themeModule) {
        themeModule.setTheme(theme);
    }
}
