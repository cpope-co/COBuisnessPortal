import { inject } from "@angular/core";
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const isUserAdmin: CanActivateFn =
    (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {

        const authService = inject(AuthService);
        if (authService.isAdmin()) {
            return true;
        } else {
            return false;
        }
    } 