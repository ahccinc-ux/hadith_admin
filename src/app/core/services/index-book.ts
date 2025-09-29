import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IndexBook {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/indexbook';

  search(): Observable<any> {
    return this.http.post(`${this.baseUrl}/search`, {});
  }
}
