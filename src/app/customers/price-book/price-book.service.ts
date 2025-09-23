import { inject, Injectable, signal } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { PriceBookItem } from "./price-book.model";
import { firstValueFrom } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class PriceBookService {
    env = environment
    http = inject(HttpClient);

    priceBookSignal = signal<PriceBookItem[]>([]);
    priceBook = this.priceBookSignal.asReadonly();

    constructor() {
    }

    async loadAllPriceBookItems() {
        // const items$ = this.http.get<PriceBookItem[]>(`${this.env.apiBaseUrl}price-book`);
        const items$ = this.http.get<PriceBookItem[]>('assets/priceBook.json');
        const response = await firstValueFrom(items$);
        this.priceBookSignal.set(response);
        return this.priceBook();
    }
}

