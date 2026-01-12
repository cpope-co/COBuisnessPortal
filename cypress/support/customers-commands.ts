/**
 * Customer-specific Cypress custom commands
 * Reusable helper functions for customer CRUD e2e testing
 */

/// <reference path="./index.d.ts" />

import { SampleData } from './customers-mocks';

// Type declarations to satisfy TypeScript compiler
declare global {
  namespace Cypress {
    interface Chainable {
      navigateToCustomerList(): Chainable<Element>;
      openCustomerDetail(custNumber: number): Chainable<Element>;
      fillCustomerEditForm(data: { typeCode?: string; candyLiker?: boolean }): Chainable<Element>;
      searchTable(searchText: string): Chainable<Element>;
      openAdvancedFilters(): Chainable<Element>;
      applyColumnFilter(columnName: string, value: string): Chainable<Element>;
      clearAllFilters(): Chainable<Element>;
      verifyCustomerInTable(customer: Partial<SampleData>): Chainable<Element>;
      clickTableRow(index: number): Chainable<Element>;
      sortTableByColumn(columnName: string): Chainable<Element>;
      verifyTableSort(columnName: string, direction: 'asc' | 'desc'): Chainable<Element>;
      changePagination(pageSize: number): Chainable<Element>;
      stubNativeConfirm(returnValue: boolean): Chainable<any>;
      shouldShowSuccessMessage(text: string): Chainable<Element>;
      shouldShowErrorMessage(text: string): Chainable<Element>;
      shouldShowWarningMessage(text: string): Chainable<Element>;
      shouldShowInfoMessage(text: string): Chainable<Element>;
      shouldNotShowMessage(): Chainable<Element>;
      dismissMessage(): Chainable<Element>;
    }
  }
}

/**
 * Navigate to the customer list page and wait for data to load
 * 
 * @example
 * cy.navigateToCustomerList();
 */
Cypress.Commands.add('navigateToCustomerList', () => {
  cy.visit('/sample/customers');
  cy.wait('@loadCustomers');
  cy.get('[data-testid="customer-list-table"]').should('be.visible');
});

/**
 * Open a specific customer detail page by customer number
 * 
 * @param custNumber - The customer number to view
 * 
 * @example
 * cy.openCustomerDetail(1001);
 */
Cypress.Commands.add('openCustomerDetail', (custNumber: number) => {
  // Find the table row containing the customer number and click it
  cy.get('co-table .mat-mdc-row').contains(custNumber.toString()).parents('.mat-mdc-row').click();
  cy.url().should('include', `/sample/customer/${custNumber}`);
  cy.get('mat-card-title').should('contain', 'Customer Detail');
});

/**
 * Fill out the customer edit form with provided data
 * 
 * @param data - Form data with optional typeCode and candyLiker
 * 
 * @example
 * cy.fillCustomerEditForm({ typeCode: 'B', candyLiker: false });
 * cy.fillCustomerEditForm({ typeCode: 'A' }); // Only change type
 * cy.fillCustomerEditForm({ candyLiker: true }); // Only change candy preference
 */
Cypress.Commands.add('fillCustomerEditForm', (data: { typeCode?: string; candyLiker?: boolean }) => {
  if (data.typeCode !== undefined) {
    // Open the select dropdown
    cy.get('[data-testid="customer-type-select"] mat-select').click();
    
    // Wait for options to be visible
    cy.get('mat-option').should('be.visible');
    
    // Select the option by type code
    const typeNames: Record<string, string> = {
      'A': 'Premium Customer',
      'B': 'Standard Customer',
      'C': 'Budget Customer',
      'D': 'Wholesale Customer'
    };
    
    const typeName = typeNames[data.typeCode];
    if (typeName) {
      cy.get('mat-option').contains(typeName).click();
    }
    
    // Verify selection
    cy.get('[data-testid="customer-type-select"] mat-select').should('contain', typeName);
  }
  
  if (data.candyLiker !== undefined) {
    // Get current checkbox state
    cy.get('[data-testid="candy-checkbox"] input[type="checkbox"]').then(($checkbox) => {
      const isChecked = $checkbox.prop('checked');
      
      // Only click if we need to change the state
      if (isChecked !== data.candyLiker) {
        cy.get('[data-testid="candy-checkbox"] mat-checkbox').click();
      }
    });
    
    // Verify the checkbox state
    if (data.candyLiker) {
      cy.get('[data-testid="candy-checkbox"] input[type="checkbox"]').should('be.checked');
    } else {
      cy.get('[data-testid="candy-checkbox"] input[type="checkbox"]').should('not.be.checked');
    }
  }
});

