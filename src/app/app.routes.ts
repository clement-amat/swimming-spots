import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { MapComponent } from './pages/map/map.component';
import { landingPageResolver } from './pages/landing-page/landing-page.resolver';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        component: MapComponent
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
