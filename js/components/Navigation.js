/**
 * Navigation Component - Gestion de la navigation latérale
 * Améliore l'organisation et la réutilisabilité de la navigation
 */
class Navigation extends BaseComponent {
    constructor(container, options = {}) {
        super(container, {
            items: [],
            currentSection: 'dashboard',
            onSectionChange: null,
            mobileEnabled: true,
            ...options
        });

        this.activeItemElement = null;
        this.render();
    }

    /**
     * Rendu de la navigation
     */
    render() {
        if (!this.container) return;

        // If we're replacing content in an existing sidebar structure,
        // don't include the header
        const includeHeader = this.options.includeHeader !== false;
        
        this.container.innerHTML = `
            ${includeHeader ? `
            <div class="flex items-center justify-between mb-8 p-4">
                <div class="flex items-center">
                    <i class="fas fa-graduation-cap text-2xl mr-3"></i>
                    <h1 class="text-lg lg:text-xl font-bold">Gestionnaire</h1>
                </div>
                ${this.options.mobileEnabled ? `
                <button id="close-sidebar" class="lg:hidden text-white hover:text-gray-300">
                    <i class="fas fa-times text-xl"></i>
                </button>
                ` : ''}
            </div>
            ` : ''}
            
            <div class="${includeHeader ? 'px-4' : ''}">
                <ul class="space-y-1" id="nav-items">
                    ${this.renderNavigationItems()}
                </ul>
            </div>
        `;

        this.setupEventListeners();
        this.updateActiveItem(this.options.currentSection);
    }

    /**
     * Rendu des éléments de navigation
     */
    renderNavigationItems() {
        const defaultItems = this.getDefaultNavigationItems();
        const items = this.options.items.length > 0 ? this.options.items : defaultItems;

        return items.map(item => this.renderNavigationItem(item)).join('');
    }

    /**
     * Obtenir les éléments de navigation par défaut
     */
    getDefaultNavigationItems() {
        return [
            {
                id: 'dashboard',
                label: 'Tableau de bord',
                icon: 'fa-tachometer-alt',
                section: 'dashboard'
            },
            {
                id: 'niveaux',
                label: 'Niveaux & Classes',
                icon: 'fa-layer-group',
                section: 'niveaux'
            },
            {
                id: 'eleves',
                label: 'Élèves',
                icon: 'fa-users',
                section: 'eleves'
            },
            {
                id: 'cahier',
                label: 'Cahier Journal',
                icon: 'fa-book',
                section: 'cahier'
            },
            {
                id: 'progression',
                label: 'Progression',
                icon: 'fa-chart-line',
                section: 'progression'
            },
            {
                id: 'taches',
                label: 'Tâches & Activités',
                icon: 'fa-tasks',
                section: 'taches'
            },
            {
                type: 'separator'
            },
            {
                id: 'import-export',
                label: 'Import/Export',
                icon: 'fa-file-excel',
                section: 'import-export'
            },
            {
                id: 'parametres',
                label: 'Paramètres',
                icon: 'fa-cog',
                section: 'parametres'
            }
        ];
    }

    /**
     * Rendu d'un élément de navigation
     */
    renderNavigationItem(item) {
        if (item.type === 'separator') {
            return '<li class="pt-4 border-t border-blue-700"></li>';
        }

        const isActive = item.section === this.options.currentSection;
        const baseClasses = 'nav-item w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 flex items-center';
        const activeClasses = isActive ? 'bg-blue-700 text-white' : 'hover:bg-blue-700';
        
        return `
            <li>
                <button 
                    data-section="${item.section}"
                    data-nav-id="${item.id}"
                    class="${baseClasses} ${activeClasses}"
                    ${item.disabled ? 'disabled' : ''}
                >
                    <i class="fas ${item.icon} w-5 mr-3 text-center"></i>
                    <span class="font-medium">${this.escapeHtml(item.label)}</span>
                    ${item.badge ? `<span class="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full">${item.badge}</span>` : ''}
                </button>
            </li>
        `;
    }

    /**
     * Configuration des event listeners
     */
    setupEventListeners() {
        // Navigation items
        const navItems = this.container.querySelectorAll('[data-section]');
        navItems.forEach(item => {
            this.addEventListener(item, 'click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Mobile close button
        if (this.options.mobileEnabled) {
            const closeBtn = this.container.querySelector('#close-sidebar');
            if (closeBtn) {
                this.addEventListener(closeBtn, 'click', () => {
                    this.closeMobileMenu();
                });
            }
        }
    }

    /**
     * Naviguer vers une section
     */
    navigateToSection(section) {
        if (section === this.options.currentSection) return;

        this.options.currentSection = section;
        this.updateActiveItem(section);

        // Fermer le menu mobile si ouvert
        if (this.options.mobileEnabled) {
            this.closeMobileMenu();
        }

        // Appeler le callback de changement de section
        if (this.options.onSectionChange) {
            this.options.onSectionChange(section);
        }
    }

    /**
     * Mettre à jour l'élément actif
     */
    updateActiveItem(section) {
        const navItems = this.container.querySelectorAll('[data-section]');
        
        navItems.forEach(item => {
            const isActive = item.dataset.section === section;
            
            // Supprimer les classes actives
            item.classList.remove('bg-blue-700', 'text-white');
            item.classList.add('hover:bg-blue-700');
            
            if (isActive) {
                item.classList.add('bg-blue-700', 'text-white');
                item.classList.remove('hover:bg-blue-700');
                this.activeItemElement = item;
            }
        });
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
     * Ajouter un élément de navigation
     */
    addNavigationItem(item, position = -1) {
        if (position === -1) {
            this.options.items.push(item);
        } else {
            this.options.items.splice(position, 0, item);
        }
        this.render();
    }

    /**
     * Supprimer un élément de navigation
     */
    removeNavigationItem(itemId) {
        this.options.items = this.options.items.filter(item => item.id !== itemId);
        this.render();
    }

    /**
     * Mettre à jour le badge d'un élément
     */
    updateItemBadge(itemId, badge) {
        const item = this.options.items.find(item => item.id === itemId);
        if (item) {
            item.badge = badge;
            this.render();
        }
    }

    /**
     * Activer/désactiver un élément
     */
    setItemDisabled(itemId, disabled) {
        const item = this.options.items.find(item => item.id === itemId);
        if (item) {
            item.disabled = disabled;
            this.render();
        }
    }

    /**
     * Obtenir la section courante
     */
    getCurrentSection() {
        return this.options.currentSection;
    }

    /**
     * Définir la section courante
     */
    setCurrentSection(section) {
        this.options.currentSection = section;
        this.updateActiveItem(section);
    }

    /**
     * Obtenir l'élément de navigation actif
     */
    getActiveItem() {
        return this.activeItemElement;
    }

    /**
     * Vérifier si un élément est actif
     */
    isItemActive(itemId) {
        const item = this.options.items.find(item => item.id === itemId);
        return item && item.section === this.options.currentSection;
    }

    /**
     * Rechercher des éléments de navigation
     */
    searchItems(query) {
        if (!query) return this.options.items;
        
        const lowerQuery = query.toLowerCase();
        return this.options.items.filter(item => 
            item.label && item.label.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Regrouper les éléments par catégorie
     */
    getItemsByCategory() {
        const categories = {
            main: [],
            tools: [],
            settings: []
        };

        this.options.items.forEach(item => {
            if (item.type === 'separator') return;
            
            const category = item.category || 'main';
            if (categories[category]) {
                categories[category].push(item);
            }
        });

        return categories;
    }
}