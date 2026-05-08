# SEO Landing Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement `/p/{slug}` SEO landing pages with resolver-based data loading, standalone layout, and modular UI components.

**Architecture:** Route resolver fetches static JSON files before component initialization (critical for SSR). Page component in `pages/`, reusable UI components in `shared/ui/`, data service in `shared/data/`. Landing pages use standalone layout optimized for SEO conversion.

**Tech Stack:** Angular 19, TypeScript, Tailwind CSS, Angular Router with Resolvers, SSR

---

## Task 1: Create Data Models

**Files:**
- Create: `src/app/shared/models/landing-page.model.ts`

**Step 1: Create the model file**

Create `src/app/shared/models/landing-page.model.ts`:

```typescript
export interface LandingPageHero {
  title: string;
  subtitle: string;
  image: string;
  badge?: string;
  author?: {
    name: string;
    title: string;
    avatar: string;
  };
}

export interface LandingPageSpot {
  code: string;
  name: string;
  city: string;
  type: string;
  score: number;
  image: string | null;
  description: string[];
  lat: number;
  lng: number;
  distance?: string;
  facilities?: string[];
  note?: string;
}

export interface ProTip {
  title: string;
  content: string;
  icon?: string;
}

export interface LandingPageData {
  slug: string;
  hero: LandingPageHero;
  introText: string;
  title: string;
  description: string;
  spotsCount: number;
  spots: LandingPageSpot[];
  proTips?: ProTip[];
  generatedAt: string;
  canonicalUrl?: string;
  ogImage?: string;
}
```

**Step 2: Commit**

```bash
git add src/app/shared/models/landing-page.model.ts
git commit -m "feat(models): add landing page data models

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Create Landing Page Service

**Files:**
- Create: `src/app/shared/data/landing-page.service.ts`

**Step 1: Create the service file**

Create `src/app/shared/data/landing-page.service.ts`:

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { LandingPageData } from '@models/landing-page.model';

@Injectable({
  providedIn: 'root',
})
export class LandingPageService {
  private http = inject(HttpClient);

  getLandingPage(slug: string): Observable<LandingPageData | null> {
    return this.http
      .get<LandingPageData>(`/landing-pages/${slug}.json`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error(`Landing page not found: ${slug}`, error);
          return of(null);
        })
      );
  }
}
```

**Step 2: Commit**

```bash
git add src/app/shared/data/landing-page.service.ts
git commit -m "feat(service): add landing page data service

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Create Landing Page Resolver

**Files:**
- Create: `src/app/pages/landing-page/landing-page.resolver.ts`

**Step 1: Create the resolver file**

Create `src/app/pages/landing-page/landing-page.resolver.ts`:

```typescript
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { LandingPageData } from '@models/landing-page.model';
import { LandingPageService } from '@app/shared/data/landing-page.service';

export const landingPageResolver: ResolveFn<LandingPageData | null> = (
  route
) => {
  const landingPageService = inject(LandingPageService);
  const slug = route.paramMap.get('slug');

  if (!slug) {
    return null;
  }

  return landingPageService.getLandingPage(slug);
};
```

**Step 2: Commit**

```bash
git add src/app/pages/landing-page/landing-page.resolver.ts
git commit -m "feat(resolver): add landing page route resolver

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Create Landing Hero Component

**Files:**
- Create: `src/app/shared/ui/landing-hero/landing-hero.component.ts`
- Create: `src/app/shared/ui/landing-hero/landing-hero.component.html`

**Step 1: Create the component TypeScript file**

Create `src/app/shared/ui/landing-hero/landing-hero.component.ts`:

```typescript
import { Component, input } from '@angular/core';
import { LandingPageHero } from '@models/landing-page.model';

@Component({
  selector: 'app-landing-hero',
  standalone: true,
  templateUrl: './landing-hero.component.html',
})
export class LandingHeroComponent {
  hero = input.required<LandingPageHero>();
}
```

**Step 2: Create the component HTML template**

Create `src/app/shared/ui/landing-hero/landing-hero.component.html`:

