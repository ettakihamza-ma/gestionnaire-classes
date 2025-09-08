/**
 * Module Calendrier - Calendrier et agenda scolaire
 */
class CalendrierModule {
    constructor(dataManager, schoolManager) {
        console.log('🗓️ Construction du CalendrierModule...');
        this.dataManager = dataManager;
        this.schoolManager = schoolManager;
        this.currentDate = new Date();
        this.currentView = 'month'; // 'month' ou 'week'
        this.selectedDate = new Date();
        this.activeTab = 'calendar'; // 'calendar' ou 'holidays'
        
        // Événements et activités
        this.events = [];
        
        // Notes de l'agenda
        this.notes = this.loadNotes();
        
        // Jours de la semaine en français
        this.dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        this.dayNamesShort = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        this.monthNames = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        
        // Données des vacances scolaires marocaines (valeurs par défaut)
        const defaultHolidays = [
            {
                id: 1,
                name: "Dikra Al-Mawlid Ennabaoui (Dikra wafate Ennabi)",
                dates: "5-6 septembre 2025",
                duration: "2 jours"
            },
            {
                id: 2,
                name: "Premières vacances scolaires",
                dates: "Du 19 octobre au 26 octobre 2025",
                duration: "8 jours"
            },
            {
                id: 3,
                name: "La Marche Verte",
                dates: "6 novembre 2025",
                duration: "1 jour"
            },
            {
                id: 4,
                name: "Fête de l'Indépendance",
                dates: "18 novembre 2025",
                duration: "1 jour"
            },
            {
                id: 5,
                name: "Deuxièmes vacances scolaires",
                dates: "Du 7 décembre 2025 au 14 décembre 2025",
                duration: "8 jours"
            },
            {
                id: 6,
                name: "Vacances de fin de semestre",
                dates: "Du 25 janvier 2026 au 1er février 2026",
                duration: "8 jours"
            },
            {
                id: 7,
                name: "Le Manifeste de l'Indépendance",
                dates: "11 janvier 2026",
                duration: "1 jour"
            },
            {
                id: 8,
                name: "Le Nouvel an Amazigh",
                dates: "14 janvier 2026",
                duration: "1 jour"
            },
            {
                id: 9,
                name: "Troisièmes vacances scolaires",
                dates: "Du 15 mars 2026 au 22 mars 2026",
                duration: "8 jours"
            },
            {
                id: 10,
                name: "Aïd Al-Fitr",
                dates: "19-20 mars 2026",
                duration: "2 jours"
            },
            {
                id: 11,
                name: "Quatrièmes vacances scolaires",
                dates: "Du 3 mai 2026 au 10 mai 2026",
                duration: "8 jours"
            },
            {
                id: 12,
                name: "Aïd Al-Adha",
                dates: "26-27 mai 2026",
                duration: "2 jours"
            }
        ];
        
        // Essayer de charger les vacances depuis localStorage, sinon utiliser les valeurs par défaut
        this.holidays = defaultHolidays;
        this.loadHolidays();
        
        this.loadEvents();
        console.log('✅ CalendrierModule construit avec succès');
    }
    
    loadNotes() {
        const notes = localStorage.getItem('calendrierNotes');
        return notes ? JSON.parse(notes) : {};
    }
    
    saveNotes() {
        localStorage.setItem('calendrierNotes', JSON.stringify(this.notes));
    }
    
    loadHolidays() {
        const holidays = localStorage.getItem('calendrierHolidays');
        if (holidays) {
            this.holidays = JSON.parse(holidays);
        }
    }
    
    saveHolidays() {
        localStorage.setItem('calendrierHolidays', JSON.stringify(this.holidays));
        // Reload events to reflect changes
        this.loadEvents();
    }
    
    loadEvents() {
        const eventsData = localStorage.getItem('calendrierEvents');
        if (eventsData) {
            this.events = JSON.parse(eventsData);
        }
    }
    
    saveEvents() {
        localStorage.setItem('calendrierEvents', JSON.stringify(this.events));
    }

    /**
     * Charger les événements depuis les données existantes
     */
    loadEvents() {
        this.events = [];
        
        // Charger les entrées du cahier journal comme événements
        this.dataManager.data.niveaux.forEach(niveau => {
            if (niveau.classes) {
                niveau.classes.forEach(classe => {
                    if (classe.cahierJournal) {
                        classe.cahierJournal.forEach(entree => {
                            // ⚠️ CORRECTION: Utiliser entree.matieres (array) au lieu de entree.matiere
                            const matieres = entree.matieres || [];
                            const matiere = matieres.length > 0 ? matieres[0] : 'Matière non définie';
                            const allMatieres = matieres.join(', ') || 'Matières non définies';
                            const classeNom = classe.nom || 'Classe inconnue';
                            const niveauNom = niveau.nom || 'Niveau inconnu';
                            const description = entree.activites || entree.objectifs || 'Aucune description';
                            
                            this.events.push({
                                id: entree.id,
                                title: `${matiere} - ${classeNom}`,
                                date: entree.date,
                                type: 'cours',
                                description: description,
                                classe: classeNom,
                                niveau: niveauNom,
                                matiere: matiere,
                                matieres: matieres,
                                allMatieres: allMatieres,
                                horaires: entree.horaires || 'Non défini',
                                objectifs: entree.objectifs || '',
                                activites: entree.activites || '',
                                observations: entree.observations || '',
                                color: '#3B82F6' // Bleu pour les cours
                            });
                        });
                    }
                });
            }
        });
        
        // Ajouter les vacances comme événements
        const holidayEvents = this.loadHolidaysAsEvents();
        this.events = [...this.events, ...holidayEvents];
        
        // Trier les événements par date
        this.events.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        console.log('📊 Événements créés:', this.events);
    }

    /**
     * Convert holidays data into event-like objects for calendar display
     * This will allow us to show holidays in the calendar view
     */
    loadHolidaysAsEvents() {
        const holidayEvents = [];
        
        this.holidays.forEach(holiday => {
            // Extract dates from the holiday description
            const dates = this.extractDatesFromHoliday(holiday);
            
            if (dates.length > 0) {
                dates.forEach(date => {
                    holidayEvents.push({
                        id: `holiday-${holiday.id}-${date}`,
                        title: holiday.name,
                        date: date,
                        type: 'holiday',
                        description: holiday.dates,
                        duration: holiday.duration,
                        color: '#FF5722',  // Orange for holidays
                        isHoliday: true
                    });
                });
            }
        });
        
        return holidayEvents;
    }

    /**
     * Extract dates from holiday description
     */
    extractDatesFromHoliday(holiday) {
        const dates = [];
        const currentYear = new Date().getFullYear();
        const nextYear = currentYear + 1;
        
        // Process different date formats
        if (holiday.dates.includes('Du') && holiday.dates.includes('au')) {
            // Range of dates: "Du 24 décembre 2025 au 4 janvier 2026"
            try {
                const dateText = holiday.dates;
                const startDateMatch = dateText.match(/Du (\d+) ([a-zûéè]+) (\d{4})/i);
                const endDateMatch = dateText.match(/au (\d+) ([a-zûéè]+) (\d{4})/i);
                
                if (startDateMatch && endDateMatch) {
                    const startDay = parseInt(startDateMatch[1]);
                    const startMonth = this.getMonthNumber(startDateMatch[2]);
                    const startYear = parseInt(startDateMatch[3]);
                    
                    const endDay = parseInt(endDateMatch[1]);
                    const endMonth = this.getMonthNumber(endDateMatch[2]);
                    const endYear = parseInt(endDateMatch[3]);
                    
                    const startDate = new Date(startYear, startMonth, startDay);
                    const endDate = new Date(endYear, endMonth, endDay);
                    
                    // Add all dates in the range
                    let currentDate = new Date(startDate);
                    while (currentDate <= endDate) {
                        dates.push(currentDate.toISOString().split('T')[0]);
                        currentDate.setDate(currentDate.getDate() + 1);
                    }
                }
            } catch (e) {
                console.error('Error parsing date range:', e);
            }
        } else if (holiday.dates.includes('partir du')) {
            // Starting from a date: "À partir du 6 juillet 2026"
            try {
                const match = holiday.dates.match(/partir du (\d+) ([a-zûéè]+) (\d{4})/i);
                if (match) {
                    const day = parseInt(match[1]);
                    const month = this.getMonthNumber(match[2]);
                    const year = parseInt(match[3]);
                    
                    // Just add the start date for now
                    const date = new Date(year, month, day);
                    dates.push(date.toISOString().split('T')[0]);
                }
            } catch (e) {
                console.error('Error parsing start date:', e);
            }
        } else if (holiday.dates.match(/^\d+-\d+ ([a-zûéè]+) (\d{4})$/i)) {
            // Two consecutive days: "5-6 septembre 2025"
            try {
                const match = holiday.dates.match(/(\d+)-(\d+) ([a-zûéè]+) (\d{4})/i);
                if (match) {
                    const startDay = parseInt(match[1]);
                    const endDay = parseInt(match[2]);
                    const month = this.getMonthNumber(match[3]);
                    const year = parseInt(match[4]);
                    
                    // Add both days
                    for (let day = startDay; day <= endDay; day++) {
                        const date = new Date(year, month, day);
                        dates.push(date.toISOString().split('T')[0]);
                    }
                }
            } catch (e) {
                console.error('Error parsing two consecutive days:', e);
            }
        } else if (holiday.dates.match(/^\d+ ([a-zûéè]+) \d{4}$/i)) {
            // Single date: "18 novembre 2025"
            try {
                const match = holiday.dates.match(/(\d+) ([a-zûéè]+) (\d{4})/i);
                if (match) {
                    const day = parseInt(match[1]);
                    const month = this.getMonthNumber(match[2]);
                    const year = parseInt(match[3]);
                    
                    const date = new Date(year, month, day);
                    dates.push(date.toISOString().split('T')[0]);
                }
            } catch (e) {
                console.error('Error parsing single date:', e);
            }
        } else if (holiday.dates.match(/^(\d+)er ([a-zûéè]+) \d{4}$/i)) {
            // First of month: "1er mai 2025"
            try {
                const match = holiday.dates.match(/(\d+)er ([a-zûéè]+) (\d{4})/i);
                if (match) {
                    const month = this.getMonthNumber(match[2]);
                    const year = parseInt(match[3]);
                    
                    const date = new Date(year, month, 1);
                    dates.push(date.toISOString().split('T')[0]);
                }
            } catch (e) {
                console.error('Error parsing 1st of month date:', e);
            }
        } else if (holiday.dates.includes('-')) {
            // Islamic calendar date with Gregorian equivalent: "13-12-1447 (13 mai 2025)"
            try {
                // Extract the Gregorian date from parentheses
                const gregorianMatch = holiday.dates.match(/\((\d+) ([a-zûéè]+) (\d{4})\)/i);
                if (gregorianMatch) {
                    const day = parseInt(gregorianMatch[1]);
                    const month = this.getMonthNumber(gregorianMatch[2]);
                    const year = parseInt(gregorianMatch[3]);
                    
                    const date = new Date(year, month, day);
                    dates.push(date.toISOString().split('T')[0]);
                }
            } catch (e) {
                console.error('Error parsing Islamic/Gregorian date:', e);
            }
        }
        
        return dates;
    }

