import {
  Component,
  OnInit,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import {
  SwimmingSpotMapService,
  SwimmingSpotGeoJSON,
} from '@data/swimming-spot-map.service';
import { SwimmingSpotsService } from '@data/swimming-spots.service';
import { isPlatformBrowser } from '@angular/common';
import type { Map, MapboxOptions } from 'mapbox-gl';
import { environment } from '../../../environments/environment';
import { spotTypeMapping } from './spot-type-mapping';
import {
  SwimmingSpotType,
  SwimmingSpot,
} from '@app/shared/models/swimming-spot.model';
import { SwimmingSpotDrawerComponent } from './swimming-spot-drawer/swimming-spot-drawer.component';

// Déclaration de mapboxgl comme variable globale
declare const mapboxgl: any;

@Component({
  selector: 'app-map',
  imports: [SwimmingSpotDrawerComponent],
  providers: [SwimmingSpotMapService, SwimmingSpotsService],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements OnInit, AfterViewInit {
  private map!: Map;
  private swimmingSpotsGeoJSON: SwimmingSpotGeoJSON | null = null;
  private mapInitialized = false;

  // Propriétés pour le drawer
  selectedSpot: SwimmingSpot | null = null;

  // Propriété pour la légende dynamique
  legendItems: Array<{ color: string; label: string }> = [];

  constructor(
    private swimmingSpotMapService: SwimmingSpotMapService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.generateLegendItems();
    this.loadSwimmingSpotsGeoJSON();
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
      })
    );
  }

  private loadSwimmingSpotsGeoJSON(): void {
    this.swimmingSpotMapService.getSwimmingSpotsGeoJSON().subscribe({
      next: (geoJSON) => {
        console.log(
          `GeoJSON récupéré: ${geoJSON.features.length} points de baignade`
        );
        this.swimmingSpotsGeoJSON = geoJSON;
        this.addSwimmingSpotsLayer();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du GeoJSON :', error);
      },
    });
  }

  private async initMap(): Promise<void> {
    if (this.mapInitialized) return;

    if (typeof mapboxgl === 'undefined') {
      console.error("mapboxgl n'est pas disponible");
      return;
    }

    const mapOptions: MapboxOptions = {
      accessToken: environment.mapbox.accessToken,
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [2.2137, 46.2276],
      zoom: 6,
      attributionControl: false,
    };

    this.map = new mapboxgl.Map(mapOptions);
    this.mapInitialized = true;

    this.map.on('load', () => {
      this.addSwimmingSpotsLayer();
      this.map.resize();
    });
  }

  private addSwimmingSpotsLayer(): void {
    if (!this.map || !this.swimmingSpotsGeoJSON) return;

    this.map.addSource('swimming-spots', {
      type: 'geojson',
      data: this.swimmingSpotsGeoJSON,
    });

    const colorArray = Object.entries(spotTypeMapping).flatMap(
      ([key, value]) => [key, value.color]
    );

    this.map.addLayer({
      id: 'swimming-spots-circles',
      type: 'circle',
      source: 'swimming-spots',
      paint: {
        'circle-radius': 8,
        'circle-color': [
          'match',
          ['get', 'type'],
          ...colorArray,
          '#9B9B9B', // default color
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    });

    // Ajouter l'événement de clic sur les points de baignade
    this.map.on('click', 'swimming-spots-circles', (e: any) => {
      if (e.features.length > 0) {
        const feature = e.features[0];
        const properties = feature.properties;

        // Créer un objet SwimmingSpot à partir des propriétés du GeoJSON
        const swimmingSpot: SwimmingSpot = {
          region: properties.region,
          department: properties.department,
          code: properties.code,
          situationUpdate: properties.situationUpdate,
          name: properties.name,
          insee: properties.insee,
          city: properties.city,
          ueDeclarationDate: properties.ueDeclarationDate,
          type: properties.type as SwimmingSpotType,
          lng: properties.lng,
          lat: properties.lat,
        };

        this.openDrawer(swimmingSpot);
      }
    });

    // Changer le curseur au survol des points
    this.map.on('mouseenter', 'swimming-spots-circles', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', 'swimming-spots-circles', () => {
      this.map.getCanvas().style.cursor = '';
    });
  }

  openDrawer(spot: SwimmingSpot): void {
    this.selectedSpot = spot;
  }

  closeDrawer(): void {
    this.selectedSpot = null;
  }
}
