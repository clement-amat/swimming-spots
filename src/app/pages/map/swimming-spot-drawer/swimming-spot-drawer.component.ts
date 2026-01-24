import {
  Component,
  input,
  output,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SwimmingSpot } from '@app/shared/models/swimming-spot.model';
import { SwimmingSpotDetailComponent } from '@app/shared/ui/swimming-spot-detail/swimming-spot-detail.component';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule, RouterModule, SwimmingSpotDetailComponent],
  templateUrl: './swimming-spot-drawer.component.html',
  styleUrl: './swimming-spot-drawer.component.css',
})
export class SwimmingSpotDrawerComponent {
  swimmingSpot = input<SwimmingSpot | null>(null);
  closeDrawer = output<void>();

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const drawer = document.querySelector('.drawer-container');

    if (this.swimmingSpot() && drawer && !drawer.contains(target)) {
      this.closeDrawer.emit();
    }
  }

  onCloseClick(event: Event): void {
    event.stopPropagation();
    this.closeDrawer.emit();
  }
}
