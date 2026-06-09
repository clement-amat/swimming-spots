# Plan d'amélioration performance (Lighthouse / PageSpeed Insights)

> Audit du 2026-06-09. État de référence : JS initial ~140 kB gzip, mapbox-gl lazy-loadé
> (432 kB gzip), fonts Google inlinées au build, cache SSR en place. Les leviers principaux
> sont les images (LCP/CLS) et la livraison des assets statiques (TTFB).

## Contexte mesuré

| Élément | Mesure |
|---|---|
| JS initial (main + polyfills + chunk commun) | ~140 kB gzip |
| mapbox-gl (lazy, home uniquement) | 1,55 Mo raw / 432 kB gzip |
| `spots-light.json` | 936 kB raw / 152 kB gzip |
| Material Symbols (set complet, 2 axes) | ~250 kB woff2 |
| `public/geojson.json` (non référencé) | 4,1 Mo |
| Images spots | originaux Wikimedia Commons, parfois 5–10 Mo |

La home étant une carte canvas (non éligible LCP), ce sont les pages `/spot/:slug` et
`/p/:slug` que PSI pénalise le plus.

---

## Phase 1 — Images & LCP (impact fort) 🔴

### 1.1 Hero des pages spot : servir des images dimensionnées ✅ Fait (2026-06-09)
- **Problème** : `src/app/shared/ui/spot-hero-gallery/spot-hero-gallery.component.html:8`
  chargeait `image.url` = fichier original Wikimedia (jusqu'à 5–10 Mo). Idem
  `swimming-spot-detail.component.html:7`.
- **Implémenté** : directive partagée `shared/ui/spot-image/spot-image.directive.ts`
  (`img[appSpotImage]`) qui génère `src` + `srcset` + `sizes` :
  - Réécrit le `thumbUrl` Wikimedia, ou le dérive depuis l'URL originale quand
    `thumbUrl` est absent.
  - Wikimedia ne sert plus que des largeurs prédéfinies (constaté : 60, 120, 250, 330,
    500, 960, 1280, 1920) — les largeurs demandées sont calées sur ces paliers,
    `srcset` = 500/960/1280/1920.
  - Images non-Wikimedia ou non redimensionnables (~90 sur 10 420) → URL originale
    telle quelle, sans `srcset`.
  - Fallback `(error)` : si une vignette générée échoue au chargement, retombe sur
    l'URL originale (garantit l'affichage même sans vignette valide).
  - `fetchpriority="high"` sur l'image principale (LCP), `loading="lazy"` sur les
    secondaires. Pas de `width`/`height` nécessaires : conteneurs à hauteur fixe,
    pas de CLS.
  - Couverture : `spot-hero-gallery` (desktop) + `swimming-spot-detail` (mobile/drawer).
  - Tests : `spot-image.directive.spec.ts` (9 specs, dont fallback d'erreur) ;
    URLs vérifiées en HTTP 200 sur le rendu SSR réel.

### 1.2 Hero des landing pages : remplacer le background CSS par un `<img>`
- **Problème** : `src/app/shared/ui/landing-hero/landing-hero.component.html:6` met l'image
  LCP en `background-image` inline → invisible pour le preload scanner, découverte tardive.
- **Fix** : vrai `<img>` positionné absolu + gradient en overlay, `fetchpriority="high"`.
  Alternative a minima : `<link rel="preload">` injecté côté SSR par le resolver.

### 1.3 Images dimensionnées sur tous les `<img>` ✅ Fait (2026-06-09)
- **Re-scopé** : plutôt que `NgOptimizedImage` (qui aurait demandé un custom loader
  Wikimedia + dimensions intrinsèques), la directive `appSpotImage` de 1.1 a été
  généralisée — elle apporte en plus le fallback d'erreur que `ngSrc` n'a pas.
  Elle accepte désormais aussi une URL string (images des landing pages).
- Couverture ajoutée : `spot-gallery-preview` (logique de `src` déplacée dans la
  directive), `spot-gallery` (page galerie : 1ʳᵉ image `fetchpriority="high"`,
  les autres lazy — fini les originaux pleine taille en masonry),
  `landing-spot-card` (lazy, vignettes dérivées des URLs string).
- Restent volontairement hors directive : `spot-map-card` (image statique Mapbox déjà
  dimensionnée), avatar de `landing-hero` (minuscule), hero landing → traité en 1.2.
- Note : `shared/ui/spot-gallery/spot-gallery.component.ts` (`app-spot-gallery`)
  est du code mort (aucun usage) → à supprimer en phase 4.

### 1.4 `preconnect` vers `upload.wikimedia.org` ✅ Fait (2026-06-09)
- Ajouté dans `src/index.html` à côté des preconnects existants (fonts, Mapbox).
  Vérifié présent dans le HTML SSR rendu.

## Phase 2 — Livraison des assets (TTFB) 🔴

### 2.1 Cache edge pour les assets servis par la lambda ✅ Fait (2026-06-09, via headers)
- **Problème** : `vercel.json` rewrite tout vers `/api` → chaque JS/CSS/font/JSON passe par
  la fonction Express. Seul `max-age=1w` était envoyé, sans `s-maxage` → pas de cache
  edge Vercel, chaque visiteur payait une invocation lambda par asset.
- **Implémenté** dans `server.ts` (`setHeaders`) :
  - Assets hashés (`main-XXXX.js`, `chunk-…`, `styles-…`) → `max-age=31536000, immutable`.
  - `.html` (dont la home prerendue, qui était cachée navigateur 1 semaine sans
    invalidation !) → `max-age=0, s-maxage=3600, stale-while-revalidate=86400`.
  - Autres statiques (favicons, manifest, `spots-light.json`, sitemap…) → même politique
    que les JSON spots : `max-age=300, s-maxage=604800, stale-while-revalidate=604800`.
  - Vérifié en local sur chaque type d'asset.
- **Reste (optionnel)** : servir `dist/browser` directement par le CDN Vercel
  (`outputDirectory` + rewrite limité aux routes HTML) pour éviter même la première
  invocation par asset/région. Non fait car non testable en local — nécessite un
  preview deployment Vercel.

### 2.2 Police d'icônes : subset Material Symbols ✅ Fait (2026-06-09)
- **Constat** : set complet = 310 kB woff2 pour 25 icônes utilisées ; le site ne se sert
  que d'une seule configuration d'axes (`wght 400, FILL 0`, cf. `styles.css`).
- **Implémenté** : URL Google Fonts dans `src/index.html` avec
  `opsz,wght,FILL,GRAD@24,400,0,0` + `icon_names=<25 icônes>` + `display=block`
  (supprime le flash de ligature) → **4,3 kB** (-98,6 %). Le CSS est inliné au build
  par Angular ; une seule `@font-face` dans le HTML final.
- Inventaire des 25 icônes fait sur templates (multi-lignes), configs TS
  (`map-filters.service`, `pro-tip-callout`, etc.) et données landing pages.
- **Maintenance** : toute nouvelle icône doit être ajoutée à `icon_names`
  (noté dans `AGENTS.md`).

## Phase 3 — Données carte & JS (impact moyen) 🟡

### 3.1 Alléger `spots-light.json`
- Tronquer les coordonnées à 5 décimales (précision ~1 m, actuellement 11 décimales)
  et raccourcir les noms de propriétés. Gain estimé ~40 % gzip (152 → ~90 kB).
- Long terme : tuiles vectorielles (tippecanoe → PMTiles) pour ne charger que le viewport.

### 3.2 Différer gtag.js
- Chargé async dans le `<head>`, il se dispute le main thread avec le boot Angular + Mapbox
  sur la home. Le charger après l'événement `load` ou à la première interaction (TBT).

### 3.3 Mode zoneless (exploratoire)
- Le code utilise déjà les signals ; Angular 19 propose `provideExperimentalZonelessChangeDetection`.
  Supprime zone.js (34 kB) et réduit le TBT (moins de cycles de CD autour des events Mapbox).
  À tester derrière une branche — risque de régressions sur les libs tierces.

## Phase 4 — Hygiène 🟢

- [ ] Supprimer `public/geojson.json` (4,1 Mo, plus référencé depuis « no geojson full load »).
- [ ] Prerender des landing pages `/p/:slug` (contenu statique ; le cache `s-maxage=3600`
      aide mais le premier hit reste lent).
- [ ] Resserrer les budgets `angular.json` (initial : warning 500 kB / error 2,5 Mo
      actuellement) pour détecter les régressions.

---

## Ordre d'exécution recommandé

1. **Phase 1** (images) — plus gros gain LCP/CLS sur les pages indexées.
2. **Phase 2.1** (CDN Vercel) — TTFB global.
3. **Phase 2.2** (icônes) — poids + flash visuel.
4. **Phase 3** puis **Phase 4** au fil de l'eau.

Après chaque phase : vérifier via PageSpeed Insights sur une page spot, une landing page
et la home (mobile en priorité).