```html
<section class="relative pt-10 pb-20 px-6">
  <div class="max-w-[1100px] mx-auto">
    <div class="relative h-[600px] w-full overflow-hidden rounded-lg shadow-2xl group">
      <div
        class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        [style.background-image]="'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7)), url(' + hero().image + ')'"
      ></div>
      <div class="absolute inset-0 flex flex-col items-center justify-end p-12 text-center">
        @if (hero().badge) {
          <span class="bg-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            {{ hero().badge }}
          </span>
        }
        <h1 class="text-white text-4xl md:text-6xl font-extrabold leading-tight mb-6 max-w-4xl text-balance">
          {{ hero().title }}
        </h1>
        <p class="text-white/90 text-lg md:text-xl max-w-2xl leading-relaxed font-medium mb-8">
          {{ hero().subtitle }}
        </p>
        @if (hero().author) {
          <div class="flex items-center gap-4 text-white/80">
            <img
              [src]="hero().author!.avatar"
              alt="Author"
              class="w-10 h-10 rounded-full border-2 border-white/20"
            />
            <div class="text-left text-sm">
              <p class="font-bold text-white">Par {{ hero().author!.name }}</p>
              <p>{{ hero().author!.title }}</p>
            </div>
          </div>
        }
      </div>
    </div>
  </div>
</section>
```

**Step 3: Commit**

```bash
git add src/app/shared/ui/landing-hero/
git commit -m "feat(ui): add landing hero component

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Create Landing Spot Card Component

**Files:**
- Create: `src/app/shared/ui/landing-spot-card/landing-spot-card.component.ts`
- Create: `src/app/shared/ui/landing-spot-card/landing-spot-card.component.html`

**Step 1: Create the component TypeScript file**

Create `src/app/shared/ui/landing-spot-card/landing-spot-card.component.ts`:

```typescript
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LandingPageSpot } from '@models/landing-page.model';

@Component({
  selector: 'app-landing-spot-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing-spot-card.component.html',
})
export class LandingSpotCardComponent {
  spot = input.required<LandingPageSpot>();
  index = input.required<number>();

  get spotNumber(): string {
    return (this.index() + 1).toString().padStart(2, '0');
  }
}
```

**Step 2: Create the component HTML template**

Create `src/app/shared/ui/landing-spot-card/landing-spot-card.component.html`:

```html
<section class="mb-24">
  <div class="flex flex-col gap-8">
    <div class="flex items-center gap-4">
      <span class="text-5xl font-black text-primary/20">{{ spotNumber }}</span>
      <h2 class="text-4xl font-extrabold text-slate-800">{{ spot().name }}</h2>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div class="lg:col-span-8">
        @if (spot().image) {
          <div class="rounded-lg overflow-hidden shadow-xl mb-8 bg-neutral-sand h-[450px]">
            <img
              [src]="spot().image"
              [alt]="spot().name"
              class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        }
        <div class="space-y-6 text-slate-700 leading-relaxed text-lg">
          @for (paragraph of spot().description; track $index) {
            <p>{{ paragraph }}</p>
          }
          <a
            [routerLink]="['/spot', spot().code]"
            class="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all mt-4 group"
          >
            <span class="material-symbols-outlined">map</span>
            Voir l'itinéraire sur la carte
            <span class="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </a>
        </div>
      </div>

      <aside class="lg:col-span-4 lg:sticky lg:top-28">
        <div class="bg-white p-8 rounded-3xl shadow-sm space-y-6">
          <h4 class="font-bold text-slate-800 uppercase tracking-wider text-xs flex items-center gap-2">
            <span class="w-1.5 h-1.5 bg-primary rounded-full"></span>
            Infos Essentielles
          </h4>
          <div class="space-y-5">
            @if (spot().distance) {
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                  <span class="material-symbols-outlined">directions_car</span>
                </div>
                <div>
                  <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Distance</p>
                  <p class="font-bold text-slate-800">{{ spot().distance }}</p>
                </div>
              </div>
            }
            @if (spot().facilities && spot().facilities.length > 0) {
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                  <span class="material-symbols-outlined">umbrella</span>
                </div>
                <div>
                  <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Équipements</p>
                  <p class="font-bold text-slate-800">{{ spot().facilities.join(', ') }}</p>
                </div>
              </div>
            }
          </div>
          @if (spot().note) {
            <hr class="border-slate-100"/>
            <p class="text-xs italic text-slate-400">{{ spot().note }}</p>
          }
        </div>
      </aside>
    </div>
  </div>
</section>
```

**Step 3: Commit**

```bash
git add src/app/shared/ui/landing-spot-card/
git commit -m "feat(ui): add landing spot card component

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Create Pro Tip Callout Component

**Files:**
- Create: `src/app/shared/ui/pro-tip-callout/pro-tip-callout.component.ts`
- Create: `src/app/shared/ui/pro-tip-callout/pro-tip-callout.component.html`

**Step 1: Create the component TypeScript file**

Create `src/app/shared/ui/pro-tip-callout/pro-tip-callout.component.ts`:

