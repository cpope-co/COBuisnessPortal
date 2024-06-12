import { Injectable, inject } from "@angular/core";
import { environment } from "../../../environments/environment";
import { firstValueFrom } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Register } from "./register.model";
import { apiReponse } from "../../models/response.model";

@Injectable({
    providedIn: 'root'
})
export class RegisterService {

    env = environment;

    http = inject(HttpClient);

    async registerAccount(register: Partial<Register>): Promise<Register> {

        const register$ = this.http.post<apiReponse>(`${this.env.apiBaseUrl}register`, register);

        const response = await firstValueFrom(register$);

        if(!response.success) {
            throw new Error(response.validationErrors!.errDesc);
        }

        return response.data as Register;
        
    }
}