import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { isUserAuthenticated } from './guards/auth.guard';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './auth/register/register.component';
import { VerifyComponent } from './auth/verify/verify.component';
import { SetPasswordComponent } from './auth/set-password/set-password.component';
import { UsersListComponent } from './admin/users-list/users-list.component';
import { UserDetailComponent } from './admin/user-detail/user-detail.component';
import { ProfileComponent } from './profile/profile.component';

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
        path: 'auth/set-password',
        component: SetPasswordComponent,
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
        path: 'profile',
        component: ProfileComponent,
    },
    {
        path: '**',
        redirectTo: 'home'
    }

];
