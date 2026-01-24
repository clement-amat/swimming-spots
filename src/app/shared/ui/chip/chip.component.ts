import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type ChipColor = 'green' | 'yellow' | 'orange';

const colorClassMap: Record<ChipColor, string> = {
  green: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  yellow:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  orange:
    'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
};

@Component({
  selector: 'app-chip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chip.component.html',
  styleUrl: './chip.component.css',
})
export class ChipComponent {
  color = input<ChipColor>('green');

  colorClass = computed(() => colorClassMap[this.color()]);
}
