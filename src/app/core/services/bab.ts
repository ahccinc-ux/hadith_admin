import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BabService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/bab';

  searchPaging(catId: number, chapterId: number, pageNumber: number, rowsPerPage: number): Observable<any> {
    const body = {
      sc: { chapter_id: chapterId, cat_id: catId },
      paging: { pageNumber, rowsPerPage }
    };
    return this.http.post(`${this.baseUrl}/searchpaging`, body);
  }
}


