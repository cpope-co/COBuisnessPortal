import { inject } from "@angular/core";
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { AuthService } from "../auth/auth.service";

export const isUserVendor: CanActivateFn =
    (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {

        const authService = inject(AuthService);
        const router = inject(Router);
        if (authService.isVendor() || authService.isAdmin()) {
            return true;
        } else {
            router.navigate(["/auth/unauthorized"]);
            return false;
        }
    } 