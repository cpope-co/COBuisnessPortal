import { Injectable, inject } from "@angular/core";
import { environment } from "../../../environments/environment";
import { firstValueFrom } from "rxjs";
import { HttpClient, HttpContext } from "@angular/common/http";
import { Register } from "./register.model";
import { apiResponse } from "../../models/response.model";
import { SKIP_AUTH_KEY, SKIP_REFRESH_KEY } from "../../shared/http-context-keys";

@Injectable({
    providedIn: 'root'
})
export class RegisterService {

    env = environment;

    http = inject(HttpClient);

    async registerAccount(register: Partial<Register>): Promise<Register> {
        const context = new HttpContext().set(SKIP_REFRESH_KEY, true).set(SKIP_AUTH_KEY, true);
        const register$ = this.http.post<apiResponse>(`${this.env.apiBaseUrl}register`, register, { context });

        const response = await firstValueFrom(register$);

        if (!response.success) {
            throw new Error(response.validationErrors!.errDesc);
        }

        return response.data as Register;

    }
}