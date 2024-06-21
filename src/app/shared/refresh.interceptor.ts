import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { SKIP_AUTH_KEY, SKIP_REFRESH_KEY } from './http-context-keys';
import { SessionService } from '../services/session.service';

@Injectable()
export class RefreshInterceptor implements HttpInterceptor {
  sessionService = inject(SessionService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if(req.context.get(SKIP_REFRESH_KEY)) {
      return next.handle(req);
    }


    this.sessionService.resetSession();


    return next.handle(req).pipe(
      finalize(() => {
      })
    );
  }
}