```typescript
import { Component, input } from '@angular/core';
import { ProTip } from '@models/landing-page.model';

@Component({
  selector: 'app-pro-tip-callout',
  standalone: true,
  templateUrl: './pro-tip-callout.component.html',
})
export class ProTipCalloutComponent {
  proTip = input.required<ProTip>();

  get iconName(): string {
    return this.proTip().icon || 'tips_and_updates';
  }
}
```

**Step 2: Create the component HTML template**

Create `src/app/shared/ui/pro-tip-callout/pro-tip-callout.component.html`:

```html
<div class="bg-white border-none rounded-3xl p-8 mb-24 flex items-start gap-6 relative overflow-hidden shadow-sm">
  <div class="absolute -right-10 -top-10 text-primary/10 scale-150 pointer-events-none">
    <span class="material-symbols-outlined text-[120px]">lightbulb</span>
  </div>
  <div class="bg-primary text-white p-3 rounded-2xl shrink-0">
    <span class="material-symbols-outlined">{{ iconName }}</span>
  </div>
  <div class="relative z-10">
    <h3 class="text-xl font-bold text-primary mb-2">{{ proTip().title }}</h3>
    <p class="text-slate-700 leading-relaxed">{{ proTip().content }}</p>
  </div>
</div>
```

**Step 3: Commit**

```bash
git add src/app/shared/ui/pro-tip-callout/
git commit -m "feat(ui): add pro tip callout component

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Create Landing Page Component

**Files:**
- Create: `src/app/pages/landing-page/landing-page.component.ts`
- Create: `src/app/pages/landing-page/landing-page.component.html`

**Step 1: Create the component TypeScript file**

Create `src/app/pages/landing-page/landing-page.component.ts`:

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LandingPageData } from '@models/landing-page.model';
import { SeoService } from '@app/shared/seo/seo.service';
import { LandingHeroComponent } from '@app/shared/ui/landing-hero/landing-hero.component';
import { LandingSpotCardComponent } from '@app/shared/ui/landing-spot-card/landing-spot-card.component';
import { ProTipCalloutComponent } from '@app/shared/ui/pro-tip-callout/pro-tip-callout.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    LandingHeroComponent,
    LandingSpotCardComponent,
    ProTipCalloutComponent,
  ],
  providers: [SeoService],
  templateUrl: './landing-page.component.html',
})
export class LandingPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seoService = inject(SeoService);

  landingPage: LandingPageData | null = null;

  ngOnInit(): void {
    this.landingPage = this.route.snapshot.data['landingPage'];

    if (!this.landingPage) {
      this.router.navigate(['/404']);
      return;
    }

    this.setupSeo();
  }

  private setupSeo(): void {
    if (!this.landingPage) return;

    this.seoService.setTitle(this.landingPage.title);
    this.seoService.setMetaData({
      description: this.landingPage.description,
      canonicalUrl:
        this.landingPage.canonicalUrl ||
        `https://yoursite.com/p/${this.landingPage.slug}`,
      image: this.landingPage.ogImage,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: this.landingPage.title,
        numberOfItems: this.landingPage.spotsCount,
        itemListElement: this.landingPage.spots.map((spot, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Place',
            name: spot.name,
            url: `https://yoursite.com/spot/${spot.code}`,
          },
        })),
      },
    });
  }
}
```

**Step 2: Create the component HTML template**

Create `src/app/pages/landing-page/landing-page.component.html`:

```html
@if (landingPage) {
  <div class="bg-[#f0f4f8] text-slate-900 selection:bg-primary/30">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div class="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="bg-primary text-white p-1.5 rounded-lg">
            <span class="material-symbols-outlined block text-xl">waves</span>
          </div>
          <span class="text-xl font-bold tracking-tight text-[#1a2b3b]">DeepOcean</span>
        </div>
        <nav class="hidden md:flex items-center gap-8">
          <a routerLink="/" class="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
            Explorer
          </a>
        </nav>
      </div>
    </header>

    <main>
      <app-landing-hero [hero]="landingPage.hero" />

      <div class="max-w-[1000px] mx-auto px-6 pb-20">
        <article class="prose prose-slate prose-lg max-w-none mb-20">
          <p class="text-xl leading-relaxed text-slate-600 first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-3 first-letter:float-left">
            {{ landingPage.introText }}
          </p>
        </article>

        @for (spot of landingPage.spots; track spot.code; let i = $index) {
          <app-landing-spot-card [spot]="spot" [index]="i" />

          @if (landingPage.proTips && landingPage.proTips[i]) {
            <app-pro-tip-callout [proTip]="landingPage.proTips[i]" />
          }
        }
      </div>
    </main>
  </div>
}
```

**Step 3: Commit**

```bash
git add src/app/pages/landing-page/
git commit -m "feat(page): add landing page component

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Add Route Configuration

