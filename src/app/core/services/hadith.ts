import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HadithService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/hadithneworg';

  search(catId: number, chapterId: number, babId: number): Observable<any> {
    const body = { cat_id: catId, chapter_id: chapterId, bab_id: babId };
    return this.http.post(`${this.baseUrl}/search`, body);
  }
}
