import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-spot-map-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spot-map-card.component.html',
  styleUrl: './spot-map-card.component.css',
})
export class SpotMapCardComponent {
  lat = input.required<string>();
  lng = input.required<string>();

  coordinates = computed(() => {
    const latNum = parseFloat(this.lat());
    const lngNum = parseFloat(this.lng());
    const latDir = latNum >= 0 ? 'N' : 'S';
    const lngDir = lngNum >= 0 ? 'E' : 'W';
    return `${Math.abs(latNum).toFixed(4)}° ${latDir}, ${Math.abs(lngNum).toFixed(4)}° ${lngDir}`;
  });

  mapImageUrl = computed(() => {
    const lat = this.lat();
    const lng = this.lng();
    return `https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/pin-l+359EFF(${lng},${lat})/${lng},${lat},13,0/400x300@2x?access_token=${environment.mapbox.accessToken}`;
  });
}
