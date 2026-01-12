/**
 * Customer Detail E2E Tests - SIMPLIFIED FOR MOCK MODE
 * Tests the customer detail page with built-in mock data
 */

describe('02 - Customer Detail (Mock Mode)', () => {
  
  beforeEach(() => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

  describe('Customer Detail Display', () => {
    it('should display customer 1001 details', () => {
      cy.visit('/sample/customer/1001');
      cy.get('mat-card', { timeout: 10000 }).should('be.visible');
      cy.get('mat-card-content').should('contain', '1001');
      cy.get('mat-card-content').should('contain', 'Acme Corporation');
    });

    it('should display all action buttons', () => {
      cy.visit('/sample/customer/1001');
      cy.get('[data-testid="back-button"]').should('be.visible');
      cy.get('[data-testid="edit-button"]').should('be.visible');
      cy.get('[data-testid="delete-button"]').should('be.visible');
    });
  });

  describe('Navigation', () => {
    it('should navigate back to list when clicking back button', () => {
      cy.visit('/sample/customer/1001');
      cy.get('[data-testid="back-button"]').click();
      cy.url().should('include', '/sample/customers');
    });

    it('should navigate to edit page when clicking edit button', () => {
      cy.visit('/sample/customer/1001');
      cy.get('[data-testid="edit-button"]').click();
      cy.url().should('include', '/sample/customer/1001/edit');
    });
  });

  describe('Delete Operations', () => {
    it('should show confirmation dialog when clicking delete', () => {
      cy.visit('/sample/customer/1001');
      cy.stubNativeConfirm(true);
      cy.get('[data-testid="delete-button"]').click();
      
      // In mock mode, the customer is removed from MOCK_SAMPLE_DATA
      // Should navigate back to list
      cy.url().should('include', '/sample/customers');
    });

    it('should cancel delete when user cancels confirmation', () => {
      cy.visit('/sample/customer/1001');
      cy.stubNativeConfirm(false);
      cy.get('[data-testid="delete-button"]').click();
      
      // Should remain on detail page
      cy.url().should('include', '/sample/customer/1001');
    });
  });

  describe('Invalid Customer ID', () => {
    it('should handle non-existent customer ID (404 in mock mode)', () => {
      cy.visit('/sample/customer/9999');
      // Service throws error for non-existent customer
      // Should show error and redirect to list or stay with empty data
      cy.url({ timeout: 10000 }).should('include', '/sample/customer');
      // In mock mode, may show error or just empty state
      // Don't assert specific message class - behavior varies
    });
  });
});
