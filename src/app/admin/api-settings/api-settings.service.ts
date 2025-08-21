import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ApiSettingsService {
  env = environment;
  router = inject(Router);
  dialog = inject(MatDialog);
  http = inject(HttpClient);
}
