import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IndexBook } from '../../core/services/index-book';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container" dir="rtl">
      <header class="header">
        <div class="titles">
          <h1>إدارة فهارس الكتب</h1>
          <p class="subtitle">قائمة الفهارس المسترجعة من الواجهة البرمجية</p>
        </div>
      </header>

      <ng-container *ngIf="!error(); else errorTpl">
        <section *ngIf="loaded(); else loadingTpl">
          <div *ngIf="items().length; else emptyTpl" class="grid">
            <article class="card" *ngFor="let item of items()" [routerLink]="['/books', item.id]" [queryParams]="{ name: item.name }" tabindex="0">
              <div class="card-inner">
                <div class="card-face card-front">
                  <div class="name" [title]="item.name">{{ item.name }}</div>
                  <div class="meta">
                    <span class="badge">معرّف: {{ item.id ?? item.indexBookId ?? '—' }}</span>
                  </div>
                </div>
                <div class="card-face card-back">
                  <div class="back-title">{{ item.name }}</div>
                  <div class="back-meta">اضغط للانتقال إلى الكتب</div>
                </div>
              </div>
            </article>
          </div>
        </section>
      </ng-container>

      <ng-template #loadingTpl>
        <div class="state loading">
          <span class="spinner" aria-hidden="true"></span>
          <span>جاري التحميل...</span>
        </div>
      </ng-template>

      <ng-template #emptyTpl>
        <div class="state empty">لا توجد بيانات لعرضها.</div>
      </ng-template>

      <ng-template #errorTpl>
        <div class="state error">حدث خطأ أثناء جلب البيانات. حاول مجدداً.</div>
      </ng-template>
    </div>
  `,
  styles: `
    .container { padding: 24px; }
    .header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .titles { display: flex; flex-direction: column; gap: 4px; }
    h1 { margin: 0; font-size: 22px; color: #347AE2; }
    .subtitle { margin: 0; color: #64748b; font-size: 13px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
    .card { background: transparent; border-radius: 12px; outline: none; cursor: pointer; perspective: 1000px; }
    .card-inner { position: relative; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.08); transition: transform .6s; transform-style: preserve-3d; background: white; }
    .card:hover .card-inner, .card:focus-visible .card-inner { transform: rotateY(180deg); box-shadow: 0 8px 20px rgba(0,0,0,.15); }
    .card-face { position: relative; padding: 16px; border-radius: 12px; backface-visibility: hidden; -webkit-backface-visibility: hidden; min-height: 92px; display: flex; flex-direction: column; justify-content: center; }
    .card-front { background: white; border-inline-start: 6px solid #e29c34; }
    .card-back { position: absolute; inset: 0; transform: rotateY(180deg); background: #f8fbff; border-inline-start: 6px solid #347AE2; color: #1d4ed8; text-align: center; }
    .back-title { font-weight: 700; margin-bottom: 6px; color: #111827; }
    .back-meta { font-size: 13px; color: #334155; }
    .card:focus { box-shadow: 0 0 0 2px rgba(52,122,226,.25), 0 1px 3px rgba(0,0,0,.08); }
    .card .name { color: #1a1a1a; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .card .meta { margin-top: 8px; color: #64748b; font-size: 12px; display: flex; gap: 8px; align-items: center; }
    .badge { background: #f1f5f9; color: #334155; padding: 2px 8px; border-radius: 999px; }
    .state { display: flex; align-items: center; gap: 8px; color: #334155; }
    .state.error { color: #b91c1c; }
    .state.empty { color: #64748b; }
    .spinner { width: 14px; height: 14px; border: 2px solid #e2e8f0; border-top-color: #347AE2; border-radius: 50%; display: inline-block; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `
})
export class Home {
  private readonly api = inject(IndexBook);
  readonly items = signal<any[]>([]);
  readonly error = signal<boolean>(false);
  readonly loaded = signal<boolean>(false);

  constructor() {
    this.api.search().subscribe({
      next: res => {
        const grid = (res?.gridData ?? []).filter((item: any) => item?.master_menu === 0);
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
