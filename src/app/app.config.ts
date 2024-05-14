import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { loadingInterceptor } from './loading/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(
      ReactiveFormsModule,
      BrowserModule
    ),
    provideAnimationsAsync(),
    provideHttpClient(
      withFetch(),
      withInterceptors([loadingInterceptor])
    ), provideAnimationsAsync()
  ]
};