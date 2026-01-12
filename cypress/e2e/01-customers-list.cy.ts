/**
 * Customers List E2E Tests
 * Tests customer list page display, filtering, sorting, pagination, and navigation
 */

describe('01 - Customer List', () => {
  
  beforeEach(() => {
    // Clear session data
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();

    // Visit the customer list page
    // The Angular service will use its built-in mock data (useMockSampleData: true)
    cy.visit('/sample/customers');
    
    // Wait for the component to load data
    cy.get('[data-testid="customer-list-table"]', { timeout: 10000 }).should('be.visible');
  });

  describe('Customer List Display', () => {
    it('should display the customer list table with correct title', () => {
      cy.get('mat-card-title h1').should('contain', 'Sample Application - Customer List');
      cy.get('[data-testid="customer-list-table"]').should('be.visible');
    });

    it('should display 8 customer rows by default', () => {
      cy.get('co-table .mat-mdc-row').should('have.length', 8);
    });

    it('should display correct column headers', () => {
      cy.get('co-table .mat-mdc-header-row').within(() => {
        cy.contains('Customer Number').should('be.visible');
        cy.contains('Customer Name').should('be.visible');
        cy.contains('Address').should('be.visible');
        cy.contains('Customer Type').should('be.visible');
        cy.contains('Likes Candy').should('be.visible');
      });
    });

    it('should show success message after loading data', () => {
      cy.shouldShowSuccessMessage('Sample data loaded successfully');
    });
  });

  describe('Global Search Filtering', () => {
    it('should filter customers when typing 4+ characters', () => {
      cy.get('co-table .mat-mdc-row').its('length').as('originalCount');
      
      // Type 4 characters
      cy.searchTable('Corp');
      
      // Wait a moment for filtering to apply
      cy.wait(500);
      
      // Should have fewer rows (filtered)
      cy.get('@originalCount').then((originalCount) => {
        cy.get('co-table .mat-mdc-row').its('length').should('be.lte', originalCount);
      });
    });

    it('should display customers containing search term', () => {
      cy.searchTable('Corp');
      cy.wait(500);
      
      cy.get('co-table .mat-mdc-row').each(($row) => {
        cy.wrap($row).should('contain', 'Corp');
      });
    });

    it('should restore all customers when search is cleared', () => {
      cy.searchTable('Test');
      cy.wait(500);
      
      cy.searchTable('');
      cy.wait(500);
      
      cy.get('co-table .mat-mdc-row').should('have.length', 8);
    });

    it('should show empty state for non-existent search', () => {
      cy.searchTable('XYZ999NonExistent');
      cy.wait(500);
      
      cy.contains('No results found').should('be.visible');
    });
  });

  describe('Advanced Filters', () => {
    it('should open advanced filters dialog', () => {
      cy.openAdvancedFilters();
      cy.get('mat-dialog-container h2').should('contain', 'Advanced Filters');
    });

    it('should filter by customer name (text input)', () => {
      cy.openAdvancedFilters();
      
      cy.get('mat-dialog-container input[formcontrolname="CustName"]').type('Inc');
      cy.get('mat-dialog-actions button[color="primary"]').contains('Apply Filters').click();
      
      cy.get('mat-dialog-container').should('not.exist');
      cy.get('.active-filters-badge').should('be.visible');
      
      cy.get('co-table .mat-mdc-row').each(($row) => {
        cy.wrap($row).should('contain', 'Inc');
      });
    });

    it('should show active filter badge with count', () => {
      cy.openAdvancedFilters();
      
      cy.get('mat-dialog-container input[formcontrolname="CustName"]').type('Corp');
      cy.get('mat-dialog-actions button[color="primary"]').contains('Apply Filters').click();
      
      cy.get('.active-filters-badge').should('contain', '1');
    });

    it('should clear all filters when clicking Clear All', () => {
      cy.openAdvancedFilters();
      
      cy.get('mat-dialog-container input[formcontrolname="CustName"]').type('Test');
      cy.get('mat-dialog-actions button[color="primary"]').contains('Apply Filters').click();
      
      cy.clearAllFilters();
      
      cy.get('.active-filters-badge').should('not.exist');
      cy.get('co-table .mat-mdc-row').should('have.length', 8);
    });

    it('should maintain previous state when canceling dialog', () => {
      cy.openAdvancedFilters();
      
      cy.get('mat-dialog-container input[formcontrolname="CustName"]').type('Test');
      cy.get('mat-dialog-actions button').contains('Cancel').click();
      
      cy.get('mat-dialog-container').should('not.exist');
      cy.get('.active-filters-badge').should('not.exist');
      cy.get('co-table .mat-mdc-row').should('have.length', 8);
    });
  });

  describe('Pagination Controls', () => {
    // Note: These tests are skipped in mock mode
    // The service returns all 8 customers at once, no pagination at service level
    it.skip('pagination tests require real API with large dataset', () => {
      cy.log('Pagination testing requires API mode with large dataset');
    });
  });

  describe('Column Sorting', () => {
    it('should sort by customer number ascending', () => {
      cy.sortTableByColumn('CustNumber');
      cy.verifyTableSort('Number', 'asc');
    });

    it('should sort by customer number descending', () => {
      cy.sortTableByColumn('CustNumber');
      cy.sortTableByColumn('CustNumber');
      cy.verifyTableSort('Number', 'desc');
    });

    it('should sort by customer name', () => {
      cy.sortTableByColumn('CustName');
      cy.verifyTableSort('Name', 'asc');
    });

    it('should sort by address', () => {
      cy.sortTableByColumn('CustAddress');
      cy.verifyTableSort('Address', 'asc');
    });

    it('should sort by customer type', () => {
      cy.sortTableByColumn('CustTypeDesc');
      cy.verifyTableSort('Type', 'asc');
    });
  });

  describe('Row Click Navigation', () => {
    it('should navigate to customer detail when clicking a row', () => {
      cy.clickTableRow(0);
      cy.url().should('include', '/sample/customer/');
      cy.get('mat-card-title').should('contain', 'Customer Detail');
    });

    it('should load the correct customer details', () => {
      cy.get('co-table .mat-mdc-row').first().within(() => {
        cy.get('.mat-mdc-cell').first().invoke('text').as('custNumber');
      });

      cy.clickTableRow(0);
      
      // Wait for navigation to detail page
      cy.url({ timeout: 10000 }).should('include', '/sample/customer/');
      cy.get('mat-card-content', { timeout: 10000 }).should('be.visible');

      cy.get('@custNumber').then((custNumber) => {
        cy.get('mat-card-content').should('contain', custNumber);
      });
    });
  });

  describe('Empty State', () => {
    // Note: Skipped in mock mode - service always returns 8 customers
    it.skip('empty state tests require API mode', () => {
      cy.log('Empty state testing requires API mode with empty dataset');
    });
  });

  describe('Error Handling', () => {
    // Note: Skipped in mock mode - service always succeeds
    it.skip('error handling tests require API mode', () => {
      cy.log('Error handling testing requires API mode with error simulation');
    });
  });
});