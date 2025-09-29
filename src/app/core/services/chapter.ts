import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChapterService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/chapter';

  searchByCat(catId: number): Observable<any> {
    const body = { sc: { cat_id: catId }, paging: { rowsPerPage: -1, pageNumber: -1 } };
    return this.http.post(`${this.baseUrl}/searchpaging`, body);
  }
}


