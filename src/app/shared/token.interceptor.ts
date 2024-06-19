import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { finalize } from "rxjs";
import { SKIP_AUTH_KEY } from "./http-context-keys";

export const tokenInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    if(req.context.get(SKIP_AUTH_KEY)) {
        return next(req);
    }
    // Add the token to the request
    const token = sessionStorage.getItem('token');
    req = req.clone({
        setHeaders: {
            'Authorization': `Bearer ${token}`
        },
        withCredentials: true
    });

    return next(req).pipe(
        finalize(() => {
        })
    );
}