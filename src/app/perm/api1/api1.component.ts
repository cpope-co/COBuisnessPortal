import { Component, inject, signal } from '@angular/core';
import { PermissionsService } from '../../services/permissions.service';
import { Permission } from '../../models/permissions.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-api1',
  imports: [
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './api1.component.html',
  styleUrl: './api1.component.scss'
})
export class Api1Component {
  RESOURCE_NAME = 'API1';
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
