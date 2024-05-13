import { Injectable, computed, effect, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { User } from "../models/user.model";
import { environment } from "../environments/environment";
import { jwtDecode } from "jwt-decode";

const USER_STORAGE_KEY = 'user';
const TOKEN_STORAGE_KEY = 'token';
@Injectable({
    providedIn: 'root'
})

export class AuthService {

    router = inject(Router);
    #userSignal = signal<User | null>(null);
    user = this.#userSignal.asReadonly();
    #tokenSignal = signal<string | null>(null);
    token = this.#tokenSignal.asReadonly();
    isLoggedIn = computed(() => !!this.user());

    constructor() {
        this.loadUserFromStorage();
        effect(() => {
            const user = this.user();
            if (user) {
                sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
            }
        });
        effect(() => {
            const token = this.token();
            if(token) {
                sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
            }
        })
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
    async login(email: string, password: string): Promise<User> {
        const response = await fetch(`${environment.apiBaseUrl}usraut/login`, {
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

    async logout() {
        const response = await fetch(`${environment.apiBaseUrl}/usraut/logout`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.token()}`
            },
            credentials: 'include'
        });

        this.#tokenSignal.set(null);
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        sessionStorage.removeItem(USER_STORAGE_KEY);
        this.#userSignal.set(null);
        this.router.navigate(['auth/login']);
    }
}