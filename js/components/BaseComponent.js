/**
 * BaseComponent - Classe de base pour tous les composants UI
 * Fournit les fonctionnalités communes de rendu, gestion d'événements et cycle de vie
 */
class BaseComponent {
    constructor(container, options = {}) {
        this.container = container;
        this.options = options;
        this.eventListeners = [];
        this.isDestroyed = false;
        
        // Auto-bind methods to preserve 'this' context
        this.render = this.render.bind(this);
        this.destroy = this.destroy.bind(this);
        this.addEventListener = this.addEventListener.bind(this);
    }

    /**
     * Méthode de rendu - à implémenter dans les classes dérivées
     */
    render() {
        throw new Error('La méthode render() doit être implémentée dans la classe dérivée');
    }

    /**
     * Ajouter un event listener avec nettoyage automatique
     */
    addEventListener(element, event, handler, options = {}) {
        if (this.isDestroyed) return;

        const boundHandler = handler.bind(this);
        element.addEventListener(event, boundHandler, options);
        
        // Garder une référence pour le nettoyage
        this.eventListeners.push({
            element,
            event,
            handler: boundHandler,
            options
        });
    }

    /**
     * Créer un élément DOM avec classes et attributs
     */
    createElement(tag, className = '', attributes = {}) {
        const element = document.createElement(tag);
        
        if (className) {
            element.className = className;
        }
        
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        
        return element;
    }

    /**
     * Créer un élément avec icône FontAwesome
     */
    createIcon(iconClass, className = '') {
        return this.createElement('i', `fas ${iconClass} ${className}`);
    }

    /**
     * Créer un bouton avec icône et texte
     */
    createButton(text, iconClass = '', className = 'btn-primary', attributes = {}) {
        const button = this.createElement('button', className, attributes);
        
        if (iconClass) {
            button.appendChild(this.createIcon(iconClass, 'mr-2'));
        }
        
        if (text) {
            button.appendChild(document.createTextNode(text));
        }
        
        return button;
    }

    /**
     * Afficher un toast/notification
     */
    showToast(message, type = 'info', duration = 3000) {
        if (typeof showToast === 'function') {
            showToast(message, type, duration);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * Mettre à jour le contenu du composant
     */
    update(newOptions = {}) {
        if (this.isDestroyed) return;
        
        this.options = { ...this.options, ...newOptions };
        this.render();
    }

    /**
     * Nettoyer le composant et ses event listeners
     */
    destroy() {
        if (this.isDestroyed) return;
        
        // Supprimer tous les event listeners
        this.eventListeners.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        this.eventListeners = [];
        
        // Vider le conteneur
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        this.isDestroyed = true;
    }

    /**
     * Vérifier si un élément est visible
     */
    isElementVisible(element) {
        return element && 
               element.offsetWidth > 0 && 
               element.offsetHeight > 0 && 
               !element.hidden &&
               window.getComputedStyle(element).display !== 'none';
    }

    /**
     * Attendre qu'un élément soit présent dans le DOM
     */
    waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }

            const observer = new MutationObserver((mutations, obs) => {
                const element = document.querySelector(selector);
                if (element) {
                    obs.disconnect();
                    resolve(element);
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Élément ${selector} non trouvé après ${timeout}ms`));
            }, timeout);
        });
    }

    /**
     * Valider les options requises
     */
    validateRequiredOptions(required = []) {
        const missing = required.filter(key => !(key in this.options));
        if (missing.length > 0) {
            throw new Error(`Options requises manquantes: ${missing.join(', ')}`);
        }
    }

    /**
     * Échapper le HTML pour éviter les injections XSS
     */
    escapeHtml(text) {
        if (typeof escapeHtml === 'function') {
            return escapeHtml(text);
        }
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}