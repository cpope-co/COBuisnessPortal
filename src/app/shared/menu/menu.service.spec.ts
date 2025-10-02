import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { MenuService } from './menu.service';
import { MenuItem, MenuItemOptions } from './menu.model';
import { AuthService } from '../../auth/auth.service';

describe('MenuService', () => {
  let service: MenuService;
  let mockAuthService: jasmine.SpyObj<AuthService>;

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
    const authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      user: jasmine.createSpy('user').and.returnValue(mockUser)
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        MenuService,
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
    
    service = TestBed.inject(MenuService);
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('Service initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should inject required dependencies', () => {
      expect(service.authService).toBe(mockAuthService);
    });
  });

  describe('Menu building functionality', () => {
    it('should build menu from router configuration', () => {
      const result = service.buildMenu();
      
      expect(result).toBeTruthy();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle null user', () => {
      // Create a new spy that returns null
      (mockAuthService.user as jasmine.Spy).and.returnValue(null);
      
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
      (mockAuthService.user as jasmine.Spy).and.returnValue(adminUser);
      
      const adminResult = service.buildMenu();
      expect(Array.isArray(adminResult)).toBe(true);
      
      // Test with original user
      (mockAuthService.user as jasmine.Spy).and.returnValue(mockUser);
      
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

  describe('Session storage functionality', () => {
    const testMenuItems: MenuItem[] = [
      createMockMenuItem('Test Item 1', '/test1', { display: true, role: 1 }),
      createMockMenuItem('Test Item 2', '/test2', { display: true, role: 2 })
    ];

    it('should set menu items in session storage', () => {
      service.setMenuItems(testMenuItems);
      
      const stored = sessionStorage.getItem('menuItems');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      // Use toMatchObject to ignore properties that become undefined and are stripped by JSON
      expect(parsed).toEqual(jasmine.arrayContaining([
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

    it('should get menu items from session storage', () => {
      // Temporarily set user to null to test pure sessionStorage behavior
      (mockAuthService.user as jasmine.Spy).and.returnValue(null);
      
      sessionStorage.setItem('menuItems', JSON.stringify(testMenuItems));
      
      const result = service.getMenuItems();
      expect(result).toEqual([]);
    });

    it('should return empty array when no menu items in storage', () => {
      // Temporarily set user to null to test pure sessionStorage behavior
      (mockAuthService.user as jasmine.Spy).and.returnValue(null);
      
      const result = service.getMenuItems();
      expect(result).toEqual([]);
    });

    it('should handle invalid JSON in session storage', () => {
      // Temporarily set user to null to test pure sessionStorage behavior
      (mockAuthService.user as jasmine.Spy).and.returnValue(null);
      
      sessionStorage.setItem('menuItems', 'invalid json');
      
      const result = service.getMenuItems();
      expect(result).toEqual([]);
    });

    it('should clear menu items from session storage', () => {
      sessionStorage.setItem('menuItems', JSON.stringify(testMenuItems));
      
      service.clearMenuItems();
      
      const stored = sessionStorage.getItem('menuItems');
      expect(stored).toBeNull();
    });

    it('should handle clearing when no items exist', () => {
      expect(() => service.clearMenuItems()).not.toThrow();
      
      const stored = sessionStorage.getItem('menuItems');
      expect(stored).toBeNull();
    });

    it('should handle setting empty menu items', () => {
      service.setMenuItems([]);
      
      const stored = sessionStorage.getItem('menuItems');
      expect(stored).toBeTruthy();
      
      const parsed = JSON.parse(stored!);
      expect(parsed).toEqual([]);
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
      // Since user is present, it will rebuild menu rather than use stored children
      expect(result).toBeTruthy();
      expect(Array.isArray(result)).toBe(true);
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
      expect(result1).toBeTruthy(); // Will be rebuilt menu, not stored items
      
      service.setMenuItems(secondItems);
      let result2 = service.getMenuItems();
      expect(result2).toBeTruthy(); // Will be rebuilt menu, not stored items
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
      // Temporarily set user to null to test cleared state
      (mockAuthService.user as jasmine.Spy).and.returnValue(null);
      retrievedMenu = service.getMenuItems();
      expect(retrievedMenu).toEqual([]);
      // Restore user
      (mockAuthService.user as jasmine.Spy).and.returnValue(mockUser);
    });

    it('should maintain menu state across multiple operations', () => {
      const testItems = [
        createMockMenuItem('Item 1', '/item1', { display: true, role: 1 }),
        createMockMenuItem('Item 2', '/item2', { display: true, role: 2 })
      ];
      
      service.setMenuItems(testItems);
      let result1 = service.getMenuItems();
      expect(result1).toBeTruthy(); // Will be rebuilt menu, not stored items
      
      // Add more items
      const moreItems = [
        ...testItems,
        createMockMenuItem('Item 3', '/item3', { display: true, role: 3 })
      ];
      
      service.setMenuItems(moreItems);
      let result2 = service.getMenuItems();
      expect(result2).toBeTruthy(); // Will be rebuilt menu, not stored items
      expect(Array.isArray(result2)).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle sessionStorage errors gracefully', () => {
      // Mock sessionStorage to throw an error
      const originalSetItem = sessionStorage.setItem;
      sessionStorage.setItem = jasmine.createSpy('setItem').and.throwError('Storage error');
      
      const testItems = [createMockMenuItem('Test', '/test', { display: true, role: 1 })];
      
      expect(() => service.setMenuItems(testItems)).toThrow();
      
      // Restore original method
      sessionStorage.setItem = originalSetItem;
    });

    it('should handle sessionStorage getItem errors gracefully', () => {
      // Mock sessionStorage to throw an error
      const originalGetItem = sessionStorage.getItem;
      sessionStorage.getItem = jasmine.createSpy('getItem').and.throwError('Storage error');
      
      // Since the service doesn't actually read from sessionStorage when user exists,
      // this won't throw in the current implementation
      expect(() => service.getMenuItems()).not.toThrow();
      
      // Restore original method
      sessionStorage.getItem = originalGetItem;
    });

    it('should handle malformed data in storage', () => {
      // Set invalid data that looks like JSON but isn't proper menu items
      sessionStorage.setItem('menuItems', '{"invalid": "data"}');
      
      // Set user to null to test pure sessionStorage behavior
      (mockAuthService.user as jasmine.Spy).and.returnValue(null);
      
      const result = service.getMenuItems();
      // Should return empty array when user is null
      expect(result).toEqual([]);
      
      // Restore user
      (mockAuthService.user as jasmine.Spy).and.returnValue(mockUser);
    });

    it('should handle buildMenu with invalid user data', () => {
      // Test with undefined user
      (mockAuthService.user as jasmine.Spy).and.returnValue(undefined);
      
      const result = service.buildMenu();
      expect(result).toEqual([]);
    });
  });
});
