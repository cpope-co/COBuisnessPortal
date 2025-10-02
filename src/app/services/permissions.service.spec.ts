import { TestBed } from '@angular/core/testing';
import { PermissionsService } from './permissions.service';
import { UserPermissions, Permission, ResourcePermission } from '../models/permissions.model';

describe('PermissionsService', () => {
  let service: PermissionsService;
  let mockSessionStorage: { [key: string]: string };

  // Mock sessionStorage
  beforeAll(() => {
    mockSessionStorage = {};
    spyOn(sessionStorage, 'getItem').and.callFake((key: string) => mockSessionStorage[key] || null);
    spyOn(sessionStorage, 'setItem').and.callFake((key: string, value: string) => {
      mockSessionStorage[key] = value;
    });
    spyOn(sessionStorage, 'removeItem').and.callFake((key: string) => {
      delete mockSessionStorage[key];
    });
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    // Clear mock storage before each test
    mockSessionStorage = {};
    service = TestBed.inject(PermissionsService);
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with null permissions', () => {
      expect(service.getUserPermissions()).toBeNull();
    });

    it('should restore permissions from sessionStorage on initialization', () => {
      const testPermissions: UserPermissions = {
        resources: [
          { resource: 'API1', per: 15 }, // All permissions
          { resource: 'API2', per: 4 }   // Read only
        ]
      };
      
      // Set up sessionStorage before creating service
      mockSessionStorage['userPermissions'] = JSON.stringify(testPermissions);
      
      // Create new TestBed with fresh service instance
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newService = TestBed.inject(PermissionsService);
      
      expect(newService.getUserPermissions()).toEqual(testPermissions);
    });

    it('should handle corrupted sessionStorage data gracefully', () => {
      // Set up corrupted data
      mockSessionStorage['userPermissions'] = 'invalid-json';
      spyOn(console, 'warn');
      
      // Create new TestBed with fresh service instance
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const newService = TestBed.inject(PermissionsService);
      
      expect(newService.getUserPermissions()).toBeNull();
      expect(console.warn).toHaveBeenCalled();
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('userPermissions');
    });
  });

  describe('Permission Management', () => {
    it('should set user permissions and store in sessionStorage', () => {
      const testPermissions: UserPermissions = {
        resources: [
          { resource: 'API1', per: 15 },
          { resource: 'API2', per: 4 }
        ]
      };

      service.setUserPermissions(testPermissions);

      expect(service.getUserPermissions()).toEqual(testPermissions);
      expect(sessionStorage.setItem).toHaveBeenCalledWith('userPermissions', JSON.stringify(testPermissions));
    });

    it('should clear permissions and remove from sessionStorage', () => {
      const testPermissions: UserPermissions = {
        resources: [{ resource: 'API1', per: 15 }]
      };

      service.setUserPermissions(testPermissions);
      expect(service.getUserPermissions()).toEqual(testPermissions);

      service.clearPermissions();

      expect(service.getUserPermissions()).toBeNull();
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('userPermissions');
    });

    it('should handle sessionStorage errors when setting permissions', () => {
      spyOn(console, 'warn');
      // Store original behavior
      const originalSetItemBehavior = (sessionStorage.setItem as jasmine.Spy).and;
      
      // Override the existing spy to throw an error
      (sessionStorage.setItem as jasmine.Spy).and.callFake(() => {
        throw new Error('Storage full');
      });

      const testPermissions: UserPermissions = {
        resources: [{ resource: 'API1', per: 15 }]
      };

      service.setUserPermissions(testPermissions);

      expect(service.getUserPermissions()).toEqual(testPermissions);
      expect(console.warn).toHaveBeenCalledWith('Failed to store permissions in sessionStorage:', jasmine.any(Error));
      
      // Restore the original spy behavior for other tests
      (sessionStorage.setItem as jasmine.Spy).and.callFake((key: string, value: string) => {
        mockSessionStorage[key] = value;
      });
    });
  });

  describe('Single Resource Permission Checking', () => {
    beforeEach(() => {
      const testPermissions: UserPermissions = {
        resources: [
          { resource: 'API1', per: 15 }, // CREATE(8) + READ(4) + UPDATE(2) + DELETE(1) = 15
          { resource: 'API2', per: 4 },  // READ(4) only
          { resource: 'API3', per: 6 },  // READ(4) + UPDATE(2) = 6
          { resource: 'API4', per: 8 }   // CREATE(8) only
        ]
      };
      service.setUserPermissions(testPermissions);
    });

    it('should return true when user has the required permission', () => {
      expect(service.hasResourcePermission('API1', Permission.READ)).toBe(true);
      expect(service.hasResourcePermission('API1', Permission.CREATE)).toBe(true);
      expect(service.hasResourcePermission('API1', Permission.UPDATE)).toBe(true);
      expect(service.hasResourcePermission('API1', Permission.DELETE)).toBe(true);
      
      expect(service.hasResourcePermission('API2', Permission.READ)).toBe(true);
      expect(service.hasResourcePermission('API3', Permission.READ)).toBe(true);
      expect(service.hasResourcePermission('API3', Permission.UPDATE)).toBe(true);
      expect(service.hasResourcePermission('API4', Permission.CREATE)).toBe(true);
    });

    it('should return false when user lacks the required permission', () => {
      expect(service.hasResourcePermission('API2', Permission.CREATE)).toBe(false);
      expect(service.hasResourcePermission('API2', Permission.UPDATE)).toBe(false);
      expect(service.hasResourcePermission('API2', Permission.DELETE)).toBe(false);
      
      expect(service.hasResourcePermission('API3', Permission.CREATE)).toBe(false);
      expect(service.hasResourcePermission('API3', Permission.DELETE)).toBe(false);
      
      expect(service.hasResourcePermission('API4', Permission.READ)).toBe(false);
      expect(service.hasResourcePermission('API4', Permission.UPDATE)).toBe(false);
      expect(service.hasResourcePermission('API4', Permission.DELETE)).toBe(false);
    });

    it('should return false for non-existent resources', () => {
      expect(service.hasResourcePermission('NONEXISTENT', Permission.READ)).toBe(false);
    });

    it('should return false when no permissions are set', () => {
      service.clearPermissions();
      expect(service.hasResourcePermission('API1', Permission.READ)).toBe(false);
    });
  });

  describe('Multiple Resource Permissions Checking', () => {
    beforeEach(() => {
      const testPermissions: UserPermissions = {
        resources: [
          { resource: 'API1', per: 15 }, // All permissions
          { resource: 'API2', per: 6 },  // READ + UPDATE
          { resource: 'API3', per: 4 }   // READ only
        ]
      };
      service.setUserPermissions(testPermissions);
    });

    it('should return true when user has all required permissions', () => {
      expect(service.hasResourcePermissions('API1', [Permission.READ, Permission.CREATE])).toBe(true);
      expect(service.hasResourcePermissions('API1', [Permission.READ, Permission.UPDATE, Permission.DELETE])).toBe(true);
      expect(service.hasResourcePermissions('API2', [Permission.READ, Permission.UPDATE])).toBe(true);
    });

    it('should return false when user lacks any required permission', () => {
      expect(service.hasResourcePermissions('API2', [Permission.READ, Permission.CREATE])).toBe(false);
      expect(service.hasResourcePermissions('API3', [Permission.READ, Permission.UPDATE])).toBe(false);
    });

    it('should return false for non-existent resources', () => {
      expect(service.hasResourcePermissions('NONEXISTENT', [Permission.READ])).toBe(false);
    });

    it('should return false when no permissions are set', () => {
      service.clearPermissions();
      expect(service.hasResourcePermissions('API1', [Permission.READ])).toBe(false);
    });
  });

  describe('Computed Signals', () => {
    it('should create reactive permission signal', () => {
      const testPermissions: UserPermissions = {
        resources: [{ resource: 'API1', per: 4 }] // READ only
      };

      const canRead = service.createResourcePermissionSignal('API1', Permission.READ);
      const canCreate = service.createResourcePermissionSignal('API1', Permission.CREATE);

      // Initially no permissions
      expect(canRead()).toBe(false);
      expect(canCreate()).toBe(false);

      // Set permissions
      service.setUserPermissions(testPermissions);
      
      expect(canRead()).toBe(true);
      expect(canCreate()).toBe(false);

      // Clear permissions
      service.clearPermissions();
      
      expect(canRead()).toBe(false);
      expect(canCreate()).toBe(false);
    });

    it('should create reactive multiple permissions signal', () => {
      const testPermissions: UserPermissions = {
        resources: [{ resource: 'API1', per: 6 }] // READ + UPDATE
      };

      const canReadAndUpdate = service.createResourcePermissionsSignal('API1', [Permission.READ, Permission.UPDATE]);
      const canReadAndCreate = service.createResourcePermissionsSignal('API1', [Permission.READ, Permission.CREATE]);

      // Initially no permissions
      expect(canReadAndUpdate()).toBe(false);
      expect(canReadAndCreate()).toBe(false);

      // Set permissions
      service.setUserPermissions(testPermissions);
      
      expect(canReadAndUpdate()).toBe(true);
      expect(canReadAndCreate()).toBe(false);

      // Clear permissions
      service.clearPermissions();
      
      expect(canReadAndUpdate()).toBe(false);
      expect(canReadAndCreate()).toBe(false);
    });

    it('should have isAuthenticated computed signal', () => {
      expect(service.isAuthenticated()).toBe(false);

      service.setUserPermissions({ resources: [{ resource: 'API1', per: 4 }] });
      expect(service.isAuthenticated()).toBe(true);

      service.clearPermissions();
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('Permission Enum Values', () => {
    it('should correctly interpret bitwise permission values', () => {
      const testPermissions: UserPermissions = {
        resources: [
          { resource: 'TEST1', per: 1 },  // DELETE only
          { resource: 'TEST2', per: 2 },  // UPDATE only  
          { resource: 'TEST3', per: 4 },  // READ only
          { resource: 'TEST4', per: 8 },  // CREATE only
          { resource: 'TEST5', per: 5 },  // READ + DELETE (4 + 1)
          { resource: 'TEST6', per: 10 }, // CREATE + UPDATE (8 + 2)
          { resource: 'TEST7', per: 12 }, // CREATE + READ (8 + 4)
          { resource: 'TEST8', per: 15 }  // All permissions (8 + 4 + 2 + 1)
        ]
      };
      service.setUserPermissions(testPermissions);

      // Single permission checks
      expect(service.hasResourcePermission('TEST1', Permission.DELETE)).toBe(true);
      expect(service.hasResourcePermission('TEST2', Permission.UPDATE)).toBe(true);
      expect(service.hasResourcePermission('TEST3', Permission.READ)).toBe(true);
      expect(service.hasResourcePermission('TEST4', Permission.CREATE)).toBe(true);

      // Combined permission checks
      expect(service.hasResourcePermissions('TEST5', [Permission.READ, Permission.DELETE])).toBe(true);
      expect(service.hasResourcePermissions('TEST6', [Permission.CREATE, Permission.UPDATE])).toBe(true);
      expect(service.hasResourcePermissions('TEST7', [Permission.CREATE, Permission.READ])).toBe(true);
      expect(service.hasResourcePermissions('TEST8', [Permission.CREATE, Permission.READ, Permission.UPDATE, Permission.DELETE])).toBe(true);

      // Negative cases
      expect(service.hasResourcePermission('TEST1', Permission.READ)).toBe(false);
      expect(service.hasResourcePermission('TEST2', Permission.CREATE)).toBe(false);
      expect(service.hasResourcePermissions('TEST5', [Permission.CREATE])).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty permissions array', () => {
      service.setUserPermissions({ resources: [] });
      
      expect(service.hasResourcePermission('API1', Permission.READ)).toBe(false);
      expect(service.isAuthenticated()).toBe(true); // Still has permissions object, just empty
    });

    it('should handle zero permission value', () => {
      service.setUserPermissions({ 
        resources: [{ resource: 'API1', per: 0 }] 
      });
      
      expect(service.hasResourcePermission('API1', Permission.READ)).toBe(false);
      expect(service.hasResourcePermission('API1', Permission.CREATE)).toBe(false);
      expect(service.hasResourcePermission('API1', Permission.UPDATE)).toBe(false);
      expect(service.hasResourcePermission('API1', Permission.DELETE)).toBe(false);
    });

    it('should handle resource name case sensitivity', () => {
      service.setUserPermissions({ 
        resources: [{ resource: 'API1', per: 4 }] 
      });
      
      expect(service.hasResourcePermission('API1', Permission.READ)).toBe(true);
      expect(service.hasResourcePermission('api1', Permission.READ)).toBe(false);
      expect(service.hasResourcePermission('Api1', Permission.READ)).toBe(false);
    });
  });
});
