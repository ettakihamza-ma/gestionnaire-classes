/**
 * Constants - Constantes globales de l'application
 */

// Matières disponibles pour le cahier journal
const MATIERES = [
    'Français',
    'Mathématiques',
    'Sciences',
    'Histoire-Géographie',
    'Arts plastiques',
    'EPS',
    'Anglais',
    'Arabe',
    'Informatique/Robotique',
    'Éducation islamique',
    'Enseignement moral et civique'
];

// Niveaux de compétences
const COMPETENCES_NIVEAUX = {
    'non_acquis': { label: 'Non acquis', color: 'text-red-600', bg: 'bg-red-100' },
    'en_cours': { label: 'En cours', color: 'text-orange-600', bg: 'bg-orange-100' },
    'acquis': { label: 'Acquis', color: 'text-green-600', bg: 'bg-green-100' }
};

// Structure hiérarchique des compétences pour une approche pédagogique intuitive
// Format: Matière -> Domaine/Thème -> Sous-compétences
const COMPETENCES_STRUCTURE = {
    'Français': {
        'Lecture et compréhension': [
            'Reconnaissance des lettres majuscules',
            'Reconnaissance des lettres minuscules',
            'Décodage syllabique simple',
            'Lecture de mots simples',
            'Lecture fluide de phrases courtes',
            'Compréhension de texte court',
            'Compréhension de consignes écrites'
        ],
        'Écriture et graphisme': [
            'Tenue correcte du crayon',
            'Traçage des lettres majuscules',
            'Traçage des lettres minuscules',
            'Copie de mots simples',
            'Copie de phrases',
            'Écriture sous dictée',
            'Production d\'écrit libre'
        ],
        'Orthographe et grammaire': [
            'Correspondance son-lettre',
            'Règles d\'accord dans le groupe nominal',
            'Accord sujet-verbe simple',
            'Homophones courants (a/à, et/est)',
            'Mots invariables fréquents',
            'Ponctuation de base'
        ],
        'Vocabulaire et expression': [
            'Enrichissement lexical',
            'Utilisation du dictionnaire',
            'Familles de mots',
            'Synonymes et contraires',
            'Expression orale structurée'
        ]
    },
    'Mathématiques': {
        'Nombres et numération': [
            'Connaître les nombres jusqu\'à 10',
            'Connaître les nombres jusqu\'à 20',
            'Connaître les nombres jusqu\'à 100',
            'Comparer et ranger les nombres',
            'Décomposition des nombres',
            'Nombres pairs et impairs'
        ],
        'Calcul et opérations': [
            'Addition simple (sans retenue)',
            'Addition avec retenue',
            'Soustraction simple (sans retenue)',
            'Soustraction avec retenue',
            'Tables de multiplication (2, 5, 10)',
            'Calcul mental rapide',
            'Résolution d\'opérations à trous'
        ],
        'Géométrie et espace': [
            'Reconnaissance des formes géométriques',
            'Traçage à la règle',
            'Utilisation de l\'équerre',
            'Propriétés du carré et du rectangle',
            'Symétrie axiale',
            'Repérage sur quadrillage'
        ],
        'Mesures et grandeurs': [
            'Mesurer des longueurs (cm, m)',
            'Lire l\'heure (heures entières)',
            'Lire l\'heure (demi-heures)',
            'Connaître les pièces de monnaie',
            'Comparer des masses',
            'Durées simples'
        ],
        'Résolution de problèmes': [
            'Comprendre un énoncé simple',
            'Identifier les données utiles',
            'Choisir la bonne opération',
            'Vérifier la cohérence du résultat',
            'Expliquer sa démarche'
        ]
    },
    'Informatique/Robotique': {
        'Présentation numérique (PowerPoint)': [
            'Créer une nouvelle présentation',
            'Insertion de texte',
            'Insertion d\'images',
            'Mise en forme du texte (gras, italique)',
            'Choix des couleurs',
            'Ajout d\'animations simples',
            'Transition entre diapositives',
            'Présenter devant un public'
        ],
        'Maîtrise des outils': [
            'Utilisation du clavier (lettres)',
            'Utilisation du clavier (chiffres)',
            'Utilisation de la souris/curseur',
            'Ouverture/fermeture d\'applications',
            'Gestion des fenêtres',
            'Sauvegarde de fichiers',
            'Navigation dans les dossiers'
        ],
        'Robotique éducative': [
            'Comprendre le fonctionnement des capteurs',
            'Programmer un déplacement simple',
            'Créer une séquence d\'actions',
            'Utiliser les boucles simples',
            'Déboguer un programme',
            'Tester et améliorer'
        ]
    },
    'Sciences': {
        'Démarche scientifique': [
            'Formuler une question/hypothèse',
            'Observer méthodiquement',
            'Expérimenter en sécurité',
            'Noter les observations',
            'Analyser les résultats',
            'Tirer des conclusions',
            'Communiquer ses découvertes'
        ],
        'Le monde du vivant': [
            'Identifier les besoins des êtres vivants',
            'Classer les êtres vivants',
            'Comprendre la notion de croissance',
            'Connaître les cycles de vie simples',
            'Distinguer vivant/non-vivant',
            'Respecter le vivant'
        ],
        'La matière et les objets': [
            'Distinguer les états de la matière',
            'Observer les changements d\'état',
            'Classer les matériaux',
            'Propriétés des matériaux',
            'Recyclage et écologie'
        ]
    },
    'Arts plastiques': {
        'Techniques et outils': [
            'Utilisation du pinceau',
            'Mélange des couleurs primaires',
            'Techniques de coloriage',
            'Découpage précis',
            'Collage et assemblage',
            'Modelage pâte à modeler'
        ],
        'Création et expression': [
            'Représentation de la figure humaine',
            'Paysages simples',
            'Création libre',
            'Respect des consignes créatives',
            'Soin et finition'
        ]
    },
    'Éducation musicale': {
        'Chant et rythme': [
            'Chanter juste une mélodie simple',
            'Respecter le rythme',
            'Mémoriser un chant',
            'Chanter en groupe',
            'Reproduire un rythme frappé'
        ],
        'Écoute musicale': [
            'Reconnaître les instruments',
            'Distinguer grave/aigu',
            'Distinguer fort/faible',
            'Identifier différents styles musicaux'
        ]
    },
    'EPS': {
        'Motricité et déplacements': [
            'Courir en ligne droite',
            'Sauter à pieds joints',
            'Lancer précis',
            'Équilibre statique',
            'Équilibre dynamique',
            'Coordination des mouvements'
        ],
        'Jeux collectifs et règles': [
            'Respecter les règles du jeu',
            'Coopérer en équipe',
            'Fair-play et respect',
            'Stratégies simples'
        ]
    },
    'Histoire-Géographie': {
        'Repérage temporel': [
            'Se situer dans le temps (hier/aujourd\'hui/demain)',
            'Connaître les jours de la semaine',
            'Connaître les mois de l\'année',
            'Comprendre la notion de passé/présent',
            'Frise chronologique simple'
        ],
        'Repérage spatial': [
            'Se repérer dans l\'école',
            'Se repérer dans le quartier',
            'Connaître son adresse',
            'Utiliser un plan simple',
            'Points cardinaux de base'
        ]
    },
    'Enseignement moral et civique': {
        'Respect et tolérance': [
            'Respecter les autres',
            'Accepter les différences',
            'Politesse et savoir-vivre',
            'Empathie et entraide'
        ],
        'Règles de vie collective': [
            'Respecter les règles de classe',
            'Participer aux décisions collectives',
            'Responsabilités individuelles',
            'Vie démocratique simple'
        ]
    }
};

