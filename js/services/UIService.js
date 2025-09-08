/**
 * UIService - Service pour les opérations UI communes
 * Gère les animations, transitions, et interactions UI réutilisables
 */
class UIService {
    constructor() {
        this.activeToasts = [];
        this.loadingOverlays = new Map();
        this.setupGlobalStyles();
    }

    /**
     * Configurer les styles globaux pour les animations
     */
    setupGlobalStyles() {
        if (document.getElementById('ui-service-styles')) return;

        const style = document.createElement('style');
        style.id = 'ui-service-styles';
        style.textContent = `
            .ui-fade-in {
                animation: uiFadeIn 0.3s ease-out;
            }
            
            .ui-fade-out {
                animation: uiFadeOut 0.3s ease-out;
            }
            
            .ui-slide-down {
                animation: uiSlideDown 0.3s ease-out;
            }
            
            .ui-slide-up {
                animation: uiSlideUp 0.3s ease-out;
            }
            
            .ui-scale-in {
                animation: uiScaleIn 0.2s ease-out;
            }
            
            .ui-scale-out {
                animation: uiScaleOut 0.2s ease-out;
            }
            
            .ui-shimmer {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: uiShimmer 1.5s infinite;
            }
            
            .ui-loading-spinner {
                border: 2px solid #f3f3f3;
                border-top: 2px solid #3498db;
                border-radius: 50%;
                animation: uiSpin 1s linear infinite;
            }
            
            @keyframes uiFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes uiFadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            
            @keyframes uiSlideDown {
                from { transform: translateY(-20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes uiSlideUp {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes uiScaleIn {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            
            @keyframes uiScaleOut {
                from { transform: scale(1); opacity: 1; }
                to { transform: scale(0.9); opacity: 0; }
            }
            
            @keyframes uiShimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
            
            @keyframes uiSpin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .ui-toast {
                position: fixed;
                right: 1rem;
                z-index: 9999;
                max-width: 400px;
                min-width: 300px;
                pointer-events: auto;
            }
            
            .ui-loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9998;
                backdrop-filter: blur(2px);
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Afficher un toast/notification
     */
    showToast(message, type = 'info', duration = 3000, options = {}) {
        const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const typeStyles = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-black',
            info: 'bg-blue-500 text-white'
        };

        const typeIcons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `ui-toast ${typeStyles[type] || typeStyles.info} rounded-lg shadow-lg p-4 mb-4 ui-slide-down`;
        
        toast.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <i class="fas ${typeIcons[type] || typeIcons.info} mr-3"></i>
                    <span class="font-medium">${this.escapeHtml(message)}</span>
                </div>
                ${options.closable !== false ? `
                    <button class="ml-4 hover:opacity-75" onclick="this.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
            </div>
        `;

        // Calculer la position
        const existingToasts = this.activeToasts.length;
        toast.style.top = `${1 + (existingToasts * 5)}rem`;

        document.body.appendChild(toast);
        this.activeToasts.push(toastId);

        // Auto-remove
        if (duration > 0) {
            setTimeout(() => {
                this.removeToast(toastId);
            }, duration);
        }

        return toastId;
    }

    /**
     * Supprimer un toast
     */
    removeToast(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.classList.remove('ui-slide-down');
            toast.classList.add('ui-fade-out');
            
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
                this.activeToasts = this.activeToasts.filter(id => id !== toastId);
                this.repositionToasts();
            }, 300);
        }
    }

    /**
     * Repositionner les toasts après suppression
     */
    repositionToasts() {
        this.activeToasts.forEach((toastId, index) => {
            const toast = document.getElementById(toastId);
            if (toast) {
                toast.style.top = `${1 + (index * 5)}rem`;
            }
        });
    }

    /**
     * Afficher un overlay de chargement
     */
    showLoading(message = 'Chargement...', container = document.body) {
        const loadingId = `loading-${Date.now()}`;
        
        const overlay = document.createElement('div');
        overlay.id = loadingId;
        overlay.className = 'ui-loading-overlay ui-fade-in';
        
        overlay.innerHTML = `
            <div class="text-center">
                <div class="ui-loading-spinner w-12 h-12 mx-auto mb-4"></div>
                <div class="text-gray-600 font-medium">${this.escapeHtml(message)}</div>
            </div>
        `;

        container.appendChild(overlay);
        this.loadingOverlays.set(loadingId, { overlay, container });
        
        return loadingId;
    }

    /**
     * Masquer un overlay de chargement
     */
    hideLoading(loadingId) {
        const loadingInfo = this.loadingOverlays.get(loadingId);
        if (loadingInfo) {
            const { overlay } = loadingInfo;
            overlay.classList.remove('ui-fade-in');
            overlay.classList.add('ui-fade-out');
            
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                this.loadingOverlays.delete(loadingId);
            }, 300);
        }
    }

    /**
     * Animer l'apparition d'un élément
     */
    animateIn(element, animation = 'fade-in') {
        if (!element) return;
        
        element.classList.add(`ui-${animation}`);
        
        // Supprimer la classe après l'animation
        setTimeout(() => {
            element.classList.remove(`ui-${animation}`);
        }, 500);
    }

    /**
     * Animer la disparition d'un élément
     */
    animateOut(element, animation = 'fade-out') {
        return new Promise((resolve) => {
            if (!element) {
                resolve();
                return;
            }
            
            element.classList.add(`ui-${animation}`);
            
            setTimeout(() => {
                resolve();
            }, 300);
        });
    }

    /**
     * Créer un effet de shimmer pour le chargement
     */
    createShimmer(width = '100%', height = '20px', className = '') {
        const shimmer = document.createElement('div');
        shimmer.className = `ui-shimmer rounded ${className}`;
        shimmer.style.width = width;
        shimmer.style.height = height;
        return shimmer;
    }

    /**
     * Créer un skeleton loader
     */
    createSkeleton(config) {
        const skeleton = document.createElement('div');
        skeleton.className = 'space-y-3';
        
        config.forEach(item => {
            const line = this.createShimmer(item.width || '100%', item.height || '20px', item.className || '');
            skeleton.appendChild(line);
        });
        
        return skeleton;
    }

    /**
     * Smooth scroll vers un élément
     */
    scrollToElement(element, offset = 0, behavior = 'smooth') {
        if (!element) return;
        
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: behavior
        });
    }

    /**
     * Copier du texte dans le presse-papiers
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copié dans le presse-papiers', 'success');
            return true;
        } catch (err) {
            // Fallback pour les navigateurs plus anciens
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                
                if (successful) {
                    this.showToast('Copié dans le presse-papiers', 'success');
                    return true;
                } else {
                    throw new Error('Échec de la copie');
                }
            } catch (err) {
                document.body.removeChild(textArea);
                this.showToast('Impossible de copier le texte', 'error');
                return false;
            }
        }
    }

    /**
     * Créer une boîte de dialogue de confirmation
     */
    confirm(message, title = 'Confirmation') {
        return new Promise((resolve) => {
            // Utiliser le composant Modal si disponible
            if (typeof Modal !== 'undefined') {
                const modal = new Modal({
                    title,
                    content: `<div class="text-gray-700">${this.escapeHtml(message)}</div>`,
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
            } else {
                // Fallback vers confirm natif
                resolve(confirm(message));
            }
        });
    }

    /**
     * Créer une animation de compteur
     */
    animateCounter(element, start, end, duration = 1000) {
        if (!element) return;
        
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
     * Gérer le focus trap pour les modales
     */
    setupFocusTrap(container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        const handleTabKey = (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        };
        
        container.addEventListener('keydown', handleTabKey);
        
        // Focus sur le premier élément
        firstElement.focus();
        
        return () => {
            container.removeEventListener('keydown', handleTabKey);
        };
    }

    /**
     * Débounce une fonction
     */
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Throttle une fonction
     */
    throttle(func, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Échapper le HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Gérer le redimensionnement responsive
     */
    onResize(callback, delay = 250) {
        const debouncedCallback = this.debounce(callback, delay);
        window.addEventListener('resize', debouncedCallback);
        
        return () => {
            window.removeEventListener('resize', debouncedCallback);
        };
    }

    /**
     * Détecter le support des fonctionnalités
     */
    getFeatureSupport() {
        return {
            clipboard: !!navigator.clipboard,
            webgl: !!window.WebGLRenderingContext,
            localStorage: (() => {
                try {
                    localStorage.setItem('test', 'test');
                    localStorage.removeItem('test');
                    return true;
                } catch (e) {
                    return false;
                }
            })(),
            serviceWorker: 'serviceWorker' in navigator,
            intersectionObserver: 'IntersectionObserver' in window
        };
    }
}