    /**
     * Convert French month name to month number (0-11)
     */
    getMonthNumber(monthName) {
        const monthMap = {
            'janvier': 0,
            'février': 1,
            'mars': 2,
            'avril': 3,
            'mai': 4,
            'juin': 5,
            'juillet': 6,
            'août': 7,
            'septembre': 8,
            'octobre': 9,
            'novembre': 10,
            'décembre': 11
        };
        
        return monthMap[monthName.toLowerCase()] || 0;
    }

    /**
     * Load notes from localStorage
     */
    loadNotes() {
        try {
            const notesData = localStorage.getItem('calendarNotes');
            return notesData ? JSON.parse(notesData) : {};
        } catch (error) {
            console.error('Error loading notes:', error);
            return {};
        }
    }

    /**
     * Save notes to localStorage
     */
    saveNotes() {
        try {
            localStorage.setItem('calendarNotes', JSON.stringify(this.notes));
            return true;
        } catch (error) {
            console.error('Error saving notes:', error);
            return false;
        }
    }

    /**
     * Save holidays to localStorage
     */
    saveHolidays() {
        try {
            localStorage.setItem('calendarHolidays', JSON.stringify(this.holidays));
            // Reload events to reflect changes
            this.loadEvents();
            return true;
        } catch (error) {
            console.error('Error saving holidays:', error);
            return false;
        }
    }

    /**
     * Load holidays from localStorage
     */
    loadHolidays() {
        try {
            const holidaysData = localStorage.getItem('calendarHolidays');
            if (holidaysData) {
                this.holidays = JSON.parse(holidaysData);
                // Reload events to reflect loaded holidays
                this.loadEvents();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error loading holidays:', error);
            return false;
        }
    }

    /**
     * Add a new holiday
     */
    addHoliday(holiday) {
        // Generate a new ID for the holiday
        const maxId = Math.max(0, ...this.holidays.map(h => h.id));
        const newHoliday = {
            id: maxId + 1,
            name: holiday.name || 'Nouvelle vacance',
            dates: holiday.dates || '',
            duration: holiday.duration || '1 jour'
        };
        
        this.holidays.push(newHoliday);
        this.saveHolidays();
        return newHoliday;
    }

    /**
     * Update an existing holiday
     */
    updateHoliday(id, updatedData) {
        const index = this.holidays.findIndex(h => h.id === id);
        if (index !== -1) {
            this.holidays[index] = {
                ...this.holidays[index],
                ...updatedData
            };
            this.saveHolidays();
            return true;
        }
        return false;
    }

    /**
     * Delete a holiday
     */
    deleteHoliday(id) {
        const index = this.holidays.findIndex(h => h.id === id);
        if (index !== -1) {
            this.holidays.splice(index, 1);
            this.saveHolidays();
            return true;
        }
        return false;
    }

    /**
     * Get note for a specific date
     */
    getNote(date) {
        return this.notes[date] || '';
    }

    /**
     * Save note for a specific date
     */
    saveNote(date, content) {
        if (content.trim() === '') {
            // Delete the note if it's empty
            delete this.notes[date];
        } else {
            this.notes[date] = content;
        }
        this.saveNotes();
    }

    /**
     * Check if a date has a note
     */
    hasNote(date) {
        return !!this.notes[date];
    }

    /**
     * Rendu principal du module
     */
    render() {
        console.log('🗓️ === DÉBUT RENDER CALENDRIER ===');
        
        const section = document.getElementById('calendrier-section');
        if (!section) {
            console.error('❌ Section calendrier-section non trouvée');
            return;
        }
        
        console.log('✅ Section calendrier-section trouvée');

        this.loadEvents(); // Recharger les événements à chaque rendu
        
        console.log('📊 Événements chargés:', this.events.length);

        section.innerHTML = `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
                <!-- En-tête avec contrôles -->
                <div class="p-6 border-b border-gray-200">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 class="text-xl font-semibold text-gray-800 flex items-center">
                                <i class="fas fa-calendar-alt text-blue-600 mr-3"></i>
                                Calendrier & Agenda
                            </h3>
                            <p class="text-gray-600 mt-1">Visualisez vos cours et activités</p>
                        </div>
                        
                        <!-- Sélecteur d'onglets (Calendrier / Vacances) -->
                        <div class="flex items-center space-x-2">
                            <div class="flex bg-gray-100 rounded-lg p-1 mb-3 sm:mb-0">
                                <button id="calendar-tab" class="px-4 py-2 text-sm rounded-md transition-colors flex items-center ${this.activeTab === 'calendar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}">
                                    <i class="fas fa-calendar-alt mr-2"></i>
                                    Calendrier
                                </button>
                                <button id="holidays-tab" class="px-4 py-2 text-sm rounded-md transition-colors flex items-center ${this.activeTab === 'holidays' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}">
                                    <i class="fas fa-umbrella-beach mr-2"></i>
                                    Vacances
                                </button>
                            </div>
                            
                            <!-- Bouton pour ajouter une note -->
                            <button id="add-note-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm">
                                <i class="fas fa-plus-circle mr-2"></i>
                                Note
                            </button>
                        </div>
                    </div>
                </div>

                ${this.activeTab === 'calendar' ? `
                <!-- Contrôles de vue pour le calendrier -->
                <div class="px-6 pt-4 pb-2 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <!-- Navigation temporelle -->
                        <div class="flex items-center space-x-2">
                            <button id="prev-period" class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button id="today-btn" class="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors">
                                Aujourd'hui
                            </button>
                            <button id="next-period" class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                        
                        <!-- Sélecteur de vue -->
                        <div class="flex bg-gray-100 rounded-lg p-1">
                            <button id="month-view" class="px-3 py-1 text-sm rounded-md transition-colors ${this.currentView === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}">
                                Mois
                            </button>
                            <button id="week-view" class="px-3 py-1 text-sm rounded-md transition-colors ${this.currentView === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}">
                                Semaine
                            </button>
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- Contenu (calendrier ou vacances) -->
                <div class="p-6">
                    ${this.activeTab === 'calendar' ? `
                    <div id="calendar-content">
                        ${this.renderCalendarView()}
                    </div>
                    ` : `
                    <div id="holidays-content">
                        ${this.renderHolidaysView()}
                    </div>
                    `}
                </div>
            </div>

            <!-- Modal d'événement -->
            <div id="event-modal" class="modal fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4" style="display: none !important;">
                <div class="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold">Détails de l'événement</h3>
                            <button id="close-event-modal" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div id="event-details">
                            <!-- Contenu dynamique -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal des événements du jour -->
            <div id="day-events-modal" class="modal fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4" style="display: none !important;">
                <div class="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold">Séances du jour</h3>
                            <button id="close-day-events-modal" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div id="day-events-details">
                            <!-- Contenu dynamique -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal pour les notes -->
            <div id="note-modal" class="modal fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4" style="display: none !important;">
                <div class="bg-white rounded-lg max-w-lg w-full max-h-screen overflow-y-auto">
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold" id="note-modal-title">Note du jour</h3>
                            <button id="close-note-modal" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="mb-4">
                            <textarea id="note-content" class="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Écrivez votre note ici..."></textarea>
                        </div>
                        <div class="flex justify-end space-x-2">
                            <button id="save-note" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="fas fa-save mr-2"></i>
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal pour ajouter une note (sélection de date) -->
            <div id="add-note-date-modal" class="modal fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4" style="display: none !important;">
                <div class="bg-white rounded-lg max-w-md w-full">
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold">Ajouter une note</h3>
                            <button id="close-add-note-modal" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                            <div class="relative">
                                <input type="text" id="note-date-input" class="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="JJ/MM/AAAA" readonly>
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <i class="fas fa-calendar-alt text-gray-400"></i>
                                </div>
                                <div id="note-date-picker" class="hidden absolute z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2" style="width: 300px;">
                                    <div class="flex justify-between items-center mb-2">
                                        <div>
                                            <span id="current-month-year" class="text-sm font-medium"></span>
                                            <button id="month-selector" class="ml-1 text-sm text-blue-600">▼</button>
                                        </div>
                                        <div class="flex space-x-1">
                                            <button id="prev-month" class="p-1 text-gray-600 hover:text-blue-600"><i class="fas fa-chevron-up"></i></button>
                                            <button id="next-month" class="p-1 text-gray-600 hover:text-blue-600"><i class="fas fa-chevron-down"></i></button>
                                        </div>
                                    </div>
                                    
                                    <!-- Month selector dropdown (hidden by default) -->
                                    <div id="month-dropdown" class="hidden mb-2">
                                        <select id="month-select" class="w-full p-1 border border-gray-300 rounded text-sm">
                                            ${this.monthNames.map((month, idx) => `<option value="${idx}">${month}</option>`).join('')}
                                        </select>
                                        <select id="year-select" class="w-full mt-1 p-1 border border-gray-300 rounded text-sm">
                                            ${Array.from({length: 5}, (_, i) => {
                                                const year = new Date().getFullYear() - 2 + i;
                                                return `<option value="${year}">${year}</option>`;
                                            }).join('')}
                                        </select>
                                    </div>
                                    
                                    <!-- Days of week header -->
                                    <div class="grid grid-cols-7 text-center text-xs font-medium text-gray-500 mb-1">
                                        <div>lu</div>
                                        <div>ma</div>
                                        <div>me</div>
                                        <div>je</div>
                                        <div>ve</div>
                                        <div>sa</div>
                                        <div>di</div>
                                    </div>
                                    
                                    <!-- Calendar grid -->
                                    <div id="calendar-grid" class="grid grid-cols-7 gap-1">
                                        <!-- Days will be dynamically inserted here -->
                                    </div>
                                    
                                    <!-- Footer buttons -->
                                    <div class="flex justify-between mt-2 text-sm">
                                        <button id="clear-date" class="text-blue-600 hover:text-blue-800">Effacer</button>
                                        <button id="today-date" class="text-blue-600 hover:text-blue-800">Aujourd'hui</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex justify-end space-x-2">
                            <button id="confirm-note-date" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="fas fa-arrow-right mr-2"></i>
                                Suivant
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        console.log('✅ HTML du calendrier injecté');
        
        // ⚠️ CRITIQUE: Forcer immédiatement la fermeture des modals
        const eventModal = document.getElementById('event-modal');
        if (eventModal) {
            eventModal.classList.add('hidden');
            eventModal.style.display = 'none';
            console.log('✅ Modal événement forcé à être caché immédiatement');
        }
        
        const dayEventsModal = document.getElementById('day-events-modal');
        if (dayEventsModal) {
            dayEventsModal.classList.add('hidden');
            dayEventsModal.style.display = 'none';
            console.log('✅ Modal événements du jour forcé à être caché immédiatement');
        }

        const noteModal = document.getElementById('note-modal');
        if (noteModal) {
            noteModal.classList.add('hidden');
            noteModal.style.display = 'none';
            console.log('✅ Modal des notes forcé à être caché immédiatement');
        }

        const addNoteDateModal = document.getElementById('add-note-date-modal');
        if (addNoteDateModal) {
            addNoteDateModal.classList.add('hidden');
            addNoteDateModal.style.display = 'none';
            console.log('✅ Modal d\'ajout de note forcé à être caché immédiatement');
        }
        
        this.setupEventListeners();
        console.log('✅ Event listeners configurés');
        
        // ⚠️ Sécurité supplémentaire: Vérifier encore une fois après un délai
        setTimeout(() => {
            const eventModalCheck = document.getElementById('event-modal');
            if (eventModalCheck) {
                eventModalCheck.classList.add('hidden');
                eventModalCheck.style.display = 'none';
                console.log('✅ Vérification finale: Modal d\'événement caché');
            }
        }, 100);
        
        console.log('🗓️ === FIN RENDER CALENDRIER ===');
    }

    /**
     * Rendu de la vue calendrier selon le mode sélectionné
     */
    renderCalendarView() {
        if (this.currentView === 'month') {
            return this.renderMonthView();
        } else {
            return this.renderWeekView();
        }
    }

    /**
     * Rendu de la vue mensuelle
     */
    renderMonthView() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Première et dernière date du mois
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // Première date à afficher (lundi de la semaine de la première date)
        const startDate = new Date(firstDay);
        const startDayOfWeek = firstDay.getDay(); // 0 = dimanche, 1 = lundi...
        const daysToSubtract = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Commencer par lundi
        startDate.setDate(firstDay.getDate() - daysToSubtract);
        
        // Générer 6 semaines (42 jours)
        const calendarDays = [];
        for (let i = 0; i < 42; i++) {
            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);
            calendarDays.push(day);
        }

