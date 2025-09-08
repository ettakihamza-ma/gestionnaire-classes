/**
 * ValidationService - Service de validation des données et formulaires
 * Centralise toute la logique de validation pour assurer la cohérence
 */
class ValidationService {
    constructor() {
        this.validators = new Map();
        this.setupDefaultValidators();
    }

    /**
     * Configurer les validateurs par défaut
     */
    setupDefaultValidators() {
        // Validateur pour les champs requis
        this.addValidator('required', (value, param) => {
            const isValid = value !== null && value !== undefined && String(value).trim() !== '';
            return {
                valid: isValid,
                message: isValid ? '' : 'Ce champ est obligatoire'
            };
        });

        // Validateur pour la longueur minimale
        this.addValidator('minLength', (value, param) => {
            const length = String(value || '').length;
            const isValid = length >= param;
            return {
                valid: isValid,
                message: isValid ? '' : `Minimum ${param} caractères requis (${length} saisis)`
            };
        });

        // Validateur pour la longueur maximale
        this.addValidator('maxLength', (value, param) => {
            const length = String(value || '').length;
            const isValid = length <= param;
            return {
                valid: isValid,
                message: isValid ? '' : `Maximum ${param} caractères autorisés (${length} saisis)`
            };
        });

        // Validateur pour les emails
        this.addValidator('email', (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isValid = !value || emailRegex.test(value);
            return {
                valid: isValid,
                message: isValid ? '' : 'Format d\'email invalide'
            };
        });

        // Validateur pour les nombres
        this.addValidator('number', (value) => {
            const isValid = !value || !isNaN(value);
            return {
                valid: isValid,
                message: isValid ? '' : 'Doit être un nombre valide'
            };
        });

        // Validateur pour les nombres entiers
        this.addValidator('integer', (value) => {
            const isValid = !value || (Number.isInteger(Number(value)) && !isNaN(value));
            return {
                valid: isValid,
                message: isValid ? '' : 'Doit être un nombre entier'
            };
        });

        // Validateur pour les valeurs minimales
        this.addValidator('min', (value, param) => {
            const numValue = Number(value);
            const isValid = !value || (!isNaN(numValue) && numValue >= param);
            return {
                valid: isValid,
                message: isValid ? '' : `La valeur doit être supérieure ou égale à ${param}`
            };
        });

        // Validateur pour les valeurs maximales
        this.addValidator('max', (value, param) => {
            const numValue = Number(value);
            const isValid = !value || (!isNaN(numValue) && numValue <= param);
            return {
                valid: isValid,
                message: isValid ? '' : `La valeur doit être inférieure ou égale à ${param}`
            };
        });

        // Validateur pour les dates
        this.addValidator('date', (value) => {
            const isValid = !value || !isNaN(Date.parse(value));
            return {
                valid: isValid,
                message: isValid ? '' : 'Format de date invalide'
            };
        });

        // Validateur pour les expressions régulières
        this.addValidator('pattern', (value, param) => {
            const regex = new RegExp(param);
            const isValid = !value || regex.test(value);
            return {
                valid: isValid,
                message: isValid ? '' : 'Format invalide'
            };
        });

        // Validateur pour les noms (lettres, espaces, tirets)
        this.addValidator('name', (value) => {
            const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
            const isValid = !value || nameRegex.test(value);
            return {
                valid: isValid,
                message: isValid ? '' : 'Seules les lettres, espaces et tirets sont autorisés'
            };
        });

        // Validateur pour les identifiants uniques
        this.addValidator('unique', (value, param) => {
            // param doit être un tableau des valeurs existantes
            const isValid = !value || !param.includes(value);
            return {
                valid: isValid,
                message: isValid ? '' : 'Cette valeur existe déjà'
            };
        });
    }

    /**
     * Ajouter un validateur personnalisé
     */
    addValidator(name, validatorFn) {
        this.validators.set(name, validatorFn);
    }

    /**
     * Supprimer un validateur
     */
    removeValidator(name) {
        this.validators.delete(name);
    }

    /**
     * Valider une seule valeur
     */
    validateValue(value, rules) {
        const errors = [];

        for (const [ruleName, ruleParam] of Object.entries(rules)) {
            const validator = this.validators.get(ruleName);
            
            if (!validator) {
                console.warn(`Validateur "${ruleName}" non trouvé`);
                continue;
            }

            const result = validator(value, ruleParam);
            if (!result.valid) {
                errors.push(result.message);
            }
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Valider un objet de données
     */
    validateObject(data, schema) {
        const result = {
            valid: true,
            errors: {},
            firstError: null
        };

        for (const [fieldName, rules] of Object.entries(schema)) {
            const fieldValue = data[fieldName];
            const validation = this.validateValue(fieldValue, rules);

            if (!validation.valid) {
                result.valid = false;
                result.errors[fieldName] = validation.errors;
                
                if (!result.firstError) {
                    result.firstError = {
                        field: fieldName,
                        message: validation.errors[0]
                    };
                }
            }
        }

        return result;
    }

    /**
     * Valider un formulaire HTML
     */
    validateForm(formElement, schema) {
        const formData = new FormData(formElement);
        const data = {};
        
        // Convertir FormData en objet
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Ajouter les champs non présents dans FormData (checkboxes non cochées, etc.)
        const inputs = formElement.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type === 'checkbox' && !input.checked) {
                data[input.name] = false;
            } else if (input.type === 'radio' && !input.checked && !(input.name in data)) {
                data[input.name] = '';
            }
        });

        const validation = this.validateObject(data, schema);
        
