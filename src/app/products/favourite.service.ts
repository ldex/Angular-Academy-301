import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Product } from './product.interface';

@Injectable({
  providedIn: 'root'
})
export class FavouriteService {

  private favouriteAdded = new BehaviorSubject<Product>(null);
  favouriteAdded$: Observable<Product> = this.favouriteAdded.asObservable();

  constructor() { }

  private favourites: Set<Product> = new Set();

  addToFavourites(product: Product) {
    this.favourites.add(product);
    this.favouriteAdded.next(product);
  }

  getFavouritesNb(): number {
    return this.favourites.size;
  }
}
