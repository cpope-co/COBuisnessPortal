import { Injectable, computed, effect, inject, signal } from "@angular/core";
import { AuthService } from "./auth.service";
import { User } from "../models/user.model";
import { MessagesService } from "../app/messages/messages.service";
const USER_STORAGE_KEY = 'user';
@Injectable({
    providedIn: 'root',
})
export class SessionService {
    authService = inject(AuthService);
    messageService = inject(MessagesService);
    #expiringSignal = signal<boolean | null>(false);
    expiring = this.#expiringSignal.asReadonly();
    #expiredSignal = signal<boolean | null>(false);
    expired = this.#expiredSignal.asReadonly();

    isExpiring = computed(() => this.expiring());
    isExpired = computed(() => this.expired());

    constructor() {
        let userTimeout: number | null = null;
        effect(() => {
            if (this.isExpiring()) {
                console.log(`Session is expiring.`);
            }
            if (this.isExpired()) {
                console.log(`Session is expired.`);
                this.authService.logout();
                if(userTimeout) {
                    clearInterval(userTimeout);
                    userTimeout = null;
                }
            }
        });
        userTimeout = window.setInterval(() => {
            this.checkExpiry().catch((error) => console.error(error));
        }, 5000);
    }

    checkExpiry(): Promise<void> {
        return new Promise((resolve, reject) => {
            let user: User | null = null;
            const userItem = sessionStorage.getItem(USER_STORAGE_KEY);
            if (userItem) {
                user = JSON.parse(userItem) as User;
            } if (user) {
                const currentTime = Math.floor(Date.now() / 1000);
                const exp = user.exp;
                if (exp - currentTime <= 60 && exp - currentTime > 0) {
                    this.#expiringSignal.set(true);
                    resolve();
                } else if (currentTime >= exp) {
                    this.#expiredSignal.set(true);
                    resolve();
                } else {
                    this.#expiringSignal.set(false);
                    this.#expiredSignal.set(false);
                }
            } else {
                reject('No user in session.');
            }
        });
    }
}