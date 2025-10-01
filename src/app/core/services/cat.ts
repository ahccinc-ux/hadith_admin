import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CatService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/cat';

  searchByIndex(indexId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/search`, { _index_book: indexId });
  }
}