/**
 * Type into the table search field
 * Note: Co-table requires 4+ characters to activate search
 * 
 * @param searchText - Text to search for
 * 
 * @example
 * cy.searchTable('Acme'); // Search for Acme
 * cy.searchTable(''); // Clear search
 */
Cypress.Commands.add('searchTable', (searchText: string) => {
  cy.get('input[type="search"]').clear();
  if (searchText) {
    cy.get('input[type="search"]').type(searchText);
  }
});

/**
 * Open the advanced filters dialog
 * 
 * @example
 * cy.openAdvancedFilters();
 */
Cypress.Commands.add('openAdvancedFilters', () => {
  cy.get('button').contains('Advanced').click();
  cy.get('mat-dialog-container').should('be.visible');
  cy.get('mat-dialog-container h2').should('contain', 'Advanced Filters');
});

/**
 * Apply a column filter in the advanced filters dialog
 * 
 * @param columnName - The column formControlName (e.g., 'CustName', 'CustTypeCode')
 * @param value - The value to filter by
 * 
 * @example
 * cy.applyColumnFilter('CustName', 'Acme');
 * cy.applyColumnFilter('CustTypeCode', 'Premium Customer');
 */
Cypress.Commands.add('applyColumnFilter', (columnName: string, value: string) => {
  cy.get('mat-dialog-container').should('be.visible');
  
  // Check if it's a select (co-select) or input field
  cy.get('mat-dialog-container').then(($dialog) => {
    if ($dialog.find(`co-select[formcontrolname="${columnName}"]`).length > 0) {
      // It's a select dropdown
      cy.get(`mat-dialog-container co-select[formcontrolname="${columnName}"] mat-select`).click();
      cy.get('mat-option').contains(value).click();
    } else {
      // It's a text/number input
      cy.get(`mat-dialog-container input[formcontrolname="${columnName}"]`).clear().type(value);
    }
  });
  
  // Click Apply Filters button
  cy.get('mat-dialog-actions button[color="primary"]').contains('Apply Filters').click();
  
  // Wait for dialog to close
  cy.get('mat-dialog-container').should('not.exist');
});

/**
 * Clear all active filters from the advanced filters dialog
 * 
 * @example
 * cy.clearAllFilters();
 */
Cypress.Commands.add('clearAllFilters', () => {
  cy.get('button').contains('Advanced').click();
  cy.get('mat-dialog-container').should('be.visible');
  cy.get('mat-dialog-actions button.clear-btn').click();
  cy.get('mat-dialog-container').should('not.exist');
});

/**
 * Verify a customer appears in the table
 * 
 * @param customer - Customer object to verify
 * 
 * @example
 * cy.verifyCustomerInTable({ CustNumber: 1001, CustName: 'Acme Corp' });
 */
Cypress.Commands.add('verifyCustomerInTable', (customer: Partial<SampleData>) => {
  if (customer.CustNumber) {
    cy.get('co-table .mat-mdc-row').should('contain', customer.CustNumber);
  }
  if (customer.CustName) {
    cy.get('co-table .mat-mdc-row').should('contain', customer.CustName);
  }
  if (customer.CustTypeDesc) {
    cy.get('co-table .mat-mdc-row').should('contain', customer.CustTypeDesc);
  }
});

/**
 * Click a specific table row by index
 * 
 * @param index - Zero-based row index
 * 
 * @example
 * cy.clickTableRow(0); // Click first row
 * cy.clickTableRow(2); // Click third row
 */
Cypress.Commands.add('clickTableRow', (index: number) => {
  cy.get('co-table .mat-mdc-row').eq(index).click();
});

