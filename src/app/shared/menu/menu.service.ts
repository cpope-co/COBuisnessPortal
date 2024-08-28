import { inject, Injectable, signal } from "@angular/core";
import { MenuItem } from "./menu.model";
import { routes } from '../../app.routes';
import { AuthService } from "../../auth/auth.service";
import { Route } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class MenuService {

    authService = inject(AuthService);

    menuItems = signal<MenuItem[]>([]);
    routes = signal<Route[]>(routes);

    constructor(
    ) {

    }

    clearMenuItems() {
        this.menuItems.set([]);
    }

    loadMenuItems(): MenuItem[] {
        const user = this.authService.user();
        if (user) {
            const userRole = user.role;
            const processRoutes = (routes: Route[], parentPath: string = ''): MenuItem[] => {
                return routes.map(route => {
                    const fullPath = parentPath ? `${parentPath}/${route.path}` : route.path;
                    const menuItem: MenuItem = {
                        title: route.title?.toString() || '',
                        route: fullPath || '',
                        options: route.data ? { display: route.data['display'], heading: route.data['heading'], role: route.data['role'] } : undefined,
                        children: route.children ? processRoutes(route.children, fullPath) : undefined // Recursively process children with full path
                    };
                    return menuItem;
                }).filter(menuItem => {
                    if(userRole === 1) {
                        return menuItem.options?.display !== false && (!menuItem.children || menuItem.children.length > 0);
                    }
                    const menuItemRole = menuItem.options?.role;
                    return menuItem.options?.display !== false && (!menuItem.children || menuItem.children.length > 0) && (!menuItemRole || menuItemRole === userRole);
                });
            };

            const items = processRoutes(this.routes());
            console.log('Menu items:', items);
            return items as MenuItem[];

        } else {
            return [];
        }
    }


}