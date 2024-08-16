import { Injectable, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { openRefreshSessionDialog } from '../shared/refresh-session-dialog/refresh-session-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MessagesService } from '../messages/messages.service';

@Injectable({
    providedIn: 'root'
})
export class SessionService {
    #sessionIntervalId: number | null = null;
    #warningIntervalId: number | null = null;

    dialog = inject(MatDialog);
    authService = inject(AuthService);
    messagesService = inject(MessagesService);

    constructor() {
        this.authService.loginEvent.subscribe(() => {
            this.saveSessionState();
        });
        this.authService.logoutEvent.subscribe(() => {
            this.stopSessionCheck();
        });
    }

    startSessionCheck() {
        this.#warningIntervalId = window.setInterval(() => this.checkWarningTimeout(), 10000);
        this.#sessionIntervalId = window.setInterval(() => this.checkSessionTimeout(), 10000);
    }

    private checkWarningTimeout() {
        const warningTimeoutEpoch = parseInt(sessionStorage.getItem('warningTimeout') || "0", 10);
        const currentTimeEpoch = Math.floor(Date.now() / 1000); // Current time in seconds since epoch

        const remainingWarningTimeMs = Math.max(0, (warningTimeoutEpoch - currentTimeEpoch) * 1000);

        if (remainingWarningTimeMs <= 0) {
            this.handleWarningTimeout();
            if (this.#warningIntervalId !== null) {
                clearInterval(this.#warningIntervalId);
            }
        }
    }

    private checkSessionTimeout() {
        const sessionTimeoutEpoch = parseInt(sessionStorage.getItem('sessionTimeout') || "0", 10);
        const currentTimeEpoch = Math.floor(Date.now() / 1000); // Current time in seconds since epoch

        const remainingSessionTimeMs = Math.max(0, (sessionTimeoutEpoch - currentTimeEpoch) * 1000);

        if (remainingSessionTimeMs <= 0) {
            this.handleSessionTimeout();
            if (this.#sessionIntervalId !== null) {
                clearInterval(this.#sessionIntervalId);
            }
        }
    }

    private handleWarningTimeout() {
        openRefreshSessionDialog(this.dialog, {
            mode: 'refresh',
            title: 'Session Expiring',
            message: 'Your session will expire in 2 minutes. Do you want to refresh it?'
        });
    }

    private async handleSessionTimeout() {
        this.dialog.closeAll();
        await this.authService.logout();
    }

    stopSessionCheck() {
        if (this.#warningIntervalId !== null) {
            clearInterval(this.#warningIntervalId);
        }
        if (this.#sessionIntervalId !== null) {
            clearInterval(this.#sessionIntervalId);
        }
    }
    resetSession() {
        this.stopSessionCheck();
        this.authService.refresh().then(() => {
            this.saveSessionState();
            this.startSessionCheck();
        });
    }
    saveSessionState() {
        const user = this.authService.user();
        if (user) {
            sessionStorage.setItem('sessionTimeout', `${user.exp}`);
            sessionStorage.setItem('warningTimeout', `${user.exp - 120}`);
        }
    }

    isSessionActive(): boolean {
        const user = this.authService.user();
        if (!user) {
            this.authService.logout();
        }

        if (user?.exp && user.exp * 1000 < Date.now()) {
            return false;
        }
        return true;
    }
    
    canRefresh(): boolean {
        const user = this.authService.user();
        if (!user) {
            this.authService.logout();
        }
        if (user?.refexp && user.refexp * 1000 < Date.now()) {
            return true;
        }
        return false;
    }
}