# 📚 Gestionnaire de Classes pour Enseignants

> Application moderne et locale pour la gestion complète des niveaux scolaires, classes, élèves avec système de groupes flexibles, cahier journal électronique, suivi de progression et gestion des tâches.

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/ettakihamza/gestionnaire-classes)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE.txt)
[![Electron](https://img.shields.io/badge/Electron-32.3.3-47848f.svg)](https://electronjs.org/)

## ✨ Fonctionnalités Principales

- **🎯 Gestion des Groupes/Demi-Classes** : Configuration flexible pour enseignants travaillant avec la classe complète ou des groupes spécifiques
- **📊 Présence Rapide Intelligente** : Interface optimisée avec filtrage par groupe et feedback visuel immédiat
- **🧠 Prise de Présence Adaptative** : Choix par défaut basé sur la configuration onboarding
- **⚡ Interface Utilisateur Moderne** : Design responsive avec animations fluides et navigation sécurisée
- **🌙 Mode Sombre Complet** : Thème sombre avec corrections systématiques pour tous les éléments
- **💾 Export/Import Excel** : Sauvegarde et import de données complètes avec dialogues natifs
- **🛠️ Outils de Debug** : Page de test intégrée et fonction de diagnostic

## 🚀 Installation

### Version Desktop (Recommandée)

1. **Téléchargez** la dernière version depuis [Releases](https://github.com/ettakihamza/gestionnaire-classes/releases)
2. **Exécutez** `Gestionnaire de Classes pour Enseignants Setup.exe`
3. **Suivez** l'assistant d'installation
4. **Lancez** l'application depuis le bureau ou le menu Démarrer

### Version Web

1. Clonez le repository :
```bash
git clone https://github.com/ettakihamza/gestionnaire-classes.git
cd gestionnaire-classes
```

2. Ouvrez `index.html` dans votre navigateur ou utilisez un serveur local :
```bash
python -m http.server 8000
```

### Développement

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run electron-dev

# Créer un build de production
npm run build-win
```

## 🎯 Public Cible

Cette application a été spécialement conçue pour **les enseignants du primaire** qui souhaitent :
- Gérer efficacement leurs classes et élèves
- Suivre les présences et progressions
- Tenir un cahier journal numérique
- Exporter/importer des données facilement

## 🛠️ Technologies Utilisées

- **Frontend** : HTML5, CSS3 (Tailwind CSS), JavaScript Vanilla
- **Desktop** : Electron.js pour applications natives cross-platform
- **Bibliothèques** :
  - SheetJS (xlsx) : Export/Import Excel côté client
  - Chart.js : Visualisations et graphiques de progression
  - FontAwesome : Icônes modernes
- **Architecture** : Single-Page Application (SPA) modulaire
- **Stockage** : localStorage (aucun serveur requis)

## 📱 Compatibilité

### Version Desktop
- ✅ Windows 10/11 (x64)
- ✅ macOS 10.14+ (en développement)
- ✅ Linux Ubuntu 18.04+ (en développement)

### Version Web
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📊 Captures d'Écran

![Dashboard](docs/images/dashboard.png)
*Tableau de bord principal avec vue d'ensemble*

![Gestion Élèves](docs/images/eleves.png)
*Interface de gestion des élèves avec système de groupes*

![Import/Export](docs/images/import-export.png)
*Fonctionnalités d'import/export avec dialogues natifs*

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez votre branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📜 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE.txt](LICENSE.txt) pour plus de détails.

## 👨‍💻 Auteur

**Hamza Ettaki**
- LinkedIn: [ettaki](https://www.linkedin.com/in/ettaki/)
- GitHub: [@ettakihamza](https://github.com/ettakihamza)

## 🙏 Remerciements

- Merci à tous les enseignants qui ont testé et donné leurs retours
- Inspiration des outils pédagogiques existants
- Communauté Electron pour les ressources et documentation

---

<div align="center">
  <strong>Made with ❤️ for Teachers</strong>
</div>
