import { Injectable, inject } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { SetPassword } from "../../models/password.model";

@Injectable({
    providedIn: 'root'
})
export class ChangePasswordService {
    env = environment;
    http = inject(HttpClient);

    async setPassword(setPassword: Partial<SetPassword>): Promise<SetPassword> {
        const setPassword$ = this.http.post<SetPassword>(`${this.env.apiBaseUrl}/chngpwd`,{ setPassword});

        const response = await firstValueFrom(setPassword$);

        return response
    }
}