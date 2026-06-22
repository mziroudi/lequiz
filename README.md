# Quiz LPEE

Application web de quiz en français sur la charte graphique du LPEE, construite avec React + Vite.

## Fonctionnalités

- 60 questions chargées depuis `public/questions.csv`
- 4 options numérotées par question (1 correcte + 3 distracteurs)
- Indice et explication issus de la charte PDF officielle
- Système de points : +10 par bonne réponse
- Bouton Réinitialiser pendant le quiz
- Interface type application, centrée et responsive

## Installation

```bash
npm install
```

## Configuration (optionnelle)

Copiez `.env.example` vers `.env` et ajoutez votre clé API Anthropic :

```bash
cp .env.example .env
```

```
ANTHROPIC_API_KEY=votre_cle_api
```

Sans clé API, des distracteurs statiques de secours sont utilisés.

## Génération des données

```bash
npm run extract-pdf          # Extrait le texte du PDF charte
npm run generate-questions   # Génère les distracteurs (Claude API optionnelle)
npm run generate-explanations # Génère indices et explications depuis la charte
```

## Lancement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`.

## Build production

```bash
npm run build
npm run preview
```

## Déploiement

Le quiz est déployé sur GitHub Pages : [https://mziroudi.github.io/lequiz/](https://mziroudi.github.io/lequiz/)

Chaque push sur `main` déclenche automatiquement le déploiement via GitHub Actions.

## Structure

```
src/
  components/   # Composants UI du quiz
  hooks/        # useQuiz — logique métier
  utils/        # Parser CSV, mélange des réponses
  styles/       # Variables CSS globales
public/
  questions.csv # Source des questions
  distractors.json # Distracteurs générés
scripts/
  generateDistractors.mjs
```
