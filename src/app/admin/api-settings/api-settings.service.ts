import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpContext } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { apiResponse } from '../../models/response.model';
import { SKIP_AUTH_KEY, SKIP_REFRESH_KEY } from '../../shared/http-context-keys';
import { ApiResponseError } from '../../shared/api-response-error';

@Injectable({
  providedIn: 'root'
})
export class ApiSettingsService {
  env = environment;
  router = inject(Router);
  dialog = inject(MatDialog);
  http = inject(HttpClient);

  async createApiSettings(apiSettings: Partial<any>): Promise<any> {
    const context = new HttpContext().set(SKIP_REFRESH_KEY, true).set(SKIP_AUTH_KEY, true);
    const apiSettings$ = this.http.post<apiResponse>(`${this.env.apiBaseUrl}api-settings`, apiSettings, { context });

    const response = await firstValueFrom(apiSettings$);

    if (!response.success) {
      // Check if there are validation errors and throw them
      if (response.validationErrors && response.validationErrors.length > 0) {
        throw new ApiResponseError("Validation errors", response.validationErrors || []);
      } else {
        // If there are no validation errors, throw a generic error
        throw new Error('API settings creation failed without specific validation errors.');
      }
    }

    return response.data as any;
  }

  async getApiSettings(id: string): Promise<any> {
    const context = new HttpContext().set(SKIP_REFRESH_KEY, true);
    const apiSettings$ = this.http.get<apiResponse>(`${this.env.apiBaseUrl}api-settings/${id}`, { context });

    const response = await firstValueFrom(apiSettings$);

    if (!response.success) {
      // Check if there are validation errors and throw them
      if (response.validationErrors && response.validationErrors.length > 0) {
        throw new ApiResponseError("Validation errors", response.validationErrors || []);
      } else {
        // If there are no validation errors, throw a generic error
        throw new Error('API settings retrieval failed without specific validation errors.');
      }
    }

    return response.data as any;
  }

  async getAllApiSettings(): Promise<any[]> {
    const context = new HttpContext().set(SKIP_REFRESH_KEY, true);
    const apiSettings$ = this.http.get<apiResponse>(`${this.env.apiBaseUrl}api-settings`, { context });

    const response = await firstValueFrom(apiSettings$);

    if (!response.success) {
      // Check if there are validation errors and throw them
      if (response.validationErrors && response.validationErrors.length > 0) {
        throw new ApiResponseError("Validation errors", response.validationErrors || []);
      } else {
        // If there are no validation errors, throw a generic error
        throw new Error('API settings retrieval failed without specific validation errors.');
      }
    }

    return response.data as any[];
  }

  async updateApiSettings(id: string, apiSettings: Partial<any>): Promise<any> {
    const context = new HttpContext().set(SKIP_REFRESH_KEY, true);
    const apiSettings$ = this.http.put<apiResponse>(`${this.env.apiBaseUrl}api-settings/${id}`, apiSettings, { context });

    const response = await firstValueFrom(apiSettings$);

    if (!response.success) {
      // Check if there are validation errors and throw them
      if (response.validationErrors && response.validationErrors.length > 0) {
        throw new ApiResponseError("Validation errors", response.validationErrors || []);
      } else {
        // If there are no validation errors, throw a generic error
        throw new Error('API settings update failed without specific validation errors.');
      }
    }

    return response.data as any;
  }

  async deleteApiSettings(id: string): Promise<any> {
    const context = new HttpContext().set(SKIP_REFRESH_KEY, true);
    const apiSettings$ = this.http.delete<apiResponse>(`${this.env.apiBaseUrl}api-settings/${id}`, { context });

    const response = await firstValueFrom(apiSettings$);

    if (!response.success) {
      // Check if there are validation errors and throw them
      if (response.validationErrors && response.validationErrors.length > 0) {
        throw new ApiResponseError("Validation errors", response.validationErrors || []);
      } else {
        // If there are no validation errors, throw a generic error
        throw new Error('API settings deletion failed without specific validation errors.');
      }
    }

    return response.data as any;
  }
}
