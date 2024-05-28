import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { isUserAuthenticated } from './guards/auth.guard';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './auth/register/register.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },

    {
        path: 'home',
        component: HomeComponent,
        canActivate: [isUserAuthenticated]
    },
    {
        path: 'auth/login',
        component: LoginComponent,
    },
    {
        path: 'auth/register',
        component: RegisterComponent,
    },
    {
        path: '**',
        redirectTo: 'home'
    }

];
