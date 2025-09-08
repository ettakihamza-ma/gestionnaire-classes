# Gestionnaire de Classes pour Enseignants

## Introduction

Cette application web moderne et locale est spécialement conçue pour les enseignants du primaire. Elle permet une gestion complète et intuitive des niveaux scolaires, classes, élèves avec système de groupes flexibles, cahier journal électronique, suivi de progression (compétences et présences), et gestion des tâches. Toutes les données sont stockées localement via `localStorage` pour une utilisation hors ligne complète.

### ✨ Fonctionnalités Clés Récentes
- **🎯 Gestion des Groupes/Demi-Classes** : Configuration flexible pour enseignants travaillant avec la classe complète ou des groupes spécifiques
- **📊 Présence Rapide Intelligente** : Interface optimisée avec filtrage par groupe et feedback visuel immédiat
- **🧠 Prise de Présence Adaptative** : Choix par défaut basé sur la configuration onboarding (classe complète vs groupes)
- **⚡ Interface Utilisateur Moderne** : Design responsive avec animations fluides et navigation sécurisée
- **🌙 Mode Sombre Complet** : Thème sombre avec corrections systématiques pour tous les éléments de l'interface
- **🔄 Système d'Onboarding Robuste** : Configuration guidée avec fermeture sécurisée et affichage correct du dashboard
- **🔧 Navigation Améliorée** : Système de fallback et retry automatique pour une navigation sans erreur
- **💾 Export/Import Excel** : Sauvegarde et import de données complètes
- **🛠️ Outils de Debug** : Page de test intégrée et fonction de diagnostic pour support technique

### Technologies Utilisées
- **Frontend** : HTML5, CSS3 (Tailwind CSS), JavaScript Vanilla
- **Desktop** : Electron.js pour applications natives cross-platform
- **Bibliothèques** :
  - **SheetJS (xlsx)** : Export/Import Excel côté client
  - **Chart.js** : Visualisations et graphiques de progression
  - **FontAwesome** : Icônes modernes
- **Architecture** : Single-Page Application (SPA) modulaire
- **Stockage** : localStorage (aucun serveur requis)

### 🚀 Démarrage Rapide

#### 💻 Version Web (Navigateur)
1. **Installation** : Aucune installation requise - ouvrez `index.html` dans votre navigateur
2. **Développement** : Utilisez un serveur local pour les tests :
   ```bash
   python -m http.server 8000
   # Puis naviguez vers http://localhost:8000
   ```

#### 🖥️ Version Desktop (Application Electron) ⭐ **NOUVEAU**
1. **Prérequis** : Node.js installé sur votre système
2. **Installation des dépendances** :
   ```bash
   npm install
   ```
3. **Lancement en développement** :
   ```bash
   npm run electron-dev
   ```
4. **Création d'un exécutable Windows** :
   ```bash
   npm run build-win
   ```

#### ⚙️ Configuration et Tests
3. **Configuration** : Suivez l'onboarding intégré lors du premier lancement
4. **Tests et Diagnostic** : Accédez à `test-fixes.html` pour les outils de debug et validation
5. **Support** : Utilisez `debugAppState()` dans la console pour diagnostiquer les problèmes

### 🎯 Formats d'Application
- **Web** : Fonctionne dans tout navigateur moderne (Chrome, Firefox, Safari)
- **Desktop** : Application native Windows/Mac/Linux avec Electron
- **Responsive** : Design mobile-first optimisé pour tablettes et ordinateurs

---

## Exigences Fonctionnelles Détaillées

### 1. Gestion des Niveaux et Classes
- Niveaux : Primaire (ex. : CP, CE1, CE2, CM1, CM2). Ajouter/supprimer/éditer dynamiquement.
- Classes par niveau : Plusieurs classes par niveau (ex. : CP A, CP B). Ajouter/supprimer/éditer.
- UI : Liste hiérarchique (niveaux > classes) avec boutons pour CRUD (Create, Read, Update, Delete).

### 2. Gestion des Élèves et Système de Groupes

#### 👥 Gestion des Élèves
- **Liste complète par classe** : Moyenne 25 élèves avec informations détaillées
- **Profil élève** : Nom, Prénom, Notes par compétence, Commentaires, Historique de présence
- **Import/Export** : Possibilité d'importer/exporter les listes d'élèves via Excel