/**
 * Sort the table by clicking a column header
 * 
 * @param columnName - The column to sort (e.g., 'CustName', 'CustNumber')
 * 
 * @example
 * cy.sortTableByColumn('CustName');
 */
Cypress.Commands.add('sortTableByColumn', (columnName: string) => {
  // Click the sort header - using a more flexible selector
  cy.get('co-table th[mat-sort-header]').contains(new RegExp(columnName.replace('Cust', ''), 'i')).click();
});

/**
 * Verify table is sorted in a specific direction
 * 
 * @param columnName - The column that should be sorted
 * @param direction - Sort direction ('asc' or 'desc')
 * 
 * @example
 * cy.verifyTableSort('CustName', 'asc');
 */
Cypress.Commands.add('verifyTableSort', (columnName: string, direction: 'asc' | 'desc') => {
  const ariaSort = direction === 'asc' ? 'ascending' : 'descending';
  cy.get('co-table th[mat-sort-header]').contains(new RegExp(columnName.replace('Cust', ''), 'i'))
    .should('have.attr', 'aria-sort', ariaSort);
});

/**
 * Change the pagination page size
 * 
 * @param pageSize - The page size to select (10, 25, 50, 100)
 * 
 * @example
 * cy.changePagination(25);
 */
Cypress.Commands.add('changePagination', (pageSize: number) => {
  cy.get('mat-paginator mat-select').click();
  cy.get('mat-option').contains(pageSize.toString()).click();
});

/**
 * Stub the native window.confirm dialog
 * 
 * @param returnValue - What the confirm should return (true = OK, false = Cancel)
 * @returns Chainable with the stub
 * 
 * @example
 * cy.stubNativeConfirm(true); // User clicks OK
 * cy.stubNativeConfirm(false); // User clicks Cancel
 */
Cypress.Commands.add('stubNativeConfirm', (returnValue: boolean) => {
  return cy.window().then((win) => {
    const stub = cy.stub(win, 'confirm').returns(returnValue);
    cy.wrap(stub).as('confirmStub');
  });
});

/**
 * Verify a success message is displayed
 * 
 * @param text - Text that should appear in the message
 * 
 * @example
 * cy.shouldShowSuccessMessage('Customer deleted successfully');
 */
Cypress.Commands.add('shouldShowSuccessMessage', (text: string) => {
  cy.get('.alert-success', { timeout: 5000 })
    .should('be.visible')
    .find('span')
    .should('contain', text);
});

/**
 * Verify an error message is displayed
 * 
 * @param text - Text that should appear in the message
 * 
 * @example
 * cy.shouldShowErrorMessage('Failed to load customer');
 */
Cypress.Commands.add('shouldShowErrorMessage', (text: string) => {
  cy.get('.alert-danger', { timeout: 5000 })
    .should('be.visible')
    .find('span')
    .should('contain', text);
});

/**
 * Verify a warning message is displayed
 * 
 * @param text - Text that should appear in the message
 * 
 * @example
 * cy.shouldShowWarningMessage('This action cannot be undone');
 */
Cypress.Commands.add('shouldShowWarningMessage', (text: string) => {
  cy.get('.alert-warning', { timeout: 5000 })
    .should('be.visible')
    .find('span')
    .should('contain', text);
});

/**
 * Verify an info message is displayed
 * 
 * @param text - Text that should appear in the message
 * 
 * @example
 * cy.shouldShowInfoMessage('Loading data');
 */
Cypress.Commands.add('shouldShowInfoMessage', (text: string) => {
  cy.get('.alert-info', { timeout: 5000 })
    .should('be.visible')
    .find('span')
    .should('contain', text);
});

/**
 * Verify no message is currently displayed
 * 
 * @example
 * cy.shouldNotShowMessage();
 */
Cypress.Commands.add('shouldNotShowMessage', () => {
  cy.get('.alert').should('not.exist');
});

/**
 * Dismiss the currently displayed message
 * 
 * @example
 * cy.dismissMessage();
 */
Cypress.Commands.add('dismissMessage', () => {
  cy.get('.alert .btn-close').click();
  cy.get('.alert').should('not.exist');
});
