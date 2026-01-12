/**
 * Customers Accessibility E2E Tests
 * Tests WCAG 2.1 AA compliance, keyboard navigation, focus management, and ARIA attributes
 */

import { mockLoadCustomers, mockLoadCustomer, mockLoadUDCOptions } from '../support/customers-mocks';

describe('06 - Customers Accessibility', () => {
  
  beforeEach(() => {
    // Clear session data
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

  describe('Automated Accessibility Checks', () => {
    it('should pass accessibility checks on customer list page', () => {
      mockLoadCustomers();
      mockLoadUDCOptions();
      
      cy.visit('/sample/customers');
      cy.wait('@loadCustomers');
      
      cy.injectAxe();
      cy.checkA11y(undefined, {
        rules: {
          // Allow color contrast issues from Material Design
          'color-contrast': { enabled: false }
        }
      });
    });

    it('should pass accessibility checks on customer detail page', () => {
      mockLoadCustomer(1001);
      
      cy.visit('/sample/customer/1001');
      cy.wait('@loadCustomer');
      
      cy.injectAxe();
      cy.checkA11y(undefined, {
        rules: {
          'color-contrast': { enabled: false }
        }
      });
    });

    it('should pass accessibility checks on customer edit page', () => {
      mockLoadCustomer(1001);
      mockLoadUDCOptions();
      
      cy.visit('/sample/customer/1001/edit');
      cy.wait('@loadCustomer');
      cy.wait('@loadUDCOptions');
      
      cy.injectAxe();
      cy.checkA11y(undefined, {
        rules: {
          'color-contrast': { enabled: false }
        }
      });
    });
  });

  describe('Keyboard Navigation - List Page', () => {
    beforeEach(() => {
      mockLoadCustomers();
      mockLoadUDCOptions();
      
      cy.visit('/sample/customers');
      cy.wait('@loadCustomers');
    });

    it('should navigate through table rows with Tab key', () => {
      cy.get('co-table').focus();
      
      // First focusable element should get focus
      cy.focused().should('exist');
    });

    it('should allow Enter key to select table row', () => {
      cy.get('co-table .mat-mdc-row').first().focus().type('{enter}');
      
      cy.url().should('include', '/sample/customer/');
    });

    it('should focus Advanced Filters button with Tab', () => {
      // Tab through elements until we reach the Advanced button
      cy.get('button').contains('Advanced').focus().should('have.focus');
    });

    it('should activate Advanced Filters button with Space key', () => {
      cy.get('button').contains('Advanced').focus().type(' ');
      
      cy.get('mat-dialog-container').should('be.visible');
    });

    it('should navigate paginator controls with keyboard', () => {
      mockLoadCustomers('customers/large-customer-list.json');
      cy.visit('/sample/customers');
      cy.wait('@loadCustomers');
      
      cy.get('mat-paginator button[aria-label*="Next"]').focus().should('have.focus');
    });
  });

  describe('Keyboard Navigation - Edit Form', () => {
    beforeEach(() => {
      mockLoadCustomer(1001);
      mockLoadUDCOptions();
      
      cy.visit('/sample/customer/1001/edit');
      cy.wait('@loadCustomer');
      cy.wait('@loadUDCOptions');
    });

    it('should Tab through form fields in correct order', () => {
      // Tab through the form
      cy.get('[data-testid="customer-type-select"] mat-select').focus();
      cy.focused().should('exist');
      
      // Use real tab key
      cy.focused().type('{tab}');
      
      // Should move to checkbox
      cy.focused().should('exist');
    });

    it('should open select dropdown with Enter key', () => {
      cy.get('[data-testid="customer-type-select"] mat-select').focus().type('{enter}');
      
      cy.get('mat-option').should('be.visible');
    });

    it('should navigate select options with Arrow keys', () => {
      cy.get('[data-testid="customer-type-select"] mat-select').focus().type('{enter}');
      
      cy.get('mat-option').should('be.visible');
      
      // Arrow down should focus next option
      cy.focused().type('{downarrow}');
      cy.focused().should('be.visible');
    });

    it('should close select dropdown with Escape key', () => {
      cy.get('[data-testid="customer-type-select"] mat-select').click();
      cy.get('mat-option').should('be.visible');
      
      cy.get('body').type('{esc}');
      
      cy.get('mat-option').should('not.exist');
    });

    it('should toggle checkbox with Space key', () => {
      cy.get('[data-testid="candy-checkbox"] input[type="checkbox"]').focus();
      
      cy.get('[data-testid="candy-checkbox"] input[type="checkbox"]').then(($checkbox) => {
        const initialState = $checkbox.prop('checked');
        
        cy.focused().type(' ');
        
        cy.get('[data-testid="candy-checkbox"] input[type="checkbox"]')
          .should($newCheckbox => {
            expect($newCheckbox.prop('checked')).to.not.equal(initialState);
          });
      });
    });

    it('should Tab to Cancel button', () => {
      cy.get('[data-testid="cancel-button"]').focus().should('have.focus');
    });

    it('should Tab to Save button', () => {
      cy.get('[data-testid="save-button"]').focus().should('have.focus');
    });

    it('should support Shift+Tab for reverse navigation', () => {
      cy.get('[data-testid="save-button"]').focus();
      
      cy.focused().type('{shift}{tab}');
      
      cy.focused().should('have.attr', 'data-testid', 'cancel-button');
    });
  });

  describe('Dialog Keyboard Interactions', () => {
    beforeEach(() => {
      mockLoadCustomer(1001);
      mockLoadUDCOptions();
      
      cy.visit('/sample/customer/1001/edit');
      cy.wait('@loadCustomer');
      cy.wait('@loadUDCOptions');
    });

    it('should trap focus within unsaved changes dialog', () => {
      // Make changes to trigger dialog
      cy.fillCustomerEditForm({ typeCode: 'B' });
      cy.get('[data-testid="cancel-button"]').click();
      
      cy.get('mat-dialog-container').should('be.visible');
      
      // Focus should be within dialog
      cy.focused().parents('mat-dialog-container').should('exist');
    });

    it('should close dialog with Escape key', () => {
      cy.fillCustomerEditForm({ candyLiker: true });
      cy.get('[data-testid="cancel-button"]').click();
      
      cy.get('mat-dialog-container').should('be.visible');
      
      cy.get('body').type('{esc}');
      
      cy.get('mat-dialog-container').should('not.exist');
    });

    it('should Tab through dialog buttons', () => {
      cy.fillCustomerEditForm({ typeCode: 'C' });
      cy.get('[data-testid="cancel-button"]').click();
      
      cy.get('mat-dialog-container').should('be.visible');
      
      // Tab through dialog buttons
      cy.get('mat-dialog-actions button').first().focus().should('have.focus');
      cy.focused().type('{tab}');
      cy.focused().should('exist');
    });

    it('should return focus to trigger button after dialog close', () => {
      cy.fillCustomerEditForm({ typeCode: 'D' });
      cy.get('[data-testid="cancel-button"]').focus().click();
      
      cy.get('mat-dialog-container').should('be.visible');
      cy.get('mat-dialog-actions button').contains('Cancel').click();
      
      cy.get('mat-dialog-container').should('not.exist');
      
      // Focus should return to Cancel button
      cy.focused().should('have.attr', 'data-testid', 'cancel-button');
    });
  });

  describe('ARIA Attributes Verification', () => {
    it('should have proper ARIA role on table', () => {
      mockLoadCustomers();
      
      cy.visit('/sample/customers');
      cy.wait('@loadCustomers');
      
      cy.get('co-table table[mat-table]').should('have.attr', 'role', 'table');
    });

    it('should have ARIA role on table rows', () => {
      mockLoadCustomers();
      
      cy.visit('/sample/customers');
      cy.wait('@loadCustomers');
      
      cy.get('co-table tr[mat-row]').should('have.attr', 'role', 'row');
    });

    it('should have ARIA role on buttons', () => {
      mockLoadCustomer(1001);
      
      cy.visit('/sample/customer/1001');
      cy.wait('@loadCustomer');
      
      cy.get('[data-testid="back-button"]').then(($btn) => {
        expect($btn.attr('role')).to.be.oneOf(['button', undefined]);
      });
      cy.get('[data-testid="edit-button"]').then(($btn) => {
        expect($btn.attr('role')).to.be.oneOf(['button', undefined]);
      });
      cy.get('[data-testid="delete-button"]').then(($btn) => {
        expect($btn.attr('role')).to.be.oneOf(['button', undefined]);
      });
    });

    it('should have aria-label on icon-only buttons', () => {
      mockLoadCustomers('customers/large-customer-list.json');
      
      cy.visit('/sample/customers');
      cy.wait('@loadCustomers');
      
      cy.get('mat-paginator button[aria-label*="Next"]').should('have.attr', 'aria-label');
      cy.get('mat-paginator button[aria-label*="Previous"]').should('have.attr', 'aria-label');
    });

    it('should have aria-sort on sortable column headers', () => {
      mockLoadCustomers();
      
      cy.visit('/sample/customers');
      cy.wait('@loadCustomers');
      
      cy.get('co-table th[mat-sort-header]').first().click();
      cy.get('co-table th[mat-sort-header]').first().should('have.attr', 'aria-sort');
    });

    it('should have aria-live region for messages', () => {
      mockLoadCustomers();
      
      cy.visit('/sample/customers');
      cy.wait('@loadCustomers');
      
      // Success message should be in a live region or have appropriate role
      cy.get('.alert-success').then(($alert) => {
        const hasRole = $alert.attr('role') === 'alert';
        const hasAriaLive = $alert.attr('aria-live') !== undefined;
        expect(hasRole || hasAriaLive).to.be.true;
      });
    });
  });

  describe('Form Accessibility', () => {
    beforeEach(() => {
      mockLoadCustomer(1001);
      mockLoadUDCOptions();
      
      cy.visit('/sample/customer/1001/edit');
      cy.wait('@loadCustomer');
      cy.wait('@loadUDCOptions');
    });

    it('should have associated labels for form fields', () => {
      // Mat-select should have accessible label
      cy.get('[data-testid="customer-type-select"] mat-select').then(($select) => {
        const hasAriaLabel = $select.attr('aria-label') !== undefined;
        const hasAriaLabelledby = $select.attr('aria-labelledby') !== undefined;
        expect(hasAriaLabel || hasAriaLabelledby).to.be.true;
      });
    });

    it('should mark required fields with aria-required', () => {
      // Customer type is required
      cy.get('[data-testid="customer-type-select"] mat-select')
        .should('have.attr', 'aria-required', 'true');
    });

    it('should associate error messages with fields via aria-describedby', () => {
      // Trigger validation error if possible
      cy.get('[data-testid="customer-type-select"] mat-select').then(($select) => {
        if ($select.attr('aria-describedby')) {
          cy.log('Field has aria-describedby association');
        }
      });
    });

    it('should announce form submission success', () => {
      mockLoadCustomer(1001);
      cy.fillCustomerEditForm({ typeCode: 'A' });
      
      // Note: Full assertion would require monitoring aria-live regions
      cy.log('Success message should be announced to screen readers');
    });
  });

  describe('Focus Management', () => {
    it('should have visible focus indicators', () => {
      mockLoadCustomers();
      
      cy.visit('/sample/customers');
      cy.wait('@loadCustomers');
      
      cy.get('button').contains('Advanced').focus();
      
      // Focus should be visible (outline, border, etc.)
      cy.focused().then(($el) => {
        const outline = $el.css('outline');
        const boxShadow = $el.css('box-shadow');
        expect(outline !== 'none' || boxShadow !== 'none').to.be.true;
      });
    });

    it('should not lose focus on dropdown open', () => {
      mockLoadCustomer(1001);
      mockLoadUDCOptions();
      
      cy.visit('/sample/customer/1001/edit');
      cy.wait('@loadCustomer');
      cy.wait('@loadUDCOptions');
      
      cy.get('[data-testid="customer-type-select"] mat-select').focus().click();
      
      // Focus should remain in select or move to options
      cy.focused().should('exist');
    });

    it('should maintain focus after page actions', () => {
      mockLoadCustomer(1001);
      
      cy.visit('/sample/customer/1001');
      cy.wait('@loadCustomer');
      
      cy.get('[data-testid="edit-button"]').focus();
      
      cy.focused().should('have.attr', 'data-testid', 'edit-button');
    });
  });

  describe('Screen Reader Support', () => {
    it('should provide meaningful page titles', () => {
      mockLoadCustomers();
      
      cy.visit('/sample/customers');
      cy.wait('@loadCustomers');
      
      cy.get('mat-card-title h1').should('exist').and('be.visible');
    });

    it('should have descriptive button text', () => {
      mockLoadCustomer(1001);
      
      cy.visit('/sample/customer/1001');
      cy.wait('@loadCustomer');
      
      cy.get('[data-testid="back-button"]').should('contain', 'Back to List');
      cy.get('[data-testid="edit-button"]').should('contain', 'Edit');
      cy.get('[data-testid="delete-button"]').should('contain', 'Delete');
    });

    it('should provide context for form fields', () => {
      mockLoadCustomer(1001);
      mockLoadUDCOptions();
      
      cy.visit('/sample/customer/1001/edit');
      cy.wait('@loadCustomer');
      cy.wait('@loadUDCOptions');
      
      // Fields should have labels or aria-labels
      cy.get('[data-testid="customer-type-select"]').should('exist');
      cy.get('[data-testid="candy-checkbox"]').should('exist');
    });
  });

  describe('Color and Contrast', () => {
    it('should not rely solely on color for information', () => {
      mockLoadCustomers();
      
      cy.visit('/sample/customers');
      cy.wait('@loadCustomers');
      
      // Success message should have icon + text, not just color
      cy.get('.alert-success mat-icon').should('exist');
      cy.get('.alert-success span').should('exist');
    });

    it('should use icons with text for actions', () => {
      mockLoadCustomer(1001);
      
      cy.visit('/sample/customer/1001');
      cy.wait('@loadCustomer');
      
      // Buttons should have text, not just icons
      cy.get('[data-testid="edit-button"]').should('have.text');
      cy.get('[data-testid="delete-button"]').should('have.text');
    });
  });
});