#### 🎯 Configuration des Groupes (Nouveauté)
- **Mode Classe Complète** : Gestion de tous les élèves simultanément
- **Mode Groupes/Demi-Classes** : Configuration pour enseignants travaillant avec des groupes spécifiques
- **Groupes par défaut** : "Groupe 1" et "Groupe 2" avec assignation flexible
- **Configuration durant l'onboarding** : Choix du mode de travail dès l'installation
- **Modification en cours d'utilisation** : Possibilité de changer la configuration dans les paramètres

#### ⚡ Fonctionnalités Avancées
- **Assignation manuelle** : Glisser-déposer pour réorganiser les groupes
- **Génération aléatoire** : Création automatique de groupes équilibrés
- **Vue adaptative** : Basculer entre vue classe entière et vues groupes selon la configuration
- **Filtrage intelligent** : Affichage automatique des élèves selon le rôle de l'enseignant

#### 🖥️ Interface Utilisateur
- **Tableau éditable responsive** : Optimisé pour tablettes et ordinateurs
- **Drag-and-drop** : Réorganisation visuelle des groupes
- **Boutons d'action rapide** : Génération aléatoire, reset des groupes
- **Indicateurs visuels** : Badges de groupe, compteurs d'élèves

### 3. Cahier Journal Électronique
- Entrées quotidiennes : Date (calendrier intégré via JS DatePicker), Objectifs de leçon, Activités réalisées, Observations sur élèves/groupes, Liens vers ressources.
- UI : Vue calendrier (jour/semaine/mois) avec formulaire pour ajouter/éditer entrées. Recherche par date ou mot-clé.

### 4. Suivi de Progression et Présences Avancé

#### 📊 Compétences
- **Grille d'évaluation** : Par élève/classe avec niveaux configurable (Acquis/En cours/Non acquis)
- **Organisation hiérarchique** : Matière → Domaine/Thème → Sous-compétences
- **Import de modèles** : Compétences prédéfinies par domaine en un clic
- **Visualisations** : Graphiques et tableaux (Chart.js) pour suivi de progression

#### ✅ Gestion des Présences (Fonctionnalité Améliorée)
- **Prise de présence rapide** : Interface grille horizontale optimisée
- **Prise de présence adaptative** : Défaut automatique selon configuration onboarding
  - Mode "Classe complète" → Défaut "Toute la classe"
  - Mode "Demi-classe/Groupes" → Défaut "Groupe 1"
- **Filtrage par groupe** : Sélecteur unique avec compteur d'élèves
- **Actions groupes** :
  - "Tous présents (filtrés)" : Marquer tous les élèves du groupe sélectionné
  - "Tous présents" : Marquer toute la classe
- **Feedback visuel immédiat** : Changements de couleur instantanés sans rafraîchissement
- **Persistance du filtrage** : Maintien du groupe sélectionné lors des interactions individuelles
- **Historique intelligent** : Affichage des données selon la configuration de l'enseignant
- **Statistiques temps réel** : Compteurs présents/absents/total avec mise à jour automatique

#### 🔄 Vues et Navigation
- **Basculement rapide** : Entre tableau, graphiques, et listes
- **Sélecteur de classe visible** : Navigation rapide avec bouton "Changer de classe"
- **Responsive design** : Interface adaptée à tous les écrans

#### 📅 Tâches et Activités
- **Assignation flexible** : Classes/groupes/élèves individuels
- **Statuts** : En cours/Terminé avec deadlines
- **Rappels** : Alertes JavaScript intégrées

### 5. Export/Import
- Exporter toutes données (classes, élèves, cahier, progression) en fichier Excel (XLSX).
- Importer depuis Excel pour initialiser ou updater.
- Utiliser lib : `xlsx` (SheetJS) – Inclure via CDN.

### Autres
- Stockage : Tout en `localStorage` (JSON sérialisé). Clé principale : `schoolData`.
- Si hébergée sur serveur plus tard : Remplacer localStorage par API calls (ex. : Node.js backend avec MongoDB).
- Compatibilité : Chrome/Firefox/Safari. Accessibilité : ARIA labels pour boutons/tableaux.

## 🆕 Modèle de Données Avancé (Version Actuelle)

