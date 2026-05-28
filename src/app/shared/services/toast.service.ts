import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error';

export interface Toast {
  text: string;
  variant: ToastVariant;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly current = signal<Toast | null>(null);
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  show(text: string, variant: ToastVariant = 'success', durationMs = 2500): void {
    this.current.set({ text, variant });

    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.current.set(null);
      this.timeoutId = null;
    }, durationMs);
  }
}
