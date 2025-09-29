import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HadithService } from '../../core/services/hadith';

@Component({
  selector: 'app-hadith',
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container" dir="rtl">
      <header class="header">
        <a class="back" [routerLink]="['/babs', catId(), chapterId()]" [queryParams]="{ name: chapterName(), parent: writerName(), book: bookName() }" aria-label="رجوع">← رجوع</a>
        <h1>الأحاديث</h1>
        <div class="meta">
          <div><strong>الكتاب:</strong> {{ writerName() }}</div>
          <div><strong>الفصل:</strong> {{ chapterName() }}</div>
          <div><strong>الباب:</strong> {{ babName() }}</div>
        </div>
      </header>

      <ng-container *ngIf="!error(); else errorTpl">
        <section *ngIf="loaded(); else loadingTpl">
          <div *ngIf="items().length; else emptyTpl" class="list">
            <article class="hadith" *ngFor="let it of items()" tabindex="0">
              <div class="actions">
                <button class="btn secondary" *ngIf="!isEditing(getId(it))" (click)="startEdit(it)">تحرير</button>
                <ng-container *ngIf="isEditing(getId(it))">
                  <button class="btn" (click)="saveEdit(it)">حفظ</button>
                  <button class="btn danger" (click)="cancelEdit(it)">إلغاء</button>
                </ng-container>
              </div>
              <div class="matn" *ngIf="!isEditing(getId(it))" [innerHTML]="it._hadithNewOrg?.matn"></div>
              <div class="editor" *ngIf="isEditing(getId(it))">
                <textarea [(ngModel)]="drafts[getId(it)]" rows="10"></textarea>
              </div>
            </article>
          </div>
        </section>
      </ng-container>

      <ng-template #loadingTpl>
        <div class="state loading"><span class="spinner" aria-hidden="true"></span><span>جاري التحميل...</span></div>
      </ng-template>
      <ng-template #emptyTpl>
        <div class="state empty">لا توجد أحاديث لعرضها.</div>
      </ng-template>
      <ng-template #errorTpl>
        <div class="state error">حدث خطأ أثناء جلب البيانات. حاول مجدداً.</div>
      </ng-template>
    </div>
  `,
  styles: `
    .container { padding: 24px; }
    .header { display: grid; grid-template-columns: 1fr; gap: 8px; margin-bottom: 16px; }
    .back { color: #334155; text-decoration: none; background: #f1f5f9; padding: 6px 10px; border-radius: 8px; width: fit-content; }
    h1 { margin: 0; font-size: 22px; color: #347AE2; }
    .meta { display: flex; flex-wrap: wrap; gap: 12px; color: #334155; }
    .list { display: flex; flex-direction: column; gap: 16px; }
    .hadith { background: white; border-radius: 12px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
    .actions { display: flex; gap: 8px; justify-content: flex-end; margin-bottom: 8px; }
    .btn { background: #347AE2; color: #fff; border: 0; padding: 6px 10px; border-radius: 8px; cursor: pointer; }
    .btn.secondary { background: #64748b; }
    .btn.danger { background: #b91c1c; }
    .matn { font-size: 20px; line-height: 1.9; color: #111827; }
    .matn :where(table, tr, td, span, p, div) { all: revert; direction: rtl; font-size: 20px; line-height: 1.9; }
    .editor textarea { width: 100%; padding: 10px; font-size: 16px; line-height: 1.6; font-family: inherit; }
    .state { display: flex; align-items: center; gap: 8px; color: #334155; }
    .state.error { color: #b91c1c; }
    .state.empty { color: #64748b; }
    .spinner { width: 14px; height: 14px; border: 2px solid #e2e8f0; border-top-color: #347AE2; border-radius: 50%; display: inline-block; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `
})
export class HadithPage {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(HadithService);

  readonly items = signal<any[]>([]);
  readonly loaded = signal<boolean>(false);
  readonly error = signal<boolean>(false);

  readonly catId = signal<number>(0);
  readonly chapterId = signal<number>(0);
  readonly babId = signal<number>(0);

  readonly writerName = signal<string>('');
  readonly chapterName = signal<string>('');
  readonly babName = signal<string>('');
  readonly bookName = signal<string>('');

  constructor() {
    const catIdStr = this.route.snapshot.paramMap.get('catId') ?? '0';
    const chapterIdStr = this.route.snapshot.paramMap.get('chapterId') ?? '0';
    const babIdStr = this.route.snapshot.paramMap.get('babId') ?? '0';
    this.catId.set(Number(catIdStr) || 0);
    this.chapterId.set(Number(chapterIdStr) || 0);
    this.babId.set(Number(babIdStr) || 0);

    // optional if passed from previous page
    this.bookName.set(this.route.snapshot.queryParamMap.get('book') ?? '');

    this.load();
  }

  load() {
    this.loaded.set(false);
    this.api.search(this.catId(), this.chapterId(), this.babId()).subscribe({
      next: res => {
        const grid = res?.gridData ?? [];
        const sorted = grid.slice().sort((a: any, b: any) => {
          const ah = Number(a?._hadithNewOrg?.h_id ?? a?.h_id ?? 0);
          const bh = Number(b?._hadithNewOrg?.h_id ?? b?.h_id ?? 0);
          return ah - bh;
        });
        this.items.set(sorted);
        // derive header data from first item
        const first = grid[0] ?? {};
        this.writerName.set(first?._cat?.name ?? this.writerName());
        this.chapterName.set(first?._chapter?.name ?? '');
        this.babName.set(first?._bab?.name ?? '');
        this.loaded.set(true);
      },
      error: () => {
        this.error.set(true);
        this.loaded.set(true);
      }
    });
  }

  // --- Inline editing (no persistence) ---
  drafts: { [id: number]: string } = {};
  editing: { [id: number]: boolean } = {};

  getId(it: any): number {
    return Number(it?._hadithNewOrg?.h_id ?? it?.h_id ?? 0);
  }

  isEditing(id: number): boolean {
    return !!this.editing[id];
  }

  startEdit(it: any) {
    const id = this.getId(it);
    this.drafts[id] = it?._hadithNewOrg?.matn ?? '';
    this.editing[id] = true;
  }

  cancelEdit(it: any) {
    const id = this.getId(it);
    delete this.drafts[id];
    this.editing[id] = false;
  }

  saveEdit(it: any) {
    const id = this.getId(it);
    const updated = this.items().map(x => {
      const xid = this.getId(x);
      if (xid === id) {
        const copy = { ...x, _hadithNewOrg: { ...(x._hadithNewOrg || {}), matn: this.drafts[id] ?? '' } };
        return copy;
      }
      return x;
    });
    this.items.set(updated);
    this.editing[id] = false;
  }
}
