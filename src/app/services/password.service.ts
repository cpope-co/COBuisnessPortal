import { Injectable, inject } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient, HttpContext } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { SetPassword } from "../models/password.model";
import { apiResponse } from "../models/response.model";
import { SKIP_REFRESH_KEY } from "../shared/http-context-keys";
import { ApiResponseError } from "../shared/api-response-error";

@Injectable({
    providedIn: 'root'
})
export class PasswordService {
    env = environment;
    http = inject(HttpClient);

    async setPassword(setPassword: Partial<SetPassword>): Promise<SetPassword> {
        const context = new HttpContext().set(SKIP_REFRESH_KEY, true);
        const setPassword$ = this.http.post<apiResponse>(`${this.env.apiBaseUrl}setpassword`, setPassword, { context });

        const response = await firstValueFrom(setPassword$);

        if (!response.success) {
            // Check if there are validation errors and throw them
            if (response.validationErrors && response.validationErrors.length > 0) {
                throw new ApiResponseError("Validation errors", response.validationErrors || []);
            } else {
                // If there are no validation errors, throw a generic error
                throw new Error('Password setting failed without specific validation errors.');
            }
        }

        return response.data as SetPassword;
    }
}