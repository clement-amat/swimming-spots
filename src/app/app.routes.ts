import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { landingPageResolver } from './pages/landing-page/landing-page.resolver';
import { spotDetailResolver } from './pages/spot-detail/spot-detail.resolver';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/map/map.component').then((m) => m.MapComponent),
      },
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
        path: 'spot/:slug',
        loadComponent: () =>
          import('./pages/spot-detail/spot-detail.component').then(
            (m) => m.SpotDetailComponent
          ),
        resolve: {
          spot: spotDetailResolver,
        },
        runGuardsAndResolvers: 'paramsChange',
      },
      {
        path: 'spot/:slug/gallery',
        loadComponent: () =>
          import('./pages/spot-gallery/spot-gallery.component').then(
            (m) => m.SpotGalleryComponent
          ),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./pages/not-found/not-found.component').then(
            (m) => m.NotFoundComponent
          ),
      },
    ],
  },
];
