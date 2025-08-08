import { TestBed } from '@angular/core/testing';
import { FilterService } from './filter.service';

describe('FilterService', () => {
  let service: FilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FilterService]
    });
    service = TestBed.inject(FilterService);
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should be injectable', () => {
      expect(service).toBeInstanceOf(FilterService);
    });
  });

  describe('applyFilter Method', () => {
    it('should return empty JSON object for empty search value', () => {
      const event = {
        searchValue: '',
        filters: {}
      };

      const result = service.applyFilter(event);
      expect(result).toBe('{}');
    });

    it('should return empty JSON object for null search value', () => {
      const event = {
        searchValue: null as any,
        filters: {}
      };

      const result = service.applyFilter(event);
      expect(result).toBe('{}');
    });

    it('should return empty JSON object for undefined search value', () => {
      const event = {
        searchValue: undefined as any,
        filters: {}
      };

      const result = service.applyFilter(event);
      expect(result).toBe('{}');
    });

    it('should return empty JSON object for whitespace-only search value', () => {
      const event = {
        searchValue: '   ',
        filters: {}
      };

      const result = service.applyFilter(event);
      expect(result).toBe('{}');
    });

    it('should return JSON with searchString for valid search value', () => {
      const event = {
        searchValue: 'test',
        filters: {}
      };

      const result = service.applyFilter(event);
      const parsed = JSON.parse(result);
      
      expect(parsed).toEqual({
        searchString: 'test'
      });
    });

    it('should trim whitespace from search value', () => {
      const event = {
        searchValue: '  test  ',
        filters: {}
      };

      const result = service.applyFilter(event);
      const parsed = JSON.parse(result);
      
      expect(parsed.searchString).toBe('test');
    });

    it('should convert search value to lowercase', () => {
      const event = {
        searchValue: 'TEST Value',
        filters: {}
      };

      const result = service.applyFilter(event);
      const parsed = JSON.parse(result);
      
      expect(parsed.searchString).toBe('test value');
    });

    it('should handle complex search strings', () => {
      const event = {
        searchValue: 'Complex Search-String_123',
        filters: {}
      };

      const result = service.applyFilter(event);
      const parsed = JSON.parse(result);
      
      expect(parsed.searchString).toBe('complex search-string_123');
    });

    it('should handle special characters in search string', () => {
      const event = {
        searchValue: 'test@example.com',
        filters: {}
      };

      const result = service.applyFilter(event);
      const parsed = JSON.parse(result);
      
      expect(parsed.searchString).toBe('test@example.com');
    });

    it('should handle numeric search values', () => {
      const event = {
        searchValue: '12345',
        filters: {}
      };

      const result = service.applyFilter(event);
      const parsed = JSON.parse(result);
      
      expect(parsed.searchString).toBe('12345');
    });
  });

  describe('Return Value Validation', () => {
    it('should always return valid JSON string', () => {
      const testCases = [
        { searchValue: '', filters: {} },
        { searchValue: 'test', filters: {} },
        { searchValue: 'UPPER case', filters: {} },
        { searchValue: '  spaced  ', filters: {} }
      ];

      testCases.forEach(testCase => {
        const result = service.applyFilter(testCase);
        
        expect(() => JSON.parse(result)).not.toThrow();
        expect(typeof result).toBe('string');
      });
    });

    it('should return stringified object, not object directly', () => {
      const event = {
        searchValue: 'test',
        filters: {}
      };

      const result = service.applyFilter(event);
      
      expect(typeof result).toBe('string');
      expect(result.startsWith('{')).toBe(true);
      expect(result.endsWith('}')).toBe(true);
    });
  });

  describe('Filter Parameter Handling', () => {
    it('should accept filters parameter without using it', () => {
      const event = {
        searchValue: 'test',
        filters: { category: 'books', price: 100 }
      };

      const result = service.applyFilter(event);
      const parsed = JSON.parse(result);
      
      // Currently filters are not processed, only searchValue
      expect(parsed).toEqual({
        searchString: 'test'
      });
      expect(parsed.category).toBeUndefined();
      expect(parsed.price).toBeUndefined();
    });

    it('should handle null filters parameter', () => {
      const event = {
        searchValue: 'test',
        filters: null as any
      };

      expect(() => service.applyFilter(event)).not.toThrow();
      const result = service.applyFilter(event);
      const parsed = JSON.parse(result);
      
      expect(parsed.searchString).toBe('test');
    });

    it('should handle undefined filters parameter', () => {
      const event = {
        searchValue: 'test',
        filters: undefined as any
      };

      expect(() => service.applyFilter(event)).not.toThrow();
      const result = service.applyFilter(event);
      const parsed = JSON.parse(result);
      
      expect(parsed.searchString).toBe('test');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very long search strings', () => {
      const longString = 'a'.repeat(1000);
      const event = {
        searchValue: longString,
        filters: {}
      };

      expect(() => service.applyFilter(event)).not.toThrow();
      const result = service.applyFilter(event);
      const parsed = JSON.parse(result);
      
      expect(parsed.searchString).toBe(longString);
    });

    it('should handle empty filter object', () => {
      const event = {
        searchValue: 'test',
        filters: {}
      };

      const result = service.applyFilter(event);
      const parsed = JSON.parse(result);
      
      expect(parsed.searchString).toBe('test');
    });

    it('should handle missing event properties gracefully', () => {
      const incompleteEvent = {} as any;

      expect(() => service.applyFilter(incompleteEvent)).not.toThrow();
      const result = service.applyFilter(incompleteEvent);
      
      expect(result).toBe('{}');
    });
  });

  describe('Performance and Memory', () => {
    it('should handle multiple consecutive calls efficiently', () => {
      const event = {
        searchValue: 'test',
        filters: {}
      };

      const startTime = performance.now();
      
      for (let i = 0; i < 100; i++) {
        service.applyFilter(event);
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete quickly
      expect(duration).toBeLessThan(100);
    });

    it('should not retain references to input objects', () => {
      const event = {
        searchValue: 'test',
        filters: { temp: 'data' }
      };

      const result1 = service.applyFilter(event);
      
      // Modify the input
      event.searchValue = 'modified';
      event.filters.temp = 'changed';
      
      const result2 = service.applyFilter(event);
      
      // Results should be different, proving no shared references
      expect(result1).not.toBe(result2);
    });
  });
});
