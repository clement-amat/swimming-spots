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
import { SwimmingSpotType } from '@app/shared/models/swimming-spot.model';

@Component({
  selector: 'app-map',
  imports: [],
  providers: [SwimmingSpotMapService, SwimmingSpotsService],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements OnInit, AfterViewInit {
  private map!: Map;
  private swimmingSpotsGeoJSON: SwimmingSpotGeoJSON | null = null;
  private mapInitialized = false;

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

    const mapboxgl = await import('mapbox-gl');

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
  }
}
