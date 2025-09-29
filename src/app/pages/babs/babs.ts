import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BabService } from '../../core/services/bab';
@Component({
  selector: 'app-babs',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container" dir="rtl">
      <header class="header">
        <a class="back" [routerLink]="['/chapters', catId()]" [queryParams]="{ name: parentName(), book: bookName() }" aria-label="رجوع">← رجوع</a>
        <h1>الأبواب - {{ chapterName() }}</h1>
      </header>

      <ng-container *ngIf="!error(); else errorTpl">
        <section *ngIf="loaded(); else loadingTpl">
          <div *ngIf="items().length; else emptyTpl" class="grid">
            <article class="card" *ngFor="let bab of items()" [routerLink]="['/hadith', catId(), chapterId(), bab.bab_id]" [queryParams]="{ book: bookName(), chapter: chapterName(), bab: bab.name }" tabindex="0">
              <div class="card-inner">
                <div class="card-face card-front">
                  <div class="name">{{bab.name }}</div>
                  <div class="meta">رقم الباب: {{bab.bab_id }}</div>
                </div>
                <div class="card-face card-back">
                  <div class="back-title">{{ bab.name }}</div>
                  <div class="back-meta">اضغط للانتقال إلى الأحاديث</div>
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
        <div class="state empty">لا توجد أبواب لعرضها.</div>
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
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
    .card { background: transparent; border-radius: 12px; cursor: pointer; perspective: 1000px; outline: none; }
    .card-inner { position: relative; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.08); transition: transform .6s; transform-style: preserve-3d; background: white; padding: 16px; }
    .card:hover .card-inner, .card:focus-visible .card-inner { transform: rotateY(180deg); box-shadow: 0 8px 20px rgba(0,0,0,.15); }
    .card-face { position: relative; border-radius: 12px; backface-visibility: hidden; -webkit-backface-visibility: hidden; min-height: 90px; display: flex; flex-direction: column; justify-content: center; }
    .card-front { background: white; }
    .card-back { position: absolute; inset: 0; transform: rotateY(180deg); background: #f8fbff; color: #1d4ed8; display: grid; place-items: center; text-align: center; padding: 16px; }
    .back-title { font-weight: 700; margin-bottom: 6px; color: #111827; }
    .back-meta { font-size: 13px; color: #334155; }
    .name { font-weight: 700; color: #111827; margin-bottom: 6px; }
    .meta { color: #64748b; font-size: 12px; }
    /* pagination removed */
    .state { display: flex; align-items: center; gap: 8px; color: #334155; }
    .state.error { color: #b91c1c; }
    .state.empty { color: #64748b; }
    .spinner { width: 14px; height: 14px; border: 2px solid #e2e8f0; border-top-color: #347AE2; border-radius: 50%; display: inline-block; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `
})
export class BabsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(BabService);

  readonly items = signal<any[]>([]);
  readonly loaded = signal<boolean>(false);
  readonly error = signal<boolean>(false);
  readonly catId = signal<number>(0);
  readonly chapterId = signal<number>(0);
  readonly chapterName = signal<string>('');
  readonly parentName = signal<string>('');
  readonly bookName = signal<string>('');

  readonly page = signal<number>(-1);
  readonly rowsPerPage = signal<number>(-1);

  constructor() {
    const catIdStr = this.route.snapshot.paramMap.get('catId') ?? '0';
    const chapterIdStr = this.route.snapshot.paramMap.get('chapterId') ?? '0';
    this.catId.set(Number(catIdStr) || 0);
    this.chapterId.set(Number(chapterIdStr) || 0);
    this.chapterName.set(this.route.snapshot.queryParamMap.get('name') ?? '');
    this.parentName.set(this.route.snapshot.queryParamMap.get('parent') ?? '');
    this.bookName.set(this.route.snapshot.queryParamMap.get('book') ?? '');
    this.loadPage();
  }

  loadPage() {
    const pageNumber = this.page();
    const rows = this.rowsPerPage();
    this.loaded.set(false);
    this.api.searchPaging(this.catId(), this.chapterId(), pageNumber, rows).subscribe({
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

  // pagination removed
}


