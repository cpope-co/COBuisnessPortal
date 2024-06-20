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

            const userAccounts$ = this.http.get<apiResponse>(`${this.env.apiBaseUrl}user/getusrs`);
            const response = await firstValueFrom(userAccounts$);
            this.userAccountsSignal.set(response.data);
            userAccounts = JSON.stringify(response.data);
            localStorage.setItem('userAccounts', userAccounts);
        }
        return JSON.parse(userAccounts) as UserAccount[];
    }

    async loadUserAccountById(id: number) {
        const userAccount$ = this.http.get<apiResponse>(`${this.env.apiBaseUrl}user/getusr?usunbr=${id}`);
        
        const response = await firstValueFrom(userAccount$);
        if(!response.success) {
            throw new Error(response.validationErrors?.errDesc);
        }
        return response.data as UserAccount;
        
    }

    async saveUserAccount(userAccount: Partial<UserAccount>): Promise<UserAccount> {
        
        const userAccount$ = this.http.patch<UserAccount>(`${this.env.apiBaseUrl}user/updusr`, userAccount);

        return await firstValueFrom(userAccount$);
    }
}