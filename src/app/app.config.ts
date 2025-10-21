import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from "@angular/common/http";
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { loadingInterceptor } from './loading/loading.interceptor';
import { provideEnvironmentNgxMask } from 'ngx-mask';
import { tokenInterceptor } from './shared/token.interceptor';
import { RefreshInterceptor } from './shared/refresh.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
    ),
    importProvidersFrom(
      ReactiveFormsModule,
      BrowserModule
    ),
    provideAnimationsAsync(),
    provideEnvironmentNgxMask(),
    provideHttpClient(
      withFetch(),
      withInterceptors([loadingInterceptor, tokenInterceptor]),
      withInterceptorsFromDi()
    ),
    provideAnimationsAsync(),
    { provide: HTTP_INTERCEPTORS, useClass: RefreshInterceptor, multi: true }
  ]
};