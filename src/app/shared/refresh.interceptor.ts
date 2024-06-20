import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { SKIP_AUTH_KEY, SKIP_REFRESH_KEY } from './http-context-keys';
import { AuthService } from '../services/auth.service';

@Injectable()
export class RefreshInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if(req.context.get(SKIP_REFRESH_KEY)) {
      return next.handle(req);
    }


    const user = JSON.parse(sessionStorage.getItem('user')!);

    // If user's expiration time is past than the current time, refresh the token
    


    return next.handle(req).pipe(
      finalize(() => {
      })
    );
  }
}