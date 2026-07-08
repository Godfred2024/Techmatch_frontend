# TimeFlow — Application de suivi du temps

## Contexte du projet
Application mobile-first de suivi du temps personnel, appelée **TimeFlow**.
Interface en **français**. Design Apple-inspired, épuré, card-based.

## Repo & déploiement
- **GitHub :** `godfred2024/G_Time_Tracker` — branche principale : `main`
- **Netlify :** auto-deploy depuis la branche `main` de G_Time_Tracker
- **URL Netlify :** site connecté automatiquement (vérifier le dashboard Netlify)
- Dès qu'on push sur `main`, Netlify rebuilde et redéploie automatiquement

## Structure du repo
```
G_Time_Tracker/
└── time-tracker/          ← dossier du projet Next.js (base directory Netlify)
    ├── app/               ← pages de l'application (App Router)
    │   ├── page.tsx       ← Dashboard (accueil)
    │   ├── log/           ← Saisir du temps
    │   ├── activities/    ← Gestion activités & catégories
    │   ├── stats/         ← Statistiques
    │   ├── calendar/      ← Agenda / heatmap
    │   └── goals/         ← Objectifs
    ├── components/
    │   ├── ui/            ← Composants de base (Button, Card, Modal, Input...)
    │   ├── layout/        ← BottomNav (navigation bas de page)
    │   ├── dashboard/     ← StatCard, ActivityBar, GoalCard
    │   ├── charts/        ← WeekBarChart
    │   └── log/           ← DurationPicker
    ├── lib/
    │   ├── types.ts       ← Tous les types TypeScript + DEFAULT_CATEGORIES
    │   ├── store.ts       ← État global Zustand (persisté localStorage)
    │   └── utils.ts       ← Fonctions utilitaires (dates, formatage...)
    └── public/            ← Assets statiques (manifest PWA, icônes)
```

## Stack technique
- **Framework :** Next.js 14 (App Router)
- **Language :** TypeScript
- **Styles :** Tailwind CSS
- **État :** Zustand avec `persist` → localStorage
- **Dates :** date-fns avec locale française (`fr`)
- **Icônes UI :** Lucide React
- **Export :** statique (`output: "export"` dans next.config.mjs)
- **Build Netlify :** `npm install && npm run build` / publish : `time-tracker/out`

## Paramètres Netlify
| Paramètre | Valeur |
|---|---|
| Base directory | `time-tracker` |
| Build command | `npm install && npm run build` |
| Publish directory | `time-tracker/out` |

## Fonctionnalités de l'app
1. **Dashboard** — stats du jour/semaine/mois, top activités, objectifs, répartition par catégorie
2. **Saisir** — enregistrement manuel de sessions de temps (activité + durée + commentaire + date)
3. **Activités** — CRUD activités (nom, icône emoji, couleur, catégorie, objectif optionnel)
4. **Catégories** — catégories personnalisables avec couleur (onglet dans la page Activités)
5. **Statistiques** — graphiques par semaine/mois/année, par activité et par catégorie
6. **Agenda** — heatmap calendrier des sessions
7. **Objectifs** — suivi des objectifs avec anneaux de progression

## Types principaux (lib/types.ts)
```typescript
Activity { id, name, category (string = id de catégorie), color, icon (emoji), goalAmount?, goalFrequency?, archived? }
TimeEntry { id, activityId, date (yyyy-MM-dd), duration (minutes), comment? }
Goal { id, activityId, targetHours, frequency, autoCreated? }
CustomCategory { id, name, color, isDefault }
Frequency = "daily" | "weekly" | "monthly" | "yearly"
```

## Conventions de code
- Commentaires et messages d'erreur en **français**
- Composants UI réutilisables dans `components/ui/`
- Pas de server components dans les pages (tout en `"use client"`)
- Animations : `animate-fade-in`, `animate-slide-up` (définis dans globals.css)
- Couleurs : palette gris (gray-900 = dark, white = light) + couleurs d'activité dynamiques
- Arrondis généreux : `rounded-2xl`, `rounded-xl`
- Navigation : `BottomNav` fixe en bas, 5 onglets

## Points importants
- La Modal (`components/ui/modal.tsx`) a `max-h-[92vh] overflow-y-auto` pour scroller sur mobile
- Le sélecteur d'icônes et de couleurs dans la modale activité est **collapsé par défaut** (s'ouvre au clic, se ferme après sélection)
- La navigation bas de page a un **indicateur de ligne** (3px) au-dessus de l'onglet actif
- Les catégories par défaut sont définies dans `DEFAULT_CATEGORIES` dans `types.ts`
- Les objectifs sont auto-créés/mis à jour/supprimés quand on modifie `goalAmount` sur une activité

## Commandes utiles
```bash
# Développement local
cd time-tracker
npm install
npm run dev        # http://localhost:3000

# Build de production
npm run build      # génère time-tracker/out/

# Vérifier les types
npm run lint
```
