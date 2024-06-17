import { Injectable, effect, inject, signal } from "@angular/core";
import { environment } from "../../environments/environment";
import { firstValueFrom } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { UserAccount } from "../models/user-accounts.model";
import { apiResponse } from "../models/response.model";

@Injectable({
    providedIn: 'root'
})
export class UserAccountService {
    env = environment;
    http = inject(HttpClient);

    userAccountsSignal = signal<UserAccount[]>([]);
    userAccounts = this.userAccountsSignal.asReadonly();

    constructor() {
    }

    async loadAllUserAccounts() {
        let userAccounts = localStorage.getItem('userAccounts');
        if (!userAccounts || userAccounts === '[]') {
            const token = sessionStorage.getItem('token'); // get the token from the session storage
            const secureCookie = document.cookie; // get the secure cookie

            const httpOptions = {
                headers: new HttpHeaders({
                    'Authorization': `Bearer ${token}`, // pass the token in the Authorization header
                    'Cookie': secureCookie // pass the secure cookie in the Cookie header
                })
            };

            const userAccounts$ = this.http.get<apiResponse>(`${this.env.apiBaseUrl}user/getusrs`, httpOptions);
            const response = await firstValueFrom(userAccounts$);
            this.userAccountsSignal.set(response.data);
            userAccounts = JSON.stringify(response.data);
            localStorage.setItem('userAccounts', userAccounts);
        }
        return JSON.parse(userAccounts) as UserAccount[];
    }

    async loadUserAccountById(id: number) {
        const userAccounts = await this.loadAllUserAccounts();
        return userAccounts.find(userAccount => userAccount.usunbr === id);
    }
}