import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
import { LandingPageData } from '@models/landing-page.model';

@Injectable({
  providedIn: 'root',
})
export class LandingPageService {
  private http = inject(HttpClient);

  getLandingPage(slug: string): Observable<LandingPageData | null> {
    return this.http
      .get<LandingPageData>(`/landing-pages/${slug}.json`)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error(`Landing page not found: ${slug}`, error);
          return of(null);
        })
      );
  }
}
