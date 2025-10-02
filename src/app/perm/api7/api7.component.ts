import { Component, inject } from '@angular/core';
import { Permission } from '../../models/permissions.model';
import { PermissionsService } from '../../services/permissions.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-api7',
  imports: [
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './api7.component.html',
  styleUrl: './api7.component.scss'
})
export class Api7Component {
  RESOURCE_NAME = 'API7';
  permissionService = inject(PermissionsService);

  canCreate = this.permissionService.createResourcePermissionSignal(this.RESOURCE_NAME, Permission.CREATE);
  canUpdate = this.permissionService.createResourcePermissionSignal(this.RESOURCE_NAME, Permission.UPDATE);
  canDelete = this.permissionService.createResourcePermissionSignal(this.RESOURCE_NAME, Permission.DELETE);
  create() {
    throw new Error('Method not implemented.');
  }
  update() {
    throw new Error('Method not implemented.');
  }
  delete() {
    throw new Error('Method not implemented.');
  }
}
