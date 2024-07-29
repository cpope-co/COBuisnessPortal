import { inject } from "@angular/core";
import { CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const isUserCustomer: CanActivateFn =
    (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {

        const authService = inject(AuthService);
        if (authService.isCustomer()) {
            return true;
        } else {
            return false;
        }
    } 