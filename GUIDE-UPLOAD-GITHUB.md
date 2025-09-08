# 🚀 Guide d'Upload Automatique vers GitHub

## 📋 Prérequis

1. **Token GitHub** : Créez un token sur https://github.com/settings/tokens
   - Cochez : `repo` (Full control of private repositories)
   - Copiez le token généré

2. **Repository GitHub** : Votre repo `gestionnaire-classes` doit exister

## 🎯 Méthodes d'Upload

### Méthode 1 : Script Batch (Recommandé pour débutants)

```cmd
# Double-cliquez sur le fichier
upload-github.bat
```

Le script vous demandera votre token GitHub et uploadera automatiquement tous les fichiers.

### Méthode 2 : PowerShell (Avancé)

```powershell
# Définir le token
$env:GITHUB_TOKEN = "votre_token_ici"

# Lancer l'upload
.\upload-to-github.ps1
```

### Méthode 3 : PowerShell en une ligne

```powershell
$env:GITHUB_TOKEN = "votre_token"; .\upload-to-github.ps1
```

## 📁 Structure Uploadée

Le script organise automatiquement vos fichiers :

```
gestionnaire-classes/
├── 📄 README.md (depuis README-GITHUB.md)
├── 📄 package.json
├── 📄 electron-main.js
├── 📄 index.html
├── 🎨 icon.svg/png/ico
├── 📁 docs/
│   ├── readme-original.md
│   ├── CORRECTIONS-SEPTEMBRE-2025.md
│   └── autres docs...
├── 📁 tests/
│   ├── test-fixes.html
│   ├── test-theme.html
│   └── autres tests...
├── 📁 css/
│   └── styles.css
└── 📁 js/
    ├── main.js
    ├── 📁 components/
    ├── 📁 core/
    ├── 📁 modules/
    ├── 📁 services/
    └── 📁 utils/
```

## ⚠️ Notes Importantes

- **Rate Limiting** : Le script fait une pause entre chaque fichier pour éviter les limitations
- **Gros Fichiers** : Les fichiers > 100MB ne sont pas supportés par l'API GitHub
- **Erreurs** : Le script affiche un résumé des succès/erreurs à la fin
- **Reprise** : Vous pouvez relancer le script, il mettra à jour les fichiers existants

## 🔧 Dépannage

### Erreur 401 (Unauthorized)
- Vérifiez que votre token est correct
- Assurez-vous que le token a les permissions `repo`

### Erreur 404 (Not Found)
- Vérifiez que le repository existe
- Vérifiez le nom du repo dans le script

### Erreur de quota
- Attendez quelques minutes et relancez
- Le script fait déjà des pauses automatiques

## 🎉 Résultat

Après l'upload, votre projet sera disponible sur :
**https://github.com/ettakihamza-ma/gestionnaire-classes**

Avec une structure propre et professionnelle ! 🌟
