import { inject, Injectable, signal } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { ProductCategory } from "../../models/product-category.model";

@Injectable({
    providedIn: 'root'
})
export class ProductCategoryService {
    env = environment
    http = inject(HttpClient);

    productCategorySignal = signal<ProductCategory[]>([]);
    productCategory = this.productCategorySignal.asReadonly();

    constructor() {
    }

    async loadAllProductCategories() {
        // const productCategories$ = this.http.get<ProductCategory[]>(`${this.env.apiBaseUrl}product-categories`);
        const productCategories$ = this.http.get<ProductCategory[]>('assets/productCategory.json');
        const response = await firstValueFrom(productCategories$);
        this.productCategorySignal.set(response);
        return this.productCategory();
    }

}