**Files:**
- Modify: `src/app/app.routes.ts`

**Step 1: Add landing page route**

Update `src/app/app.routes.ts` to add the new route before the existing routes:

```typescript
import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { MapComponent } from './pages/map/map.component';
import { landingPageResolver } from './pages/landing-page/landing-page.resolver';

export const routes: Routes = [
  {
    path: 'p/:slug',
    loadComponent: () =>
      import('./pages/landing-page/landing-page.component').then(
        (m) => m.LandingPageComponent
      ),
    resolve: {
      landingPage: landingPageResolver,
    },
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: MapComponent
      },
      {
        path: 'spot/:code',
        loadComponent: () =>
          import('./pages/spot-detail/spot-detail.component').then(
            (m) => m.SpotDetailComponent
          ),
      },
      {
        path: 'spot/:code/gallery',
        loadComponent: () =>
          import('./pages/spot-gallery/spot-gallery.component').then(
            (m) => m.SpotGalleryComponent
          ),
      },
    ],
  },
];
```

**Step 2: Commit**

```bash
git add src/app/app.routes.ts
git commit -m "feat(routing): add landing page route with resolver

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Create Mock Landing Page Data

**Files:**
- Create: `public/landing-pages/swimming-near-lyon.json`

**Step 1: Find real spot codes from geojson.json**

Run: `cat public/geojson.json | grep -o '"code":"[^"]*"' | head -10`

This will show you real spot codes to use in the mock data.

**Step 2: Create the mock JSON file**

Create `public/landing-pages/swimming-near-lyon.json`:

```json
{
  "slug": "swimming-near-lyon",
  "title": "Où se baigner près de Lyon ? Les 10 spots les plus proches !",
  "description": "Découvrez les meilleurs spots de baignade à moins d'une heure de Lyon. Lacs, rivières et plages pour se rafraîchir cet été.",
  "spotsCount": 3,
  "hero": {
    "title": "Où se baigner près de Lyon ? Les 10 spots les plus proches !",
    "subtitle": "Exit le bitume brûlant ! Nous avons exploré pour vous les pépites d'eau douce à moins d'une heure de la capitale des Gaules. Voici notre sélection exclusive.",
    "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
    "badge": "Édition Été 2024",
    "author": {
      "name": "Julien Vasseur",
      "title": "Expert Local & Voyageur",
      "avatar": "https://i.pravatar.cc/150?img=12"
    }
  },
  "introText": "Quand le thermomètre s'emballe sur la place Bellecour, l'appel du large — ou plutôt du lac — devient irrésistible. Lyon a la chance d'être entourée d'une nature généreuse, entre les monts du Lyonnais, le massif du Jura et les Alpes qui pointent leur nez à l'horizon. Des eaux cristallines d'Aiguebelette aux aménagements ludiques du Grand Parc, voici notre guide ultime pour une escapade rafraîchissante.",
  "spots": [
    {
      "code": "REPLACE_WITH_REAL_CODE_1",
      "name": "Le Lac d'Aiguebelette",
      "city": "Aiguebelette-le-Lac",
      "type": "Lac",
      "score": 4.8,
      "image": "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80",
      "description": [
        "Véritable perle émeraude nichée au pied de la chaîne de l'Épine, le lac d'Aiguebelette est une exception française. Ce qui frappe dès l'arrivée, c'est le calme absolu : ici, les moteurs à essence sont interdits. On n'y entend que le clapotis de l'eau contre les coques des barques de pêcheurs et le chant des oiseaux.",
        "L'eau y est particulièrement chaude, atteignant souvent les 26-28°C en plein mois d'août. Les plages de sable fin ou de pelouse, comme celle de Bon Vent, offrent un cadre idéal pour les familles. C'est l'endroit parfait pour louer un paddle et partir explorer les petites îles mystérieuses au centre du lac."
      ],
      "lat": 45.5447,
      "lng": 5.8027,
      "distance": "95 km (1h de Lyon)",
      "facilities": ["Plages surveillées", "WC", "Douches"],
      "note": "L'accès aux plages est payant durant la saison estivale."
    },
    {
      "code": "REPLACE_WITH_REAL_CODE_2",
      "name": "Le Grand Parc de Miribel-Jonage",
      "city": "Vaulx-en-Velin",
      "type": "Lac",
      "score": 4.5,
      "image": "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&q=80",
      "description": [
        "À deux pas de Lyon, le Grand Parc est LA solution miracle pour les citadins en quête de fraîcheur sans perdre une journée sur la route. Avec ses 350 hectares, c'est un véritable poumon vert équipé de trois plages aménagées sur le lac des Eaux Bleues.",
        "L'atout majeur ? La plage de l'Atol' et ses infrastructures : toboggans aquatiques, trampolines, terrain de beach-volley... Les enfants s'en donnent à cœur joie pendant que les parents se prélassent sur le sable. Parfait pour un dimanche après-midi improvisé."
      ],
      "lat": 45.7864,
      "lng": 5.0233,
      "distance": "15 km (20 min de Lyon)",
      "facilities": ["Snack", "Location de pédalos", "Aire de jeux"]
    },
    {
      "code": "REPLACE_WITH_REAL_CODE_3",
      "name": "Lac de Nantua",
      "city": "Nantua",
      "type": "Lac",
      "score": 4.3,
      "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      "description": [
        "Niché dans une cluse spectaculaire du massif du Jura, le lac de Nantua offre un décor de carte postale avec ses falaises calcaires qui plongent dans une eau turquoise. Cette ancienne langue glaciaire est bordée d'une promenade ombragée parfaite pour une balade digestive après une dégustation de quenelles, spécialité locale.",
        "La baignade y est agréable en été, avec une eau qui monte jusqu'à 24°C. La plage municipale dispose d'une zone délimitée et surveillée. Pour les plus aventureux, des sentiers de randonnée partent du lac et permettent de prendre de la hauteur pour admirer le panorama."
      ],
      "lat": 46.1519,
      "lng": 5.6089,
      "distance": "75 km (1h de Lyon)",
      "facilities": ["Plage surveillée", "Parking gratuit"],
      "note": "Pensez à goûter les fameuses quenelles de Nantua après votre baignade !"
    }
  ],
  "proTips": [
    {
      "title": "Conseil d'expert : Le départ matinal",
      "content": "Pour Aiguebelette comme pour Annecy, les parkings saturent dès 10h30 le week-end. Visez une arrivée à 9h00 : vous profiterez du lac miroir, d'une place de choix à l'ombre et d'une tranquillité royale avant l'arrivée des foules citadines.",
      "icon": "tips_and_updates"
    }
  ],
  "generatedAt": "2024-06-15T10:00:00Z",
  "canonicalUrl": "https://yoursite.com/p/swimming-near-lyon",
  "ogImage": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
}
```

**Step 3: Update spot codes with real values**

Manually replace `REPLACE_WITH_REAL_CODE_1`, `REPLACE_WITH_REAL_CODE_2`, `REPLACE_WITH_REAL_CODE_3` with actual spot codes from your geojson.json file.

**Step 4: Commit**

```bash
git add public/landing-pages/
git commit -m "feat(data): add mock swimming-near-lyon landing page

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Manual Testing

