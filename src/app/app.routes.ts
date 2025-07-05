import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { MapComponent } from './pages/map/map.component';

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
        path: 'spot/:id',
        loadComponent: () =>
          import('./pages/spot-detail/spot-detail.component').then(
            (m) => m.SpotDetailComponent
          ),
      },
    ],
  },
];
