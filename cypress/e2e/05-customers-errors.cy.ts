/**
 * Customers Error Handling E2E Tests
 * Tests error scenarios for all API endpoints
 */

import { 
  mockLoadCustomersError, 
  mockCustomerNotFound, 
  mockUpdateCustomer,
  mockDeleteCustomer,
  mockDeleteCustomerConflict,
  mockLoadCustomer,
  mockLoadCustomers,
  mockLoadUDCOptions,
  mockUpdateCustomerValidationError
} from '../support/customers-mocks';

describe('05 - Customers Errors', () => {
  
  beforeEach(() => {
    // Clear session data
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

  describe('Load Customers List Errors', () => {
    it('should handle network error when loading customer list', () => {
      mockLoadCustomersError('network');
      
      cy.visit('/sample/customers');
      cy.wait('@loadCustomers');
      
      cy.shouldShowErrorMessage('Failed to load sample data');
      cy.get('co-table .mat-mdc-row').should('have.length', 0);
    });

    it('should handle 500 server error when loading customer list', () => {
      mockLoadCustomersError('server');
      
      cy.visit('/sample/customers');
      cy.wait('@loadCustomers');
      
      cy.shouldShowErrorMessage('Failed to load sample data');
    });
  });

  describe('Load Single Customer Errors', () => {
    it('should handle 404 not found when loading customer detail', () => {
      mockCustomerNotFound(9999);
      
      cy.visit('/sample/customer/9999');
      cy.wait('@loadCustomer');
      
      cy.shouldShowErrorMessage('Failed to load customer');
    });

    it('should handle network error when loading customer detail', () => {
      cy.intercept('GET', '**/api/SampleData/1001', { forceNetworkError: true }).as('loadCustomer');
      
      cy.visit('/sample/customer/1001');
      cy.wait('@loadCustomer');
      
      cy.shouldShowErrorMessage('Failed to load customer');
    });

    it('should handle 404 when loading customer for edit', () => {
      mockCustomerNotFound(9999);
      mockLoadUDCOptions();
      
      cy.visit('/sample/customer/9999/edit');
      cy.wait('@loadCustomer');
      
      cy.shouldShowErrorMessage('Failed to load customer');
    });
  });

  describe('Update Customer Errors', () => {
    beforeEach(() => {
      mockLoadCustomer(1001);
      mockLoadUDCOptions();
      
      cy.visit('/sample/customer/1001/edit');
      cy.wait('@loadCustomer');
      cy.wait('@loadUDCOptions');
    });

    it('should handle 400 validation error on update', () => {
      mockUpdateCustomerValidationError(1001);
      
      cy.fillCustomerEditForm({ typeCode: 'A' });
      cy.get('[data-testid="save-button"]').click();
      
      cy.wait('@updateCustomer');
      cy.shouldShowErrorMessage('Please correct the errors on the form');
      cy.url().should('include', '/edit'); // Stay on edit page
    });

    it('should handle 404 not found on update', () => {
      mockUpdateCustomer(1001, false, 'notfound');
      
      cy.fillCustomerEditForm({ candyLiker: false });
      cy.get('[data-testid="save-button"]').click();
      
      cy.wait('@updateCustomer');
      cy.shouldShowErrorMessage('Customer record not found');
    });

    it('should handle 500 server error on update', () => {
      mockUpdateCustomer(1001, false, 'server');
      
      cy.fillCustomerEditForm({ typeCode: 'B' });
      cy.get('[data-testid="save-button"]').click();
      
      cy.wait('@updateCustomer');
      cy.shouldShowErrorMessage('Failed to save customer');
    });

    it('should handle network error on update', () => {
      cy.intercept('PUT', '**/api/SampleData/1001', { forceNetworkError: true }).as('updateCustomer');
      
      cy.fillCustomerEditForm({ typeCode: 'C' });
      cy.get('[data-testid="save-button"]').click();
      
      cy.wait('@updateCustomer');
      cy.shouldShowErrorMessage('Failed to save customer');
    });

    it('should allow retry after update error', () => {
      // First attempt fails
      mockUpdateCustomer(1001, false, 'server');
      
      cy.fillCustomerEditForm({ typeCode: 'D' });
      cy.get('[data-testid="save-button"]').click();
      cy.wait('@updateCustomer');
      
      cy.shouldShowErrorMessage('Failed to save customer');
      
      // Dismiss error and try again
      cy.dismissMessage();
      
      // Second attempt succeeds
      mockUpdateCustomer(1001, true);
      cy.get('[data-testid="save-button"]').click();
      cy.wait('@updateCustomer');
      
      cy.shouldShowSuccessMessage('Customer updated successfully');
    });
  });

  describe('Delete Customer Errors', () => {
    beforeEach(() => {
      mockLoadCustomer(1001);
      
      cy.visit('/sample/customer/1001');
      cy.wait('@loadCustomer');
    });

    it('should handle 404 not found on delete', () => {
      cy.stubNativeConfirm(true);
      mockDeleteCustomer(1001, false);
      
      cy.get('[data-testid="delete-button"]').click();
      cy.wait('@deleteCustomer');
      
      cy.shouldShowErrorMessage('Failed to delete customer');
    });

    it('should handle 409 conflict on delete', () => {
      cy.stubNativeConfirm(true);
      mockDeleteCustomerConflict(1001);
      
      cy.get('[data-testid="delete-button"]').click();
      cy.wait('@deleteCustomer');
      
      cy.shouldShowErrorMessage('Customer record already exists');
    });

    it('should handle network error on delete', () => {
      cy.stubNativeConfirm(true);
      cy.intercept('DELETE', '**/api/SampleData/1001', { forceNetworkError: true }).as('deleteCustomer');
      
      cy.get('[data-testid="delete-button"]').click();
      cy.wait('@deleteCustomer');
      
      cy.shouldShowErrorMessage('Failed to delete customer');
    });

    it('should stay on detail page after delete error', () => {
      cy.stubNativeConfirm(true);
      mockDeleteCustomer(1001, false);
      
      cy.get('[data-testid="delete-button"]').click();
      cy.wait('@deleteCustomer');
      
      cy.url().should('include', '/sample/customer/1001');
      cy.get('mat-card-title').should('contain', 'Customer Detail');
    });
  });

  describe('Load UDC Options Errors', () => {
    it('should handle error loading customer types', () => {
      mockLoadCustomer(1001);
      cy.intercept('GET', '**/api/SampleData/udc/55/SP', {
        statusCode: 500,
        body: {
          success: false,
          validationErrors: [{ errDesc: 'Failed to load customer types' }]
        }
      }).as('loadUDCOptions');
      
      cy.visit('/sample/customer/1001/edit');
      cy.wait('@loadCustomer');
      cy.wait('@loadUDCOptions');
      
      // Form should still display, but may show error or empty dropdown
      cy.get('[data-testid="customer-type-select"]').should('be.visible');
    });
  });

  describe('Multiple Concurrent Errors', () => {
    it('should handle multiple failed API calls gracefully', () => {
      // Both customer and UDC loading fail
      mockCustomerNotFound(1001);
      cy.intercept('GET', '**/api/SampleData/udc/55/SP', {
        statusCode: 500,
        body: { success: false }
      }).as('loadUDCOptions');
      
      cy.visit('/sample/customer/1001/edit');
      cy.wait('@loadCustomer');
      
      // Should show error message (from first failure)
      cy.shouldShowErrorMessage('Failed to load customer');
    });
  });

  describe('Error Message Display', () => {
    it('should display error messages with correct styling', () => {
      mockLoadCustomersError('server');
      
      cy.visit('/sample/customers');
      cy.wait('@loadCustomers');
      
      cy.get('.alert-danger').should('be.visible');
      cy.get('.alert-danger mat-icon').should('contain', 'error');
      cy.get('.alert-danger span').should('be.visible');
    });

    it('should allow dismissing error messages', () => {
      mockLoadCustomersError('server');
      
      cy.visit('/sample/customers');
      cy.wait('@loadCustomers');
      
      cy.get('.alert-danger').should('be.visible');
      
      cy.dismissMessage();
      
      cy.get('.alert').should('not.exist');
    });

    it('should clear previous messages when new ones appear', () => {
      mockLoadCustomer(1001);
      mockLoadUDCOptions();
      
      cy.visit('/sample/customer/1001/edit');
      cy.wait('@loadCustomer');
      cy.wait('@loadUDCOptions');
      
      // Trigger first error
      mockUpdateCustomer(1001, false, 'server');
      cy.fillCustomerEditForm({ typeCode: 'A' });
      cy.get('[data-testid="save-button"]').click();
      cy.wait('@updateCustomer');
      
      cy.get('.alert-danger').should('contain', 'Failed to save customer');
      
      // Trigger second error
      mockUpdateCustomer(1001, false, 'validation');
      cy.get('[data-testid="save-button"]').click();
      cy.wait('@updateCustomer');
      
      // Should show new error message
      cy.get('.alert-danger').should('contain', 'Please correct the errors');
    });
  });

  describe('Error Recovery', () => {
    it('should recover from error state on successful retry', () => {
      mockLoadCustomersError('server');
      
      cy.visit('/sample/customers');
      cy.wait('@loadCustomers');
      
      cy.shouldShowErrorMessage('Failed to load sample data');
      
      // Setup successful mock and reload
      mockLoadCustomers();
      cy.reload();
      cy.wait('@loadCustomers');
      
      cy.shouldShowSuccessMessage('Sample data loaded successfully');
      cy.get('co-table .mat-mdc-row').should('have.length', 8);
    });
  });
});
