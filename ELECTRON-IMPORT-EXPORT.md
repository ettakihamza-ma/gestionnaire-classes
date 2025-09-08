# 🎉 Nouvelles Fonctionnalités Import/Export avec Dialogues Natifs

## ✨ Fonctionnalités Ajoutées

### 📁 Export avec Dialogue Natif Windows
- **Bouton** : "📁 Exporter avec sélection de dossier" (uniquement visible dans l'app desktop)
- **Fonctionnalité** : Utilise la fenêtre native Windows "Enregistrer sous"
- **Avantages** :
  - Choix libre du dossier et nom de fichier
  - Interface familière Windows
  - Navigation facile dans l'arborescence
  - Aperçu des fichiers existants

### 📁 Import avec Dialogue Natif Windows
- **Bouton** : "📁 Importer avec sélection de fichier" (uniquement visible dans l'app desktop)
- **Fonctionnalité** : Utilise la fenêtre native Windows "Ouvrir"
- **Avantages** :
  - Navigation facile pour trouver le fichier Excel
  - Prévisualisation des fichiers
  - Filtrage automatique des fichiers Excel (.xlsx, .xls)
  - Dialogue de sélection du type d'import

## 🎯 Comment Utiliser

### Pour Exporter :
1. **Dans l'application desktop** → Menu "Import/Export"
2. **Cliquez** sur "📁 Exporter avec sélection de dossier"
3. **Choisissez** où sauvegarder votre fichier
4. **Nommez** votre fichier (par défaut : `donnees-classes-2025-09-08.xlsx`)
5. **Cliquez** "Enregistrer"
6. ✅ **Confirmation** : Message de succès avec le chemin du fichier

### Pour Importer :
1. **Dans l'application desktop** → Menu "Import/Export"
2. **Cliquez** sur "📁 Importer avec sélection de fichier" 
3. **Naviguez** et sélectionnez votre fichier Excel
4. **Choisissez le type d'import** :
   - Fusionner avec les données existantes
   - Remplacement complet (⚠️ supprime tout)
   - Élèves uniquement
   - Vacances uniquement
5. **Cliquez** "Importer"
6. ✅ **Confirmation** : Message de succès

## 🔧 Raccourcis Clavier (Menu)

- **Ctrl+E** : Export rapide (menu Fichier)
- **Ctrl+I** : Import rapide (menu Fichier)
- **Ctrl+D** : Basculer mode sombre
- **F12** : Outils de développement

## 📊 Données Exportées

Le fichier Excel contient plusieurs feuilles :
- **Niveaux et Classes** : Structure des niveaux avec nombre d'élèves
- **Élèves** : Liste complète avec groupes assignés
- **Présences** : Historique des présences par élève
- **Cahier Journal** : Entrées du cahier avec dates et objectifs
- **Compétences** : Évaluations par élève et matière
- **Vacances** : Périodes de vacances configurées
- **Notes** : Notes d'agenda et rappels

## 🛡️ Sécurité

- **Isolation des processus** : Les dialogues natifs sont sécurisés
- **Validation des fichiers** : Vérification du format Excel
- **Gestion d'erreurs** : Messages d'erreur clairs en cas de problème
- **Sauvegarde locale** : Aucune donnée n'est envoyée en ligne

## 🔄 Compatibilité

### Version Web (Navigateur)
- ✅ Boutons d'export/import classiques
- ✅ Sélection de fichiers via input HTML
- ✅ Téléchargement automatique

### Version Desktop (Electron)
- ✅ Tous les boutons de la version web
- ✅ **+ Boutons avec dialogues natifs** 📁
- ✅ Raccourcis clavier globaux
- ✅ Menus natifs Windows

## 🚀 Prochaines Améliorations

- [ ] Export sélectif par période de dates
- [ ] Import par glisser-déposer
- [ ] Historique des exports/imports
- [ ] Compression automatique des gros fichiers
- [ ] Prévisualisation avant import

---

**🎯 Les boutons avec l'icône 📁 n'apparaissent que dans l'application desktop et offrent une expérience native Windows optimale !**
