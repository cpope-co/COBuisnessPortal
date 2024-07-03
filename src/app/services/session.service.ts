import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { openRefreshSessionDialog } from '../shared/refresh-session-dialog/refresh-session-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MessagesService } from '../messages/messages.service';


const WARNING_TIMEOUT = 480000;
const SESSION_TIMEOUT = 594000;

@Injectable({
    providedIn: 'root'
})
export class SessionService {
    #sessionTimeoutId: any;
    #warningTimeoutId: any;
    dialog = inject(MatDialog);
    authService = inject(AuthService);
    messagesService = inject(MessagesService);
    

    async startSession(): Promise<string> {
        console.log('Starting session.');
        return new Promise((resolve) => {
            this.#warningTimeoutId = setTimeout(() => {
                console.log('Session will expire in 2 minutes.');
                openRefreshSessionDialog(this.dialog, {
                    mode: 'refresh',
                    title: 'Session Expiring',
                    message: 'Your session will expire in 2 minutes. Do you want to refresh it?'
                });
                resolve('Your session will expire in 2 minutes.');
            }, WARNING_TIMEOUT);
            this.#sessionTimeoutId = setTimeout(async () => {
                this.dialog.closeAll();
                await this.authService.logout();
                resolve('Your session has expired.');
            }, SESSION_TIMEOUT);
        });
    }

    async resetSession() {
        clearTimeout(this.#sessionTimeoutId);
        clearTimeout(this.#warningTimeoutId);
        await this.authService.refresh();
        this.startSession();
    }

    async endSesssion() {
        clearTimeout(this.#sessionTimeoutId);
        clearTimeout(this.#warningTimeoutId);
    }

    isSessionActive(): boolean {
        const user = this.authService.user();
        if (!user) {
          this.authService.logout();
        }
        
        if(user?.exp && user.exp * 1000 < Date.now()) {
            return false;
        }
        return true;
    }
    canRefresh(): boolean {
        const user = this.authService.user();
        if (!user) {
          this.authService.logout();
        }
        if(user?.refexp && user.refexp * 1000 < Date.now()) {
            return true;
        }
        return false;
    }
}