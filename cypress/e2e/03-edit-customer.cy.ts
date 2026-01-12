/**
 * Edit Customer E2E Tests
 * Tests customer edit form interactions, validation, save/cancel actions
 */

import { mockLoadCustomer, mockLoadUDCOptions, mockUpdateCustomer, mockUpdateCustomerValidationError, mockCustomerNotFound } from '../support/customers-mocks';

describe('03 - Edit Customer', () => {
  
  beforeEach(() => {
    // Clear session data
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();

    // Setup default mocks
    mockLoadCustomer(1001);
    mockLoadUDCOptions();

    cy.visit('/sample/customer/1001/edit');
    cy.wait('@loadCustomer');
    cy.wait('@loadUDCOptions');
  });

  describe('Edit Form Display', () => {
    it('should display the edit customer page title', () => {
      cy.get('mat-card-title h1').should('contain', 'Edit Customer');
    });

    it('should display read-only customer information section', () => {
      cy.get('.bg-light.rounded').within(() => {
        cy.contains('Customer Information').should('be.visible');
        cy.contains('Customer Number:').should('be.visible');
        cy.contains('Customer Name:').should('be.visible');
        cy.contains('Address:').should('be.visible');
        cy.contains('Current Type:').should('be.visible');
      });
    });

    it('should display customer number 1001 in readonly section', () => {
      cy.get('.bg-light.rounded').should('contain', '1001');
    });

    it('should display editable form fields', () => {
      cy.get('[data-testid="customer-type-select"]').should('be.visible');
      cy.get('[data-testid="candy-checkbox"]').should('be.visible');
    });

    it('should display action buttons', () => {
      cy.get('[data-testid="cancel-button"]').should('be.visible');
      cy.get('[data-testid="save-button"]').should('be.visible');
    });
  });

  describe('Customer Type Dropdown', () => {
    it('should open dropdown when clicked', () => {
      cy.get('[data-testid="customer-type-select"] mat-select').click();
      cy.get('mat-option').should('be.visible');
      cy.get('mat-option').should('have.length.at.least', 4);
    });

    it('should display all customer type options', () => {
      cy.get('[data-testid="customer-type-select"] mat-select').click();
      
      cy.get('mat-option').should('contain', 'Premium Customer');
      cy.get('mat-option').should('contain', 'Standard Customer');
      cy.get('mat-option').should('contain', 'Budget Customer');
      cy.get('mat-option').should('contain', 'Wholesale Customer');
    });

    it('should update selection when option is clicked', () => {
      cy.get('[data-testid="customer-type-select"] mat-select').click();
      cy.get('mat-option').contains('Standard Customer').click();
      
      cy.get('[data-testid="customer-type-select"] mat-select')
        .should('contain', 'Standard Customer');
    });

    it('should close dropdown after selection', () => {
      cy.get('[data-testid="customer-type-select"] mat-select').click();
      cy.get('mat-option').first().click();
      
      cy.get('mat-option').should('not.exist');
    });
  });

  describe('Candy Checkbox Interaction', () => {
    it('should toggle checkbox state on click', () => {
      cy.get('[data-testid="candy-checkbox"] input[type="checkbox"]').then(($checkbox) => {
        const initialState = $checkbox.prop('checked');
        
        cy.get('[data-testid="candy-checkbox"] mat-checkbox').click();
        
        cy.get('[data-testid="candy-checkbox"] input[type="checkbox"]')
          .should($newCheckbox => {
            expect($newCheckbox.prop('checked')).to.not.equal(initialState);
          });
      });
    });

    it('should check the checkbox when clicking on label', () => {
      cy.get('[data-testid="candy-checkbox"] input[type="checkbox"]').uncheck({ force: true });
      
      cy.get('[data-testid="candy-checkbox"] mat-checkbox').click();
      
      cy.get('[data-testid="candy-checkbox"] input[type="checkbox"]')
        .should('be.checked');
    });
  });

  describe('Form Validation', () => {
    it('should show validation error when customer type is cleared', () => {
      // Try to clear the select (if possible) or test required validation
      cy.get('[data-testid="customer-type-select"] mat-select').click();
      cy.get('mat-option').contains('None').click();
      cy.wait(200);
      cy.get('[data-testid="save-button"]').click();
      // Validation error should appear
      cy.get('mat-error').should('be.visible');
    });
  });

  describe('Save Customer Success', () => {
    it('should save customer and redirect to detail page', () => {
      mockUpdateCustomer(1001, true);
      
      cy.fillCustomerEditForm({ typeCode: 'B', candyLiker: false });
      
      cy.get('[data-testid="save-button"]').click();
      
      cy.wait('@updateCustomer');
      cy.url().should('include', '/sample/customer/1001');
      cy.url().should('not.include', '/edit');
      cy.shouldShowSuccessMessage('Customer updated successfully');
    });

    it('should send correct data to API on save', () => {
      mockUpdateCustomer(1001, true);
      
      cy.fillCustomerEditForm({ typeCode: 'D', candyLiker: true });
      
      cy.get('[data-testid="save-button"]').click();
      
      cy.wait('@updateCustomer').its('request.body').should('deep.include', {
        CustTypeCode: 'D',
        CandyLiker: true
      });
    });

    it('should update only changed fields', () => {
      mockUpdateCustomer(1001, true);
      
      // Only change customer type
      cy.fillCustomerEditForm({ typeCode: 'C' });
      
      cy.get('[data-testid="save-button"]').click();
      
      cy.wait('@updateCustomer').its('request.body')
        .should('have.property', 'CustTypeCode', 'C');
    });
  });

  describe('Cancel Without Changes', () => {
    it('should redirect to detail page immediately when no changes made', () => {
      cy.get('[data-testid="cancel-button"]').click();
      
      // Should redirect without dialog
      cy.url().should('include', '/sample/customer/1001');
      cy.url().should('not.include', '/edit');
      cy.get('mat-dialog-container').should('not.exist');
    });
  });

  describe('Cancel With Unsaved Changes', () => {
    it('should show unsaved changes dialog when form is modified', () => {
      cy.fillCustomerEditForm({ typeCode: 'B' });
      
      cy.get('[data-testid="cancel-button"]').click();
      
      cy.get('mat-dialog-container').should('be.visible');
      cy.get('mat-dialog-container').should('contain', 'Unsaved changes');
      cy.get('mat-dialog-container').should('contain', 'discard');
    });

    it('should redirect when Continue is clicked in dialog', () => {
      cy.fillCustomerEditForm({ candyLiker: false });
      
      cy.get('[data-testid="cancel-button"]').click();
      
      cy.get('mat-dialog-container').should('be.visible');
      cy.get('mat-dialog-actions button').contains('Continue').click();
      
      cy.get('mat-dialog-container').should('not.exist');
      cy.url().should('include', '/sample/customer/1001');
      cy.url().should('not.include', '/edit');
    });

    it('should stay on edit page when Cancel is clicked in dialog', () => {
      cy.fillCustomerEditForm({ typeCode: 'C' });
      
      cy.get('[data-testid="cancel-button"]').click();
      
      cy.get('mat-dialog-container').should('be.visible');
      cy.get('mat-dialog-actions button').contains('Cancel').click();
      
      cy.get('mat-dialog-container').should('not.exist');
      cy.url().should('include', '/edit');
      cy.get('mat-card-title').should('contain', 'Edit Customer');
    });
  });

  describe('API Error Scenarios', () => {
    it('should display error message on validation error (400)', () => {
      mockUpdateCustomerValidationError(1001);
      
      cy.fillCustomerEditForm({ typeCode: 'A' });
      cy.get('[data-testid="save-button"]').click();
      
      cy.wait('@updateCustomer');
      cy.shouldShowErrorMessage('Please correct the errors on the form');
    });

    it('should display error message when customer not found (404)', () => {
      mockUpdateCustomer(1001, false, 'notfound');
      
      cy.fillCustomerEditForm({ candyLiker: true });
      cy.get('[data-testid="save-button"]').click();
      
      cy.wait('@updateCustomer');
      cy.shouldShowErrorMessage('Customer record not found');
    });

    it('should display error message on server error (500)', () => {
      mockUpdateCustomer(1001, false, 'server');
      
      cy.fillCustomerEditForm({ typeCode: 'D' });
      cy.get('[data-testid="save-button"]').click();
      
      cy.wait('@updateCustomer');
      cy.shouldShowErrorMessage('Failed to save customer');
    });

    it('should stay on edit page after save error', () => {
      mockUpdateCustomer(1001, false, 'server');
      
      cy.fillCustomerEditForm({ typeCode: 'B' });
      cy.get('[data-testid="save-button"]').click();
      
      cy.wait('@updateCustomer');
      cy.url().should('include', '/edit');
    });
  });

  describe('Load Errors', () => {
    it('should handle customer not found on page load', () => {
      mockCustomerNotFound(9999);
      mockLoadUDCOptions();
      
      cy.visit('/sample/customer/9999/edit');
      cy.wait('@loadCustomer');
      
      cy.shouldShowErrorMessage('Failed to load customer');
    });
  });

  describe('Form Helper Usage', () => {
    it('should use fillCustomerEditForm helper to change both fields', () => {
      mockUpdateCustomer(1001, true);
      
      cy.fillCustomerEditForm({
        typeCode: 'B',
        candyLiker: false
      });
      
      cy.get('[data-testid="customer-type-select"] mat-select')
        .should('contain', 'Standard Customer');
      cy.get('[data-testid="candy-checkbox"] input[type="checkbox"]')
        .should('not.be.checked');
    });
  });
});