// Exemples de domaines pour faciliter la création
const DOMAINES_EXEMPLES = {
    'Français': ['Lecture et compréhension', 'Écriture et production', 'Orthographe et grammaire', 'Vocabulaire et langage oral'],
    'Mathématiques': ['Nombres et calculs', 'Géométrie', 'Grandeurs et mesures', 'Résolution de problèmes'],
    'Sciences': ['Démarche scientifique', 'Le vivant', 'La matière', 'L\'environnement'],
    'Informatique/Robotique': ['Présentation numérique', 'Maîtrise des outils', 'Programmation', 'Robotique'],
    'Arts plastiques': ['Techniques artistiques', 'Création et expression', 'Histoire des arts'],
    'Éducation musicale': ['Chant et interprétation', 'Écoute musicale', 'Création sonore'],
    'EPS': ['Motricité et déplacements', 'Jeux collectifs', 'Expression corporelle'],
    'Histoire-Géographie': ['Repérage temporel', 'Repérage spatial', 'Patrimoine', 'Citoyenneté'],
    'Enseignement moral et civique': ['Respect et tolérance', 'Règles de vie', 'Citoyenneté', 'Environnement']
};

// Compétences simplifiées (pour compatibilité avec l'ancien système)
const COMPETENCES_EXEMPLES = {
    'Français': [
        'Lecture fluide',
        'Compréhension de texte',
        'Expression écrite',
        'Orthographe',
        'Grammaire',
        'Vocabulaire'
    ],
    'Mathématiques': [
        'Numération',
        'Calcul mental',
        'Résolution de problèmes',
        'Géométrie',
        'Mesures'
    ],
    'Sciences': [
        'Démarche scientifique',
        'Observation',
        'Expérimentation',
        'Analyse de résultats',
        'Raisonnement logique'
    ],
    'Informatique/Robotique': [
        'Navigation interface',
        'Présentation numérique',
        'Programmation simple',
        'Utilisation périphériques'
    ]
};