**Step 1: Start the development server**

Run: `npm start` or `ng serve`

**Step 2: Test the landing page**

Visit: `http://localhost:4200/p/swimming-near-lyon`

Expected:
- Hero section displays with title, subtitle, badge, and author
- Intro paragraph appears
- 3 spot cards display with images, descriptions, and info sidebars
- Pro tip callout appears after first spot
- All "Voir l'itinéraire sur la carte" buttons link to `/spot/:code`

**Step 3: Test 404 handling**

Visit: `http://localhost:4200/p/non-existent-page`

Expected: Redirects to 404 page

**Step 4: Test SEO metadata**

View page source: `view-source:http://localhost:4200/p/swimming-near-lyon`

Expected:
- `<title>` tag contains landing page title
- Meta description present
- Canonical URL present
- JSON-LD structured data with ItemList schema present

**Step 5: Test responsive design**

Resize browser to mobile width

Expected:
- Info sidebar stacks below content on mobile
- Hero text remains readable
- Navigation collapses appropriately

---

## Task 11: Final Commit and Documentation

**Step 1: Update AGENTS.md if needed**

Check if any new patterns or conventions should be documented.

**Step 2: Final commit**

```bash
git add .
git commit -m "feat: complete SEO landing pages implementation

- Add /p/:slug routes with resolver for SSR optimization
- Create modular UI components for hero, spot cards, callouts
- Implement full SEO metadata with structured data
- Add mock landing page for swimming-near-lyon

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Verification Checklist

Before marking complete, verify:

- [ ] Route `/p/swimming-near-lyon` loads successfully
- [ ] Hero section renders with all elements
- [ ] All 3 spot cards render with images and info sidebars
- [ ] Pro tip callout displays between spots
- [ ] Links to `/spot/:code` work correctly
- [ ] 404 handling works for invalid slugs
- [ ] SEO metadata appears in page source
- [ ] JSON-LD structured data is valid
- [ ] Mobile layout works correctly
- [ ] No console errors
- [ ] All files committed to git
