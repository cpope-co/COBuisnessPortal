import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../auth/auth.service';
import { SessionService } from '../../services/session.service';
import { LoseChangesDialogData } from './lose-changes-dialog.data.model';
import { Router } from '@angular/router';
import { MessagesService } from '../../messages/messages.service';

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
  dialogRef = inject(MatDialogRef<LoseChangesDialogComponent>);
  authService = inject(AuthService);
  sessionService = inject(SessionService);
  messageService = inject(MessagesService);
  router = inject(Router);

  data: LoseChangesDialogData = inject(MAT_DIALOG_DATA);

  async onCancel() {
    this.dialogRef.close();
    this.dialogRef.afterClosed().subscribe( async () => {
        this.router.navigate([this.data.destination]);
        this.messageService.showMessage('Changes were not saved', 'warning');
    });
    
  }

  async onStay() {
    this.messageService.showMessage('Complete your changes before leaving', 'info');
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