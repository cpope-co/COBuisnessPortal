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

import { effect, inject, Injectable, signal } from "@angular/core";
import { MenuItem } from "./menu.model";
import { routes } from '../../app.routes';
import { AuthService } from "../../auth/auth.service";
import { PermissionsService } from "../../services/permissions.service";
import { Permission } from "../../models/permissions.model";
import { Route } from "@angular/router";

@Injectable({
    providedIn: 'root'
})

export class MenuService {

    authService = inject(AuthService);
    permissionsService = inject(PermissionsService);

    menuItems = signal<MenuItem[]>([]);
    routes = signal<Route[]>(routes);

    constructor() {
        // React to user and permission changes without causing circular dependency
        effect(() => {
            const user = this.authService.user();
            const permissions = this.permissionsService.userPermissions();
            
            // Debug logging removed for production. Use environment-based logging if needed.
            
            // When user or permissions change, rebuild menu
            if (user) {
                this.refreshMenu();
            } else {
                this.clearMenuItems();
            }
        });
        
        // Rebuild menu when permissions are loaded (e.g., after login)
        effect(() => {
            const permissionsLoaded = this.permissionsService.permissionsLoaded();
            if (permissionsLoaded > 0 && this.authService.user()) {
                this.refreshMenu();
            }
        });
    }

    clearMenuItems() {
        this.menuItems.set([]);
        sessionStorage.removeItem('menuItems');
    }

    /**
     * Rebuilds and refreshes the menu items
     */
    refreshMenu() {
        this.clearMenuItems();
        const newMenuItems = this.buildMenu();
        this.setMenuItems(newMenuItems);
        this.menuItems.set(newMenuItems);
    }

    buildMenu(): MenuItem[] {
        const user = this.authService.user();
        if (user) {
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
                    // Check if menu item should be displayed
                    if (!menuItem.options?.display) {
                        return false;
                    }

                    // Check role-based access (includes admin bypass)
                    // Role-based access is now delegated to PermissionsService.hasRole(), replacing previous userRole logic.
                    // Check role-based access (includes admin bypass)
                    const menuItemRole = menuItem.options?.role;
                    const hasRoleAccess = !menuItemRole || this.permissionsService.hasRole(menuItemRole);
                    // Check permissions-based access for routes with resource
                    let hasPermissionAccess = true;
                    const routeData = this.findRouteData(menuItem.route);
                    
                    if (routeData?.resource && routeData?.requiredPermissions) {
                        const resource = routeData.resource;
                        const requiredPermissions = routeData.requiredPermissions as Permission[];
                        
                        // Ensure user has ALL required permissions for the resource
                        hasPermissionAccess = this.permissionsService.hasResourcePermissions(resource, requiredPermissions);
                        hasPermissionAccess = this.permissionsService.hasResourcePermissions(resource, requiredPermissions);
                    }

                    // For parent routes with children, show if any child is accessible
                    if (menuItem.children && menuItem.children.length > 0) {
                        const hasAccessibleChildren = menuItem.children.some(child => {
                            const childRouteData = this.findRouteData(child.route);
                            if (childRouteData?.resource && childRouteData?.requiredPermissions) {
                                const childRequiredPermissions = childRouteData.requiredPermissions as Permission[];
                                // Ensure user has ALL required permissions for the resource
                                return this.permissionsService.hasResourcePermissions(childRouteData.resource, childRequiredPermissions);
                                
                            }
                            // If no specific permissions required, check role access (includes admin bypass)
                            const childRole = child.options?.role;
                            return !childRole || this.permissionsService.hasRole(childRole);
                        });
                        return hasRoleAccess && hasAccessibleChildren;
                    }

                    return hasRoleAccess && hasPermissionAccess;
                }).map(menuItem => {
                    // Filter children recursively
                    if (menuItem.children) {
                        menuItem.children = menuItem.children.filter(child => {
                            const childRouteData = this.findRouteData(child.route);
                            if (childRouteData?.resource && childRouteData?.requiredPermissions) {
                                const childRequiredPermissions = childRouteData.requiredPermissions as Permission[];
                                return this.permissionsService.hasResourcePermissions(childRouteData.resource, childRequiredPermissions);
                            }
                            // If no specific permissions required, check role access (includes admin bypass)
                            const childRole = child.options?.role;
                            return !childRole || this.permissionsService.hasRole(childRole);
                        });
                    }
                    return menuItem;
                });
            };

            const items = processRoutes(this.routes());
            return items as MenuItem[];

        } else {
            return [];
        }
    }

    /**
     * Helper method to find route data by path
     */
    private findRouteData(path: string): any {
        const findInRoutes = (routes: Route[], targetPath: string): any => {
            for (const route of routes) {
                if (route.path === targetPath.split('/').pop()) {
                    return route.data;
                }
                if (route.children) {
                    const found = findInRoutes(route.children, targetPath);
                    if (found) return found;
                }
            }
            return null;
        };
        return findInRoutes(this.routes(), path);
    }

    setMenuItems(menuItems: MenuItem[]) {
        sessionStorage.setItem('menuItems', JSON.stringify(menuItems));
    }

    getMenuItems(): MenuItem[] {
        // Always rebuild menu if we have a user, don't trust stale sessionStorage
        if (this.authService.user()) {
            if (this.menuItems().length === 0) {
                const newMenuItems = this.buildMenu();
                this.setMenuItems(newMenuItems);
                this.menuItems.set(newMenuItems);
            }
        } else {
            // No user, clear everything
            this.clearMenuItems();
        }
        return this.menuItems();
    }


}