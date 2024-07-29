import { inject } from "@angular/core";
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const isUserVendor: CanActivateFn =
    (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {

        const authService = inject(AuthService);
        if (authService.isVendor()) {
            return true;
        } else {
            return false;
        }
    } 