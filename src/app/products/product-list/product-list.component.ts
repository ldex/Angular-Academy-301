import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Observable, EMPTY, combineLatest, Subscription } from 'rxjs';
import { tap, catchError, startWith, count, flatMap, map, debounceTime, filter, distinctUntilChanged } from 'rxjs/operators';

import { Product } from '../product.interface';
import { ProductService } from '../product.service';
import { FavouriteService } from '../favourite.service';
import { LoadingService } from 'src/app/services/loading.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  title: string = 'Products';
  selectedProduct: Product;
  favouriteAdded$: Observable<Product>;

  products$: Observable<Product[]>;
  productsNumber$: Observable<number | string>;
  filter$: Observable<string>;
  filtered$: Observable<Boolean>;
  filteredProducts$: Observable<Product[]>;

  errorMessage;
  filter: FormControl = new FormControl("");

  // Pagination
  pageSize = 5;
  start = 0;
  end = this.pageSize;
  currentPage = 1;

  firstPage() {
    this.start = 0;
    this.end = this.pageSize;
    this.currentPage = 1;
  }

  previousPage() {
    this.start -= this.pageSize;
    this.end -= this.pageSize;
    this.currentPage--;
    this.selectedProduct = null;
  }

  nextPage() {
    this.start += this.pageSize;
    this.end += this.pageSize;
    this.currentPage++;
    this.selectedProduct = null;
  }

  onSelect(product: Product) {
    this.selectedProduct = product;
    this.router.navigateByUrl('/products/' + product.id);
  }

  get favourites(): number {
    return this.favouriteService.getFavouritesNb();
  }

  constructor(
    private productService: ProductService,
    private favouriteService: FavouriteService,
    private router: Router,
    private loadingService: LoadingService) {

      this.favouriteAdded$ =
                this
                  .favouriteService
                  .favouriteAdded$
                  .pipe(
                    tap(p => console.log('new favourite: ' + p.name))
                  )

  }


  ngOnInit(): void {
    // Self url navigation will refresh the page ('Refresh List' button)
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;

    this.filter$ = this.filter
                        .valueChanges
                        .pipe(
                          tap(console.log),
                          debounceTime(500),
                          map(text => text.trim()), // remove extras white spaces
                          tap(console.log),
                          filter(text => text == "" || text.length > 2), // filter 3 char mon (or no filter)
                          distinctUntilChanged(), // get nothing until value changed
                          tap(console.log),
                          tap(text => this.firstPage()),
                          startWith('')
                        );

    this.filtered$ = this
                        .filter$
                        .pipe(
                          map(text => text.length > 0)
                        );

    this.products$ = this
                      .productService
                      .products$;

    this.loadingService.showLoaderUntilCompleted(this.products$);

    this.filteredProducts$ = combineLatest([this.products$, this.filter$])
      .pipe(
        map(([products, filterString]) =>
          products.filter(product =>
            product.name.toLowerCase().includes(filterString.toLowerCase())
          )
        )
      )

    this.productsNumber$ = this
                            .filteredProducts$
                            .pipe(
                              map(products => products.length),
                              startWith('loading')
                            )
  }

  refresh() {
    this.productService.initProducts();
    this.router.navigateByUrl('/products'); // Self route navigation
  }
}
