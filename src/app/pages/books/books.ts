import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CatService } from '../../core/services/cat';

@Component({
  selector: 'app-books',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container" dir="rtl">
      <header class="header">
        <a class="back" routerLink="/" aria-label="رجوع">← رجوع</a>
        <h1>الكتب - {{ categoryName() }}</h1>
      </header>

      <ng-container *ngIf="!error(); else errorTpl">
        <section *ngIf="loaded(); else loadingTpl">
          <div *ngIf="items().length; else emptyTpl" class="grid">
            <article class="book-card" *ngFor="let book of items()" [routerLink]="['/chapters', book.id]" [queryParams]="{ name: categoryName(), book: book.name }" tabindex="0">
              <div class="book-card-inner">
                <div class="book-face book-front">
                  <img class="cover" [src]="'https://hadithportal.com/upload/' + book.cover_image" [alt]="book.name" />
                  <div class="content">
                    <div class="title" [title]="book.name">{{ book.name }}</div>
                    <div class="author" *ngIf="book.full_writer_name">{{ book.full_writer_name }}</div>
                  </div>
                </div>
                <div class="book-face book-back">
                  <div class="back-title">{{ book.name }}</div>
                  <div class="back-meta">اضغط للانتقال إلى الفصول</div>
                </div>
              </div>
            </article>
          </div>
        </section>
      </ng-container>

      <ng-template #loadingTpl>
        <div class="state loading"><span class="spinner" aria-hidden="true"></span><span>جاري التحميل...</span></div>
      </ng-template>
      <ng-template #emptyTpl>
        <div class="state empty">لا توجد كتب لعرضها.</div>
      </ng-template>
      <ng-template #errorTpl>
        <div class="state error">حدث خطأ أثناء جلب البيانات. حاول مجدداً.</div>
      </ng-template>
    </div>
  `,
  styles: `
    .container { padding: 24px; }
    .header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .back { color: #334155; text-decoration: none; background: #f1f5f9; padding: 6px 10px; border-radius: 8px; transition: background-color .2s ease, color .2s ease, transform .2s ease, box-shadow .2s ease; }
    .back:hover, .back:focus-visible { background: #e8f0fe; color: #1d4ed8; transform: translateY(-1px); box-shadow: 0 4px 10px rgba(0,0,0,.08); outline: 2px solid #347AE2; outline-offset: 2px; }
    h1 { margin: 0; font-size: 22px; color: #347AE2; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .book-card { background: transparent; border-radius: 12px; cursor: pointer; perspective: 1000px; outline: none; }
    .book-card-inner { position: relative; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,.08); transform-style: preserve-3d; background: white; overflow: hidden; }
    .book-card:hover .book-card-inner, .book-card:focus-visible .book-card-inner { box-shadow: 0 12px 28px rgba(0,0,0,.18); }
    .book-face { position: relative; border-radius: 12px; backface-visibility: hidden; -webkit-backface-visibility: hidden; min-height: 380px; display: flex; flex-direction: column; transition: transform .6s; }
    .book-front { background: white; transform: rotateY(0deg); }
    .book-back { position: absolute; inset: 0; transform: rotateY(180deg); background: #f8fbff; color: #1d4ed8; display: grid; place-items: center; text-align: center; padding: 16px; }
    .book-card:hover .book-front, .book-card:focus-visible .book-front { transform: rotateY(-180deg); }
    .book-card:hover .book-back, .book-card:focus-visible .book-back { transform: rotateY(0deg); }
    .back-title { font-weight: 700; margin-bottom: 6px; color: #111827; }
    .back-meta { font-size: 13px; color: #334155; }
    .cover { width: 100%; height: 320px; object-fit: contain; background: #ffffff; }
    .content { padding: 14px 16px; }
    .title { font-weight: 700; color: #111827; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .author { color: #64748b; font-size: 13px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .state { display: flex; align-items: center; gap: 8px; color: #334155; }
    .state.error { color: #b91c1c; }
    .state.empty { color: #64748b; }
    .spinner { width: 14px; height: 14px; border: 2px solid #e2e8f0; border-top-color: #347AE2; border-radius: 50%; display: inline-block; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 640px) {
      .grid { grid-template-columns: 1fr; }
      .cover { height: 260px; }
    }
  `
})
export class BooksPage {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(CatService);

  readonly items = signal<any[]>([]);
  readonly loaded = signal<boolean>(false);
  readonly error = signal<boolean>(false);
  readonly categoryName = signal<string>('');

  constructor() {
    const indexId = this.route.snapshot.paramMap.get('indexId') ?? '';
    this.categoryName.set(this.route.snapshot.queryParamMap.get('name') ?? '');
    this.api.searchByIndex(indexId).subscribe({
      next: res => {
        const grid = res?.gridData ?? [];
        this.items.set(grid);
        this.loaded.set(true);
      },
      error: () => {
        this.error.set(true);
        this.loaded.set(true);
      }
    });
  }
}


