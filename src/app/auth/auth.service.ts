import { Injectable, computed, effect, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { User } from "../models/user.model";
import { environment } from "../../environments/environment";
import { jwtDecode } from "jwt-decode";
import { MessagesService } from "../messages/messages.service";
import { MatDialog } from "@angular/material/dialog";
import { HttpClient, HttpContext, HttpContextToken, HttpHeaders } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { SKIP_AUTH_KEY, SKIP_REFRESH_KEY } from "../shared/http-context-keys";
import { PermissionsService } from "../services/permissions.service";
import { UserPermissions } from "../models/permissions.model";

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
    permissionsService = inject(PermissionsService);

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

    // Use signals instead of EventEmitters
    #logoutTrigger = signal<number>(0);
    logoutTrigger = this.#logoutTrigger.asReadonly();
    
    #loginTrigger = signal<number>(0);
    loginTrigger = this.#loginTrigger.asReadonly();

    #isLoggingOut = signal(false);

    constructor() {
        this.loadUserFromStorage();
        this.loadTokenFromStorage();

        // Only validate token if user exists - do this async to not block constructor
        if (this.user()) {
            // Use setTimeout to make this async and not block the constructor
            setTimeout(() => this.validateTokenOnInit(), 0);
        }
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

    private safeJwtDecode(token: string | null): User | null {
        if (!token || typeof token !== 'string' || token.trim() === '') {
            console.error('Invalid token provided to jwtDecode:', token);
            return null;
        }
        try {
            return jwtDecode(token) as User;
        } catch (error) {
            console.error('Failed to decode JWT token:', error);
            return null;
        }
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
        // Don't validate if no user is present
        if (!this.user()) {
            return;
        }

        try {
            const status = await this.checkExpiry();
            if (status === 'expiring' || status === 'expired') {
                await this.refreshToken();
            }
        } catch (error) {
            console.log('Token validation failed:', error);
            // Only logout if we were previously logged in
            if (this.user()) {
                this.logout();
            }
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
        try {
            const json = sessionStorage.getItem(USER_STORAGE_KEY);
            if (json) {
                const user = JSON.parse(json) as User;
                // Validate that the user object has the required properties
                if (user && user.exp && typeof user.exp === 'number') {
                    this.#userSignal.set(user);
                    console.log('Loaded user from storage.');
                } else {
                    console.log('Invalid user data in storage, clearing...');
                    sessionStorage.removeItem(USER_STORAGE_KEY);
                }
            } else {
                console.log(`No user found in storage.`);
            }
        } catch (error) {
            console.error('Error loading user from storage:', error);
            sessionStorage.removeItem(USER_STORAGE_KEY);
        }
    }
    loadTokenFromStorage() {
        try {
            const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
            if (token && typeof token === 'string' && token.trim() !== '') {
                // Validate that the token can be decoded before setting it
                const testUser = this.safeJwtDecode(token);
                if (testUser) {
                    this.#tokenSignal.set(token);
                    console.log('Loaded token from storage.');
                } else {
                    console.log('Invalid token in storage, clearing...');
                    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
                }
            } else {
                console.log(`No valid token found in storage.`);
                if (token) {
                    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
                }
            }
        } catch (error) {
            console.error('Error loading token from storage:', error);
            sessionStorage.removeItem(TOKEN_STORAGE_KEY);
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

        const context = new HttpContext().set(SKIP_AUTH_KEY, true).set(SKIP_REFRESH_KEY, true);

        const response = await firstValueFrom(this.http.post<{
            success: boolean;
            permissions: Array<{ resource: string; per: number }>;
        }>(`${this.env.apiBaseUrl}usraut/login`,
            { email, password },
            { headers, observe: 'response', withCredentials: true, context }
        ));

        const token = response.headers.get('x-id');
        if (!token) {
            throw new Error('No authentication token received from server');
        }
        this.#tokenSignal.set(token);

        const user = this.safeJwtDecode(token);
        if (!user) {
            throw new Error('Failed to decode authentication token');
        }

        // Clear any cached menu items from previous user session
        sessionStorage.removeItem('menuItems');
        
        // Handle permissions from response body
        if (response.body?.permissions) {
            const userPermissions: UserPermissions = {
                resources: response.body.permissions.map(p => ({
                    resource: p.resource,
                    per: p.per
                }))
            };
            this.permissionsService.setUserPermissions(userPermissions);
        }

        this.#userSignal.set(user);
        this.permissionsService.setUser(user);
        this.#loginTrigger.update(v => v + 1);
        this.setRoles();
        return user;
    }
    
    async refresh(): Promise<User> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${this.token()}`
        });

        const context = new HttpContext().set(SKIP_REFRESH_KEY, true).set(SKIP_AUTH_KEY, true);
        const response = await firstValueFrom(this.http.get<{
            success?: boolean;
            permissions?: Array<{ resource: string; per: number }>;
        }>(
            `${this.env.apiBaseUrl}usraut/refresh`,
            { headers, observe: 'response', withCredentials: true, context }
        ));

        const token = response.headers.get('x-id');
        if (!token) {
            throw new Error('No refresh token received from server');
        }
        this.#tokenSignal.set(token);

        const user = this.safeJwtDecode(token);
        if (!user) {
            throw new Error('Failed to decode refresh token');
        }

        // Handle permissions from refresh response if provided
        if (response.body?.permissions) {
            // Clear cached menu items when permissions change
            sessionStorage.removeItem('menuItems');
            
            const userPermissions: UserPermissions = {
                resources: response.body.permissions.map(p => ({
                    resource: p.resource,
                    per: p.per
                }))
            };
            this.permissionsService.setUserPermissions(userPermissions);
        }

        this.#userSignal.set(user);
        this.permissionsService.setUser(user);
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

        const token = response.headers.get('x-id');
        if (!token) {
            throw new Error('No verification token received from server');
        }
        this.#tokenSignal.set(token);

        const user = this.safeJwtDecode(token);
        if (!user) {
            throw new Error('Failed to decode verification token');
        }
        this.#userSignal.set(user);
        this.permissionsService.setUser(user);
        return user;
    }

    async logout(reason: 'manual' | 'timeout' | 'token-expired' = 'manual'): Promise<void> {
        // Prevent multiple simultaneous logout calls
        if (this.#isLoggingOut()) {
            return;
        }
        
        this.#isLoggingOut.set(true);
        
        try {
            const headers = new HttpHeaders({
                'Authorization': `Bearer ${this.token()}`
            });

            // Skip refresh interceptor for logout to prevent infinite loops
            const context = new HttpContext().set(SKIP_REFRESH_KEY, true);

            const response = await firstValueFrom(this.http.post(
                `${this.env.apiBaseUrl}/usraut/logout`,
                {},
                {
                    headers, withCredentials: true, context
                }));
        } catch (error) {
            // Even if logout request fails, we should still clear local state
            console.warn('Logout request failed, but clearing local state anyway:', error);
        } finally {
            // Always clear local state regardless of server response
            this.permissionsService.clearPermissions();
            sessionStorage.clear();
            localStorage.clear();
            this.#userSignal.set(null);
            this.#tokenSignal.set(null);
            this.#logoutTrigger.update(v => v + 1);
            
            // Set message based on logout reason via query parameters
            const messages = {
                'manual': { text: 'You have been logged out.', severity: 'info' },
                'timeout': { text: 'Your session has expired due to inactivity.', severity: 'warning' },
                'token-expired': { text: 'Your session has expired. Please log in again.', severity: 'warning' }
            };
            
            const message = messages[reason];
            this.#isLoggingOut.set(false);
            
            
            this.router.navigate(['auth/login'], { 
                queryParams: { msg: message.text, severity: message.severity }
            });
        }
    }
}