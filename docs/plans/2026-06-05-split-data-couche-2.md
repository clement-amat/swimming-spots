# Couche 2 — Split des données : light geojson + per-spot JSON + code-to-slug

## Contexte

Aujourd'hui le front charge un unique `public/geojson.json` de ~4 MB. Du fait du SSR Angular + TransferState, ce blob est embarqué dans le HTML de chaque page rendue (map, spot détail, gallery). Impact massif sur INP mobile, TTFB, et cold starts Vercel.

Couche 2 sépare ce blob en 3 ressources servies depuis l'edge CDN Vercel :
- un index léger pour la carte
- un fichier par spot pour les pages détail/gallery et le drawer
- un lookup `code → slug` pour les redirects legacy

Le but de ce plan : exécuter cette refacto sans casser quoi que ce soit en route, avec un rollback possible à chaque étape.

## Cibles de données

### `spots-light.geojson` (~150-250 KB)

Une feature par spot, juste ce qu'il faut pour Mapbox (render, `setFilter`, sort) + search par nom + navigation au click.

```json
{
  "type": "Feature",
  "geometry": {"type": "Point", "coordinates": [lng, lat]},
  "properties": {
    "slug": "catalans-marseille",
    "name": "Catalans",
    "city": "Marseille",
    "department": "Bouches-du-Rhône",
    "type": "Eau côtière",
    "score": 135,
    "comfort": true,
    "wheelchair": false,
    "lifeguard": true,
    "dogs": false
  }
}
```

Booléens dérivés au build depuis `siteDetails` :
- `comfort` = `toilets && showers`
- `wheelchair` = `wheelchairAccess`
- `lifeguard` = `surveillance || lifeguard`
- `dogs` = `animalsAllowed`

Correspondent aux 4 IDs filtres définis dans `map-filters.service.ts`.

### `spots/{slug}.json` (~2-5 KB chacun, ~3000 fichiers)

Contenu : équivalent strict de `feature.properties` actuel = `SwimmingSpot` complet (images, siteDetails, region, etc.). **Pas de changement** du type TS `SwimmingSpot` côté front.

Récupéré uniquement :
- Au click sur un marker map (pour ouvrir le drawer ou naviguer)
- Dans `spot-detail.resolver.ts` et `spot-gallery.component.ts`

### `code-to-slug.json` (~100-200 KB)

Lookup plat pour le redirect legacy dans `server.ts` :
```json
{"FRL0413055M013400": "catalans-marseille", ...}
```

## Étape 1 — Scrapper : modif directe de `to-geojson.ts`

À chaque exécution, crée `resources/geojson-output-{YYYYMMDD-HHmm}/` contenant tous les outputs.

```
geojson-output-20260605-1430/
├── geojson.json              # plein (compat viewer + debug)
├── spots-light.geojson       # léger pour la map
├── spots/
│   ├── catalans-marseille.json
│   └── ... (~3000 fichiers)
└── code-to-slug.json
```

**Logique :**
1. Lit `resources/scoring-with-images.json`
2. Construit le geojson complet (logique existante `transformToGeoJSON`)
3. Crée le dossier daté
4. Écrit `geojson.json` (pretty-printed pour le viewer)
5. Construit + écrit `spots-light.geojson` (minifié)
6. Pour chaque feature → écrit `spots/{slug}.json` (minifié). Détecte les collisions de slug.
7. Construit + écrit `code-to-slug.json` (minifié)

**Pas d'impact pipeline :** une seule commande `npm run to-geojson` produit tout. Les autres scripts du scrapper (`scoring`, `fetch-images`, `slim-geojson`, etc.) restent inchangés.

**Rollback :** suppression du dossier daté. Le `resources/geojson.json` historique n'est plus écrit mais on peut le restaurer depuis git si besoin (à confirmer avec l'utilisateur si on doit le maintenir en plus).

## Étape 2 — Sync vers le front

Nouveau script `swimming-spots-scrapper/src/sync-output.ts` :

```bash
npm run sync-output -- ../swimming-spots/public/
```

**Logique :**
1. Trouve le dernier `geojson-output-*` (par ordre alpha décroissant)
2. Copie :
   - `spots-light.geojson` → `public/spots-light.geojson`
   - `spots/` → `public/spots/` (overwrite, pas de merge)
   - `code-to-slug.json` → `public/code-to-slug.json`
3. **Ne touche pas** à `public/geojson.json` (le vieux) pour ne pas casser le front pendant la migration

Idempotent, traçable, reproductible.

## Étape 3 — Front : nouveaux types et service

### Nouveau fichier `swimming-spots/src/app/shared/models/swimming-spot-light.model.ts`

```ts
import { SwimmingSpotType } from './swimming-spot.model';

export interface SwimmingSpotLight {
  slug: string;
  name: string;
  city: string;
  department: string;
  type: SwimmingSpotType;
  score: number;
  comfort: boolean;
  wheelchair: boolean;
  lifeguard: boolean;
  dogs: boolean;
}

export interface SwimmingSpotLightGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: { type: 'Point'; coordinates: [number, number] };
    properties: SwimmingSpotLight;
  }>;
}
```

`SwimmingSpot` (full) reste inchangé.

### Refacto `SwimmingSpotsService`

