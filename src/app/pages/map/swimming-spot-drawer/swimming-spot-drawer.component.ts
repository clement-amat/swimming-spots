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
  SwimmingSpotImage,
  SwimmingSpotType,
} from '@app/shared/models/swimming-spot.model';
import { StatCardComponent } from '@app/shared/ui/card/stat-card/stat-card.component';
import { TagComponent } from '@app/shared/ui/tag/tag.component';
import { ChipComponent } from '@app/shared/ui/chip/chip.component';
import { WaterQualityChipsColorPipe } from '@app/shared/pipes/water-quality-chips-color.pipe';
import { WaterQualityLabelPipe } from '@app/shared/pipes/water-quality-label.pipe';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [CommonModule, StatCardComponent, TagComponent, ChipComponent, WaterQualityChipsColorPipe, WaterQualityLabelPipe],
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

  get images(): SwimmingSpotImage[] {
    return (this.swimmingSpot?.images || []).slice(0, 3);
  }
}
