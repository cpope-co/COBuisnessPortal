import { EventEmitter, Injectable, computed, effect, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { User } from "../models/user.model";
import { environment } from "../../environments/environment";
import { jwtDecode } from "jwt-decode";
import { MessagesService } from "../messages/messages.service";
import { MatDialog } from "@angular/material/dialog";
import { HttpClient, HttpContext, HttpContextToken, HttpHeaders } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { SKIP_AUTH_KEY, SKIP_REFRESH_KEY } from "../shared/http-context-keys";

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

    #isAdminSignal = signal<boolean>(false);
    isAdmin = this.#isAdminSignal.asReadonly();

    #isCustomerSignal = signal<boolean>(false);
    isCustomer = this.#isCustomerSignal.asReadonly();

    isVendorSignal = signal<boolean>(false);
    isVendor = this.isVendorSignal.asReadonly();

    isEmployeeSignal = signal<boolean>(false);
    isEmployee = this.isEmployeeSignal.asReadonly();

    isApiUserSIgnal = signal<boolean>(false);
    isApiUser = this.isApiUserSIgnal.asReadonly();

    logoutEvent = new EventEmitter<void>();
    loginEvent = new EventEmitter<void>();

    constructor() {
        this.loadUserFromStorage();
        this.loadTokenFromStorage();
        
        this.validateTokenOnInit();
        effect(() => {
            const user = this.user();
            if (user) {
                sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
                this.setRoles();
            }
        });
        effect(() => {
            const token = this.token();
            if (token) {
                sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
            }
        });
    }
    setRoles() {
        const user = this.user();
        if (user) {
            switch (user.role) {
                case 1:
                    this.#isAdminSignal.set(true);
                    break;
                case 2:
                    this.#isCustomerSignal.set(true);
                    break;
                case 3:
                    this.isVendorSignal.set(true);
                    break;
                case 4:
                    this.isEmployeeSignal.set(true);
                    break;
                case 5:
                    this.isApiUserSIgnal.set(true);
                    break;
                default:
                    this.#isAdminSignal.set(false);
                    break;
            }
        }
    }

    private async validateTokenOnInit() {
        try {
            const status = await this.checkExpiry();
            if (status === 'expiring' || status === 'expired') {
                await this.refreshToken();
            }
        } catch (error) {
            console.log('Token validation failed:', error);
            this.logout();
        }
    }
    private async refreshToken() {
        try {
            const user = await this.refresh();
            this.#userSignal.set(user);
        } catch (error) {
            this.logout();
        }
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


        // Use the token to set metadata
        const context = new HttpContext().set(SKIP_AUTH_KEY, true).set(SKIP_REFRESH_KEY, true);

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
        this.loginEvent.emit();
        this.setRoles();
        return user;
    }
    async refresh(): Promise<User> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.token()}`
        });

        const context = new HttpContext().set(SKIP_REFRESH_KEY, true).set(SKIP_AUTH_KEY, true);
        const response = await firstValueFrom(this.http.post(
            `${this.env.apiBaseUrl}usraut/refresh`,
            {},
            { headers, observe: 'response', withCredentials: true, context }
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

        sessionStorage.clear();
        localStorage.clear();
        this.#userSignal.set(null);
        this.#tokenSignal.set(null);
        this.logoutEvent.emit();
        this.messageService.showMessage('You have been logged out.', 'info', 30000);
        this.router.navigate(['auth/login']);
    }
}