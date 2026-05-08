# SEO Landing Pages Design

**Date:** 2026-02-28
**Status:** Approved
**Purpose:** Create dynamic `/p/{slug}` routes for SEO-optimized landing pages showcasing curated swimming spot collections

## Overview

Implement SEO landing pages targeting specific search queries (e.g., "swimming spots near Lyon") to drive organic traffic. Landing pages will feature standalone layouts with curated content and link to existing spot detail pages.

## Goals

- Drive organic search traffic through SEO-optimized landing pages
- Provide curated, editorial-style content about swimming spots
- Maintain fast SSR performance with complete HTML in first response
- Create reusable component architecture for future landing pages

## Architecture

### Route Pattern
- Path: `/p/:slug`
- Example: `/p/swimming-near-lyon`
- Uses route resolver to fetch data before rendering (critical for SSR/SEO)
- Returns 404 if JSON file not found

### File Structure

```
src/app/pages/landing-page/
├── landing-page.component.ts          # Page component
├── landing-page.component.html
├── landing-page.resolver.ts           # Route resolver

src/app/shared/ui/
├── landing-hero/
│   ├── landing-hero.component.ts
│   └── landing-hero.component.html
├── landing-spot-card/
│   ├── landing-spot-card.component.ts
│   └── landing-spot-card.component.html
└── pro-tip-callout/
    ├── pro-tip-callout.component.ts
    └── pro-tip-callout.component.html

src/app/shared/data/
└── landing-page.service.ts            # Data fetching service

src/app/shared/models/
└── landing-page.model.ts              # TypeScript interfaces

public/landing-pages/
└── swimming-near-lyon.json            # Static JSON files (one per landing page)
```

## Data Model

### LandingPageData (Main)
```typescript
interface LandingPageData {
  slug: string;
  hero: LandingPageHero;
  introText: string;
  title: string;              // SEO title
  description: string;        // SEO meta description
  spotsCount: number;
  spots: LandingPageSpot[];
  proTips?: ProTip[];
  generatedAt: string;
  canonicalUrl?: string;
  ogImage?: string;
}
```

### LandingPageHero
```typescript
interface LandingPageHero {
  title: string;
  subtitle: string;
  image: string;
  badge?: string;             // e.g., "Édition Été 2024"
  author?: {
    name: string;
    title: string;
    avatar: string;
  };
}
```

### LandingPageSpot
```typescript
interface LandingPageSpot {
  code: string;               // Links to /spot/:code
  name: string;
  city: string;
  type: string;
  score: number;
  image: string | null;
  description: string[];      // Multiple paragraphs
  lat: number;
  lng: number;
  distance?: string;          // e.g., "95 km (1h de Lyon)"
  facilities?: string[];      // e.g., ["Plages surveillées", "WC"]
  note?: string;              // Additional info
}
```

### ProTip
```typescript
interface ProTip {
  title: string;
  content: string;
  icon?: string;              // Material icon name
}
```

## Component Design

### LandingPageComponent (Container)
**Responsibility:** Orchestrate page rendering and SEO setup

- Receives resolved `LandingPageData` from route
- Standalone layout (does NOT use LayoutComponent)
- Sets SEO metadata via `SeoService` in `ngOnInit`
- Passes data to child components
- Renders custom header/navigation matching template

### LandingHeroComponent
**Responsibility:** Hero section with title, image, author

**Inputs:**
- `hero: LandingPageHero`

**Template Features:**
- Full-height hero with background image overlay
- Centered title and subtitle
- Optional badge chip
- Optional author card with avatar
- Tailwind styling matching developer-resources/landing template

### LandingSpotCardComponent
**Responsibility:** Individual numbered spot presentation

**Inputs:**
- `spot: LandingPageSpot`
- `index: number` (for numbering: 01, 02, etc.)

**Template Features:**
- Large spot number (01, 02, etc.)
- Spot name as heading
- Hero image
- Multiple description paragraphs
- Sticky info sidebar (desktop) with:
  - Distance icon + value
  - Facilities icon + list
  - Optional note
- "Voir l'itinéraire sur la carte" button → links to `/spot/${spot.code}`

### ProTipCalloutComponent
**Responsibility:** Expert tip callouts between spots

