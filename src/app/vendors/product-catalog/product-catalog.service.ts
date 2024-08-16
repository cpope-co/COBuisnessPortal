import { inject, Injectable, signal } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Product } from "../../models/product.model";
import { firstValueFrom } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ProductCatalogService {
    env = environment
    http = inject(HttpClient);
    
    productCatalogSignal = signal<Product[]>([]);
    productCatalog = this.productCatalogSignal.asReadonly();

    constructor() {
    }

    async loadAllProducts() {
        // const products$ = this.http.get<Product[]>(`${this.env.apiBaseUrl}products`);
        const products$ = this.http.get<Product[]>('assets/product.json');
        const response = await firstValueFrom(products$);
        this.productCatalogSignal.set(response);
        return this.productCatalog();
    }
}