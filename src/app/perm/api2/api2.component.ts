import { Component, inject } from '@angular/core';
import { Permission } from '../../models/permissions.model';
import { PermissionsService } from '../../services/permissions.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-api2',
  imports: [
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './api2.component.html',
  styleUrl: './api2.component.scss'
})
export class Api2Component {
  RESOURCE_NAME = 'API2';
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
