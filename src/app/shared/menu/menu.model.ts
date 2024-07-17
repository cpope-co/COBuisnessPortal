export type MenuItem = {
    title: string;
    route: string;
    children?: MenuItem[];
    options?: MenuItemOptions;
}
export type MenuItemOptions = {
    display: boolean;
    heading?: boolean;
}
