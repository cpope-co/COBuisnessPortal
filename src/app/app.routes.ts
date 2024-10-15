import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { isUserAuthenticated, isUserNotAuthenticated } from './guards/auth.guard';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './auth/register/register.component';
import { VerifyComponent } from './auth/verify/verify.component';
import { SetPasswordComponent } from './auth/set-password/set-password.component';
import { UsersListComponent } from './admin/users-list/users-list.component';
import { UserDetailComponent } from './admin/user-detail/user-detail.component';
import { ProfileComponent } from './profile/profile.component';
import { isUserAdmin } from './guards/admin.guard';
import { ProductCatalogComponent } from './vendors/product-catalog/product-catalog.component';
import { TradeShowComponent } from './vendors/trade-show/trade-show.component';
import { isUserVendor } from './guards/vendor.guard';
import { isUserCustomer } from './guards/customer.guard';
import { ForgotComponent } from './auth/forgot/forgot.component';
import { UnauthorizedComponent } from './auth/unauthorized/unauthorized.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
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
        path: 'auth',
        title: 'Auth',
        data: { display: false, heading: true },
        children: [
            {
                path: 'unauthorized',
                title: 'Unauthorized',
                component: UnauthorizedComponent,
                data: { display: false }
            },
            {
                path: 'login',
                title: 'Login',
                component: LoginComponent,
                data: { display: false },
                canActivate: [isUserNotAuthenticated]
            }, 
            {
                path: 'register',
                title: 'Register',
                component: RegisterComponent,
                data: { display: false }
            },
            {
                path: 'verify/:token',
                title: 'Verify',
                component: VerifyComponent,
                data: { display: false }
        
            },
            {
                path: 'set-password',
                title: 'Set Password',
                component: SetPasswordComponent,
                data: { display: false }
        
            },
            {
                path: 'forgot',
                title: 'Forgot Password',
                component: ForgotComponent,
                data: { display: false }
            }
        ]

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
        canActivate: [isUserAuthenticated, isUserAdmin]

    },
    {
        path: 'profile',
        title: 'Profile',
        component: ProfileComponent,
        data: { display: false },
        canActivate: [isUserAuthenticated]
    },
    {
        path: 'customer',
        title: 'Customer',
        children: [
            {
                path: 'pricebook',
                title: 'Pricebook',
                component: HomeComponent,
                data: { display: true, role: 2 }
            },
            {
                path: 'accruals',
                title: 'Accruals',
                component: HomeComponent,
                data: { display: true, role: 2 }
            },
            {
                path: 'retail-management',
                title: 'Retail Management',
                component: HomeComponent,
                data: { display: true, role: 2 }
            },
            {
                path: 'accounts-receivable',
                title: 'Accounts Receivable',
                component: HomeComponent,
                data: { display: true, role: 2 }
            },
            {
                path: 'sales-orders',
                title: 'Sales Orders',
                component: HomeComponent,
                data: { display: true, role: 2 }
            },
            {
                path: 'data-archive',
                title: 'Data Archive',
                component: HomeComponent,
                data: { display: true, role: 2 }
            },
            {
                path: 'ct114data',
                title: 'CT114 Data',
                component: HomeComponent,
                data: { display: true, role: 2 }
            }
        ],
        data: { display: true, heading: true, role: 2 },
        canActivate: [isUserAuthenticated, isUserCustomer]
    },
    {
        path: 'vendor',
        title: 'Vendors',
        children: [
            {
                path: 'product-catalog',
                title: 'Product Catalog',
                component: ProductCatalogComponent,
                data: { display: true, role: 3 },
            },
            {
                path: 'tradeshow',
                title: 'Tradeshow',
                component: TradeShowComponent,
                data: { display: true, role: 3 }
            }
        ],
        data: { display: true, heading: true, role: 3 },
        canActivate: [isUserAuthenticated, isUserVendor]
    },
    {
        path: '**',
        redirectTo: 'home',
        data: { display: false }
    }

];