La structure a évolué pour inclure la configuration des groupes et les fonctionnalités avancées :

### 🔑 Configuration Globale
```json
{
  "config": {
    "firstLaunch": false,
    "setupCompleted": true,
    "user": {
      "prenom": "Hamza",
      "nom": "Ettaki",
      "ecole": "École primaire"
    },
    "classConfig": {
      "mode": "groups",  // "complete" ou "groups"
      "teacherGroup": "Groupe1",
      "description": "Je gère les groupes/demi-classes"
    },
    "version": "1.0.0"
  }
}
```

### 🎯 Compétences Hiérarchiques
```json
{
  "competencesPersonnalisees": {
    "Français": {
      "Lecture et compréhension": [
        {
          "id": "comp_001",
          "nom": "Lecture fluide",
          "description": "Lire un texte de manière fluide",
          "matiere": "Français",
          "domaine": "Lecture et compréhension"
        }
      ]
    }
  }
}
```

### 👥 Élèves avec Groupes
```json
{
  "eleves": [
    {
      "id": "eleve1",
      "nom": "Doe",
      "prenom": "John",
      "groupe": "Groupe1",  // "Groupe1", "Groupe2" ou null
      "competences": { 
        "comp_001": "acquis" 
      },
      "presence": { 
        "2025-09-01": true 
      }
    }
  ]
}
```

### 🔑 Points Clés de la Structure

- **`config.classConfig.mode`** : Détermine le mode de gestion (classe complète ou groupes)
- **`config.classConfig.teacherGroup`** : Groupe principal de l'enseignant
- **`eleves[].groupe`** : Assignation à "Groupe1", "Groupe2" ou null
- **`competencesPersonnalisees`** : Hiérarchie Matière → Domaine → Compétences
- **Clé localStorage** : `schoolData` pour toutes les données

---

## 🚀 Fonctionnalités Récentes et Améliorations

### ✨ Nouvelles Fonctionnalités (Septembre 2025)

1. **🎯 Gestion des Groupes/Demi-Classes**
   - Configuration flexible durant l'onboarding
   - Mode "Classe complète" ou "Groupes/Demi-classes"
   - Assignation automatique et manuelle des élèves

2. **📊 Présence Rapide Améliorée**
   - Interface grille horizontale responsive
   - Filtrage par groupe avec sélecteur unique
   - Feedback visuel immédiat (sans rafraîchissement)
   - Persistance du filtrage lors des interactions

3. **🧠 Prise de Présence Intelligente** ⭐ **NOUVEAU**
   - Choix automatique du groupe par défaut selon configuration onboarding
   - Mode "Classe complète" → défaut "Toute la classe"
   - Mode "Demi-classe" → défaut "Groupe 1"
   - Configuration modifiable dans les paramètres

