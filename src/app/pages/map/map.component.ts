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

  constructor(
    private swimmingSpotMapService: SwimmingSpotMapService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadSwimmingSpotsGeoJSON();
  }

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId) && !this.mapInitialized) {
      await this.initMap();
    }
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
      console.log('Carte Mapbox chargée avec succès');
      this.addSwimmingSpotsLayer();
      this.map.resize();
    });
  }

  private addSwimmingSpotsLayer(): void {
    if (!this.map || !this.swimmingSpotsGeoJSON) return;

    console.log('Ajout de la couche des points de baignade...');

    // Ajouter la source GeoJSON
    this.map.addSource('swimming-spots', {
      type: 'geojson',
      data: this.swimmingSpotsGeoJSON,
    });

    // Ajouter la couche des cercles
    this.map.addLayer({
      id: 'swimming-spots-circles',
      type: 'circle',
      source: 'swimming-spots',
      paint: {
        'circle-radius': 8,
        'circle-color': [
          'match',
          ['get', 'type'],
          'Lac',
          '#4A90E2',
          'Rivière',
          '#50E3C2',
          'Mer',
          '#0077BE',
          'Étang',
          '#7ED321',
          'Piscine',
          '#F5A623',
          '#9B9B9B', // couleur par défaut
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    });

    console.log(
      `${this.swimmingSpotsGeoJSON.features.length} points de baignade ajoutés à la carte`
    );
  }
}
