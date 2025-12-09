import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { SKIP_AUTH_KEY, SKIP_REFRESH_KEY } from './http-context-keys';
import { SessionService } from '../services/session.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class RefreshInterceptor implements HttpInterceptor {
  sessionService = inject(SessionService);
  authService = inject(AuthService);
  private isLoggingOut = false; // Add flag to prevent infinite loops

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (req.context.get(SKIP_REFRESH_KEY)) {
      return next.handle(req);
    }

    // Skip interceptor for logout requests to prevent infinite loops
    if (req.url.includes('/logout')) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isLoggingOut) {
          // Handle 401 error, e.g., by refreshing the session or redirecting to login
          const isActive = this.sessionService.isSessionActive();
          const canRefresh = this.sessionService.canRefresh();
          
          if (!isActive && canRefresh) {
            // Attempt to refresh the session or token
            this.sessionService.stopSessionCheck();
            this.sessionService.startSessionCheck();
            // Optionally, reattempt the request here
          } else if (!isActive) {
            // Session is not active and cannot be refreshed - logout with token-expired reason
            this.isLoggingOut = true;
            this.authService.logout('token-expired').finally(() => {
              this.isLoggingOut = false;
            });
          }
        }
        // Re-throw the error if it's not handled above
        return throwError(() => error);
      }),
      finalize(() => {
        // Any final operations after the request completes
      })
    );
  }
}