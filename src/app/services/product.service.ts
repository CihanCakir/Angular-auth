import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { IProduct } from '../models/product';
import { shareReplay, flatMap, first } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = environment.apiUrl;

  private product$: Observable<IProduct[]>;
  constructor(private http: HttpClient) { }

  // HEPSNİ GETİRİYORUZ
  getProducts(): Observable<IProduct[]> {
    if (!this.product$) {
      this.product$ = this.http.get<IProduct[]>(this.baseUrl + 'product').pipe(shareReplay());
    }
    // if producyt cache exists return it
    return this.product$;

  }
  // GEt Proudc by its Id
  getProductById(id: number): Observable<IProduct> {
    return this.getProducts().pipe(flatMap(result => result), first(product => product.productId === id));
  }

  // Product Kayıt Ediyotuz

  insertProduct(products: IProduct): Observable<IProduct> {
    return this.http.post<IProduct>(this.baseUrl + 'product', products);
  }

  // Update Product
  updateProduct(id: number, product: IProduct): Observable<IProduct> {
    return this.http.put<IProduct>(this.baseUrl + 'product/' + id, product);

  }
  // delete Product

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(this.baseUrl + 'product/' + id);
  }

  // Clear Cache
  clearCache() {
    this.product$ = null;
  }

}
