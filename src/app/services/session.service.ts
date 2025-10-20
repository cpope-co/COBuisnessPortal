import { Injectable, inject, effect } from '@angular/core';
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
        // Save session state on login
        effect(() => {
            // 'loginTrigger' is a counter incremented on each login event; when it increases, this effect runs.
            const loginTrigger = this.authService.loginTrigger();
            if (loginTrigger > 0) {
                this.saveSessionState();
            }
        });
        
        // Stop session check on logout
        effect(() => {
            // logoutTrigger is a counter incremented on logout events; effect runs when it changes
            const logoutTrigger = this.authService.logoutTrigger();
            if (logoutTrigger > 0) {
                this.stopSessionCheck();
            }
        });
    }

    startSessionCheck() {
        this.#warningIntervalId = window.setInterval(() => this.checkWarningTimeout(), 10000);
        this.#sessionIntervalId = window.setInterval(() => this.checkSessionTimeout(), 10000);
    }

    private checkWarningTimeout() {
        const warningTimeoutString = sessionStorage.getItem('warningTimeout') || "0";
        const warningTimeoutEpoch = parseInt(warningTimeoutString, 10) || 0;
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
        const sessionTimeoutString = sessionStorage.getItem('sessionTimeout') || "0";
        const sessionTimeoutEpoch = parseInt(sessionTimeoutString, 10) || 0;
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
        if (this.dialog) {
            this.openRefreshSessionDialog();
        }
    }

    // Wrapper method to make testing easier
    private openRefreshSessionDialog() {
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
    async resetSession() {
        this.stopSessionCheck();
        try {
            await this.authService.refresh();
            this.saveSessionState();
            this.startSessionCheck();
        } catch (error) {
            // Re-throw the error so calling code can handle it
            throw error;
        }
    }
    saveSessionState() {
        const user = this.authService.user();
        if (user) {
            sessionStorage.setItem('sessionTimeout', `${user.exp}`);
            sessionStorage.setItem('warningTimeout', `${user.exp - 120}`);
        } else {
            // Clear session storage when user is null
            sessionStorage.removeItem('sessionTimeout');
            sessionStorage.removeItem('warningTimeout');
        }
    }

    isSessionActive(): boolean {
        const user = this.authService.user();
        if (!user) {
            return false; // Don't call logout here, let the caller handle it
        }

        if (user?.exp && user.exp * 1000 < Date.now()) {
            return false;
        }
        return true;
    }
    
    canRefresh(): boolean {
        const user = this.authService.user();
        if (!user) {
            return false; // Don't call logout here, let the caller handle it
        }
        if (user?.refexp && user.refexp * 1000 < Date.now()) {
            return true;
        }
        return false;
    }
}