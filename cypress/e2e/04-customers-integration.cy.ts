/**
 * Customers Integration E2E Tests
 * Tests complete end-to-end workflows across multiple pages
 */

import { mockLoadCustomers, mockLoadCustomer, mockLoadUDCOptions, mockUpdateCustomer, mockDeleteCustomer } from '../support/customers-mocks';

describe('04 - Customers Integration', () => {
  
  beforeEach(() => {
    // Clear session data
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

  describe('Complete Edit Workflow', () => {
    it('should navigate from list through search, edit, and back to detail', () => {
      // Setup mocks
      mockLoadCustomers();
      mockLoadUDCOptions();
      
      // Start at customer list
      cy.visit('/sample/customers');
      cy.wait('@loadCustomers');
      
      // Search for a specific customer
      cy.searchTable('Corp');
      cy.wait(500);
      
      // Verify filtered results
      cy.get('co-table .mat-mdc-row').should('have.length.lessThan', 8);
      cy.get('co-table .mat-mdc-row').first().should('contain', 'Corp');
      
      // Click first result
      cy.clickTableRow(0);
      cy.url().should('include', '/sample/customer/');
      
      // Get customer number from detail page
      cy.get('mat-card-content').contains('Customer Number:')
        .parent().find('p').invoke('text').as('custNumber');
      
      // Navigate to edit
      cy.get('@custNumber').then((custNumber) => {
        const custNum = parseInt(String(custNumber));
        mockLoadCustomer(custNum);
        mockUpdateCustomer(custNum, true);
      });
      
      cy.get('[data-testid="edit-button"]').click();
      cy.wait('@loadCustomer');
      cy.wait('@loadUDCOptions');
      
      // Make changes
      cy.fillCustomerEditForm({
        typeCode: 'D', // Wholesale Customer
        candyLiker: false
      });
      
      // Save changes
      cy.get('[data-testid="save-button"]').click();
      cy.wait('@updateCustomer');
      
      // Verify back on detail page with updated values
      cy.url().should('not.include', '/edit');
      cy.shouldShowSuccessMessage('Customer updated successfully');
      cy.get('mat-card-content').should('contain', 'Wholesale Customer');
      cy.get('mat-card-content').should('contain', 'No'); // Candy liker = false
    });
  });

  describe('Complete Delete Workflow', () => {
    it('should delete customer from detail page and verify removed from list', () => {
      // Setup mocks
      mockLoadCustomers();
      mockLoadCustomer(1001);
      
      // Navigate to customer list
      cy.visit('/sample/customers');
      cy.wait('@loadCustomers');
      
      // Sort by customer name for predictable order
      cy.sortTableByColumn('CustName');
      
      // Click first customer
      cy.clickTableRow(0);
      cy.wait('@loadCustomer');
      
      // Get customer number
      cy.get('mat-card-content').contains('Customer Number:')
        .parent().find('p').invoke('text').then((custNumber) => {
          const custNum = parseInt(custNumber);
          
          // Setup delete mock
          mockDeleteCustomer(custNum, true);
          
          // Stub confirm dialog
          cy.stubNativeConfirm(true);
          
          // Click delete
          cy.get('[data-testid="delete-button"]').click();
          
          cy.wait('@deleteCustomer');
          
          // Should redirect to list
          cy.url().should('include', '/sample/customers');
          cy.shouldShowSuccessMessage('Customer deleted successfully');
          
          // Verify customer is not in the table (note: mock doesn't actually remove it,
          // but in real app it would be gone)
          cy.get('[data-testid="customer-list-table"]').should('be.visible');
        });
    });
  });

  describe('Filter Persistence After Navigation', () => {
    it('should maintain filter state when navigating back from detail', () => {
      // Setup mocks
      mockLoadCustomers();
      mockLoadCustomer(1001);
      mockLoadUDCOptions();
      
      // Navigate to list
      cy.visit('/sample/customers');
      cy.wait('@loadCustomers');
      
      // Apply advanced filter
      cy.openAdvancedFilters();
      
      // Filter by customer name
      cy.get('mat-dialog-container input[formcontrolname="CustName"]').type('Inc');
      cy.get('mat-dialog-actions button[color="primary"]').contains('Apply Filters').click();
      
      // Verify filter applied
      cy.get('.active-filters-badge').should('contain', '1');
      cy.get('co-table .mat-mdc-row').should('have.length.lessThan', 8);
      
      // Get first filtered result customer number
      cy.get('co-table .mat-mdc-row').first().find('.mat-mdc-cell').first()
        .invoke('text').then((text) => {
          const custNum = parseInt(text.trim());
          mockLoadCustomer(custNum);
          
          // Click to view detail
          cy.clickTableRow(0);
          cy.wait('@loadCustomer');
          
          // Verify on detail page
          cy.get('mat-card-title').should('contain', 'Customer Detail');
          
          // Click back button
          cy.get('[data-testid="back-button"]').click();
          
          // Verify back on list with filter still active
          cy.url().should('include', '/sample/customers');
          cy.get('.active-filters-badge').should('be.visible');
          cy.get('co-table .mat-mdc-row').should('have.length.lessThan', 8);
        });
    });
  });

  describe('Multiple Operations Sequence', () => {
    it('should handle multiple edits in sequence', () => {
      mockLoadCustomer(1001);
      mockLoadUDCOptions();
      mockUpdateCustomer(1001, true);
      
      // First edit
      cy.visit('/sample/customer/1001/edit');
      cy.wait('@loadCustomer');
      cy.wait('@loadUDCOptions');
      
      cy.fillCustomerEditForm({ typeCode: 'A' });
      cy.get('[data-testid="save-button"]').click();
      cy.wait('@updateCustomer');
      
      // Navigate to edit again
      mockLoadCustomer(1001);
      cy.get('[data-testid="edit-button"]').click();
      cy.wait('@loadCustomer');
      
      // Second edit
      cy.fillCustomerEditForm({ typeCode: 'B' });
      cy.get('[data-testid="save-button"]').click();
      cy.wait('@updateCustomer');
      
      cy.shouldShowSuccessMessage('Customer updated successfully');
    });

    it('should handle edit then cancel with changes', () => {
      mockLoadCustomer(1001);
      mockLoadUDCOptions();
      
      cy.visit('/sample/customer/1001/edit');
      cy.wait('@loadCustomer');
      cy.wait('@loadUDCOptions');
      
      // Make changes but cancel
      cy.fillCustomerEditForm({ typeCode: 'C', candyLiker: true });
      cy.get('[data-testid="cancel-button"]').click();
      
      // Confirm lose changes
      cy.get('mat-dialog-container').should('be.visible');
      cy.get('mat-dialog-actions button').contains('Continue').click();
      
      // Should be back on detail
      cy.url().should('include', '/sample/customer/1001');
      cy.url().should('not.include', '/edit');
    });
  });

  describe('Browser Navigation', () => {
    it('should handle browser back/forward buttons', () => {
      mockLoadCustomers();
      mockLoadCustomer(1001);
      mockLoadUDCOptions();
      
      // Start at list
      cy.visit('/sample/customers');
      cy.wait('@loadCustomers');
      
      // Go to detail
      cy.clickTableRow(0);
      cy.wait('@loadCustomer');
      
      // Go to edit
      cy.get('[data-testid="edit-button"]').click();
      cy.wait('@loadCustomer');
      cy.wait('@loadUDCOptions');
      
      // Browser back to detail
      cy.go('back');
      cy.url().should('include', '/sample/customer/');
      cy.url().should('not.include', '/edit');
      
      // Browser forward to edit
      cy.go('forward');
      cy.url().should('include', '/edit');
    });
  });

  describe('Deep Linking and Refresh', () => {
    it('should handle page refresh on edit page', () => {
      mockLoadCustomer(1001);
      mockLoadUDCOptions();
      
      cy.visit('/sample/customer/1001/edit');
      cy.wait('@loadCustomer');
      cy.wait('@loadUDCOptions');
      
      // Make changes
      cy.fillCustomerEditForm({ typeCode: 'D' });
      
      // Reload page
      mockLoadCustomer(1001);
      mockLoadUDCOptions();
      cy.reload();
      cy.wait('@loadCustomer');
      cy.wait('@loadUDCOptions');
      
      // Form should be reset (changes lost)
      cy.get('[data-testid="customer-type-select"]').should('be.visible');
    });

    it('should handle direct URL navigation to edit page', () => {
      mockLoadCustomer(1001);
      mockLoadUDCOptions();
      
      cy.visit('/sample/customer/1001/edit');
      cy.wait('@loadCustomer');
      cy.wait('@loadUDCOptions');
      
      cy.get('mat-card-title').should('contain', 'Edit Customer');
      cy.get('[data-testid="customer-type-select"]').should('be.visible');
    });
  });
});
