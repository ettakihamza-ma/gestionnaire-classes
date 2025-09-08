# Création des Icônes pour l'Application

## Instructions pour Générer les Icônes

Pour avoir des icônes correctes, tu auras besoin de créer les fichiers suivants à partir de ton logo/design :

### 📁 Fichiers d'icônes requis dans le dossier `assets/` :

1. **`icon.png`** - 512x512 pixels (pour Linux et utilisation générale)
2. **`icon.ico`** - Format Windows (contient plusieurs tailles : 16, 32, 48, 64, 128, 256 px)
3. **`icon.icns`** - Format macOS (pour la compatibilité multi-plateformes)

### 🛠️ Outils recommandés pour créer les icônes :

#### Option 1 : En ligne (Facile)
- **PNG vers ICO** : https://www.icoconverter.com/
- **PNG vers ICNS** : https://cloudconvert.com/png-to-icns

#### Option 2 : Logiciels
- **GIMP** (gratuit) : Peut exporter en .ico
- **Photoshop** : Avec plugin ICO
- **CANVA** : Pour créer le design initial

### 🎨 Design de l'Icône Suggéré

L'icône actuelle (SVG) représente :
- 📚 Un cahier/livre ouvert (blanc sur fond bleu)
- 📝 Des lignes représentant les pages
- 👨‍🎓 Une silhouette d'élève avec toque de graduation
- 📏 Une marge rouge comme dans un vrai cahier

### 🚀 Étapes Rapides

1. **Créer l'icône PNG** :
   - Utilise le SVG fourni comme base
   - Exporte en 512x512 pixels
   - Sauvegarde comme `assets/icon.png`

2. **Convertir en ICO** :
   - Va sur icoconverter.com
   - Upload ton PNG 512x512
   - Télécharge le fichier .ico
   - Renomme en `icon.ico` et place dans `assets/`

3. **Tester l'application** :
   ```bash
   npm run electron-dev
   ```

4. **Créer l'exécutable** :
   ```bash
   npm run build-win
   ```

### 📝 Note Temporaire

Pour l'instant, l'application utilisera l'icône par défaut d'Electron. Une fois que tu auras créé tes fichiers d'icônes, l'application utilisera automatiquement ton design personnalisé.
