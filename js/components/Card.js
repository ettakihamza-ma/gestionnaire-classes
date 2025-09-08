/**
 * Card Component - Composant carte réutilisable
 * Affiche des informations dans un format structuré avec header, body et footer optionnels
 */
class Card extends BaseComponent {
    constructor(container, options = {}) {
        super(container, {
            title: '',
            subtitle: '',
            content: '',
            icon: '',
            actions: [],
            className: '',
            headerClassName: '',
            bodyClassName: '',
            footerClassName: '',
            clickable: false,
            hover: true,
            shadow: true,
            border: true,
            ...options
        });

        this.cardElement = null;
        this.render();
    }

    /**
     * Rendu de la carte
     */
    render() {
        if (!this.container) return;

        // Nettoyer le conteneur
        this.container.innerHTML = '';

        // Créer l'élément principal de la carte
        this.cardElement = this.createElement('div', this.getCardClasses());

        // Créer le header si nécessaire
        if (this.options.title || this.options.subtitle || this.options.icon || this.options.actions.length > 0) {
            const header = this.createHeader();
            this.cardElement.appendChild(header);
        }

        // Créer le body
        if (this.options.content) {
            const body = this.createBody();
            this.cardElement.appendChild(body);
        }

        // Créer le footer si des actions sont définies
        if (this.options.actions.length > 0 && !this.hasHeaderActions()) {
            const footer = this.createFooter();
            this.cardElement.appendChild(footer);
        }

        this.container.appendChild(this.cardElement);
        this.setupEventListeners();
    }

    /**
     * Obtenir les classes CSS de la carte
     */
    getCardClasses() {
        let classes = ['bg-white', 'rounded-lg'];

        if (this.options.shadow) {
            classes.push('shadow-sm');
        }

        if (this.options.border) {
            classes.push('border', 'border-gray-200');
        }

        if (this.options.hover) {
            classes.push('hover:shadow-md', 'transition-shadow', 'duration-200');
        }

        if (this.options.clickable) {
            classes.push('cursor-pointer', 'hover:bg-gray-50');
        }

        if (this.options.className) {
            classes.push(this.options.className);
        }

        return classes.join(' ');
    }

    /**
     * Créer le header de la carte
     */
    createHeader() {
        const header = this.createElement('div', 
            `p-4 ${this.options.headerClassName || ''} ${this.needsHeaderBorder() ? 'border-b border-gray-200' : ''}`
        );

        const headerContent = this.createElement('div', 'flex items-start justify-between');

        // Partie gauche (icône, titre, sous-titre)
        const leftSide = this.createElement('div', 'flex items-start space-x-3 flex-1 min-w-0');

        if (this.options.icon) {
            const iconContainer = this.createElement('div', 'flex-shrink-0');
            if (this.options.icon.startsWith('fa-')) {
                iconContainer.appendChild(this.createIcon(this.options.icon, 'text-xl text-blue-600'));
            } else {
                iconContainer.innerHTML = this.options.icon;
            }
            leftSide.appendChild(iconContainer);
        }

        if (this.options.title || this.options.subtitle) {
            const textContainer = this.createElement('div', 'flex-1 min-w-0');
            
            if (this.options.title) {
                const title = this.createElement('h3', 'text-lg font-semibold text-gray-900 truncate');
                title.textContent = this.options.title;
                textContainer.appendChild(title);
            }

            if (this.options.subtitle) {
                const subtitle = this.createElement('p', 'text-sm text-gray-600 mt-1');
                subtitle.textContent = this.options.subtitle;
                textContainer.appendChild(subtitle);
            }

            leftSide.appendChild(textContainer);
        }

        headerContent.appendChild(leftSide);

        // Partie droite (actions dans le header)
        if (this.hasHeaderActions()) {
            const rightSide = this.createElement('div', 'flex items-center space-x-2 flex-shrink-0');
            this.renderHeaderActions(rightSide);
            headerContent.appendChild(rightSide);
        }

        header.appendChild(headerContent);
        return header;
    }

