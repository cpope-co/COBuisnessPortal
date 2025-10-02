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
import { isUserApiUser } from './guards/api-user.guard';
import { ForgotComponent } from './auth/forgot/forgot.component';
import { UnauthorizedComponent } from './auth/unauthorized/unauthorized.component';
import { ApiTokenManagementComponent } from './apiUser/api-token-management/api-token-management.component';
import { ApiSettingsComponent } from './admin/api-settings/api-settings.component';
import { UnsecuredTestComponent } from './unsecured-test/unsecured-test.component';
import { PriceBookComponent } from './customers/price-book/price-book.component';
import { Api1Component } from './perm/api1/api1.component';
import { Api2Component } from './perm/api2/api2.component';
import { Api3Component } from './perm/api3/api3.component';
import { Api4Component } from './perm/api4/api4.component';
import { Api5Component } from './perm/api5/api5.component';
import { Api6Component } from './perm/api6/api6.component';
import { Api7Component } from './perm/api7/api7.component';
import { Api8Component } from './perm/api8/api8.component';
import { hasResourcePermission } from './guards/hasPermission.guard';
import { Permission } from './models/permissions.model';

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
        path: 'test',
        title: 'Test',
        component: UnsecuredTestComponent,
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
            {
                path: 'api-settings',
                title: 'API Settings',
                component: ApiSettingsComponent,
                canActivate: [isUserAdmin],
                data: { display: true, role: 1 }
            }
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
                component: PriceBookComponent,
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
        // canActivate: [isUserAuthenticated]
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
    },
    {
        path: 'apiuser',
        title: 'API User',
        children: [
            {
                path: 'api-token-management',
                title: 'Api Token Management',
                component: ApiTokenManagementComponent,
                data: { display: true, role: 5 }
            }
        ],
        data: { display: true, heading: true, role: 5 },
        canActivate: [isUserAuthenticated, isUserApiUser]
    },
    {
        path: 'perm',
        title: 'Permissions',
        children: [
            {
                path: 'api1',
                title: 'API 1',
                component: Api1Component,
                canActivate: [isUserAuthenticated, hasResourcePermission],
                data: {
                    display: true,
                    resource: 'API1',
                    requiredPermissions: [Permission.READ]
                }
            },
            {
                path: 'api2',
                title: 'API 2',
                component: Api2Component,
                canActivate: [isUserAuthenticated, hasResourcePermission],
                data: {
                    display: true,
                    resource: 'API2',
                    requiredPermissions: [Permission.READ]
                }
            },
            {
                path: 'api3',
                title: 'API 3',
                component: Api3Component,
                canActivate: [isUserAuthenticated, hasResourcePermission],
                data: {
                    display: true,
                    resource: 'API3',
                    requiredPermissions: [Permission.READ]
                }
            },
            {
                path: 'api4',
                title: 'API 4',
                component: Api4Component,
                canActivate: [isUserAuthenticated, hasResourcePermission],
                data: {
                    display: true,
                    resource: 'API4',
                    requiredPermissions: [Permission.READ]
                }
            },
            {
                path: 'api5',
                title: 'API 5',
                component: Api5Component,
                canActivate: [isUserAuthenticated, hasResourcePermission],
                data: {
                    display: true,
                    resource: 'API5',
                    requiredPermissions: [Permission.READ]
                }
            },
            {
                path: 'api6',
                title: 'API 6',
                component: Api6Component,
                canActivate: [isUserAuthenticated, hasResourcePermission],
                data: {
                    display: true,
                    resource: 'API6',
                    requiredPermissions: [Permission.READ]
                }
            },
            {
                path: 'api7',
                title: 'API 7',
                component: Api7Component,
                canActivate: [isUserAuthenticated, hasResourcePermission],
                data: {
                    display: true,
                    resource: 'API7',
                    requiredPermissions: [Permission.READ]
                }
            },
            {
                path: 'api8',
                title: 'API 8',
                component: Api8Component,
                canActivate: [isUserAuthenticated, hasResourcePermission],
                data: {
                    display: true,
                    resource: 'API8',
                    requiredPermissions: [Permission.READ]
                }
            }
        ],
        data: { display: true, heading: true }
    },
    {
        path: '**',
        redirectTo: 'home',
        data: { display: false }
    }

];
