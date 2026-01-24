import { Component, input } from '@angular/core';
import { SiteDetails } from '@app/shared/models/swimming-spot.model';
import { TagComponent } from '@app/shared/ui/tag/tag.component';

@Component({
  selector: 'app-spot-facilities',
  standalone: true,
  imports: [TagComponent],
  templateUrl: './spot-facilities.component.html',
  styleUrl: './spot-facilities.component.css',
})
export class SpotFacilitiesComponent {
  siteDetails = input<SiteDetails | undefined>();
  columns = input<2 | 3>(2);
}
