import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { SessionService } from '../../services/session.service';
import { RefreshSessionDialogComponent } from '../refresh-session-dialog/refresh-session-dialog.component';
import { LoseChangesDialogData } from './lose-changes-dialog.data.model';

@Component({
  selector: 'app-lose-changes-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule],
  templateUrl: './lose-changes-dialog.component.html',
  styleUrl: './lose-changes-dialog.component.scss'
})
export class LoseChangesDialogComponent {
  dialogRef = inject(MatDialogRef<RefreshSessionDialogComponent>);
  authService = inject(AuthService);
  sessionService = inject(SessionService);

  data: LoseChangesDialogData = inject(MAT_DIALOG_DATA);

  async onCancel() {
    
    this.dialogRef.close();
  }

  async onStay() {
    
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

export function openLoseChangesDialog(dialog: MatDialog, data: LoseChangesDialogData) {
  const config = createDefaultDialogConfig();
  config.data = data;
  return dialog.open(LoseChangesDialogComponent, config);
}