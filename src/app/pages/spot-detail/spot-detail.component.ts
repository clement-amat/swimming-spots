import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SwimmingSpotsService } from '@app/shared/data/swimming-spots.service';
import { SwimmingSpot } from '@app/shared/models/swimming-spot.model';
import { SwimmingSpotDetailComponent } from '@app/shared/ui/swimming-spot-detail/swimming-spot-detail.component';

@Component({
  selector: 'app-spot-detail',
  standalone: true,
  imports: [CommonModule, SwimmingSpotDetailComponent],
  templateUrl: './spot-detail.component.html',
  styleUrl: './spot-detail.component.css',
})
export class SpotDetailComponent implements OnInit {
  swimmingSpot: SwimmingSpot | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private swimmingSpotsService: SwimmingSpotsService
  ) {}

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code');

    if (!code) {
      this.loading = false;
      return;
    }

    const navigationState = history.state;
    if (navigationState?.swimmingSpot) {
      this.swimmingSpot = navigationState.swimmingSpot;
      this.loading = false;
      return;
    }

    this.swimmingSpotsService.getSwimmingSpotByCode(code).subscribe({
      next: (spot) => {
        this.swimmingSpot = spot;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du spot:', error);
        this.loading = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
