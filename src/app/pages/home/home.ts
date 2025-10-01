import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { IndexBook } from '../../core/services/index-book';
import { CatService } from '../../core/services/cat';

interface Category {
  id: number;
  name: string;
  sort_menu?: number;
  master_menu?: number;
  sub_menu?: number;
  hasSubcategories?: boolean;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  standalone: true,
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
          <!-- Breadcrumb -->
          <nav *ngIf="breadcrumbs().length > 0" class="breadcrumb">
            <a (click)="goToLevel()">الرئيسية</a>
            <span *ngFor="let crumb of breadcrumbs(); let last = last" class="breadcrumb-item">
              <span class="separator">/</span>
              <a *ngIf="!last" (click)="goToLevel(crumb.id)">{{ crumb.name }}</a>
              <span *ngIf="last">{{ crumb.name }}</span>
            </span>
          </nav>

          <div *ngIf="items().length; else emptyTpl" class="grid">
            <article 
              class="card" 
              *ngFor="let item of items()" 
              (click)="onItemClick(item)" 
              (keyup.enter)="onItemClick(item)"
              tabindex="0"
              role="button"
              [attr.aria-label]="'تصفح ' + item.name"
            >
              <div class="card-inner">
                <div class="card-face card-front">
                  <div class="name" [title]="item.name">{{ item.name }}</div>
                  <div class="meta">
                    <span class="badge" *ngIf="showIds">معرّف: {{ item.id || '—' }}</span>
                    <span class="badge" *ngIf="item.hasSubcategories">{{ item.hasSubcategories ? 'أقسام فرعية' : 'كتب' }}</span>
                  </div>
                </div>
                <div class="card-face card-back">
                  <div class="back-title">{{ item.name }}</div>
                  <div class="back-meta">{{ item.hasSubcategories ? 'اضغط لعرض الأقسام الفرعية' : 'اضغط لعرض الكتب' }}</div>
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
    .breadcrumb { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; padding: 8px 0; font-size: 14px; }
    .breadcrumb a { color: #3b82f6; cursor: pointer; text-decoration: none; }
    .breadcrumb a:hover { text-decoration: underline; }
    .breadcrumb .separator { margin: 0 4px; color: #94a3b8; }
    .breadcrumb-item { display: flex; align-items: center; }
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
  private readonly catService = inject(CatService);
  private readonly router = inject(Router);
  
  readonly items = signal<Category[]>([]);
  readonly error = signal<boolean>(false);
  readonly loaded = signal<boolean>(false);
  readonly showIds = false; // Set to true to show IDs for debugging
  
  // Navigation state
  private navigationStack: Array<{id: number, name: string, items: Category[]}> = [];
  readonly currentLevel = signal<number | null>(null);
  readonly breadcrumbs = signal<Array<{id: number, name: string}>>([]);

  constructor() {
    this.loadMainCategories();
  }

  private loadMainCategories(): void {
    this.loaded.set(false);
    this.api.search().subscribe({
      next: res => {
        // Get main categories (where sub_menu is null or 0)
        const mainCategories = (res?.gridData ?? [])
          .filter((item: any) => !item.sub_menu || item.sub_menu === 0)
          .map((item: any) => ({
            ...item,
            hasSubcategories: false // Will be updated in next step
          }));
        
        // Check which main categories have subcategories
        const categoriesWithSubs = new Set<number>();
        (res?.gridData ?? []).forEach((item: any) => {
          if (item.sub_menu && item.sub_menu !== 0) {
            categoriesWithSubs.add(item.sub_menu);
          }
        });

        // Update hasSubcategories flag
        const processedCategories = mainCategories.map((cat: any) => ({
          ...cat,
          hasSubcategories: categoriesWithSubs.has(cat.sort_menu || cat.id)
        }));

        this.items.set(processedCategories);
        this.loaded.set(true);
      },
      error: () => {
        this.error.set(true);
        this.loaded.set(true);
      }
    });
  }

  onItemClick(item: Category): void {
    if (item.hasSubcategories) {
      this.loadSubcategories(item);
    } else {
      this.navigateToBooks(item);
    }
  }

  private loadSubcategories(parentItem: Category): void {
    this.loaded.set(false);
    
    // Save current state to navigation stack
    this.navigationStack.push({
      id: this.currentLevel() || 0,
      name: 'الرئيسية',
      items: this.items()
    });
    
    // Update breadcrumbs
    this.breadcrumbs.update(crumbs => [
      ...crumbs,
      { id: parentItem.id, name: parentItem.name }
    ]);
    
    // Load subcategories
    this.api.search().subscribe({
      next: res => {
        const subcategories = (res?.gridData ?? [])
          .filter((item: any) => item.sub_menu === parentItem.sort_menu)
          .map((item: any) => ({
            ...item,
            // Check if this item has its own subcategories
            hasSubcategories: (res?.gridData ?? []).some(
              (subItem: any) => subItem.sub_menu === item.sort_menu
            )
          }));

        if (subcategories.length > 0) {
          this.currentLevel.set(parentItem.id);
          this.items.set(subcategories);
        } else {
          // If no subcategories, navigate to books
          this.navigateToBooks(parentItem);
          return;
        }
        
        this.loaded.set(true);
      },
      error: () => {
        this.error.set(true);
        this.loaded.set(true);
      }
    });
  }

  goToLevel(levelId?: number): void {
    if (!levelId) {
      // Go to root
      this.currentLevel.set(null);
      this.breadcrumbs.set([]);
      this.loadMainCategories();
      this.navigationStack = [];
      return;
    }

    // Find the level in the navigation stack
    const levelIndex = this.navigationStack.findIndex(item => item.id === levelId);
    if (levelIndex !== -1) {
      // Go back to the selected level
      const targetLevel = this.navigationStack[levelIndex];
      this.items.set(targetLevel.items);
      this.currentLevel.set(levelId);
      this.breadcrumbs.update(crumbs => crumbs.slice(0, levelIndex + 1));
      this.navigationStack = this.navigationStack.slice(0, levelIndex);
    }
  }

  private navigateToBooks(item: Category): void {
    this.router.navigate(['/books', item.id], { 
      queryParams: { 
        name: item.name,
        from: this.currentLevel() ? 'subcategory' : 'category'
      }
    });
  }
}
