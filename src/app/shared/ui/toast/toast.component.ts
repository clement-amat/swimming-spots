import { Component, inject } from '@angular/core';
import { ToastService } from '@app/shared/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent {
  toast = inject(ToastService);
}
