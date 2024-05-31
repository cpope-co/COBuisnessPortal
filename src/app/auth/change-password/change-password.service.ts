import { inject } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

export class ChangePasswordService {
    env = environment;
    http = inject(HttpClient);

    async changePassword(oldPassword: string, newPassword: string, confirmPassword: string) {
        const changePassword$ = this.http.post(`${this.env.apiBaseUrl}/chngpwd`,{});

        const response = await firstValueFrom(changePassword$);

        return response
    }
}