- `getSwimmingSpots()` → fetch `/spots-light.geojson`, retourne `Observable<SwimmingSpotLightGeoJSON>`
- `getSwimmingSpotBySlug(slug)` → `http.get<SwimmingSpot>(/spots/${slug}.json)` direct, plus de `.find()` sur 4 MB
- `searchSpotsByName(query)` → garde sa signature, utilise le light geojson
- `filteredGeoJSON()` → **supprimé** (filtre désormais natif Mapbox dans `map.component`)

## Étape 4 — Front : refacto map

### `map.component.ts`

1. Le champ interne `swimmingSpotsGeoJSON` devient typé `SwimmingSpotLightGeoJSON | null`
2. `addSwimmingSpotsLayer()` reçoit le light geojson — Mapbox s'en sert directement
3. **Fix du double-appel :** garder un seul point d'entrée, condition à 2 flags (map loaded AND data loaded)
4. **Click handler :**
   - Mobile : `router.navigate(['/spot', feature.properties.slug])`, drop le `state.swimmingSpot` (le resolver fetch directement le bon spot)
   - Desktop : trigger le fetch du per-spot JSON, ouvre le drawer avec un skeleton (light data en attendant)
   - Supprime les `JSON.parse(properties.images)` / `JSON.parse(properties.siteDetails)` — ces champs n'existent plus
5. **Filtres** : `applyFilters()` devient
   ```ts
   const exprs = activeFilters.map(f => ['==', ['get', f.id], true]);
   map.setFilter('swimming-spots-circles', exprs.length ? ['all', ...exprs] : null);
   ```

### Drawer (`swimming-spot-drawer.component.ts`)

- Accepte un `SwimmingSpotLight` (info immédiate du marker cliqué) + un `SwimmingSpot | null` (full data, arrive après fetch)
- Skeleton pour les sections qui dépendent du full (images, siteDetails) tant que le fetch n'est pas arrivé
- Affiche immédiatement `name`, `city`, `type`, `score` depuis le light

## Étape 5 — Front : resolvers et gallery

### `spot-detail.resolver.ts`

- Garde la branche `navState` (raccourci propre quand on vient de la map)
- Le fallback `getSwimmingSpotBySlug(slug)` devient un fetch direct de ~3 KB
- Côté SSR Vercel : IO local sur `public/spots/{slug}.json`, ~1ms

### `spot-gallery.component.ts`

- Idem, le `getSwimmingSpotBySlug(slug)` fetch désormais 3 KB au lieu de 4 MB
- Branche `navigationState` conservée

## Étape 6 — Server.ts : code-to-slug léger

Remplacer `loadCodeToSlugMap()` pour parser `code-to-slug.json` (~100 KB) au lieu de `geojson.json` (~4 MB) au cold start :

```ts
function loadCodeToSlugMap(): Map<string, string> {
  try {
    const raw = readFileSync(
      join(browserDistFolder, 'code-to-slug.json'),
      'utf-8',
    );
    return new Map(Object.entries(JSON.parse(raw)));
  } catch {
    return new Map();
  }
}
```

### Cache headers

- `express.static` global (`server.ts:65`) : `maxAge: '1y'` → `maxAge: '1w'`
- Handler dédié pour `/spots/*.json` (avant le static catch-all) :
  ```ts
  app.get(/^\/spots\/.+\.json$/, (req, res, next) => {
    res.setHeader(
      'Cache-Control',
      'public, max-age=300, s-maxage=604800, stale-while-revalidate=604800',
    );
    next();
  });
  ```

## Étape 7 — Cleanup

Une fois les étapes 1-6 testées et déployées :
- Supprimer `swimming-spots/public/geojson.json` (l'ancien gros fichier)
- Le scrapper continue à produire `geojson.json` dans son dossier daté (utilisé par le viewer pour la curation d'images)

## Ordre d'exécution

1. **Étape 1** (modif `to-geojson.ts`) — testable en isolation, pas de breaking
2. **Étape 2** (script sync) — testable en isolation
3. **Étapes 3 + 4 + 5** ensemble en branche, un commit cohérent (changement coordonné service/map/resolvers)
4. **Étape 6** (server.ts) dans le même commit ou juste après
5. **Test local** avec ancien `geojson.json` + nouveaux fichiers présents en parallèle
6. **Deploy**
7. **Étape 7** (cleanup) après validation prod

## Risques et points d'attention

- **Slug uniqueness** : si deux spots génèrent le même slug, le 2e clobberait le 1er fichier. Le script Étape 1 détecte et reporte les collisions.
- **Désynchro front/back temporaire** : pendant la migration, le front actuel continue de lire `geojson.json` (présent jusqu'à l'étape 7). Aucune fenêtre de panne.
- **Cache 1 semaine sur les `/spots/`** : si on re-scrappe, les visiteurs récents voient l'ancienne donnée jusqu'à 1 semaine. Acceptable vu le profil des données (qualité de l'eau qui change rarement).
- **Drawer skeleton** : ajout léger d'UI, ~30 lignes. À designer rapidement.

## Hors-scope (gardé pour plus tard)

- Préfixe SSG des pages détail (Couche 1) — décision : ISR via cache headers, sans build prerender pour l'instant
- Lazy-load du `MapComponent` (Couche 4)
- `afterNextRender` sur le fetch geojson pour skip SSR
- Mapbox `cluster: true` natif
- Hashage des filenames `spots/{slug}.{hash}.json` pour activer `Cache-Control: immutable`

Ces optimisations s'ajoutent **par-dessus** Couche 2 sans en dépendre. À traiter dans des plans séparés.
