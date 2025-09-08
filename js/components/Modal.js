/**
 * Modal Component - Composant modal réutilisable
 * Gère l'affichage des modales avec titre, contenu, boutons personnalisables
 */
class Modal extends BaseComponent {
    constructor(options = {}) {
        // Le conteneur sera créé dynamiquement
        super(null, {
            title: 'Modal',
            content: '',
            showCloseButton: true,
            closeOnOverlayClick: true,
            closeOnEscape: true,
            size: 'medium', // small, medium, large, xlarge
            buttons: [],
            className: '',
            ...options
        });

        this.modalId = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.isVisible = false;
        this.onShow = this.options.onShow || (() => {});
        this.onHide = this.options.onHide || (() => {});
        
        this.createModal();
    }

    /**
     * Créer la structure du modal
     */
    createModal() {
        // Créer l'overlay
        this.overlay = this.createElement('div', 
            'modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden',
            { id: this.modalId }
        );

        // Créer le conteneur du modal
        this.modalContainer = this.createElement('div', 
            `bg-white rounded-lg shadow-2xl mx-4 ${this.getSizeClasses()} ${this.options.className}`
        );

        // Créer le header
        if (this.options.title || this.options.showCloseButton) {
            this.header = this.createHeader();
            this.modalContainer.appendChild(this.header);
        }

        // Créer le body
        this.body = this.createElement('div', 'p-6');
        this.modalContainer.appendChild(this.body);

        // Créer le footer si des boutons sont définis
        if (this.options.buttons.length > 0) {
            this.footer = this.createFooter();
            this.modalContainer.appendChild(this.footer);
        }

        this.overlay.appendChild(this.modalContainer);
        document.body.appendChild(this.overlay);

        this.setupEventListeners();
        this.render();
    }

    /**
     * Créer le header du modal
     */
    createHeader() {
        const header = this.createElement('div', 'flex justify-between items-center p-6 border-b border-gray-200');
        
        if (this.options.title) {
            const title = this.createElement('h3', 'text-lg font-semibold text-gray-900');
            title.textContent = this.options.title;
            header.appendChild(title);
        }

        if (this.options.showCloseButton) {
            const closeBtn = this.createElement('button', 
                'text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100',
                { type: 'button', 'aria-label': 'Fermer' }
            );
            closeBtn.appendChild(this.createIcon('fa-times', 'text-lg'));
            this.addEventListener(closeBtn, 'click', this.hide);
            header.appendChild(closeBtn);
        }

        return header;
    }

    /**
     * Créer le footer du modal
     */
    createFooter() {
        const footer = this.createElement('div', 'flex justify-end space-x-3 p-6 border-t border-gray-200');
        
        this.options.buttons.forEach(buttonConfig => {
            const button = this.createButton(
                buttonConfig.text,
                buttonConfig.icon,
                buttonConfig.className || 'btn-secondary',
                buttonConfig.attributes || {}
            );

            if (buttonConfig.onClick) {
                this.addEventListener(button, 'click', (e) => {
                    buttonConfig.onClick(e, this);
                });
            }

            footer.appendChild(button);
        });

        return footer;
    }

    /**
     * Obtenir les classes CSS selon la taille
     */
    getSizeClasses() {
        const sizes = {
            small: 'w-full max-w-md',
            medium: 'w-full max-w-lg',
            large: 'w-full max-w-2xl',
            xlarge: 'w-full max-w-4xl'
        };
        return sizes[this.options.size] || sizes.medium;
    }

    /**
     * Configurer les event listeners
     */
    setupEventListeners() {
        // Fermer en cliquant sur l'overlay
        if (this.options.closeOnOverlayClick) {
            this.addEventListener(this.overlay, 'click', (e) => {
                if (e.target === this.overlay) {
                    this.hide();
                }
            });
        }

        // Fermer avec la touche Escape
        if (this.options.closeOnEscape) {
            this.addEventListener(document, 'keydown', (e) => {
                if (e.key === 'Escape' && this.isVisible) {
                    this.hide();
                }
            });
        }
    }

