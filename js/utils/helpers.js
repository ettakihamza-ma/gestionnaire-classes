/**
 * Helpers - Fonctions utilitaires globales
 */

/**
 * Ferme tous les modals ouverts
 */
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
}

/**
 * Affiche un modal spécifique
 */
function showModal(modalId) {
    closeAllModals();
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

/**
 * Cache un modal spécifique
 */
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Vide un formulaire
 */
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        // Réinitialiser les checkboxes personnalisées
        form.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    }
}

/**
 * Affiche une notification toast
 */
function showToast(message, type = 'info', duration = 3000) {
    // Créer ou réutiliser le conteneur toast
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed top-4 right-4 z-50';
        document.body.appendChild(toastContainer);
    }

    // Créer le toast
    const toast = document.createElement('div');
    toast.className = `p-4 rounded-lg shadow-lg mb-2 transform transition-all duration-300 translate-x-full`;
    
    if (type === 'success') {
        toast.className += ' bg-green-500 text-white';
    } else if (type === 'error') {
        toast.className += ' bg-red-500 text-white';
    } else {
        toast.className += ' bg-blue-500 text-white';
    }

    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle mr-2"></i>
            <span>${message}</span>
        </div>
    `;

    toastContainer.appendChild(toast);

    // Animation d'entrée
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 10);

    // Suppression automatique
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}

/**
 * Débounce une fonction
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Escape HTML pour éviter XSS
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Valide un email
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Capitalise la première lettre
 */
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Confirme une action destructive
 */
function confirmAction(message, onConfirm) {
    if (confirm(message)) {
        onConfirm();
    }
}

/**
 * Tronque un texte à une longueur donnée
 */
function truncateText(text, length = 100) {
    if (!text || text.length <= length) return text;
    return text.substring(0, length) + '...';
}

/**
 * Debug helper - Diagnostique l'état de l'application
 */
function debugAppState() {
    console.log('🔍 === DIAGNOSTIC APPLICATION ===');
    
    // Vérifier window.app
    console.log('window.app:', window.app ? '✅ Disponible' : '❌ Manquant');
    if (window.app) {
        console.log('window.app.showSection:', typeof window.app.showSection === 'function' ? '✅ Fonction' : '❌ Manquant');
        console.log('window.app.currentSection:', window.app.currentSection || 'non défini');
    }
    
    // Vérifier les fonctions globales
    console.log('showToast:', typeof showToast === 'function' ? '✅ Disponible' : '❌ Manquant');
    console.log('window.safeShowSection:', typeof window.safeShowSection === 'function' ? '✅ Disponible' : '❌ Manquant');
    
    // Vérifier les modules
    const modules = ['DataManager', 'NiveauxModule', 'ElevesModule', 'CahierModule', 'CalendrierModule'];
    modules.forEach(module => {
        console.log(`${module}:`, typeof window[module] === 'function' ? '✅ Chargé' : '❌ Manquant');
    });
    
    // Vérifier les sections DOM
    const sections = ['dashboard', 'niveaux', 'eleves', 'cahier', 'calendrier', 'import-export', 'parametres'];
    sections.forEach(section => {
        const element = document.getElementById(`${section}-section`);
        const isVisible = element && !element.classList.contains('hidden');
        console.log(`Section ${section}:`, element ? (isVisible ? '✅ Visible' : '🔶 Cachée') : '❌ Manquante');
    });
    
    // Vérifier localStorage
    try {
        const data = localStorage.getItem('gestionnaire_classes_data');
        console.log('localStorage:', data ? '✅ Données présentes' : '🔶 Vide');
        if (data) {
            const parsed = JSON.parse(data);
            console.log('Config onboarding:', parsed.config ? 
                `firstLaunch=${parsed.config.firstLaunch}, setupCompleted=${parsed.config.setupCompleted}` : 
                '❌ Pas de config'
            );
        }
    } catch (error) {
        console.log('localStorage:', '❌ Erreur -', error.message);
    }
    
    console.log('🔍 === FIN DIAGNOSTIC ===');
}
