import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type ChipColor = 'green' | 'yellow' | 'orange';

@Component({
  selector: 'app-chip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.css',
})
export class ChipComponent {
  color = input<ChipColor>('green');

  colorClass = computed(() => {
    const color = this.color();
    return `bg-${color}-100 text-${color}-700 dark:bg-${color}-900/40 dark:text-${color}-300`;
  });
}