4. **🌙 Mode Sombre Complet** ⭐ **NOUVEAU**
   - Thème sombre avec système de basculement instantané
   - Corrections systématiques pour tous les arrière-plans clairs
   - Optimisation spécifique pour formulaires, modals et date pickers
   - Corrections pour éléments colorés (badges, alertes, zones d'information)
   - Amélioration de la lisibilité des textes et contrastes
   - Corrections pour calendrier, vacances et éléments orange
   - Prise en charge des inputs natifs HTML et date pickers personnalisés

5. **🔧 Navigation et Stabilité Renforcées** ⭐ **NOUVEAU**
   - Système de navigation avec fallback automatique (`safeShowSection`)
   - Résolution des problèmes de boutons non fonctionnels
   - Onboarding avec fermeture sécurisée et affichage correct du dashboard
   - Ordre de chargement des scripts optimisé

6. **🛠️ Outils de Debug et Support** ⭐ **NOUVEAU**
   - Page de test intégrée (`test-fixes.html`) pour validation et diagnostic
   - Fonction `debugAppState()` pour diagnostic rapide des problèmes
   - Tests de navigation, onboarding, et fonctions globales
   - Configuration facile des modes classe/groupes pour tests

7. **💾 Export/Import Excel Étendu**
   - Export/import des données de vacances scolaires
   - Export/import des notes d'agenda
   - Templates Excel pour tous les types de données
   - Support des types d'import spécifiques (vacances-only, notes-only)

8. **⚡ Corrections de Bugs Majeures** ⭐ **NOUVEAU**
   - Résolution du problème de navigation (boutons non fonctionnels)
   - Correction de l'onboarding qui ne se fermait pas correctement
   - Amélioration de la gestion des formulaires de compétences
   - Optimisation des transitions entre vues
   - Correction des erreurs d'import/export pour les nouvelles fonctionnalités

### 🛠️ Architecture Technique

- **Modulaire** : Code organisé en 9 modules spécialisés
- **Responsive** : Design mobile-first avec Tailwind CSS
- **Performance** : Optimisations pour classes de 40+ élèves
- **UX/UI** : Animations fluides et feedback visuel

### 💯 Compatibilité et Support

- **Navigateurs** : Chrome, Firefox, Safari (dernières versions)
- **Appareils** : Tablettes, ordinateurs portables, ordinateurs de bureau
- **Hors ligne** : Fonctionnement 100% local sans internet
- **Sauvegarde** : Export Excel intégré pour backup

---

## 🔮 Évolutions Techniques Prévues

### 🚀 Option 4 : Architecture Lazy-Loading (Planifié)

**Objectif** : Améliorer les performances et la scalabilité en implémentant un système de chargement modulaire à la demande.

#### 🎯 Avantages de l'Architecture Lazy-Loading

- **Performance optimisée** : Chargement initial plus rapide (réduction de 60-80% du temps de chargement)
- **Gestion mémoire efficace** : Seuls les modules utilisés sont chargés en mémoire
- **Scalabilité améliorée** : Facilite l'ajout de nouvelles fonctionnalités sans impact sur les performances
- **Expérience utilisateur maintenue** : Navigation SPA fluide conservée
- **Maintenance simplifiée** : Modules complètement indépendants

#### 🏗️ Structure Technique Prévue

```
js/
├── core/
│   ├── Router.js              # Gestionnaire de routing et lazy loading
│   ├── ModuleLoader.js        # Chargement dynamique des modules
│   └── DataManager.js         # Existant
├── modules/
│   ├── dashboard/
│   │   ├── dashboard.js       # Logique du module
│   │   └── dashboard.html     # Template HTML
│   ├── niveaux/
│   │   ├── niveaux.js
│   │   └── niveaux.html
│   ├── eleves/
│   │   ├── eleves.js
│   │   └── eleves.html
│   └── ...
├── services/                  # Implémenté
└── components/                # Implémenté
```

#### ⚡ Implémentation Technique

**Router avec Lazy Loading**
```javascript
class LazyRouter {
    async loadModule(moduleName) {
        if (!this.loadedModules[moduleName]) {
            const [moduleJs, moduleHtml] = await Promise.all([
                import(`./modules/${moduleName}/${moduleName}.js`),
                fetch(`./modules/${moduleName}/${moduleName}.html`)
                    .then(r => r.text())
            ]);
            
            this.loadedModules[moduleName] = {
                js: moduleJs.default,
                html: moduleHtml,
                loadedAt: Date.now()
            };
        }
        
        return this.loadedModules[moduleName];
    }
    
    async navigateToModule(moduleName) {
        const loadingId = uiService.showLoading(
            `Chargement de ${moduleName}...`
        );
        
        try {
            const module = await this.loadModule(moduleName);
            await this.renderModule(module);
            this.updateURL(moduleName);
        } finally {
            uiService.hideLoading(loadingId);
        }
    }
}
```

**Module Auto-contenu**
```javascript
// modules/niveaux/niveaux.js
export default class NiveauxModule {
    constructor(container, dataManager, services) {
        this.container = container;
        this.dataManager = dataManager;
        this.services = services;
    }
    
    async render() {
        // Charger le template HTML
        const template = await this.getTemplate();
        this.container.innerHTML = template;
        this.setupEventListeners();
    }
    
    async getTemplate() {
        // Template HTML intégré ou chargé dynamiquement
        return this.templateHTML || await this.loadTemplate();
    }
    
    destroy() {
        // Nettoyage des event listeners et données
        this.cleanup();
    }
}
```

#### 📊 Bénéfices Attendus

| Métrique | Actuel | Avec Lazy-Loading | Amélioration |
|----------|--------|------------------|-------------|
| **Temps de chargement initial** | ~2-3s | ~0.8-1s | 60-70% |
| **Taille du bundle initial** | ~450KB | ~120KB | 75% |
| **Utilisation mémoire** | Tous modules | Module actuel seulement | 60-80% |
| **Temps de navigation** | Instantané | ~200-300ms | Acceptable |
| **Facilité d'ajout de modules** | Modification globale | Module isolé | 90% |

#### 🔧 Plan d'Implémentation

**Phase 1** : Infrastructure de base
- [ ] Créer le système de routing avec lazy loading
- [ ] Implémenter ModuleLoader avec cache intelligent
- [ ] Adapter l'architecture actuelle

**Phase 2** : Migration des modules
- [ ] Migrer le module dashboard (pilote)
- [ ] Migrer niveaux et élèves
- [ ] Migrer cahier et progression
- [ ] Migrer import-export et paramètres

**Phase 3** : Optimisations avancées
- [ ] Pré-chargement intelligent des modules fréquents
- [ ] Cache persistant avec versioning
- [ ] Système de mise à jour modulaire
- [ ] Monitoring des performances

#### 🎯 Critères de Migration

**Conditions pour démarrer l'implémentation :**
- ✅ Architecture actuelle (Option 3) stable et fonctionnelle
- ✅ Tests utilisateur satisfaisants
- ✅ Fonctionnalités core complètes
- ❌ Base utilisateur étendue nécessitant optimisation
- ❌ Besoin de modules additionnels importants

#### 🚧 Considérations Techniques

**Avantages**
- Performance significativement améliorée
- Facilité de maintenance et d'évolution
- Possibilité de mise à jour modulaire
- Meilleure séparation des responsabilités

**Défis**
- Complexité accrue du système de routing
- Gestion des dépendances entre modules
- Tests plus complexes
- Léger délai lors du premier accès à un module

**Décision recommandée** : Implémenter quand l'application aura atteint sa maturité fonctionnelle et que les performances deviendront un enjeu critique.

---

## 📋 Liste des Tâches Réalisées et À Faire

### ✅ Tâches Réalisées

1. **🔧 Corrections Critiques (Septembre 2025)**
   - ✅ Résolution du problème de navigation (boutons menu non fonctionnels)
   - ✅ Correction de l'onboarding qui ne se fermait pas correctement
   - ✅ Implémentation de la prise de présence intelligente selon onboarding
   - ✅ Création d'outils de debug et page de test (`test-fixes.html`)
   - ✅ Optimisation de l'ordre de chargement des scripts
   - ✅ Amélioration de la stabilité générale de l'application

2. **🌙 Implémentation du Mode Sombre Complet (Septembre 2025)**
   - ✅ Système de basculement de thème avec stockage des préférences
   - ✅ Corrections systématiques des arrière-plans clairs (bg-white, bg-gray-*)
   - ✅ Optimisation des formulaires et modals pour le mode sombre
   - ✅ Corrections spécifiques pour les éléments d'entrée (entree-form, attendance-grid)
   - ✅ Amélioration des contrastes et lisibilité des textes
   - ✅ Corrections pour les zones colorées (alertes jaunes, zones bleues, sections vertes)
   - ✅ Optimisation des détails de modals et cercles colorés (bg-green-200, bg-red-200, etc.)
   - ✅ Corrections pour les éléments orange du calendrier et date pickers
   - ✅ Amélioration des inputs de date natifs HTML et personnalisés
   - ✅ Création de fichiers de test spécifiques pour validation des corrections
   - ✅ Documentation complète des corrections CSS appliquées

3. **🔧 Fichiers de Test et Validation Créés**
   - ✅ `test-correction-complete.html` - Validation des corrections systématiques
   - ✅ `test-screenshots-fix.html` - Tests des éléments identifiés par captures d'écran
   - ✅ `test-modal-cercles.html` - Validation des modals et cercles colorés
   - ✅ `test-calendar-orange.html` - Tests des éléments orange du calendrier
   - ✅ `test-modal-vacances.html` - Validation du modal d'ajout de vacances
   - ✅ `test-modal-force.html` - Tests avec CSS forcé pour debugging

4. **amélioration de l'Import/Export Excel**
   - ✅ Ajout de l'export des vacances scolaires
   - ✅ Ajout de l'export des notes d'agenda
   - ✅ Ajout de templates Excel pour vacances et présences
   - ✅ Ajout des options d'import spécifiques (vacances-only, notes-only)
   - ✅ Implémentation de l'import des vacances
   - ✅ Implémentation de l'import des notes
   - ✅ Correction des erreurs d'import/export identifiées lors des tests
   - ✅ Mise à jour de l'interface utilisateur pour refléter les nouvelles fonctionnalités

5. **Améliorations de l'Interface Utilisateur**
   - ✅ Ajout d'un bouton "Ajouter niveau ou classe" dans les actions rapides du dashboard
   - ✅ Ajout d'une barre de recherche dans la section Gestion des Élèves
   - ✅ Amélioration de la navigation et de l'expérience utilisateur

### 🔧 Fichiers de Support et Debug

1. **`test-fixes.html`** - Page de test et diagnostic complète
   - Tests de navigation (dashboard, niveaux, élèves)
   - Vérification des fonctions globales (showToast, DataManager)
   - Tests d'onboarding (réinitialisation, configuration)
   - Gestion du localStorage (export, nettoyage)
   - Configuration rapide des modes classe/groupes

2. **🌙 Fichiers de Test Mode Sombre**
   - **`test-correction-complete.html`** - Tests des corrections systématiques
   - **`test-screenshots-fix.html`** - Validation des éléments identifiés par captures
   - **`test-modal-cercles.html`** - Tests des modals et cercles colorés
   - **`test-calendar-orange.html`** - Validation des éléments orange du calendrier
   - **`test-modal-vacances.html`** - Tests du modal d'ajout de vacances et date pickers
   - **`test-modal-force.html`** - Tests avec CSS forcé pour debugging

3. **`debugAppState()`** - Fonction de diagnostic dans `helpers.js`
   - Vérification de l'état de `window.app`
   - Status des modules et scripts chargés
   - État des sections DOM (visibles/cachées)
   - Validation des données localStorage
   - Configuration onboarding

4. **`CORRECTIONS-SEPTEMBRE-2025.md`** - Documentation des corrections
   - Détail des problèmes identifiés et solutions
   - Guide de test des nouvelles fonctionnalités
   - Instructions de dépannage et recommandations futures

### 🚧 Tâches En Cours

1. **🌙 Finalisation du Mode Sombre**
   - 🔄 Résolution des problèmes de spécificité CSS pour les date pickers du modal vacances
   - 🔄 Optimisation de la compatibilité avec les classes Tailwind CSS
   - 🔄 Tests sur différents navigateurs pour validation complète

2. **Gestion des Vacances**
   - 🔄 Correction des erreurs identifiées lors des tests d'import/export
   - 🔄 Amélioration de l'interface de gestion des vacances
   - 🔄 Ajout de fonctionnalités d'édition des vacances

### 🔜 Tâches À Faire

1. **🌙 Amélioration Continue du Mode Sombre**
   - [ ] Résolution complète des problèmes de spécificité CSS avec Tailwind
   - [ ] Optimisation des performances du basculement de thème
   - [ ] Ajout de transitions fluides lors du changement de thème
   - [ ] Tests de compatibilité sur tous les navigateurs supportés

2. **Fonctionnalités du Calendrier & Vacances**
   - [ ] Amélioration de l'interface de gestion des vacances avec édition directe
   - [ ] Ajout de la possibilité de créer/supprimer des vacances personnalisées
   - [ ] Amélioration de l'affichage des vacances dans le calendrier
   - [ ] Ajout de notifications pour les vacances à venir

3. **Améliorations de l'Import/Export**
   - [ ] Ajout de validation plus stricte lors de l'import des données
   - [ ] Amélioration des messages d'erreur pour les imports échoués
   - [ ] Ajout de la possibilité d'exporter des données sélectives (par date, par classe, etc.)

4. **Fonctionnalités Futures**
   - [ ] Ajout d'un système de rappels pour les tâches et événements
   - [ ] Amélioration de la visualisation des données de présence
   - [ ] Ajout de rapports et statistiques avancés
   - [ ] Implémentation de l'architecture lazy-loading (Option 4)

---

*📝 Cette documentation sera mise à jour au fur et à mesure de l'évolution du projet vers l'architecture lazy-loading.*