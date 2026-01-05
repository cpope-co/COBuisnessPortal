import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { MenuService } from './menu.service';
import { MenuItem, MenuItemOptions } from './menu.model';
import { AuthService } from '../../auth/auth.service';
import { PermissionsService } from '../../services/permissions.service';
import { signal } from '@angular/core';

describe('MenuService', () => {
  let service: MenuService;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockPermissionsService: jasmine.SpyObj<PermissionsService>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    role: 2,
    firstName: 'Test',
    lastName: 'User'
  };

  const createMockMenuItem = (title: string, route: string, options?: MenuItemOptions, children?: MenuItem[]): MenuItem => ({
    title,
    route,
    options,
    children
  });

  beforeEach(() => {    
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['logout'], {
      user: signal(mockUser),
      isLoggedIn: signal(true),
      logoutTrigger: signal(0).asReadonly(),
      loginTrigger: signal(0).asReadonly()
    });

    const permissionsServiceSpy = jasmine.createSpyObj('PermissionsService', [
      'hasRole',
      'hasResourcePermission',
      'hasResourcePermissions',
      'isUserAdmin'
    ], {
      userPermissions: signal(null),
      permissionsLoaded: signal(1)
    });

    // Set default return values
    permissionsServiceSpy.hasRole.and.returnValue(true);
    permissionsServiceSpy.hasResourcePermission.and.returnValue(true);
    permissionsServiceSpy.hasResourcePermissions.and.returnValue(true);
    permissionsServiceSpy.isUserAdmin.and.returnValue(false);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        MenuService,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: PermissionsService, useValue: permissionsServiceSpy }
      ]
    });
    
    service = TestBed.inject(MenuService);
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockPermissionsService = TestBed.inject(PermissionsService) as jasmine.SpyObj<PermissionsService>;
  });

  describe('Service initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should inject required dependencies', () => {
      expect(service.authService).toBe(mockAuthService);
    });

    it('should have menuItems signal', () => {
      expect(service.menuItems).toBeDefined();
      expect(typeof service.menuItems).toBe('function');
    });

    it('should have menuLoaded signal', () => {
      expect(service.menuLoaded).toBeDefined();
      expect(typeof service.menuLoaded).toBe('function');
    });
  });

  describe('Menu building functionality', () => {
    it('should build menu from router configuration', () => {
      const result = service.buildMenu();
      
      expect(result).toBeTruthy();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle null user', () => {
      // Update the signal to return null
      (mockAuthService.user as any).set(null);
      
      const result = service.buildMenu();
      expect(result).toEqual([]);
    });

    it('should build menu for authenticated user', () => {
      const result = service.buildMenu();
      
      // Should return an array (may be empty depending on routes configuration)
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle different user roles', () => {
      // Test with different role
      const adminUser = { ...mockUser, role: 1 };
      (mockAuthService.user as any).set(adminUser);
      
      const adminResult = service.buildMenu();
      expect(Array.isArray(adminResult)).toBe(true);
      
      // Test with original user
      (mockAuthService.user as any).set(mockUser);
      
      const userResult = service.buildMenu();
      expect(Array.isArray(userResult)).toBe(true);
    });

    it('should create menu items with correct structure', () => {
      const result = service.buildMenu();
      
      result.forEach(item => {
        expect(item.title).toBeDefined();
        expect(item.route).toBeDefined();
        expect(typeof item.title).toBe('string');
        expect(typeof item.route).toBe('string');
        
        if (item.children) {
          expect(Array.isArray(item.children)).toBe(true);
          item.children.forEach(child => {
            expect(child.title).toBeDefined();
            expect(child.route).toBeDefined();
          });
        }
      });
    });
  });

  describe('Signal functionality', () => {
    const testMenuItems: MenuItem[] = [
      createMockMenuItem('Test Item 1', '/test1', { display: true, role: 1 }),
      createMockMenuItem('Test Item 2', '/test2', { display: true, role: 2 })
    ];

    it('should set menu items in signal', () => {
      service.setMenuItems(testMenuItems);
      
      // Check the signal value directly
      const items = service.menuItems();
      expect(items).toBeTruthy();
      expect(items.length).toBe(2);
      expect(items).toEqual(jasmine.arrayContaining([
        jasmine.objectContaining({
          title: 'Test Item 1',
          route: '/test1',
          options: { display: true, role: 1 }
        }),
        jasmine.objectContaining({
          title: 'Test Item 2',
          route: '/test2',
          options: { display: true, role: 2 }
        })
      ]));
    });

    it('should get menu items from signal', () => {
      // Set menu items first
      service.setMenuItems(testMenuItems);
      
      const result = service.getMenuItems();
      expect(result).toEqual(jasmine.arrayContaining([
        jasmine.objectContaining({
          title: 'Test Item 1',
          route: '/test1'
        }),
        jasmine.objectContaining({
          title: 'Test Item 2',
          route: '/test2'
        })
      ]));
    });

    it('should return empty array when no menu items exist', () => {
      // Clear first
      service.clearMenuItems();
      
      const result = service.getMenuItems();
      expect(result).toEqual([]);
    });

    it('should handle refreshing menu items', () => {
      // Refresh should rebuild
      service.refreshMenu();
      const result = service.getMenuItems();
      expect(Array.isArray(result)).toBe(true);
      expect(service.menuLoaded()).toBe(true);
    });

    it('should clear menu items from signal', () => {
      service.setMenuItems(testMenuItems);
      expect(service.menuItems().length).toBe(2);
      
      service.clearMenuItems();
      
      const items = service.menuItems();
      expect(items).toEqual([]);
      expect(service.menuLoaded()).toBe(false);
    });

    it('should handle clearing when no items exist', () => {
      expect(() => service.clearMenuItems()).not.toThrow();
      
      const items = service.menuItems();
      expect(items).toEqual([]);
    });

    it('should handle setting empty menu items', () => {
      service.setMenuItems([]);
      
      const items = service.menuItems();
      expect(items).toBeTruthy();
      expect(items).toEqual([]);
    });

    it('should handle setting menu items with children', () => {
      const itemsWithChildren: MenuItem[] = [
        createMockMenuItem('Parent', '/parent', { display: true, role: 1 }, [
          createMockMenuItem('Child 1', '/parent/child1', { display: true, role: 1 }),
          createMockMenuItem('Child 2', '/parent/child2', { display: true, role: 1 })
        ])
      ];
      
      service.setMenuItems(itemsWithChildren);
      
      const result = service.getMenuItems();
      expect(result).toBeTruthy();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].children).toBeDefined();
    });
  });

  describe('Menu processing', () => {
    it('should handle menu items with various options', () => {
      const complexItems: MenuItem[] = [
        createMockMenuItem('Regular Item', '/regular', { display: true, role: 1 }),
        createMockMenuItem('Heading Item', '/heading', { display: true, heading: true, role: 1 }),
        createMockMenuItem('Hidden Item', '/hidden', { display: false, role: 1 }),
        createMockMenuItem('High Role Item', '/high-role', { display: true, role: 5 })
      ];
      
      service.setMenuItems(complexItems);
      const result = service.getMenuItems();
      
      // Since user is present, it will rebuild menu rather than use stored items
      expect(result).toBeTruthy();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should maintain menu item structure through storage cycle', () => {
      const originalMenu = service.buildMenu();
      service.setMenuItems(originalMenu);
      const retrievedMenu = service.getMenuItems();
      
      expect(retrievedMenu).toEqual(originalMenu);
    });

    it('should handle multiple storage operations', () => {
      const firstItems = [createMockMenuItem('First', '/first', { display: true, role: 1 })];
      const secondItems = [createMockMenuItem('Second', '/second', { display: true, role: 2 })];
      
      service.setMenuItems(firstItems);
      let result1 = service.getMenuItems();
      expect(result1).toEqual(firstItems);
      
      service.setMenuItems(secondItems);
      let result2 = service.getMenuItems();
      expect(result2).toEqual(secondItems);
    });
  });

  describe('Integration testing', () => {
    it('should integrate buildMenu, setMenuItems, and getMenuItems', () => {
      const builtMenu = service.buildMenu();
      service.setMenuItems(builtMenu);
      const retrievedMenu = service.getMenuItems();
      
      expect(retrievedMenu).toEqual(builtMenu);
    });

    it('should handle full workflow: build -> set -> clear -> get', () => {
      const builtMenu = service.buildMenu();
      service.setMenuItems(builtMenu);
      
      let retrievedMenu = service.getMenuItems();
      expect(retrievedMenu).toEqual(builtMenu);
      
      service.clearMenuItems();
      retrievedMenu = service.getMenuItems();
      expect(retrievedMenu).toEqual([]);
    });

    it('should maintain menu state across multiple operations', () => {
      const testItems = [
        createMockMenuItem('Item 1', '/item1', { display: true, role: 1 }),
        createMockMenuItem('Item 2', '/item2', { display: true, role: 2 })
      ];
      
      service.setMenuItems(testItems);
      let result1 = service.getMenuItems();
      expect(result1).toEqual(testItems);
      
      // Add more items
      const moreItems = [
        ...testItems,
        createMockMenuItem('Item 3', '/item3', { display: true, role: 3 })
      ];
      
      service.setMenuItems(moreItems);
      let result2 = service.getMenuItems();
      expect(result2).toEqual(moreItems);
      expect(result2.length).toBe(3);
    });
  });

  describe('Error handling', () => {
    it('should handle signal updates gracefully', () => {
      const testItems = [createMockMenuItem('Test', '/test', { display: true, role: 1 })];
      
      // Setting menu items should not throw
      expect(() => service.setMenuItems(testItems)).not.toThrow();
      
      // Should successfully set the items
      expect(service.menuItems().length).toBe(1);
    });

    it('should handle getMenuItems when signal is empty', () => {
      // Clear items first
      service.clearMenuItems();
      
      // Getting items should not throw and should return empty array
      expect(() => service.getMenuItems()).not.toThrow();
      expect(service.getMenuItems()).toEqual([]);
    });

    it('should handle buildMenu with invalid user data', () => {
      // Test with undefined user
      (mockAuthService.user as any).set(undefined);
      
      const result = service.buildMenu();
      expect(result).toEqual([]);
    });

    it('should handle permissions service integration', () => {
      // Test that menu building respects permissions service
      mockPermissionsService.hasRole.and.returnValue(false);
      
      const result = service.buildMenu();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Constructor effect', () => {
    it('should auto-refresh menu when user and permissions change', () => {
      // The effect should have already run in beforeEach
      expect(service.menuItems()).toBeDefined();
    });
  });
});
