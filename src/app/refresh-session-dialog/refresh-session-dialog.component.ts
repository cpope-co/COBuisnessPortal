import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RefreshSessionDialogData } from './refresh-session-dialog.data.model';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-refresh-session-dialog',
  standalone: true,
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

  data: RefreshSessionDialogData = inject(MAT_DIALOG_DATA);

  async onLogout() {
    await this.authService.logout();
    this.dialogRef.close();
  }

  async onRefresh() {
    // Refresh the session
    await this.sessionService.resetSession();
    this.dialogRef.close();
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