**Inputs:**
- `proTip: ProTip`

**Template Features:**
- Highlighted card with icon
- Title and content
- Decorative background elements

## Data Flow

```
User visits /p/swimming-near-lyon
         ↓
Angular Router activates route
         ↓
LandingPageResolver runs BEFORE component
         ↓
Calls LandingPageService.getLandingPage('swimming-near-lyon')
         ↓
HttpClient.get('/landing-pages/swimming-near-lyon.json')
         ↓
┌─────────────────────┬──────────────────────┐
│ Success (200)       │ Not Found (404)      │
├─────────────────────┼──────────────────────┤
│ Validate JSON       │ Resolver returns null│
│ Return data         │ Router shows 404     │
│ Component renders   │                      │
│ Full HTML in SSR    │                      │
└─────────────────────┴──────────────────────┘
```

### Why Resolver Pattern?

Critical for SEO:
- Data fetched BEFORE component initialization
- SSR generates complete HTML (no loading states)
- Search engines see full content immediately
- Better Core Web Vitals (no content shifts)

## Error Handling

### Missing JSON File (404)
- `HttpClient` throws 404 error
- `LandingPageService` catches error, returns null
- `LandingPageResolver` returns null
- Angular router displays 404 page
- Proper HTTP 404 status code for SEO

### Invalid JSON Structure
- Service validates required fields
- Returns null if validation fails
- Falls back to 404 page

### Missing Images
- Use placeholder or skip image rendering
- Don't break page layout

## SEO Implementation

### Metadata Setup
In `LandingPageComponent.ngOnInit()`:

```typescript
this.seoService.setTitle(data.title);
this.seoService.setMetaData({
  description: data.description,
  canonicalUrl: data.canonicalUrl || `https://yoursite.com/p/${data.slug}`,
  image: data.ogImage,
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: data.title,
    numberOfItems: data.spotsCount,
    itemListElement: data.spots.map((spot, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Place',
        name: spot.name,
        url: `https://yoursite.com/spot/${spot.code}`
      }
    }))
  }
});
```

### SEO Features
- Page title and meta description from JSON
- Canonical URL to prevent duplicate content
- Open Graph image for social sharing
- JSON-LD structured data (ItemList schema)
- Internal links to spot detail pages (crawlable)
- SSR ensures content in HTML source

## Mock Data

### First Example: Swimming Near Lyon

**File:** `public/landing-pages/swimming-near-lyon.json`

**Spot Selection:**
- Use real spot codes from existing `geojson.json`
- Select 10 spots near Lyon (Rhône-Alpes region)
- Include variety: lakes, rivers, beaches
- Add editorial descriptions, distances, facilities

**Content:**
- Hero: "Où se baigner près de Lyon ? Les 10 spots les plus proches !"
- Intro paragraph about Lyon's surrounding nature
- Each spot gets detailed editorial description
- Include 1-2 pro tip callouts

## Routing Configuration

Add to `src/app/app.routes.ts`:

```typescript
{
  path: 'p/:slug',
  loadComponent: () =>
    import('./pages/landing-page/landing-page.component').then(
      (m) => m.LandingPageComponent
    ),
  resolve: {
    landingPage: LandingPageResolver
  }
}
```

## Design Principles

Following AGENTS.md guidelines:

1. **Angular 19 Best Practices**
   - Standalone components
   - Signals where applicable
   - Services for data logic
   - No code comments

2. **Responsive Design**
   - Mobile-first approach
   - Sticky sidebars desktop-only
   - Touch-friendly buttons
   - Responsive images

3. **Code Reusability**
   - Shared components (hero, spot card, callout)
   - Service-based data fetching
   - Consistent Tailwind patterns

4. **SEO Focus**
   - SSR-optimized with resolver
   - Semantic HTML
   - Structured data
   - Fast load times

## Future Considerations

Not in MVP but possible later:
- Generate landing pages from CMS or admin panel
- A/B testing different layouts
- Analytics tracking for conversion optimization
- Pagination for very long lists
- Filtering/sorting within landing page

## Success Metrics

- Landing page renders with complete HTML in SSR response
- All spot links navigate to correct detail pages
- SEO metadata appears in page source
- Mobile and desktop layouts work correctly
- 404 handling works for invalid slugs
