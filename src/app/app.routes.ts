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
import { isUserAdmin } from './guards/admin.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full',
        data: { display: false }
    },

    {
        path: 'home',
        title: 'Home',
        component: HomeComponent,
        canActivate: [isUserAuthenticated],
        data: { display: true, heading: false }
    },
    {
        path: 'auth/login',
        title: 'Login',
        component: LoginComponent,
        data: { display: false }
    },
    {
        path: 'auth/register',
        title: 'Register',
        component: RegisterComponent,
        data: { display: false }
    },
    {
        path: 'auth/verify/:token',
        title: 'Verify',
        component: VerifyComponent,
        data: { display: false }

    },
    {
        path: 'auth/set-password',
        title: 'Set Password',
        component: SetPasswordComponent,
        data: { display: false }

    },
    {
        path: 'admin',
        title: 'Admin',
        children: [
            {
                path: 'users',
                title: 'Users',
                component: UsersListComponent,
                canActivate: [isUserAdmin],
                data: { display: true, role: 1 }

            },
            {
                path: 'user/:id',
                title: 'User Detail',
                component: UserDetailComponent,
                canActivate: [isUserAdmin],
                data: { display: false, role: 1 }

            },
        ],
        data: { display: true, heading: true, role: 1 },
        canActivate: [isUserAdmin]

    },
    {
        path: 'profile',
        title: 'Profile',
        component: ProfileComponent,
        data: { display: false }

    },
    {
        path: '**',
        redirectTo: 'home',
        data: { display: false }
    }

];
