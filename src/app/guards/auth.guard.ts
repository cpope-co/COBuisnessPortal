import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot} from "@angular/router";
import { AuthService } from "../services/auth.service";
import {inject} from "@angular/core";
import { MessagesService } from "../messages/messages.service";


export const isUserAuthenticated: CanActivateFn =
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {

    const authService = inject(AuthService);
    const messageService = inject(MessagesService);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
      return true;
    } else {
      messageService.showMessage("You must be logged in to access this page.", "danger");
      return router.parseUrl("/auth/login");
    }
  }
