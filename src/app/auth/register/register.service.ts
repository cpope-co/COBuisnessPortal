import { Injectable, inject } from "@angular/core";
import { environment } from "../../../environments/environment";
import { firstValueFrom } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Register } from "../../../models/register.model";

@Injectable({
    providedIn: 'root'
})
export class RegisterService {

    env = environment;

    http = inject(HttpClient);

    async registerAccount(register: Partial<Register>): Promise<Register> {

        const register$ = this.http.post<Register>(`${this.env.apiBaseUrl}register`, register);

        return await firstValueFrom(register$);
        
    }
}