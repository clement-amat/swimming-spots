import { Component, input } from '@angular/core';
import { ProTip } from '@models/landing-page.model';

@Component({
  selector: 'app-pro-tip-callout',
  standalone: true,
  templateUrl: './pro-tip-callout.component.html',
})
export class ProTipCalloutComponent {
  proTip = input.required<ProTip>();

  get iconName(): string {
    return this.proTip().icon || 'tips_and_updates';
  }
}
