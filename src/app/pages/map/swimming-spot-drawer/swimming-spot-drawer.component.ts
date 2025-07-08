import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SwimmingSpot,
  SwimmingSpotType,
} from '@app/shared/models/swimming-spot.model';
import { SpotTypeIconPipe } from '@app/shared/pipes/spot-type-icon.pipe';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule, SpotTypeIconPipe],
  templateUrl: './swimming-spot-drawer.component.html',
  styleUrl: './swimming-spot-drawer.component.css',
})
export class SwimmingSpotDrawerComponent {
  @Input() swimmingSpot: SwimmingSpot | null = null;
  @Output() closeDrawer = new EventEmitter<void>();

  SwimmingSpotType = SwimmingSpotType;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const drawer = document.querySelector('.drawer-container');

    if (this.swimmingSpot && drawer && !drawer.contains(target)) {
      this.closeDrawer.emit();
    }
  }

  onCloseClick(event: Event): void {
    event.stopPropagation();
    this.closeDrawer.emit();
  }

  getSpotTypeLabel(type: SwimmingSpotType): string {
    return type;
  }

  getStatusColor(situationUpdate: string): string {
    switch (situationUpdate.toLowerCase()) {
      case 'excellent':
        return '#4CAF50';
      case 'bon':
        return '#8BC34A';
      case 'moyen':
        return '#FFC107';
      case 'mauvais':
        return '#F44336';
      case 'insuffisant':
        return '#9C27B0';
      default:
        return '#9E9E9E';
    }
  }
}
