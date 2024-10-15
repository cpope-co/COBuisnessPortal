import { inject } from "@angular/core";
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { AuthService } from "../auth/auth.service";
import { MessagesService } from "../messages/messages.service";

export const isUserAdmin: CanActivateFn =
    (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {

        const authService = inject(AuthService);
        const router = inject(Router);
        if (authService.isAdmin()) {
            return true;
        } else {
            router.navigate(['/auth/unauthorized']);
            return false;
        }
    } 