        // Afficher les erreurs dans le formulaire
        this.displayFormErrors(formElement, validation.errors);
        
        return {
            ...validation,
            data
        };
    }

    /**
     * Afficher les erreurs dans le formulaire
     */
    displayFormErrors(formElement, errors) {
        // Supprimer les erreurs existantes
        const existingErrors = formElement.querySelectorAll('.validation-error');
        existingErrors.forEach(error => error.remove());

        // Supprimer les classes d'erreur
        const inputs = formElement.querySelectorAll('.border-red-500');
        inputs.forEach(input => {
            input.classList.remove('border-red-500');
            input.classList.add('border-gray-300');
        });

        // Afficher les nouvelles erreurs
        for (const [fieldName, fieldErrors] of Object.entries(errors)) {
            const input = formElement.querySelector(`[name="${fieldName}"]`);
            if (input) {
                // Ajouter la classe d'erreur
                input.classList.add('border-red-500');
                input.classList.remove('border-gray-300');

                // Créer le message d'erreur
                const errorElement = document.createElement('div');
                errorElement.className = 'validation-error text-red-600 text-sm mt-1';
                errorElement.textContent = fieldErrors[0]; // Afficher seulement la première erreur

                // Insérer après l'input
                input.parentNode.insertBefore(errorElement, input.nextSibling);
            }
        }
    }

    /**
     * Valider en temps réel un champ
     */
    validateFieldRealTime(input, rules, debounceMs = 300) {
        let timeoutId;

        const validateAndShow = () => {
            const validation = this.validateValue(input.value, rules);
            
            // Supprimer l'erreur existante
            const existingError = input.parentNode.querySelector('.validation-error');
            if (existingError) {
                existingError.remove();
            }

            // Gérer l'apparence de l'input
            if (validation.valid) {
                input.classList.remove('border-red-500');
                input.classList.add('border-gray-300');
            } else {
                input.classList.add('border-red-500');
                input.classList.remove('border-gray-300');

                // Afficher l'erreur
                const errorElement = document.createElement('div');
                errorElement.className = 'validation-error text-red-600 text-sm mt-1';
                errorElement.textContent = validation.errors[0];
                input.parentNode.insertBefore(errorElement, input.nextSibling);
            }

            return validation.valid;
        };

        // Validation sur input avec debounce
        input.addEventListener('input', () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(validateAndShow, debounceMs);
        });

        // Validation immédiate sur blur
        input.addEventListener('blur', validateAndShow);

        return validateAndShow;
    }

    /**
     * Schémas de validation prédéfinis
     */
    getSchemas() {
        return {
            niveau: {
                nom: {
                    required: true,
                    minLength: 2,
                    maxLength: 50,
                    name: true
                }
            },
            classe: {
                nom: {
                    required: true,
                    minLength: 2,
                    maxLength: 50
                }
            },
            eleve: {
                prenom: {
                    required: true,
                    minLength: 2,
                    maxLength: 50,
                    name: true
                },
                nom: {
                    required: true,
                    minLength: 2,
                    maxLength: 50,
                    name: true
                },
                dateNaissance: {
                    date: true
                }
            },
            user: {
                prenom: {
                    required: true,
                    minLength: 2,
                    maxLength: 50,
                    name: true
                },
                nom: {
                    required: true,
                    minLength: 2,
                    maxLength: 50,
                    name: true
                },
                email: {
                    email: true
                }
            },
            competence: {
                nom: {
                    required: true,
                    minLength: 3,
                    maxLength: 200
                },
                description: {
                    maxLength: 500
                }
            }
        };
    }

    /**
     * Validation spécifique pour les données scolaires
     */
    validateSchoolData(data) {
        const errors = [];

        // Vérifier la structure de base
        if (!data.niveaux || !Array.isArray(data.niveaux)) {
            errors.push('Les niveaux doivent être un tableau');
        }

        if (!data.matieres || !Array.isArray(data.matieres)) {
            errors.push('Les matières doivent être un tableau');
        }

        // Vérifier les niveaux
        if (data.niveaux) {
            data.niveaux.forEach((niveau, index) => {
                if (!niveau.id || !niveau.nom) {
                    errors.push(`Niveau ${index + 1}: ID et nom requis`);
                }

                if (niveau.classes && Array.isArray(niveau.classes)) {
                    niveau.classes.forEach((classe, classeIndex) => {
                        if (!classe.id || !classe.nom) {
                            errors.push(`Niveau ${index + 1}, Classe ${classeIndex + 1}: ID et nom requis`);
                        }
                    });
                }
            });
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Nettoyer et normaliser les données
     */
    sanitizeData(data, type = 'text') {
        if (data === null || data === undefined) {
            return '';
        }

        let sanitized = String(data).trim();

        switch (type) {
            case 'name':
                // Capitaliser la première lettre de chaque mot
                sanitized = sanitized.replace(/\b\w/g, l => l.toUpperCase());
                break;
            case 'email':
                sanitized = sanitized.toLowerCase();
                break;
            case 'number':
                sanitized = sanitized.replace(/[^\d.-]/g, '');
                break;
            case 'integer':
                sanitized = sanitized.replace(/[^\d-]/g, '');
                break;
        }

        return sanitized;
    }

    /**
     * Valider les identifiants uniques
     */
    validateUniqueIds(items, fieldName = 'id') {
        const ids = items.map(item => item[fieldName]).filter(Boolean);
        const uniqueIds = [...new Set(ids)];
        
        return {
            valid: ids.length === uniqueIds.length,
            duplicates: ids.filter((id, index) => ids.indexOf(id) !== index)
        };
    }
}