        return `
            <!-- En-tête avec mois/année -->
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-800 text-center">
                    ${this.monthNames[month]} ${year}
                </h2>
            </div>

            <!-- Grille du calendrier -->
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <!-- En-tête des jours de la semaine -->
                <div class="grid grid-cols-7 bg-gray-50">
                    ${['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => `
                        <div class="p-3 text-center text-sm font-medium text-gray-600 border-r border-gray-200 last:border-r-0">
                            ${day}
                        </div>
                    `).join('')}
                </div>

                <!-- Grille des jours -->
                <div class="grid grid-cols-7">
                    ${calendarDays.map(day => {
                        const isCurrentMonth = day.getMonth() === month;
                        const isToday = this.isSameDay(day, new Date());
                        const dayEvents = this.getEventsForDate(day);
                        
                        return `
                            <div class="border-r border-b border-gray-200 last:border-r-0 h-24 sm:h-32 p-1 sm:p-2 ${
                                !isCurrentMonth ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                            } ${
                                isToday ? 'bg-blue-50' : ''
                            } cursor-pointer transition-colors" data-date="${day.toISOString().split('T')[0]}">
                                
                                <!-- Numéro du jour -->
                                <div class="flex items-center justify-between mb-1">
                                    <span class="text-sm font-medium ${
                                        !isCurrentMonth ? 'text-gray-400' : 
                                        isToday ? 'text-blue-600 font-bold' : 'text-gray-800'
                                    }">
                                        ${day.getDate()}
                                    </span>
                                    <div class="flex items-center space-x-1">
                                        ${this.hasNote(day.toISOString().split('T')[0]) ? `
                                            <span class="w-2 h-2 bg-green-500 rounded-full" title="Ce jour a une note"></span>
                                        ` : ''}
                                        ${dayEvents.length > 0 ? `
                                            <span class="w-2 h-2 bg-blue-500 rounded-full" title="Ce jour a des événements"></span>
                                        ` : ''}
                                    </div>
                                </div>

                                <!-- Événements du jour -->
                                <div class="space-y-1 overflow-hidden">
                                    ${dayEvents.slice(0, 2).map(event => {
                                        // Obtenir les statistiques d'assiduité pour cet événement
                                        const attendanceInfo = event.isHoliday ? null : this.getAttendanceInfoForEvent(event);
                                        
                                        // Style différent pour les vacances
                                        if (event.isHoliday) {
                                            return `
                                                <div class="text-xs p-1 rounded bg-orange-100 text-orange-800 truncate cursor-pointer hover:bg-orange-200 flex items-center justify-between" 
                                                     data-event-id="${event.id}">
                                                    <span class="truncate"><i class="fas fa-umbrella-beach mr-1"></i> ${event.title}</span>
                                                </div>
                                            `;
                                        } else {
                                            return `
                                                <div class="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate cursor-pointer hover:bg-blue-200 flex items-center justify-between" 
                                                     data-event-id="${event.id}">
                                                    <span class="truncate">${event.title}</span>
                                                    ${attendanceInfo ? `
                                                        <span class="text-xs text-green-600 font-medium ml-1 flex-shrink-0">
                                                            ${attendanceInfo.present}/${attendanceInfo.total}
                                                        </span>
                                                    ` : ''}
                                                </div>
                                            `;
                                        }
                                    }).join('')}
                                    ${dayEvents.length > 2 ? `
                                        <div class="text-xs text-gray-500 cursor-pointer hover:text-blue-600" 
                                             data-day-events="${day.toISOString().split('T')[0]}">
                                            +${dayEvents.length - 2} autre(s)
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Rendu de la vue hebdomadaire
     */
    renderWeekView() {
        const startOfWeek = this.getStartOfWeek(this.currentDate);
        const weekDays = [];
        
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            weekDays.push(day);
        }

        return `
            <!-- En-tête avec période -->
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-800 text-center">
                    Semaine du ${weekDays[0].getDate()} ${this.monthNames[weekDays[0].getMonth()]} 
                    au ${weekDays[6].getDate()} ${this.monthNames[weekDays[6].getMonth()]} ${weekDays[6].getFullYear()}
                </h2>
            </div>

            <!-- Vue hebdomadaire -->
            <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <!-- En-tête des jours -->
                <div class="grid grid-cols-7 bg-gray-50">
                    ${weekDays.map(day => {
                        const isToday = this.isSameDay(day, new Date());
                        return `
                            <div class="p-3 text-center border-r border-gray-200 last:border-r-0 ${
                                isToday ? 'bg-blue-100 text-blue-800' : ''
                            }">
                                <div class="text-sm font-medium">${this.dayNames[day.getDay()]}</div>
                                <div class="text-lg font-bold mt-1 ${
                                    isToday ? 'text-blue-600' : 'text-gray-800'
                                }">${day.getDate()}</div>
                                <div class="text-xs text-gray-500">${this.monthNames[day.getMonth()]}</div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- Contenu de la semaine -->
                <div class="grid grid-cols-7 min-h-96">
                    ${weekDays.map(day => {
                        const dayEvents = this.getEventsForDate(day);
                        const isToday = this.isSameDay(day, new Date());
                        
                        return `
                            <div class="border-r border-gray-200 last:border-r-0 p-2 ${
                                isToday ? 'bg-blue-50' : 'hover:bg-gray-50'
                            }" data-date="${day.toISOString().split('T')[0]}">
                                <!-- Indicateur de note -->
                                ${this.hasNote(day.toISOString().split('T')[0]) ? `
                                <div class="flex justify-end mb-1">
                                    <span class="w-2 h-2 bg-green-500 rounded-full" title="Ce jour a une note"></span>
                                </div>
                                ` : ''}
                                <div class="space-y-2">
                                        ${dayEvents.map(event => {
                                            // Obtenir les statistiques d'assiduité pour cet événement
                                            const attendanceInfo = event.isHoliday ? null : this.getAttendanceInfoForEvent(event);
                                            
                                            // Style différent pour les vacances
                                            if (event.isHoliday) {
                                                return `
                                                    <div class="p-2 rounded bg-orange-100 text-orange-800 text-sm cursor-pointer hover:bg-orange-200 transition-colors" 
                                                         data-event-id="${event.id}">
                                                        <div class="font-medium truncate flex items-center">
                                                            <i class="fas fa-umbrella-beach mr-1"></i>
                                                            <span class="truncate">${event.title}</span>
                                                        </div>
                                                        <div class="text-xs text-orange-600 truncate">${event.description}</div>
                                                    </div>
                                                `;
                                            } else {
                                                return `
                                                    <div class="p-2 rounded bg-blue-100 text-blue-800 text-sm cursor-pointer hover:bg-blue-200 transition-colors" 
                                                         data-event-id="${event.id}">
                                                        <div class="font-medium truncate flex items-center justify-between">
                                                            <span class="truncate">${event.title}</span>
                                                            ${attendanceInfo ? `
                                                                <span class="text-xs text-green-600 font-medium ml-2 flex-shrink-0">
                                                                    ${attendanceInfo.present}/${attendanceInfo.total}
                                                                </span>
                                                            ` : ''}
                                                        </div>
                                                        <div class="text-xs text-blue-600 truncate">${event.description}</div>
                                                        ${attendanceInfo && attendanceInfo.absentStudents.length > 0 ? `
                                                            <div class="text-xs text-red-600 mt-1">
                                                                <i class="fas fa-user-times mr-1"></i>
                                                                ${attendanceInfo.absentStudents.length} absent(s)
                                                            </div>
                                                        ` : ''}
                                                    </div>
                                                `;
                                            }
                                        }).join('')}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Configuration des event listeners
     */
    setupEventListeners() {
        // ⚠️ Sécurité: Vérifier que les éléments existent avant d'ajouter les listeners
        
        // Changement d'onglet (Calendrier / Vacances)
        const calendarTab = document.getElementById('calendar-tab');
        const holidaysTab = document.getElementById('holidays-tab');
        
        if (calendarTab) {
            calendarTab.addEventListener('click', () => {
                this.activeTab = 'calendar';
                this.render();
            });
        }
        
        if (holidaysTab) {
            holidaysTab.addEventListener('click', () => {
                this.activeTab = 'holidays';
                this.render();
            });
        }
        
        // Bouton d'ajout de note
        const addNoteBtn = document.getElementById('add-note-btn');
        if (addNoteBtn) {
            addNoteBtn.addEventListener('click', () => {
                this.showAddNoteDateModal();
            });
        }
        
        // Bouton d'ajout de vacance (uniquement dans l'onglet vacances)
        if (this.activeTab === 'holidays') {
            const addHolidayBtn = document.getElementById('add-holiday-btn');
            if (addHolidayBtn) {
                addHolidayBtn.addEventListener('click', () => {
                    this.showHolidayModal();
                });
            }
            
            // Boutons d'édition et de suppression des vacances
            document.querySelectorAll('.edit-holiday-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const holidayId = parseInt(e.target.closest('.edit-holiday-btn').dataset.holidayId);
                    this.editHoliday(holidayId);
                });
            });
            
            document.querySelectorAll('.delete-holiday-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const holidayId = parseInt(e.target.closest('.delete-holiday-btn').dataset.holidayId);
                    this.deleteHolidayConfirm(holidayId);
                });
            });
            
            // Fermeture du modal de vacance
            const closeHolidayModal = document.getElementById('close-holiday-modal');
            if (closeHolidayModal) {
                closeHolidayModal.addEventListener('click', () => {
                    this.hideHolidayModal();
                });
            }
            
            const cancelHolidayBtn = document.getElementById('cancel-holiday-btn');
            if (cancelHolidayBtn) {
                cancelHolidayBtn.addEventListener('click', () => {
                    this.hideHolidayModal();
                });
            }
            
            // Formulaire de vacance
            const holidayForm = document.getElementById('holiday-form');
            if (holidayForm) {
                holidayForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.saveHoliday();
                });
            }
        }
        
        // Fermeture du modal d'ajout de note (sélection de date)
        const closeAddNoteModal = document.getElementById('close-add-note-modal');
        if (closeAddNoteModal) {
            closeAddNoteModal.addEventListener('click', () => {
                this.hideAddNoteDateModal();
            });
        }
        
        // Confirmation de la date pour la note
        const confirmNoteDate = document.getElementById('confirm-note-date');
        if (confirmNoteDate) {
            confirmNoteDate.addEventListener('click', () => {
                this.confirmNoteDate();
            });
        }
        
        // Navigation temporelle (uniquement si on est dans l'onglet calendrier)
        if (this.activeTab === 'calendar') {
            const prevBtn = document.getElementById('prev-period');
            const nextBtn = document.getElementById('next-period');
            const todayBtn = document.getElementById('today-btn');
            
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    if (this.currentView === 'month') {
                        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                    } else {
                        this.currentDate.setDate(this.currentDate.getDate() - 7);
                    }
                    this.updateCalendarContent();
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    if (this.currentView === 'month') {
                        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                    } else {
                        this.currentDate.setDate(this.currentDate.getDate() + 7);
                    }
                    this.updateCalendarContent();
                });
            }

            if (todayBtn) {
                todayBtn.addEventListener('click', () => {
                    this.currentDate = new Date();
                    this.updateCalendarContent();
                });
            }

            // Changement de vue
            const monthBtn = document.getElementById('month-view');
            const weekBtn = document.getElementById('week-view');
            
            if (monthBtn) {
                monthBtn.addEventListener('click', () => {
                    this.currentView = 'month';
                    this.updateCalendarContent();
                    this.updateViewButtons();
                });
            }

            if (weekBtn) {
                weekBtn.addEventListener('click', () => {
                    this.currentView = 'week';
                    this.updateCalendarContent();
                    this.updateViewButtons();
                });
            }
        }

        // Fermeture du modal - Sécurité supplémentaire
        const closeModal = document.getElementById('close-event-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.hideEventModal();
            });
        }

        const closeDayEventsModal = document.getElementById('close-day-events-modal');
        if (closeDayEventsModal) {
            closeDayEventsModal.addEventListener('click', () => {
                this.hideDayEventsModal();
            });
        }

        // Gestion du modal de notes
        const closeNoteModal = document.getElementById('close-note-modal');
        if (closeNoteModal) {
            closeNoteModal.addEventListener('click', () => {
                this.hideNoteModal();
            });
        }

        const saveNoteBtn = document.getElementById('save-note');
        if (saveNoteBtn) {
            saveNoteBtn.addEventListener('click', () => {
                this.saveNoteFromModal();
            });
        }

        // Permet de sauvegarder la note en appuyant sur Ctrl+Enter dans le textarea
        const noteContent = document.getElementById('note-content');
        if (noteContent) {
            noteContent.addEventListener('keydown', (e) => {
                if (e.ctrlKey && (e.key === 'Enter')) {
                    this.saveNoteFromModal();
                }
            });
        }

        // Fermeture du modal en cliquant à l'extérieur
        const eventModal = document.getElementById('event-modal');
        if (eventModal) {
            eventModal.addEventListener('click', (e) => {
                if (e.target.id === 'event-modal') {
                    this.hideEventModal();
                }
            });
        }
        
        const dayEventsModal = document.getElementById('day-events-modal');
        if (dayEventsModal) {
            dayEventsModal.addEventListener('click', (e) => {
                if (e.target.id === 'day-events-modal') {
                    this.hideDayEventsModal();
                }
            });
        }
        
        const addNoteDateModal = document.getElementById('add-note-date-modal');
        if (addNoteDateModal) {
            addNoteDateModal.addEventListener('click', (e) => {
                if (e.target.id === 'add-note-date-modal') {
                    this.hideAddNoteDateModal();
                }
            });
        }
        
        const holidayModal = document.getElementById('holiday-modal');
        if (holidayModal) {
            holidayModal.addEventListener('click', (e) => {
                if (e.target.id === 'holiday-modal') {
                    this.hideHolidayModal();
                }
            });
        }
        
        // Clic sur les événements - Délégué au niveau du document
        document.addEventListener('click', (e) => {
            // Clic sur un événement individuel
            if (e.target.closest('[data-event-id]')) {
                const eventId = e.target.closest('[data-event-id]').dataset.eventId;
                this.showEventDetails(eventId);
            }
            // Clic sur "+X autre(s)" pour voir tous les événements du jour
            else if (e.target.closest('[data-day-events]')) {
                const date = e.target.closest('[data-day-events]').dataset.dayEvents;
                this.showDayEvents(date);
            }
            // Clic sur un jour du calendrier
            else if (e.target.closest('[data-date]')) {
                const date = e.target.closest('[data-date]').dataset.date;
                
                // Si le jour a déjà une note, afficher le modal d'édition
                if (this.hasNote(date)) {
                    this.showNoteModal(date);
                }
                // Sinon, afficher les événements du jour s'il y en a
                else {
                    const dayEvents = this.getEventsForDate(new Date(date));
                    if (dayEvents.length > 0) {
                        this.showDayEvents(date);
                    }
                }
            }
        });
        
        console.log('✅ Tous les event listeners configurés avec sécurité');
    }

    /**
     * Mettre à jour le contenu du calendrier
     */
    updateCalendarContent() {
        const calendarContent = document.getElementById('calendar-content');
        if (calendarContent) {
            calendarContent.innerHTML = this.renderCalendarView();
        }
    }

    /**
     * Mettre à jour les boutons de vue
     */
    updateViewButtons() {
        const monthBtn = document.getElementById('month-view');
        const weekBtn = document.getElementById('week-view');
        
        // Reset classes
        [monthBtn, weekBtn].forEach(btn => {
            btn.className = 'px-3 py-1 text-sm rounded-md transition-colors text-gray-600 hover:text-gray-800';
        });
        
        // Activer le bouton approprié
        if (this.currentView === 'month') {
            monthBtn.className = 'px-3 py-1 text-sm rounded-md transition-colors bg-white text-blue-600 shadow-sm';
        } else {
            weekBtn.className = 'px-3 py-1 text-sm rounded-md transition-colors bg-white text-blue-600 shadow-sm';
        }
    }

    /**
     * Obtenir les événements pour une date donnée
     */
    getEventsForDate(date) {
        const dateStr = date.toISOString().split('T')[0];
        return this.events.filter(event => event.date === dateStr);
    }

    /**
     * Vérifier si deux dates sont le même jour
     */
    isSameDay(date1, date2) {
        return date1.toDateString() === date2.toDateString();
    }

    /**
     * Obtenir le début de la semaine (lundi)
     */
    getStartOfWeek(date) {
        const startOfWeek = new Date(date);
        const dayOfWeek = date.getDay();
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Lundi = 0
        startOfWeek.setDate(date.getDate() - daysToSubtract);
        startOfWeek.setHours(0, 0, 0, 0);
        return startOfWeek;
    }

    /**
     * Afficher tous les événements d'un jour
     */
    showDayEvents(date) {
        console.log('📅 Affichage des événements du jour:', date);
        
        const dayEvents = this.getEventsForDate(new Date(date));
        const hasNote = this.hasNote(date);
        const note = this.getNote(date);
        
        // Ne rien afficher s'il n'y a ni événement ni note
        if (dayEvents.length === 0 && !hasNote) {
            console.warn('⚠️ Aucun événement ni note pour cette date:', date);
            return;
        }

        const dayEventsDetails = document.getElementById('day-events-details');
        const modal = document.getElementById('day-events-modal');
        
        if (dayEventsDetails && modal) {
            const formattedDate = new Date(date).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
            
            dayEventsDetails.innerHTML = `
                <div class="space-y-4">
                    <div class="text-center">
                        <h4 class="text-lg font-semibold text-gray-800 mb-2">${formattedDate}</h4>
                        ${dayEvents.length > 0 ? 
                            `<p class="text-sm text-gray-600">${dayEvents.length} événement${dayEvents.length > 1 ? 's' : ''} prévu${dayEvents.length > 1 ? 's' : ''}</p>` 
                            : ''}
                    </div>
                    
                    ${hasNote ? `
                    <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div class="flex items-center justify-between mb-2">
                            <h5 class="font-medium text-green-800 flex items-center">
                                <i class="fas fa-sticky-note mr-2"></i>
                                Note du jour
                            </h5>
                            <button class="text-green-600 hover:text-green-800" onclick="window.calendrierModule.showNoteModal('${date}')">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                        <div class="text-gray-700 whitespace-pre-wrap">${this.escapeHtml(note)}</div>
                    </div>
                    ` : ''}
                    
                    ${dayEvents.length > 0 ? `
                    <div class="space-y-3">
                        ${dayEvents.map((event, index) => {
                            // Style différent pour les vacances
                            if (event.isHoliday) {
                                return `
                                    <div class="bg-orange-50 rounded-lg p-4 border border-orange-200 hover:border-orange-300 transition-colors cursor-pointer"
                                         onclick="window.calendrierModule.showEventDetailsFromDay('${event.id}')">
                                        <div class="flex items-start justify-between">
                                            <div class="flex-1">
                                                <h5 class="font-medium text-orange-800 mb-1">
                                                    <i class="fas fa-umbrella-beach mr-2"></i>
                                                    ${this.escapeHtml(event.title)}
                                                </h5>
                                                <p class="text-sm text-gray-600 mb-1">
                                                    ${this.escapeHtml(event.description)}
                                                </p>
                                                <div class="flex flex-wrap gap-1 mt-2">
                                                    <span class="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                                                        Durée: ${this.escapeHtml(event.duration)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div class="ml-3">
                                                <span class="inline-flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                                                    ${index + 1}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            } else {
                                // Pour les événements normaux (cours)
                                const attendanceInfo = this.getAttendanceInfoForEvent(event);
                                return `
                                    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                                         onclick="window.calendrierModule.showEventDetailsFromDay('${event.id}')">
                                        <div class="flex items-start justify-between">
                                            <div class="flex-1">
                                                <h5 class="font-medium text-gray-800 mb-1">${this.escapeHtml(event.title)}</h5>
                                                ${event.horaires && event.horaires !== 'Non défini' ? `
                                                    <p class="text-sm text-gray-600 mb-2">
                                                        <i class="fas fa-clock mr-1"></i>
                                                        ${this.escapeHtml(event.horaires)}
                                                    </p>
                                                ` : ''}
                                                
                                                ${attendanceInfo ? `
                                                    <div class="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                                                        <div class="flex items-center justify-between text-sm">
                                                            <span class="text-blue-800 font-medium">
                                                                <i class="fas fa-users mr-1"></i>
                                                                ${attendanceInfo.scopeLabel}
                                                            </span>
                                                            <span class="text-green-600 font-bold">
                                                                ${attendanceInfo.present}/${attendanceInfo.total} présents
                                                            </span>
                                                        </div>
                                                        ${attendanceInfo.absentStudents.length > 0 ? `
                                                            <div class="text-xs text-red-600 mt-1">
                                                                <i class="fas fa-user-times mr-1"></i>
                                                                Absents: ${attendanceInfo.absentStudents.map(s => s.prenom).join(', ')}
                                                            </div>
                                                        ` : ''}
                                                    </div>
                                                ` : ''}
                                                
                                                ${event.matieres && event.matieres.length > 0 ? `
                                                    <div class="flex flex-wrap gap-1 mb-2">
                                                        ${event.matieres.map(matiere => `
                                                            <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                                                ${this.escapeHtml(matiere)}
                                                            </span>
                                                        `).join('')}
                                                    </div>
                                                ` : ''}
                                                
                                                ${event.objectifs ? `
                                                    <p class="text-sm text-gray-600 line-clamp-2">
                                                        <strong>Objectifs:</strong> ${this.escapeHtml(event.objectifs)}
                                                    </p>
                                                ` : ''}
                                            </div>
                                            <div class="ml-3">
                                                <span class="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                                                    ${index + 1}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }
                        }).join('')}
                    </div>
                    ` : ''}
                    
                    <div class="flex ${dayEvents.length === 0 && !hasNote ? 'justify-between' : 'justify-center'} pt-4">
                        ${dayEvents.length === 0 && !hasNote ? `
                            <button onclick="window.calendrierModule.showNoteModal('${date}')" class="btn-primary px-6 py-2">
                                <i class="fas fa-plus mr-2"></i>
                                Ajouter une note
                            </button>
                        ` : ''}
                        <button onclick="window.calendrierModule.hideDayEventsModal()" class="btn-secondary px-6 py-2">
                            Fermer
                        </button>
                    </div>
                </div>
            `;
            
            // Afficher le modal
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
            console.log('✅ Modal des événements du jour affiché');
        }
    }

    /**
     * Afficher les détails d'un événement depuis la vue jour
     */
    showEventDetailsFromDay(eventId) {
        // Fermer le modal du jour d'abord
        this.hideDayEventsModal();
        // Puis afficher les détails de l'événement
        setTimeout(() => {
            this.showEventDetails(eventId);
        }, 100);
    }
    showEventDetails(eventId) {
        console.log('👁️ Affichage des détails de l\'événement:', eventId);
        
        const event = this.events.find(e => e.id === eventId);
        if (!event) {
            console.warn('⚠️ Événement introuvable:', eventId);
            return;
        }

        const eventDetails = document.getElementById('event-details');
        const modal = document.getElementById('event-modal');
        
        if (eventDetails && modal) {
            // Contenu différent pour les vacances et les événements normaux
            if (event.isHoliday) {
                // Affichage des détails de vacances
                eventDetails.innerHTML = `
                    <div class="space-y-4">
                        <div>
                            <h4 class="font-semibold text-lg text-orange-800">${this.escapeHtml(event.title)}</h4>
                            <p class="text-sm text-gray-600">
                                <i class="fas fa-calendar mr-2"></i>
                                ${new Date(event.date).toLocaleDateString('fr-FR', { 
                                    weekday: 'long', 
                                    day: 'numeric', 
                                    month: 'long', 
                                    year: 'numeric' 
                                })}
                            </p>
                        </div>

                        <div class="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <h5 class="font-medium text-orange-800 mb-2 flex items-center">
                                <i class="fas fa-umbrella-beach mr-2"></i>
                                Détails
                            </h5>
                            <p class="text-gray-700">${this.escapeHtml(event.description)}</p>
                            <p class="mt-2 text-sm font-medium text-orange-700">
                                Durée: ${this.escapeHtml(event.duration)}
                            </p>
                        </div>
                        
                        <div class="flex space-x-2 pt-4">
                            <button onclick="window.calendrierModule.hideEventModal()" class="btn-secondary px-4 py-2 text-sm">
                                Fermer
                            </button>
                        </div>
                    </div>
                `;
            } else {
                // Récupérer les données d'assiduité pour cet événement
                const attendanceInfo = this.getAttendanceInfoForEvent(event);

                eventDetails.innerHTML = `
                    <div class="space-y-4">
                        <div>
                            <h4 class="font-semibold text-lg text-gray-800">${this.escapeHtml(event.title)}</h4>
                            <p class="text-sm text-gray-600">
                                <i class="fas fa-calendar mr-2"></i>
                                ${new Date(event.date).toLocaleDateString('fr-FR', { 
                                    weekday: 'long', 
                                    day: 'numeric', 
                                    month: 'long', 
                                    year: 'numeric' 
                                })}
                            </p>
                            ${event.horaires && event.horaires !== 'Non défini' ? `
                                <p class="text-sm text-gray-600">
                                    <i class="fas fa-clock mr-2"></i>
                                    ${this.escapeHtml(event.horaires)}
                                </p>
                            ` : ''}
                        </div>

                        ${attendanceInfo ? `
                            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h5 class="font-medium text-blue-800 mb-3 flex items-center">
                                    <i class="fas fa-users mr-2"></i>
                                    Présences - ${attendanceInfo.scopeLabel}
                                </h5>
                                <div class="grid grid-cols-3 gap-4 text-center mb-3">
                                    <div class="bg-white rounded p-2">
                                        <div class="text-lg font-bold text-green-600">${attendanceInfo.present}</div>
                                        <div class="text-xs text-gray-600">Présents</div>
                                    </div>
                                    <div class="bg-white rounded p-2">
                                        <div class="text-lg font-bold text-red-600">${attendanceInfo.absent}</div>
                                        <div class="text-xs text-gray-600">Absents</div>
                                    </div>
                                    <div class="bg-white rounded p-2">
                                        <div class="text-lg font-bold text-gray-600">${attendanceInfo.total}</div>
                                        <div class="text-xs text-gray-600">Total</div>
                                    </div>
                                </div>
                                
                                ${attendanceInfo.absentStudents.length > 0 ? `
                                    <div class="border-t border-blue-200 pt-3">
                                        <h6 class="font-medium text-red-800 mb-2 flex items-center">
                                            <i class="fas fa-user-times mr-1"></i>
                                            Élèves absents
                                        </h6>
                                        <div class="space-y-1">
                                            ${attendanceInfo.absentStudents.map(student => `
                                                <div class="flex items-center justify-between text-sm">
                                                    <span class="text-gray-800">
                                                        <i class="fas fa-circle text-red-400 mr-2"></i>
                                                        ${this.escapeHtml(student.prenom)} ${this.escapeHtml(student.nom)}
                                                    </span>
                                                    <span class="text-xs ${student.isTemporary ? 'text-orange-600' : 'text-blue-600'}">
                                                        ${student.isTemporary 
                                                            ? `Invité (${student.originalGroup})` 
                                                            : (student.groupe || 'Groupe principal')
                                                        }
                                                    </span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : '<div class="text-center text-green-700 text-sm"><i class="fas fa-check-circle mr-1"></i>Tous présents!</div>'}
                                
                                ${attendanceInfo.temporaryCount > 0 ? `
                                    <div class="border-t border-blue-200 pt-2 mt-2">
                                        <div class="text-xs text-orange-700">
                                            <i class="fas fa-exchange-alt mr-1"></i>
                                            ${attendanceInfo.temporaryCount} élève(s) invité(s) d'autres groupes
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}
                        
                        ${event.matieres && event.matieres.length > 0 ? `
                            <div>
                                <h5 class="font-medium text-gray-700 mb-2">Matières</h5>
                                <div class="flex flex-wrap gap-2">
                                    ${event.matieres.map(matiere => `
                                        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                            ${this.escapeHtml(matiere)}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        ${event.objectifs && event.objectifs.trim() ? `
                            <div>
                                <h5 class="font-medium text-gray-700 mb-2">Objectifs</h5>
                                <p class="text-gray-600 text-sm">${this.escapeHtml(event.objectifs)}</p>
                            </div>
                        ` : ''}
                        
                        ${event.activites && event.activites.trim() ? `
                            <div>
                                <h5 class="font-medium text-gray-700 mb-2">Activités</h5>
                                <p class="text-gray-600 text-sm">${this.escapeHtml(event.activites)}</p>
                            </div>
                        ` : ''}
                        
                        ${event.observations && event.observations.trim() ? `
                            <div>
                                <h5 class="font-medium text-gray-700 mb-2">Observations</h5>
                                <p class="text-gray-600 text-sm">${this.escapeHtml(event.observations)}</p>
                            </div>
                        ` : ''}
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <h5 class="font-medium text-gray-700 mb-1">Niveau</h5>
                                <p class="text-sm text-gray-600">${this.escapeHtml(event.niveau)}</p>
                            </div>
                            <div>
                                <h5 class="font-medium text-gray-700 mb-1">Classe</h5>
                                <p class="text-sm text-gray-600">${this.escapeHtml(event.classe)}</p>
                            </div>
                        </div>
                        
                        <div class="flex space-x-2 pt-4">
                            <button onclick="window.app.showSection('cahier')" class="btn-primary px-4 py-2 text-sm">
                                <i class="fas fa-book mr-2"></i>
                                Voir le cahier journal
                            </button>
                            <button onclick="window.calendrierModule.hideEventModal()" class="btn-secondary px-4 py-2 text-sm">
                                Fermer
                            </button>
                        </div>
                    </div>
                `;
            }
            
            // Afficher le modal SEULEMENT maintenant
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
            console.log('✅ Modal d\'événement affiché');
        }
    }

    /**
     * Récupérer les informations d'assiduité pour un événement
     */
    getAttendanceInfoForEvent(event) {
        // Trouver l'entrée correspondante dans le cahier journal
        let entree = null;
        
        this.dataManager.data.niveaux.forEach(niveau => {
            if (niveau.classes) {
                niveau.classes.forEach(classe => {
                    if (classe.cahierJournal) {
                        const foundEntry = classe.cahierJournal.find(e => e.id === event.id);
                        if (foundEntry) {
                            entree = foundEntry;
                            entree._classe = classe; // Ajouter une référence à la classe
                        }
                    }
                });
            }
        });

        if (!entree || !entree.attendance || !entree._classe) {
            return null;
        }

        const { scope, data, temporaryStudents } = entree.attendance;
        const classe = entree._classe;
        
        // Déterminer le label du scope
        let scopeLabel = scope === 'all' ? 'Toute la classe' : scope;
        
        // Collecter les élèves présents et absents
        let presents = [];
        let absents = [];
        let temporaryCount = 0;
        
        // Élèves du scope principal
        Object.entries(data).forEach(([eleveId, isPresent]) => {
            const eleve = classe.eleves.find(e => e.id === eleveId);
            if (eleve) {
                if (isPresent) {
                    presents.push(eleve);
                } else {
                    absents.push(eleve);
                }
            }
        });
        
        // Élèves temporaires
        if (temporaryStudents) {
            temporaryCount = Object.keys(temporaryStudents).length;
            Object.entries(temporaryStudents).forEach(([eleveId, tempData]) => {
                const eleve = classe.eleves.find(e => e.id === eleveId);
                if (eleve) {
                    const tempEleve = {
                        ...eleve,
                        isTemporary: true,
                        originalGroup: tempData.originalGroup
                    };
                    
                    if (tempData.present) {
                        presents.push(tempEleve);
                    } else {
                        absents.push(tempEleve);
                    }
                }
            });
        }
        
        return {
            present: presents.length,
            absent: absents.length,
            total: presents.length + absents.length,
            scopeLabel: scopeLabel,
            absentStudents: absents,
            temporaryCount: temporaryCount
        };
    }

    /**
     * Masquer le modal d'événement
     */
    hideEventModal() {
        const modal = document.getElementById('event-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
            console.log('✅ Modal d\'événement caché');
        }
    }

    /**
     * Masquer le modal des événements du jour
     */
    hideDayEventsModal() {
        const modal = document.getElementById('day-events-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
            console.log('✅ Modal des événements du jour caché');
        }
    }

    /**
     * Afficher le modal de note pour une date spécifique
     */
    showNoteModal(date) {
        console.log('📝 Affichage du modal de note pour la date:', date);
        const formattedDate = new Date(date).toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });

        // Définir la date active pour la note
        this.activeNoteDate = date;
        
        // Mettre à jour le titre du modal
        const modalTitle = document.getElementById('note-modal-title');
        if (modalTitle) {
            modalTitle.textContent = `Note du ${formattedDate}`;
        }
        
        // Récupérer la note existante pour cette date
        const noteContent = document.getElementById('note-content');
        if (noteContent) {
            noteContent.value = this.getNote(date);
        }
        
        // Afficher le modal
        const modal = document.getElementById('note-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
            
            // Focus sur le textarea
            if (noteContent) {
                setTimeout(() => {
                    noteContent.focus();
                }, 100);
            }
            
            console.log('✅ Modal de note affiché');
        }
    }
    
    /**
     * Masquer le modal de note
     */
    hideNoteModal() {
        const modal = document.getElementById('note-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
            console.log('✅ Modal de note caché');
        }
    }
    
    /**
     * Afficher le modal de sélection de date pour une note
     */
    showAddNoteDateModal() {
        console.log('📝 Affichage du modal de sélection de date pour une note');
        
        // Afficher le modal
        const modal = document.getElementById('add-note-date-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
            
            // Initialiser le date picker
            this.initDatePicker();
            console.log('✅ Modal de sélection de date pour note affiché');
        }
    }
    
    /**
     * Initialiser le date picker pour la sélection de date
     */
    initDatePicker() {
        const dateInput = document.getElementById('note-date-input');
        const datePicker = document.getElementById('note-date-picker');
        const monthYearText = document.getElementById('current-month-year');
        const calendarGrid = document.getElementById('calendar-grid');
        const prevMonthBtn = document.getElementById('prev-month');
        const nextMonthBtn = document.getElementById('next-month');
        const monthSelector = document.getElementById('month-selector');
        const monthDropdown = document.getElementById('month-dropdown');
        const monthSelect = document.getElementById('month-select');
        const yearSelect = document.getElementById('year-select');
        const clearDateBtn = document.getElementById('clear-date');
        const todayDateBtn = document.getElementById('today-date');
        
        // Date actuelle pour initialisation
        let currentDate = new Date();
        let selectedDate = null;
        
        // Fonction pour formater la date en français
        const formatDate = (date) => {
            return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
        };
        
        // Fonction pour mettre à jour le texte du mois/année
        const updateMonthYearText = () => {
            monthYearText.textContent = `${this.monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
            
            // Mettre à jour les sélecteurs de mois et d'année
            monthSelect.value = currentDate.getMonth();
            yearSelect.value = currentDate.getFullYear();
        };
        
        // Fonction pour générer la grille du calendrier
        const generateCalendarGrid = () => {
            calendarGrid.innerHTML = '';
            
            // Premier jour du mois
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            // Dernier jour du mois
            const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            
            // Déterminer le jour de la semaine du premier jour (0 = dimanche, 1 = lundi, ...)
            let firstDayWeekday = firstDayOfMonth.getDay();
            // Ajuster pour commencer par lundi (0)
            firstDayWeekday = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1;
            
            // Jours du mois précédent pour remplir la première semaine
            const prevMonthDays = firstDayWeekday;
            // Calculer le premier jour à afficher
            const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
            
            // Générer les jours du mois précédent
            for (let i = 0; i < prevMonthDays; i++) {
                const dayNumber = prevMonthLastDay - prevMonthDays + i + 1;
                const dayElement = document.createElement('div');
                dayElement.className = 'text-center py-1 text-gray-400';
                dayElement.textContent = dayNumber;
                calendarGrid.appendChild(dayElement);
            }
            
            // Générer les jours du mois actuel
            for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
                const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
                const dayElement = document.createElement('div');
                
                // Vérifier si ce jour a une note
                const dateStr = dayDate.toISOString().split('T')[0];
                const hasNote = this.hasNote(dateStr);
                
                // Déterminer si ce jour est aujourd'hui
                const isToday = this.isSameDay(dayDate, new Date());
                
                // Déterminer si ce jour est sélectionné
                const isSelected = selectedDate && this.isSameDay(dayDate, selectedDate);
                
                dayElement.className = `text-center py-1 rounded cursor-pointer ${
                    isToday ? 'bg-blue-100 text-blue-800' : ''
                } ${
                    isSelected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'
                } ${
                    hasNote ? 'font-bold' : ''
                }`;
                dayElement.textContent = i;
                
                // Ajouter un indicateur visuel pour les jours avec des notes
                if (hasNote) {
                    dayElement.title = "Ce jour a une note";
                }
                
                // Gestionnaire d'événement pour sélectionner une date
                dayElement.addEventListener('click', () => {
                    selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
                    dateInput.value = formatDate(selectedDate);
                    generateCalendarGrid(); // Rafraîchir pour mettre à jour la sélection
                    datePicker.classList.add('hidden');
                });
                
                calendarGrid.appendChild(dayElement);
            }
            
            // Calculer les jours du mois suivant pour remplir la dernière semaine
            const totalCells = 42; // 6 semaines x 7 jours
            const nextMonthDays = totalCells - prevMonthDays - lastDayOfMonth.getDate();
            
            // Générer les jours du mois suivant
            for (let i = 1; i <= nextMonthDays; i++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'text-center py-1 text-gray-400';
                dayElement.textContent = i;
                calendarGrid.appendChild(dayElement);
            }
        };
        
        // Configurer les événements du date picker
        if (dateInput) {
            dateInput.addEventListener('click', () => {
                datePicker.classList.toggle('hidden');
                updateMonthYearText();
                generateCalendarGrid();
            });
        }
        
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() - 1);
                updateMonthYearText();
                generateCalendarGrid();
            });
        }
        
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => {
                currentDate.setMonth(currentDate.getMonth() + 1);
                updateMonthYearText();
                generateCalendarGrid();
            });
        }
        
        if (monthSelector) {
            monthSelector.addEventListener('click', () => {
                monthDropdown.classList.toggle('hidden');
            });
        }
        
        if (monthSelect && yearSelect) {
            monthSelect.addEventListener('change', () => {
                currentDate.setMonth(parseInt(monthSelect.value));
                updateMonthYearText();
                generateCalendarGrid();
            });
            
            yearSelect.addEventListener('change', () => {
                currentDate.setFullYear(parseInt(yearSelect.value));
                updateMonthYearText();
                generateCalendarGrid();
            });
        }
        
        if (clearDateBtn) {
            clearDateBtn.addEventListener('click', () => {
                selectedDate = null;
                dateInput.value = '';
                datePicker.classList.add('hidden');
            });
        }
        
        if (todayDateBtn) {
            todayDateBtn.addEventListener('click', () => {
                currentDate = new Date();
                selectedDate = new Date();
                dateInput.value = formatDate(selectedDate);
                updateMonthYearText();
                generateCalendarGrid();
                datePicker.classList.add('hidden');
            });
        }
        
        // Initialiser le date picker
        updateMonthYearText();
        generateCalendarGrid();
    }
    
    /**
     * Masquer le modal de sélection de date pour une note
     */
    hideAddNoteDateModal() {
        const modal = document.getElementById('add-note-date-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
            console.log('✅ Modal de sélection de date pour note caché');
        }
    }
    
    /**
     * Confirmer la date sélectionnée pour la note
     */
    confirmNoteDate() {
        const dateInput = document.getElementById('note-date-input');
        
        if (dateInput && dateInput.value) {
            // Convertir la date du format JJ/MM/AAAA en objet Date
            const [day, month, year] = dateInput.value.split('/').map(num => parseInt(num, 10));
            
            // Les mois dans JavaScript sont indexés à partir de 0, donc soustraire 1 du mois
            const date = new Date(year, month - 1, day);
            const dateStr = date.toISOString().split('T')[0];
            
            // Masquer le modal de sélection de date
            this.hideAddNoteDateModal();
            
            // Afficher le modal de note
            this.showNoteModal(dateStr);
        } else {
            // Afficher un message d'erreur si aucune date n'est sélectionnée
            alert('Veuillez sélectionner une date');
        }
    }
    
    /**
     * Sauvegarder la note du modal
     */
    saveNoteFromModal() {
        const noteContent = document.getElementById('note-content');
        if (noteContent && this.activeNoteDate) {
            this.saveNote(this.activeNoteDate, noteContent.value);
            console.log('✅ Note sauvegardée pour la date:', this.activeNoteDate);
            
            // Mettre à jour l'affichage du calendrier pour montrer l'indicateur de note
            this.updateCalendarContent();
            
            // Fermer le modal
            this.hideNoteModal();
        }
    }

    /**
     * Rendu de la vue des vacances scolaires
     */
    renderHolidaysView() {
        const currentYear = new Date().getFullYear();
        const schoolYear = `${currentYear}/${currentYear + 1}`;
        
        return `
            <!-- En-tête avec année scolaire -->
            <div class="mb-6">
                <div class="flex justify-between items-center">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-800">
                            Vacances Scolaires ${schoolYear}
                        </h2>
                        <p class="text-gray-600 mt-2">
                            Calendrier officiel des vacances scolaires au Maroc
                        </p>
                    </div>
                    <!-- Bouton pour ajouter une nouvelle vacance -->
                    <button id="add-holiday-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                        <i class="fas fa-plus-circle mr-2"></i>
                        Ajouter une vacance
                    </button>
                </div>
            </div>

            <!-- Tableau des vacances -->
            <div class="overflow-hidden border border-gray-200 rounded-lg">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr class="bg-blue-50">
                            <th class="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                                Vacances / Fêtes
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                                Dates
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                                Durée
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${this.holidays.map((holiday, index) => `
                            <tr class="${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors" data-holiday-id="${holiday.id}">
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="flex items-center">
                                        ${this.getHolidayIcon(holiday.name)}
                                        <div class="ml-3">
                                            <div class="text-sm font-medium text-gray-900">${this.escapeHtml(holiday.name)}</div>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-sm text-gray-700">${this.escapeHtml(holiday.dates)}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${this.getDurationClass(holiday.duration)}">
                                        ${this.escapeHtml(holiday.duration)}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button class="text-blue-600 hover:text-blue-900 mr-3 edit-holiday-btn" data-holiday-id="${holiday.id}">
                                        <i class="fas fa-edit"></i> Modifier
                                    </button>
                                    <button class="text-red-600 hover:text-red-900 delete-holiday-btn" data-holiday-id="${holiday.id}">
                                        <i class="fas fa-trash"></i> Supprimer
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- Note -->
            <div class="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p class="text-sm text-gray-700">
                    <i class="fas fa-info-circle text-blue-600 mr-2"></i>
                    Ce calendrier est basé sur les dates officielles du Ministère de l'Éducation Nationale du Maroc pour l'année scolaire ${schoolYear}. 
                    Les dates des fêtes religieuses peuvent varier selon l'observation de la lune.
                </p>
            </div>

            <!-- Modal pour ajouter/modifier une vacance -->
            <div id="holiday-modal" class="modal fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4">
                <div class="bg-white rounded-lg max-w-lg w-full max-h-screen overflow-y-auto">
                    <div class="p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-semibold" id="holiday-modal-title">Ajouter une vacance</h3>
                            <button id="close-holiday-modal" class="text-gray-400 hover:text-gray-600">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <form id="holiday-form">
                            <input type="hidden" id="holiday-id">
                            
                            <!-- Nom de la vacance -->
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Nom de la vacance *</label>
                                <input type="text" id="holiday-name" class="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" placeholder="Ex: Vacances d'été" required>
                            </div>
                            
                            <!-- Type de période -->
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Type de période</label>
                                <div class="flex space-x-2">
                                    <label class="flex items-center">
                                        <input type="radio" name="holiday-type" value="single" id="holiday-type-single" class="mr-2" checked>
                                        <span class="text-sm">Jour unique</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="radio" name="holiday-type" value="range" id="holiday-type-range" class="mr-2">
                                        <span class="text-sm">Période (plusieurs jours)</span>
                                    </label>
                                </div>
                            </div>
                            
                            <!-- Date unique -->
                            <div id="single-date-container" class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                                <div class="relative">
                                    <input type="date" id="holiday-single-date" class="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <i class="fas fa-calendar-alt text-gray-400"></i>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Période de dates -->
                            <div id="date-range-container" class="mb-4 hidden">
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Date de début *</label>
                                        <div class="relative">
                                            <input type="date" id="holiday-start-date" class="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <i class="fas fa-calendar-alt text-gray-400"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Date de fin *</label>
                                        <div class="relative">
                                            <input type="date" id="holiday-end-date" class="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <i class="fas fa-calendar-alt text-gray-400"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Aperçu des dates formatées -->
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Aperçu du format</label>
                                <div id="date-preview" class="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                                    Sélectionnez une date pour voir l'aperçu
                                </div>
                            </div>
                            
                            <!-- Durée (calculée automatiquement) -->
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 mb-2">Durée</label>
                                <input type="text" id="holiday-duration" class="w-full p-2 border border-gray-300 rounded-lg bg-gray-50" placeholder="Calculée automatiquement" readonly>
                            </div>
                            
                            <div class="flex justify-end space-x-2">
                                <button type="button" id="cancel-holiday-btn" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
                                    Annuler
                                </button>
                                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    <i class="fas fa-save mr-2"></i>
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Obtenir l'icône appropriée pour un type de vacances
     */
    getHolidayIcon(holidayName) {
        const name = holidayName.toLowerCase();
        
        if (name.includes('aïd') || name.includes('aid') || name.includes('religieuse')) {
            return '<i class="fas fa-moon text-green-600 mr-1"></i>';
        } else if (name.includes('vacance') || name.includes('été')) {
            return '<i class="fas fa-umbrella-beach text-orange-500 mr-1"></i>';
        } else if (name.includes('rentrée') || name.includes('scolaire')) {
            return '<i class="fas fa-school text-blue-600 mr-1"></i>';
        } else if (name.includes('indépendance') || name.includes('trône') || name.includes('marche')) {
            return '<i class="fas fa-flag text-red-600 mr-1"></i>';
        } else if (name.includes('travail')) {
            return '<i class="fas fa-briefcase text-gray-600 mr-1"></i>';
        } else {
            return '<i class="fas fa-calendar-day text-blue-600 mr-1"></i>';
        }
    }

    /**
     * Obtenir la classe CSS pour la durée
     */
    getDurationClass(duration) {
        if (duration.includes('mois')) {
            return 'bg-green-100 text-green-800';
        } else if (parseInt(duration) > 7 || duration.includes('semaine')) {
            return 'bg-blue-100 text-blue-800';
        } else if (parseInt(duration) > 1) {
            return 'bg-yellow-100 text-yellow-800';
        } else {
            return 'bg-gray-100 text-gray-800';
        }
    }

    /**
     * Échapper le HTML pour éviter les injections
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Afficher le modal d'ajout/modification de vacance
     */
    showHolidayModal(holidayId = null) {
        console.log('🏖️ Affichage du modal de vacance:', holidayId ? 'édition' : 'ajout');
        
        const modal = document.getElementById('holiday-modal');
        const modalTitle = document.getElementById('holiday-modal-title');
        const holidayIdField = document.getElementById('holiday-id');
        const holidayNameField = document.getElementById('holiday-name');
        const holidaySingleDate = document.getElementById('holiday-single-date');
        const holidayStartDate = document.getElementById('holiday-start-date');
        const holidayEndDate = document.getElementById('holiday-end-date');
        const holidayDurationField = document.getElementById('holiday-duration');
        const singleDateContainer = document.getElementById('single-date-container');
        const dateRangeContainer = document.getElementById('date-range-container');
        const holidayTypeSingle = document.getElementById('holiday-type-single');
        const holidayTypeRange = document.getElementById('holiday-type-range');
        
        if (modal && modalTitle && holidayIdField && holidayNameField) {
            if (holidayId) {
                // Mode édition
                const holiday = this.holidays.find(h => h.id === holidayId);
                if (holiday) {
                    modalTitle.textContent = 'Modifier une vacance';
                    holidayIdField.value = holiday.id;
                    holidayNameField.value = holiday.name;
                    
                    // Analyser les dates existantes pour déterminer le type
                    const parsedDates = this.parseFrenchDateString(holiday.dates);
                    if (parsedDates) {
                        if (parsedDates.startDate === parsedDates.endDate) {
                            // Jour unique
                            holidayTypeSingle.checked = true;
                            holidayTypeRange.checked = false;
                            holidaySingleDate.value = parsedDates.startDate;
                            singleDateContainer.classList.remove('hidden');
                            dateRangeContainer.classList.add('hidden');
                        } else {
                            // Période
                            holidayTypeSingle.checked = false;
                            holidayTypeRange.checked = true;
                            holidayStartDate.value = parsedDates.startDate;
                            holidayEndDate.value = parsedDates.endDate;
                            singleDateContainer.classList.add('hidden');
                            dateRangeContainer.classList.remove('hidden');
                        }
                        this.updateDatePreview();
                        this.calculateDuration();
                    }
                }
            } else {
                // Mode ajout
                modalTitle.textContent = 'Ajouter une vacance';
                holidayIdField.value = '';
                holidayNameField.value = '';
                holidaySingleDate.value = '';
                holidayStartDate.value = '';
                holidayEndDate.value = '';
                holidayDurationField.value = '';
                holidayTypeSingle.checked = true;
                holidayTypeRange.checked = false;
                singleDateContainer.classList.remove('hidden');
                dateRangeContainer.classList.add('hidden');
                document.getElementById('date-preview').textContent = 'Sélectionnez une date pour voir l\'aperçu';
            }
            
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
            
            // Configurer les événements pour ce modal
            this.setupHolidayModalEvents();
            
            // Focus sur le premier champ
            setTimeout(() => {
                holidayNameField.focus();
            }, 100);
            
            console.log('✅ Modal de vacance affiché');
        }
    }

    /**
     * Configurer les événements pour le modal de vacance
     */
    setupHolidayModalEvents() {
        const holidayTypeSingle = document.getElementById('holiday-type-single');
        const holidayTypeRange = document.getElementById('holiday-type-range');
        const singleDateContainer = document.getElementById('single-date-container');
        const dateRangeContainer = document.getElementById('date-range-container');
        const holidaySingleDate = document.getElementById('holiday-single-date');
        const holidayStartDate = document.getElementById('holiday-start-date');
        const holidayEndDate = document.getElementById('holiday-end-date');
        
        // Enlever les anciens événements pour éviter les duplicatas
        [holidayTypeSingle, holidayTypeRange, holidaySingleDate, holidayStartDate, holidayEndDate].forEach(element => {
            if (element) {
                element.replaceWith(element.cloneNode(true));
            }
        });
        
        // Récupérer les nouveaux éléments
        const newHolidayTypeSingle = document.getElementById('holiday-type-single');
        const newHolidayTypeRange = document.getElementById('holiday-type-range');
        const newHolidaySingleDate = document.getElementById('holiday-single-date');
        const newHolidayStartDate = document.getElementById('holiday-start-date');
        const newHolidayEndDate = document.getElementById('holiday-end-date');
        
        // Événements pour changer le type de période
        if (newHolidayTypeSingle) {
            newHolidayTypeSingle.addEventListener('change', () => {
                if (newHolidayTypeSingle.checked) {
                    singleDateContainer.classList.remove('hidden');
                    dateRangeContainer.classList.add('hidden');
                    this.updateDatePreview();
                    this.calculateDuration();
                }
            });
        }
        
        if (newHolidayTypeRange) {
            newHolidayTypeRange.addEventListener('change', () => {
                if (newHolidayTypeRange.checked) {
                    singleDateContainer.classList.add('hidden');
                    dateRangeContainer.classList.remove('hidden');
                    this.updateDatePreview();
                    this.calculateDuration();
                }
            });
        }
        
        // Événements pour les changements de date
        if (newHolidaySingleDate) {
            newHolidaySingleDate.addEventListener('change', () => {
                this.updateDatePreview();
                this.calculateDuration();
            });
        }
        
        if (newHolidayStartDate) {
            newHolidayStartDate.addEventListener('change', () => {
                // S'assurer que la date de fin n'est pas antérieure à la date de début
                const startDate = newHolidayStartDate.value;
                const endDate = newHolidayEndDate.value;
                
                if (startDate && endDate && startDate > endDate) {
                    newHolidayEndDate.value = startDate;
                }
                
                // Définir la date minimale pour la date de fin
                newHolidayEndDate.min = startDate;
                
                this.updateDatePreview();
                this.calculateDuration();
            });
        }
        
        if (newHolidayEndDate) {
            newHolidayEndDate.addEventListener('change', () => {
                this.updateDatePreview();
                this.calculateDuration();
            });
        }
    }
    
    /**
     * Mettre à jour l'aperçu des dates formatées
     */
    updateDatePreview() {
        const preview = document.getElementById('date-preview');
        const holidayTypeSingle = document.getElementById('holiday-type-single');
        const holidaySingleDate = document.getElementById('holiday-single-date');
        const holidayStartDate = document.getElementById('holiday-start-date');
        const holidayEndDate = document.getElementById('holiday-end-date');
        
        if (!preview) return;
        
        if (holidayTypeSingle && holidayTypeSingle.checked) {
            // Jour unique
            if (holidaySingleDate && holidaySingleDate.value) {
                const formattedDate = this.formatDateToFrench(holidaySingleDate.value);
                preview.innerHTML = `<span class="text-blue-600 font-medium">${formattedDate}</span>`;
            } else {
                preview.textContent = 'Sélectionnez une date pour voir l\'aperçu';
            }
        } else {
            // Période
            if (holidayStartDate && holidayEndDate && holidayStartDate.value && holidayEndDate.value) {
                const formattedStart = this.formatDateToFrench(holidayStartDate.value);
                const formattedEnd = this.formatDateToFrench(holidayEndDate.value);
                preview.innerHTML = `<span class="text-blue-600 font-medium">Du ${formattedStart} au ${formattedEnd}</span>`;
            } else if (holidayStartDate && holidayStartDate.value) {
                const formattedStart = this.formatDateToFrench(holidayStartDate.value);
                preview.innerHTML = `<span class="text-orange-600 font-medium">Du ${formattedStart} au...</span> <span class="text-gray-500">(sélectionnez la date de fin)</span>`;
            } else {
                preview.textContent = 'Sélectionnez les dates de début et de fin';
            }
        }
    }
    
    /**
     * Calculer et afficher la durée automatiquement
     */
    calculateDuration() {
        const durationField = document.getElementById('holiday-duration');
        const holidayTypeSingle = document.getElementById('holiday-type-single');
        const holidaySingleDate = document.getElementById('holiday-single-date');
        const holidayStartDate = document.getElementById('holiday-start-date');
        const holidayEndDate = document.getElementById('holiday-end-date');
        
        if (!durationField) return;
        
        if (holidayTypeSingle && holidayTypeSingle.checked) {
            // Jour unique
            if (holidaySingleDate && holidaySingleDate.value) {
                durationField.value = '1 jour';
            } else {
                durationField.value = '';
            }
        } else {
            // Période
            if (holidayStartDate && holidayEndDate && holidayStartDate.value && holidayEndDate.value) {
                const startDate = new Date(holidayStartDate.value);
                const endDate = new Date(holidayEndDate.value);
                const diffTime = Math.abs(endDate - startDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 pour inclure le dernier jour
                
                if (diffDays === 1) {
                    durationField.value = '1 jour';
                } else if (diffDays < 7) {
                    durationField.value = `${diffDays} jours`;
                } else if (diffDays === 7) {
                    durationField.value = '1 semaine';
                } else if (diffDays < 30) {
                    const weeks = Math.floor(diffDays / 7);
                    const remainingDays = diffDays % 7;
                    if (remainingDays === 0) {
                        durationField.value = `${weeks} semaine${weeks > 1 ? 's' : ''}`;
                    } else {
                        durationField.value = `${diffDays} jours`;
                    }
                } else {
                    durationField.value = `${diffDays} jours`;
                }
            } else {
                durationField.value = '';
            }
        }
    }
    
    /**
     * Formater une date au format français
     */
    formatDateToFrench(dateString) {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = this.monthNames[date.getMonth()].toLowerCase();
        const year = date.getFullYear();
        
        if (day === 1) {
            return `1er ${month} ${year}`;
        } else {
            return `${day} ${month} ${year}`;
        }
    }
    
    /**
     * Analyser une chaîne de date française pour extraire les dates
     */
    parseFrenchDateString(dateStr) {
        try {
            // Patterns pour différents formats
            
            // Du X mois YYYY au Y mois YYYY
            let match = dateStr.match(/Du (\d+)(?:er)? ([a-zéèôû]+) (\d{4}) au (\d+)(?:er)? ([a-zéèôû]+) (\d{4})/i);
            if (match) {
                const startDay = parseInt(match[1]);
                const startMonth = this.getMonthNumber(match[2]);
                const startYear = parseInt(match[3]);
                const endDay = parseInt(match[4]);
                const endMonth = this.getMonthNumber(match[5]);
                const endYear = parseInt(match[6]);
                
                return {
                    startDate: `${startYear}-${String(startMonth + 1).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`,
                    endDate: `${endYear}-${String(endMonth + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`
                };
            }
            
            // X mois YYYY (jour unique)
            match = dateStr.match(/(\d+)(?:er)? ([a-zéèôû]+) (\d{4})/i);
            if (match) {
                const day = parseInt(match[1]);
                const month = this.getMonthNumber(match[2]);
                const year = parseInt(match[3]);
                
                const dateFormatted = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                return {
                    startDate: dateFormatted,
                    endDate: dateFormatted
                };
            }
            
            // X-Y mois YYYY (jours consécutifs)
            match = dateStr.match(/(\d+)-(\d+) ([a-zéèôû]+) (\d{4})/i);
            if (match) {
                const startDay = parseInt(match[1]);
                const endDay = parseInt(match[2]);
                const month = this.getMonthNumber(match[3]);
                const year = parseInt(match[4]);
                
                return {
                    startDate: `${year}-${String(month + 1).padStart(2, '0')}-${String(startDay).padStart(2, '0')}`,
                    endDate: `${year}-${String(month + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`
                };
            }
            
        } catch (error) {
            console.error('Erreur lors de l\'analyse de la date:', error);
        }
        
        return null;
    }

    /**
     * Masquer le modal de vacance
     */
    hideHolidayModal() {
        const modal = document.getElementById('holiday-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
            console.log('✅ Modal de vacance caché');
        }
    }

    /**
     * Modifier une vacance
     */
    editHoliday(holidayId) {
        console.log('✏️ Édition de la vacance:', holidayId);
        this.showHolidayModal(holidayId);
    }

    /**
     * Confirmer la suppression d'une vacance
     */
    deleteHolidayConfirm(holidayId) {
        console.log('🗑️ Confirmation de suppression de la vacance:', holidayId);
        
        const holiday = this.holidays.find(h => h.id === holidayId);
        if (holiday) {
            if (confirm(`Êtes-vous sûr de vouloir supprimer la vacance "${holiday.name}" ?\n\nCette action est irréversible.`)) {
                this.deleteHoliday(holidayId);
                this.render(); // Recharger l'affichage
                console.log('✅ Vacance supprimée avec succès');
            }
        }
    }

    /**
     * Sauvegarder une vacance (ajout ou modification)
     */
    saveHoliday() {
        console.log('💾 Sauvegarde de la vacance');
        
        const holidayIdField = document.getElementById('holiday-id');
        const holidayNameField = document.getElementById('holiday-name');
        const holidayDurationField = document.getElementById('holiday-duration');
        const holidayTypeSingle = document.getElementById('holiday-type-single');
        const holidaySingleDate = document.getElementById('holiday-single-date');
        const holidayStartDate = document.getElementById('holiday-start-date');
        const holidayEndDate = document.getElementById('holiday-end-date');
        
        if (holidayIdField && holidayNameField && holidayDurationField) {
            // Validation des champs
            const name = holidayNameField.value.trim();
            
            if (!name) {
                alert('Veuillez saisir le nom de la vacance.');
                holidayNameField.focus();
                return;
            }
            
            let dates = '';
            let duration = '';
            
            if (holidayTypeSingle && holidayTypeSingle.checked) {
                // Jour unique
                if (!holidaySingleDate || !holidaySingleDate.value) {
                    alert('Veuillez sélectionner une date.');
                    if (holidaySingleDate) holidaySingleDate.focus();
                    return;
                }
                
                dates = this.formatDateToFrench(holidaySingleDate.value);
                duration = '1 jour';
                
            } else {
                // Période
                if (!holidayStartDate || !holidayStartDate.value) {
                    alert('Veuillez sélectionner la date de début.');
                    if (holidayStartDate) holidayStartDate.focus();
                    return;
                }
                
                if (!holidayEndDate || !holidayEndDate.value) {
                    alert('Veuillez sélectionner la date de fin.');
                    if (holidayEndDate) holidayEndDate.focus();
                    return;
                }
                
                const startFormatted = this.formatDateToFrench(holidayStartDate.value);
                const endFormatted = this.formatDateToFrench(holidayEndDate.value);
                dates = `Du ${startFormatted} au ${endFormatted}`;
                duration = holidayDurationField.value || 'Non calculée';
            }
            
            const holidayData = {
                name: name,
                dates: dates,
                duration: duration
            };
            
            const holidayId = holidayIdField.value;
            
            if (holidayId) {
                // Mode édition
                this.updateHoliday(parseInt(holidayId), holidayData);
                console.log('✅ Vacance mise à jour');
            } else {
                // Mode ajout
                this.addHoliday(holidayData);
                console.log('✅ Nouvelle vacance ajoutée');
            }
            
            // Masquer le modal et recharger l'affichage
            this.hideHolidayModal();
            this.render();
        }
    }
}

// Exporter pour utilisation globale
window.CalendrierModule = CalendrierModule;