    /**
     * Créer le body de la carte
     */
    createBody() {
        const body = this.createElement('div', `p-4 ${this.options.bodyClassName || ''}`);
        
        if (typeof this.options.content === 'string') {
            body.innerHTML = this.options.content;
        } else if (this.options.content instanceof HTMLElement) {
            body.appendChild(this.options.content);
        } else if (typeof this.options.content === 'function') {
            const result = this.options.content();
            if (typeof result === 'string') {
                body.innerHTML = result;
            } else if (result instanceof HTMLElement) {
                body.appendChild(result);
            }
        }

        return body;
    }

    /**
     * Créer le footer de la carte
     */
    createFooter() {
        const footer = this.createElement('div', 
            `p-4 border-t border-gray-200 ${this.options.footerClassName || ''}`
        );
        
        const actionsContainer = this.createElement('div', 'flex items-center justify-end space-x-2');
        this.renderFooterActions(actionsContainer);
        
        footer.appendChild(actionsContainer);
        return footer;
    }

    /**
     * Vérifier si des actions doivent être dans le header
     */
    hasHeaderActions() {
        return this.options.actions.some(action => action.position === 'header');
    }

    /**
     * Vérifier si le header a besoin d'une bordure
     */
    needsHeaderBorder() {
        return this.options.content || this.options.actions.some(action => action.position !== 'header');
    }

    /**
     * Rendu des actions dans le header
     */
    renderHeaderActions(container) {
        this.options.actions
            .filter(action => action.position === 'header')
            .forEach(action => {
                const button = this.createActionButton(action);
                container.appendChild(button);
            });
    }

    /**
     * Rendu des actions dans le footer
     */
    renderFooterActions(container) {
        this.options.actions
            .filter(action => !action.position || action.position === 'footer')
            .forEach(action => {
                const button = this.createActionButton(action);
                container.appendChild(button);
            });
    }

    /**
     * Créer un bouton d'action
     */
    createActionButton(action) {
        const button = this.createButton(
            action.text || '',
            action.icon || '',
            action.className || 'btn-secondary',
            {
                type: 'button',
                title: action.tooltip || action.text || '',
                ...action.attributes || {}
            }
        );

        if (action.onClick) {
            this.addEventListener(button, 'click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                action.onClick(e, this);
            });
        }

        return button;
    }

    /**
     * Configurer les event listeners
     */
    setupEventListeners() {
        if (this.options.clickable && this.options.onClick) {
            this.addEventListener(this.cardElement, 'click', (e) => {
                // Ne pas déclencher si on clique sur un bouton
                if (e.target.closest('button, a')) {
                    return;
                }
                this.options.onClick(e, this);
            });
        }
    }

    /**
     * Mettre à jour le titre
     */
    setTitle(title) {
        this.options.title = title;
        this.render();
    }

    /**
     * Mettre à jour le sous-titre
     */
    setSubtitle(subtitle) {
        this.options.subtitle = subtitle;
        this.render();
    }

    /**
     * Mettre à jour le contenu
     */
    setContent(content) {
        this.options.content = content;
        this.render();
    }

    /**
     * Ajouter une action
     */
    addAction(action) {
        this.options.actions.push(action);
        this.render();
    }

    /**
     * Supprimer une action
     */
    removeAction(actionId) {
        this.options.actions = this.options.actions.filter(action => action.id !== actionId);
        this.render();
    }

    /**
     * Ajouter une classe CSS
     */
    addClass(className) {
        if (this.cardElement) {
            this.cardElement.classList.add(...className.split(' '));
        }
    }

    /**
     * Supprimer une classe CSS
     */
    removeClass(className) {
        if (this.cardElement) {
            this.cardElement.classList.remove(...className.split(' '));
        }
    }

    /**
     * Basculer une classe CSS
     */
    toggleClass(className) {
        if (this.cardElement) {
            this.cardElement.classList.toggle(className);
        }
    }

    /**
     * Méthode statique pour créer une carte simple
     */
    static simple(container, title, content, options = {}) {
        return new Card(container, {
            title,
            content,
            ...options
        });
    }

    /**
     * Méthode statique pour créer une carte avec statistique
     */
    static stat(container, label, value, icon, options = {}) {
        const content = `
            <div class="text-center">
                <div class="text-3xl font-bold text-gray-900 mb-1">${value}</div>
                <div class="text-sm text-gray-600">${label}</div>
            </div>
        `;

        return new Card(container, {
            content,
            icon,
            className: 'text-center',
            ...options
        });
    }
}