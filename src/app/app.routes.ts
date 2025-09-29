import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { BooksPage } from './pages/books/books';
import { ChaptersPage } from './pages/chapters/chapters';
import { BabsPage } from './pages/babs/babs';
import { HadithPage } from './pages/hadith/hadith';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'books/:indexId', component: BooksPage },
  { path: 'chapters/:catId', component: ChaptersPage },
  { path: 'babs/:catId/:chapterId', component: BabsPage },
  { path: 'hadith/:catId/:chapterId/:babId', component: HadithPage },
  { path: '**', redirectTo: '' }
];
