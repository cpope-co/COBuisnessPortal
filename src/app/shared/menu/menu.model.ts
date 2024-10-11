/**
 * Represents a menu item in the application.
 * 
 * @typedef {Object} MenuItem
 * @property {string} title - The title of the menu item.
 * @property {string} route - The route path associated with the menu item.
 * @property {MenuItem[]} [children] - Optional nested menu items.
 * @property {MenuItemOptions} [options] - Optional additional options for the menu item.
 */

/**
 * Represents additional options for a menu item.
 * 
 * @typedef {Object} MenuItemOptions
 * @property {boolean} display - Indicates whether the menu item should be displayed.
 * @property {boolean} [heading] - Optional flag to indicate if the menu item is a heading.
 * @property {number} role - The role associated with the menu item.
 */
export type MenuItem = {
    title: string;
    route: string;
    children?: MenuItem[];
    options?: MenuItemOptions;
}
export type MenuItemOptions = {
    display: boolean;
    heading?: boolean;
    role: number;
}
