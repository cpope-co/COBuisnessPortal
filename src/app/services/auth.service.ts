import { Injectable, computed, effect, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { User } from "../models/user.model";
import { environment } from "../../environments/environment";
import { jwtDecode } from "jwt-decode";
import { MessagesService } from "../messages/messages.service";
import { MatDialog } from "@angular/material/dialog";
import { HttpClient, HttpContext, HttpContextToken, HttpHeaders } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { SKIP_AUTH_KEY } from "../shared/http-context-keys";

const USER_STORAGE_KEY = 'user';
const TOKEN_STORAGE_KEY = 'token';
@Injectable({
    providedIn: 'root'
})

export class AuthService {
    env = environment;
    router = inject(Router);
    messageService = inject(MessagesService);
    dialog = inject(MatDialog);
    http = inject(HttpClient);

    #userSignal = signal<User | null>(null);
    user = this.#userSignal.asReadonly();

    #tokenSignal = signal<string | null>(null);
    token = this.#tokenSignal.asReadonly();

    isLoggedIn = computed(() => !!this.user());

    constructor() {
        this.loadUserFromStorage();
        this.loadTokenFromStorage();
        effect(() => {
            const user = this.user();
            if (user) {
                sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
            }
        });
        effect(() => {
            const token = this.token();
            if (token) {
                sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
            }
        });

    }

    loadUserFromStorage() {
        const json = sessionStorage.getItem(USER_STORAGE_KEY);
        if (json) {
            console.log(`Loaded user from storage.`);
            const user = JSON.parse(json) as User;
            this.#userSignal.set(user);
        } else {
            console.log(`No user found in storage.`);
        }
    }
    loadTokenFromStorage() {
        const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
        if (token) {
            console.log(`Loaded token from storage.`);
            this.#tokenSignal.set(token);
        } else {
            console.log(`No token found in storage.`);
        }
    }
    clearTimer(timer: number | null) {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }
    checkExpiry(): Promise<string> {
        return new Promise((resolve, reject) => {
            let user: User | null = null;
            const userItem = sessionStorage.getItem(USER_STORAGE_KEY);
            if (userItem) {
                user = JSON.parse(userItem) as User;
            } if (user) {
                const currentTime = Math.floor(Date.now() / 1000);
                const exp = user.exp;
                if (currentTime >= exp - 580) {
                    resolve('expiring');
                } else if (currentTime >= exp - 540) {
                    resolve('expired');
                } else {
                    resolve('valid');
                }
            } else {
                reject('No user in session.');
            }
        });
    }

    async login(email: string, password: string): Promise<User> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa(`${email}:${password}`)}`
        });
        // Create a new HttpContextToken
        

        // Use the token to set metadata
        const context = new HttpContext().set(SKIP_AUTH_KEY, true);

        // Use the context in your HTTP request
        const user$ = await this.http.post(`${this.env.apiBaseUrl}usraut/login`,
            { email, password },
            { headers, observe: 'response', withCredentials: true, context }
        );

        const response = await firstValueFrom(user$);

        const token = response.headers.get('x-id')!;
        this.#tokenSignal.set(token);

        const user = await jwtDecode(response.headers.get('x-id')!) as User;
        this.#userSignal.set(user);
        return user;
    }
    async refresh(): Promise<User> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.token()}`
        });

        const response = await firstValueFrom(this.http.post(
            `${this.env.apiBaseUrl}usraut/refresh`,
            {},
            { headers, observe: 'response', withCredentials: true }
        ));

        const token = response.headers.get('x-id')!;
        this.#tokenSignal.set(token);

        const user = await jwtDecode(response.headers.get('x-id')!) as User;
        this.#userSignal.set(user);
        return user;
    }

    async verify(verifyToken: string): Promise<User> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const response = await firstValueFrom(this.http.post(
            `${this.env.apiBaseUrl}usraut/verify?id=${verifyToken}`,
            {},
            { headers, observe: 'response' }
        ));

        const token = response.headers.get('x-id')!;
        this.#tokenSignal.set(token);

        const user = await jwtDecode(response.headers.get('x-id')!) as User;
        this.#userSignal.set(user);
        return user;
    }

    async logout(): Promise<void> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.token()}`
        });

        await this.http.post(`${this.env.apiBaseUrl}/usraut/logout`, {}, { headers, withCredentials: true });

        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        sessionStorage.removeItem(USER_STORAGE_KEY);
        this.#userSignal.set(null);
        this.#tokenSignal.set(null);

        this.messageService.showMessage('You have been logged out.', 'info', 30000);
        this.router.navigate(['auth/login']);
    }
}