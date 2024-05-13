import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { isUserAuthenticated } from './guards/auth.guard';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
    {
        path: 'home',
        component: HomeComponent,
        canActivate: [isUserAuthenticated]
    },
    {
        path: 'auth/login',
        component: LoginComponent,
    }

];