// Labels des compétences
const COMPETENCES_LABELS = {
    'lecture': 'Lecture',
    'ecriture': 'Écriture',
    'maths': 'Mathématiques',
    'oral': 'Expression orale',
    'sciences': 'Sciences'
};

// Compétences par défaut pour évaluation rapide
const COMPETENCES_DEFAUT = ['lecture', 'ecriture', 'maths', 'oral'];

// Vues disponibles pour chaque module
const VIEWS = {
    ELEVES: {
        ALL: 'all',
        GROUPE1: 'groupe1',
        GROUPE2: 'groupe2'
    },
    CAHIER: {
        LISTE: 'liste'
    },
    PROGRESSION: {
        COMPETENCES: 'competences',
        PRESENCE: 'presence',
        GRAPHIQUES: 'graphiques'
    }
};

// Messages d'erreur
const ERROR_MESSAGES = {
    SAVE_FAILED: 'Erreur lors de la sauvegarde',
    LOAD_FAILED: 'Erreur lors du chargement',
    INVALID_DATA: 'Données invalides',
    EXPORT_FAILED: 'Erreur lors de l\'export',
    IMPORT_FAILED: 'Erreur lors de l\'import',
    NO_DATA: 'Aucune donnée disponible'
};

// Messages de succès
const SUCCESS_MESSAGES = {
    SAVED: 'Données sauvegardées',
    EXPORTED: 'Export réussi',
    IMPORTED: 'Import réussi',
    DELETED: 'Élément supprimé',
    CREATED: 'Élément créé'
};

// Configuration des graphiques
const CHART_CONFIG = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom'
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            max: 100
        }
    }
};

// Formats de date
const DATE_FORMATS = {
    INPUT: 'YYYY-MM-DD',
    DISPLAY: 'DD/MM/YYYY',
    FULL: 'DD/MM/YYYY HH:mm'
};

// Tailles max pour les champs texte
const MAX_LENGTHS = {
    NIVEAU_NOM: 50,
    CLASSE_NOM: 50,
    ELEVE_PRENOM: 30,
    ELEVE_NOM: 30,
    COMMENTAIRE: 500,
    OBJECTIFS: 1000,
    ACTIVITES: 2000,
    OBSERVATIONS: 1000
};
