/**
 * Service responsible for managing the application's menu items.
 * 
 * @class
 * @name MenuService
 * 
 * @property {AuthService} authService - Injected authentication service to get user information.
 * @property {Signal<MenuItem[]>} menuItems - Signal to hold the current menu items.
 * @property {Signal<Route[]>} routes - Signal to hold the application's routes.
 * 
 * @method clearMenuItems - Clears the current menu items.
 * @method buildMenu - Builds the menu items based on the user's role and available routes.
 * @returns {MenuItem[]} - The built menu items.
 * @method setMenuItems - Stores the given menu items in the session storage.
 * @param {MenuItem[]} menuItems - The menu items to be stored.
 * @method getMenuItems - Retrieves the menu items from the session storage or the current signal.
 * @returns {MenuItem[]} - The retrieved menu items.
 */

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

    buildMenu(): MenuItem[] {
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
            return items as MenuItem[];

        } else {
            return [];
        }
    }

    setMenuItems(menuItems: MenuItem[]) {
        sessionStorage.setItem('menuItems', JSON.stringify(menuItems));
    }

    getMenuItems(): MenuItem[] {
        if(this.menuItems().length === 0) {
            const menuItems = JSON.parse(sessionStorage.getItem('menuItems') || '[]');
            this.menuItems.set(menuItems);
        }
        return this.menuItems();
    }


}