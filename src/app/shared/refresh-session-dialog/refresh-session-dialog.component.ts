import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RefreshSessionDialogData } from './refresh-session-dialog.data.model';
import { AuthService } from '../../auth/auth.service';
import { SessionService } from '../../services/session.service';
import { MessagesService } from '../../messages/messages.service';

@Component({
    selector: 'app-refresh-session-dialog',
    imports: [
        MatDialogModule,
        MatButtonModule
    ],
    templateUrl: './refresh-session-dialog.component.html',
    styleUrl: './refresh-session-dialog.component.scss'
})
export class RefreshSessionDialogComponent {
  dialogRef = inject(MatDialogRef<RefreshSessionDialogComponent>);
  authService = inject(AuthService);
  sessionService = inject(SessionService);
  messageService = inject(MessagesService);

  data: RefreshSessionDialogData = inject(MAT_DIALOG_DATA);

  async onLogout() {
    await this.authService.logout('manual');
    this.dialogRef.close();
  }

  async onRefresh() {
    try {
      // Refresh the session
      await this.sessionService.resetSession();
      this.dialogRef.close();
    } catch (error: any) {
      // Differentiate between expired refresh token (401) and other errors
      if (error?.status === 401) {
        this.messageService.showMessage('Your session has expired. Please log in again.', 'danger');
      } else {
        this.messageService.showMessage('Session refresh failed due to a network error. Please try again or log in.', 'danger');
      }
      await this.authService.logout('token-expired');
      this.dialogRef.close();
    }
  }
}

function createDefaultDialogConfig() {
  const config = new MatDialogConfig();
  config.disableClose = true;
  config.autoFocus = true;
  config.width = '400px';
  return config;
}

export function openRefreshSessionDialog(dialog: MatDialog, data: RefreshSessionDialogData) {
  const config = createDefaultDialogConfig();
  config.data = data;
  return dialog.open(RefreshSessionDialogComponent, config);
}