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

  editMatn(catId: number, chapterId: number, babId: number, hId: number, matnBase64: string): Observable<any> {
    const body = { cat_id: catId, chapter_id: chapterId, bab_id: babId, h_id: hId, matn_base64: matnBase64 };
    return this.http.post(`${this.baseUrl}/editmatn`, body);
  }
}
