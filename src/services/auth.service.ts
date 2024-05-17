import { Injectable, computed, effect, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { User } from "../models/user.model";
import { environment } from "../environments/environment";
import { jwtDecode } from "jwt-decode";
import { MessagesService } from "../app/messages/messages.service";
import { MatDialog } from "@angular/material/dialog";
import { openRefreshSessionDialog } from "../app/refresh-session-dialog/refresh-session-dialog.component";

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
        const response = await fetch(`${this.env.apiBaseUrl}usraut/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${btoa(`${email}:${password}`)}`
            },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });


        const token = await response.headers.get('x-id')!;
        this.#tokenSignal.set(token);

        const user = await jwtDecode(response.headers.get('x-id')!) as User;
        this.#userSignal.set(user);
        return user;

    }

    async refresh(): Promise<User> {
        const response = await fetch(`${this.env.apiBaseUrl}usraut/refresh`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token()}`
            },
            credentials: 'include'
        });
        const token = await response.headers.get('x-id')!;
        this.#tokenSignal.set(token);

        const user = await jwtDecode(response.headers.get('x-id')!) as User;

        this.#userSignal.set(user);
        return user;
    }

    async logout(): Promise<void> {
        await fetch(`${this.env.apiBaseUrl}/usraut/logout`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token()}`
            },
            credentials: 'include'
        });

        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        sessionStorage.removeItem(USER_STORAGE_KEY);
        this.#userSignal.set(null);
        this.#tokenSignal.set(null);

        this.messageService.showMessage('You have been logged out.', 'info', 30000);
        this.router.navigate(['auth/login']);
    }
}