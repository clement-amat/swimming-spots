import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  effect,
} from '@angular/core';
import { SwimmingSpotsService } from '@data/swimming-spots.service';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { takeUntilDestroyed as takeUntilDestroyedRxjs } from '@angular/core/rxjs-interop';
import type { Map, MapboxOptions } from 'mapbox-gl';
import { environment } from '../../../environments/environment';
import { spotTypeMapping } from './spot-type-mapping';
import {
  SwimmingSpotType,
  SwimmingSpot,
} from '@app/shared/models/swimming-spot.model';
import { SwimmingSpotDrawerComponent } from './swimming-spot-drawer/swimming-spot-drawer.component';
import { SwimmingSpotGeoJSON } from '@app/shared/models/swimming-spot-geojson.model';
import { MapControlService } from '@app/shared/maps/map-control.service';
import { MapFiltersComponent } from '@app/shared/ui/map-filters/map-filters.component';
import { MapFiltersService } from '@app/shared/services/map-filters.service';
import {
  BASE_URL,
  DEFAULT_LOGO,
  HOMEPAGE_DESCRIPTION,
  HOMEPAGE_TITLE,
  SeoService,
} from '@app/shared/seo/seo.service';
import {
  buildCircleRadiusExpression,
  buildCircleOpacityExpression,
  buildCircleStrokeWidthExpression,
} from './map-visibility.config';

// Déclaration de mapboxgl comme variable globale
declare const mapboxgl: any;

