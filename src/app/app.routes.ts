import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { isUserAuthenticated } from './guards/auth.guard';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './auth/register/register.component';
import { VerifyComponent } from './auth/verify/verify.component';
import { ChangePasswordComponent } from './auth/change-password/change-password.component';
import { UsersListComponent } from './admin/users-list/users-list.component';
import { UserDetailComponent } from './admin/user-detail/user-detail.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'auth/login',
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
        path: 'auth/verify/:token',
        component: VerifyComponent,
    },
    {
        path: 'auth/change-password',
        component: ChangePasswordComponent,
    },
    {
        path: 'admin/users',
        component: UsersListComponent,
    },
    {
        path: 'admin/user/:id',
        component: UserDetailComponent,
    },
    {
        path: '**',
        redirectTo: 'home'
    }

];
