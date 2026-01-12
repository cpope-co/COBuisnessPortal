/**
 * Customer List E2E Tests - SIMPLIFIED FOR MOCK MODE
 * Tests the UI with the Angular service's built-in mock data
 */

describe('01 - Customer List (Mock Mode)', () => {
  
  beforeEach(() => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    cy.visit('/sample/customers');
    // Wait for table to load (service returns mock data directly)
    cy.get('[data-testid="customer-list-table"]', { timeout: 10000 }).should('be.visible');
  });

  describe('Customer List Display', () => {
    it('should display the customer list table with correct title', () => {
      cy.get('mat-card-title h1').should('contain', 'Sample Application - Customer List');
      cy.get('[data-testid="customer-list-table"]').should('be.visible');
    });

    it('should display 8 mock customers', () => {
      cy.get('co-table .mat-mdc-row').should('have.length', 8);
    });

    it('should display customer number 1001', () => {
      cy.get('co-table .mat-mdc-row').first().should('contain', '1001');
    });

    it('should display customer name "Acme Corporation"', () => {
      cy.get('co-table .mat-mdc-row').first().should('contain', 'Acme Corporation');
    });

    it('should display success message after loading', () => {
      cy.get('.alert-success').should('be.visible');
      cy.get('.alert-success').should('contain', 'Sample data loaded successfully');
    });
  });

  describe('Global Search', () => {
    it('should filter customers by name (client-side)', () => {
      cy.get('co-table').should('exist');
      // Type into search field if it exists
      cy.get('input[placeholder*="Search"]').then(($input) => {
        if ($input.length) {
          cy.wrap($input).type('Corp');
          cy.wait(500); // Wait for client-side filtering
          cy.get('co-table .mat-mdc-row').should('have.length.lessThan', 8);
        }
      });
    });
  });

  describe('Row Navigation', () => {
    it('should navigate to detail page when clicking a row', () => {
      cy.get('co-table .mat-mdc-row').first().click();
      cy.url().should('include', '/sample/customer/1001');
    });
  });
});
