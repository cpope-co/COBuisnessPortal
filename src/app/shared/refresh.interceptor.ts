import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { SKIP_AUTH_KEY, SKIP_REFRESH_KEY } from './http-context-keys';
import { SessionService } from '../services/session.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class RefreshInterceptor implements HttpInterceptor {
  sessionService = inject(SessionService);
  authService = inject(AuthService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (req.context.get(SKIP_REFRESH_KEY)) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Handle 401 error, e.g., by refreshing the session or redirecting to login
          if (!this.sessionService.isSessionActive() && this.sessionService.canRefresh()) {
            // Attempt to refresh the session or token
            this.sessionService.resetSession();
            // Optionally, reattempt the request here
          } else {
            // Redirect to login or handle session inactive state
            this.authService.logout();
          }
        }
        // Re-throw the error if it's not handled above
        return throwError(error);
      }),
      finalize(() => {
        // Any final operations after the request completes
      })
    );
  }
}