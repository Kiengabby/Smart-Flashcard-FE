import { Routes } from '@angular/router';

export const DECK_LIBRARY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./deck-library.component').then((m) => m.DeckLibraryComponent),
  },
];