@Component({
  selector: 'app-map',
  imports: [SwimmingSpotDrawerComponent, MapFiltersComponent],
  providers: [SeoService],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  private map!: Map;
  private swimmingSpotsGeoJSON: SwimmingSpotGeoJSON | null = null;
  private mapInitialized = false;
  private isMobile = false;

  selectedSpot: SwimmingSpot | null = null;

  legendItems: Array<{ color: string; label: string }> = [];

  constructor(
    private swimmingSpotsService: SwimmingSpotsService,
    private mapControlService: MapControlService,
    private mapFiltersService: MapFiltersService,
    private seoService: SeoService,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.mapControlService
      .onCenterMap()
      .pipe(takeUntilDestroyed())
      .subscribe((coordinates) => {
        this.centerMapOn(coordinates.lon, coordinates.lat);
      });

    this.breakpointObserver
      .observe(['(max-width: 768px)'])
      .pipe(takeUntilDestroyedRxjs())
      .subscribe((result) => {
        this.isMobile = result.matches;
      });

    effect(() => {
      const activeFilters = this.mapFiltersService.activeFilters();
      if (this.mapInitialized && this.swimmingSpotsGeoJSON) {
        this.applyFilters();
      }
    });
  }

  ngOnInit(): void {
    this.seoService.setTitle(HOMEPAGE_TITLE);
    this.seoService.setMetaData({
      description: HOMEPAGE_DESCRIPTION,
      canonicalUrl: BASE_URL,
      image: DEFAULT_LOGO,
      ogType: 'website',
      structuredData: this.seoService.buildHomepageStructuredData(HOMEPAGE_DESCRIPTION),
    });
    this.generateLegendItems();
    this.loadSwimmingSpotsGeoJSON();
  }

  private centerMapOn(lon: number, lat: number): void {
    if (!this.map || !this.mapInitialized) {
      console.warn('Map not initialized yet');
      return;
    }

    this.map.flyTo({
      center: [lon, lat],
      zoom: 11,
      essential: true,
      duration: 2000,
    });
  }

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId) && !this.mapInitialized) {
      await this.initMap();
    }
  }

  private generateLegendItems(): void {
    this.legendItems = Object.entries(spotTypeMapping).map(
      ([type, config]) => ({
        color: config.color,
        label: type,
      }),
    );
  }

  private loadSwimmingSpotsGeoJSON(): void {
    this.swimmingSpotsService.getSwimmingSpots().subscribe({
      next: (geoJSON) => {
        console.log(
          `GeoJSON récupéré: ${geoJSON.features.length} points de baignade`,
        );
        this.swimmingSpotsGeoJSON = geoJSON;
        this.addSwimmingSpotsLayer();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du GeoJSON :', error);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.map && this.mapInitialized) {
      const center = this.map.getCenter();
      this.mapControlService.saveMapState({
        center: [center.lng, center.lat],
        zoom: this.map.getZoom(),
      });
    }
    this.mapControlService.setMapReady(false);
  }

  private async initMap(): Promise<void> {
    if (this.mapInitialized) return;

    this.mapControlService.setMapReady(false);

    if (typeof mapboxgl === 'undefined') {
      console.error("mapboxgl n'est pas disponible");
      return;
    }

    const savedState = this.mapControlService.getSavedMapState();

    const mapOptions: MapboxOptions = {
      accessToken: environment.mapbox.accessToken,
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: savedState?.center ?? [2.2137, 46.2276],
      zoom: savedState?.zoom ?? 5,
      attributionControl: false,
    };

    this.map = new mapboxgl.Map(mapOptions);
    this.mapInitialized = true;

    this.map.on('load', () => {
      this.addSwimmingSpotsLayer();
      this.map.resize();
      this.mapControlService.setMapReady(true);
    });
  }

  private addSwimmingSpotsLayer(): void {
    if (!this.map || !this.swimmingSpotsGeoJSON) return;

    this.map.addSource('swimming-spots', {
      type: 'geojson',
      data: this.swimmingSpotsGeoJSON,
    });

    const colorArray = Object.entries(spotTypeMapping).flatMap(
      ([key, value]) => [key, value.color],
    );

    this.map.addLayer({
      id: 'swimming-spots-circles',
      type: 'circle',
      source: 'swimming-spots',
      layout: {
        'circle-sort-key': ['coalesce', ['get', 'score'], 0] as any,
      },
      paint: {
        'circle-radius': buildCircleRadiusExpression() as any,
        'circle-opacity': buildCircleOpacityExpression() as any,
        'circle-color': ['match', ['get', 'type'], ...colorArray, '#9B9B9B'],
        'circle-stroke-width': buildCircleStrokeWidthExpression() as any,
        'circle-stroke-opacity': buildCircleOpacityExpression() as any,
        'circle-stroke-color': '#ffffff',
      },
    });

    this.map.on('click', 'swimming-spots-circles', (e: any) => {
      if (e.features.length > 0) {
        const feature = e.features[0];
        const properties = feature.properties;

        const swimmingSpot: SwimmingSpot = {
          ...properties,
          images:
            typeof properties.images === 'string'
              ? JSON.parse(properties.images)
              : properties.images,
          siteDetails:
            typeof properties.images === 'string'
              ? JSON.parse(properties.siteDetails)
              : properties.siteDetails,
        };

        this.openDrawer(swimmingSpot);
      }
    });

    this.map.on('mouseenter', 'swimming-spots-circles', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', 'swimming-spots-circles', () => {
      this.map.getCanvas().style.cursor = '';
    });
  }

  openDrawer(spot: SwimmingSpot): void {
    if (this.isMobile) {
      this.router.navigate(['/spot', spot.slug], {
        state: { swimmingSpot: spot },
      });
    } else {
      this.selectedSpot = spot;
    }
  }

  closeDrawer(): void {
    this.selectedSpot = null;
  }

  private applyFilters(): void {
    if (!this.map || !this.swimmingSpotsGeoJSON) return;

    const activeFilters = this.mapFiltersService.activeFilters();
    const filteredGeoJSON = this.swimmingSpotsService.filteredGeoJSON(
      this.swimmingSpotsGeoJSON,
      activeFilters,
    );

    const source = this.map.getSource('swimming-spots') as any;
    if (source) {
      source.setData(filteredGeoJSON);
    }
  }
}
