import { Injectable, inject } from "@angular/core";
import { environment } from "../../../environments/environment";
import { firstValueFrom } from "rxjs";
import { HttpClient, HttpContext } from "@angular/common/http";
import { Register } from "./register.model";
import { apiResponse } from "../../models/response.model";
import { SKIP_AUTH_KEY, SKIP_REFRESH_KEY } from "../../shared/http-context-keys";
import { ApiResponseError } from "../../shared/api-response-error";

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
            // Check if there are validation errors and throw them
            if (response.validationErrors && response.validationErrors.length > 0) {
                throw new ApiResponseError("Validation errors", response.validationErrors || []);
            } else {
                // If there are no validation errors, throw a generic error
                throw new Error('Registration failed without specific validation errors.');
            }
        }

        return response.data as Register;

    }
}