    /**
     * Rendu du contenu du modal
     */
    render() {
        if (this.body) {
            if (typeof this.options.content === 'string') {
                this.body.innerHTML = this.options.content;
            } else if (this.options.content instanceof HTMLElement) {
                this.body.innerHTML = '';
                this.body.appendChild(this.options.content);
            }
        }
    }

    /**
     * Afficher le modal
     */
    show() {
        if (this.isVisible) return;
        
        this.overlay.classList.remove('hidden');
        this.isVisible = true;
        
        // Empêcher le scroll du body
        document.body.style.overflow = 'hidden';
        
        // Animation d'entrée
        requestAnimationFrame(() => {
            this.overlay.style.opacity = '0';
            this.modalContainer.style.transform = 'scale(0.95)';
            
            requestAnimationFrame(() => {
                this.overlay.style.transition = 'opacity 0.2s ease-out';
                this.modalContainer.style.transition = 'transform 0.2s ease-out';
                this.overlay.style.opacity = '1';
                this.modalContainer.style.transform = 'scale(1)';
            });
        });

        // Focus sur le premier élément focusable
        setTimeout(() => {
            const focusable = this.modalContainer.querySelector('input, button, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable) {
                focusable.focus();
            }
        }, 250);

        this.onShow(this);
    }

    /**
     * Masquer le modal
     */
    hide() {
        if (!this.isVisible) return;
        
        // Animation de sortie
        this.overlay.style.transition = 'opacity 0.2s ease-out';
        this.modalContainer.style.transition = 'transform 0.2s ease-out';
        this.overlay.style.opacity = '0';
        this.modalContainer.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            this.overlay.classList.add('hidden');
            this.isVisible = false;
            
            // Restaurer le scroll du body
            document.body.style.overflow = 'auto';
            
            this.onHide(this);
        }, 200);
    }

    /**
     * Basculer la visibilité du modal
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Mettre à jour le titre
     */
    setTitle(title) {
        this.options.title = title;
        if (this.header) {
            const titleElement = this.header.querySelector('h3');
            if (titleElement) {
                titleElement.textContent = title;
            }
        }
    }

    /**
     * Mettre à jour le contenu
     */
    setContent(content) {
        this.options.content = content;
        this.render();
    }

    /**
     * Mettre à jour les boutons
     */
    setButtons(buttons) {
        this.options.buttons = buttons;
        
        // Recréer le footer
        if (this.footer) {
            this.footer.remove();
        }
        
        if (buttons.length > 0) {
            this.footer = this.createFooter();
            this.modalContainer.appendChild(this.footer);
        }
    }

    /**
     * Nettoyer le modal
     */
    destroy() {
        this.hide();
        
        setTimeout(() => {
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
            super.destroy();
        }, 300);
    }

    /**
     * Méthodes statiques pour un usage rapide
     */
    static alert(message, title = 'Information') {
        return new Modal({
            title,
            content: `<div class="text-gray-700">${message}</div>`,
            buttons: [
                {
                    text: 'OK',
                    className: 'btn-primary',
                    onClick: (e, modal) => modal.destroy()
                }
            ]
        });
    }

    static confirm(message, title = 'Confirmation') {
        return new Promise((resolve) => {
            const modal = new Modal({
                title,
                content: `<div class="text-gray-700">${message}</div>`,
                buttons: [
                    {
                        text: 'Annuler',
                        className: 'btn-secondary',
                        onClick: (e, modal) => {
                            modal.destroy();
                            resolve(false);
                        }
                    },
                    {
                        text: 'Confirmer',
                        className: 'btn-primary',
                        onClick: (e, modal) => {
                            modal.destroy();
                            resolve(true);
                        }
                    }
                ],
                closeOnOverlayClick: false,
                onHide: () => resolve(false)
            });
            modal.show();
        });
    }
}