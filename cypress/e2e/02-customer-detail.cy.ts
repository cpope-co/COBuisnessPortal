/**
 * Customer Detail E2E Tests
 * Tests customer detail page display, navigation actions, and delete functionality
 */

describe('02 - Customer Detail', () => {
  
  beforeEach(() => {
    // Clear session data
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

  describe('Customer Detail Display', () => {
    beforeEach(() => {
      // Visit customer detail page - service uses built-in mock data
      cy.visit('/sample/customer/1001');
      cy.get('mat-card-title h1', { timeout: 10000 }).should('be.visible');
    });

    it('should display the customer detail page title', () => {
      cy.get('mat-card-title h1').should('contain', 'Customer Detail');
    });

    it('should display all customer fields', () => {
      cy.get('mat-card-content').within(() => {
        cy.contains('Customer Number:').should('be.visible');
        cy.contains('Customer Name:').should('be.visible');
        cy.contains('Address:').should('be.visible');
        cy.contains('Customer Type:').should('be.visible');
        cy.contains('Likes Candy:').should('be.visible');
      });
    });

    it('should display customer number 1001', () => {
      cy.get('mat-card-content').should('contain', '1001');
    });

    it('should format candy preference as Yes/No', () => {
      cy.get('mat-card-content').then(($content) => {
        const text = $content.text();
        expect(text).to.match(/Yes|No/);
      });
    });

    it('should display all action buttons', () => {
      cy.get('[data-testid="back-button"]').should('be.visible');
      cy.get('[data-testid="edit-button"]').should('be.visible');
      cy.get('[data-testid="delete-button"]').should('be.visible');
    });
  });

  describe('Navigation Actions', () => {
    beforeEach(() => {
      cy.visit('/sample/customer/1001');
      cy.get('mat-card-title h1', { timeout: 10000 }).should('be.visible');
    });

    it('should navigate back to customer list when clicking Back button', () => {
      cy.get('[data-testid="back-button"]').click();
      cy.url().should('include', '/sample/customers');
      cy.get('mat-card-title').should('contain', 'Customer List');
    });

    it('should navigate to edit page when clicking Edit button', () => {
      cy.get('[data-testid="edit-button"]').click();
      cy.url().should('include', '/sample/customer/1001/edit');
      cy.get('mat-card-title').should('contain', 'Edit Customer');
    });
  });

  describe('Delete Customer Success', () => {
    beforeEach(() => {
      mockLoadCustomer(1001);
      cy.visit('/sample/customer/1001');
      cy.get('mat-card-title h1', { timeout: 10000 }).should('be.visible');
    });

    it('should show native confirm dialog when clicking Delete', () => {
      cy.stubNativeConfirm(true);
      
      cy.get('[data-testid="delete-button"]').click();
      
      cy.get('@confirmStub').should('have.been.calledOnce');
    });

    it('should delete customer and redirect to list on confirm', () => {
      cy.stubNativeConfirm(true);
      
      cy.get('[data-testid="delete-button"]').click();
      
      cy.url({ timeout: 10000 }).should('include', '/sample/customers');
      cy.shouldShowSuccessMessage('Customer deleted successfully');
    });
  });

  describe('Cancel Delete Confirmation', () => {
    beforeEach(() => {
      mockLoadCustomer(1001);
      cy.visit('/sample/customer/1001');
      cy.wait('@loadCustomer');
    });

    it('should show confirm dialog on delete click', () => {
      cy.stubNativeConfirm(false);
      
      cy.get('[data-testid="delete-button"]').click();
      
      cy.get('@confirmStub').should('have.been.calledOnce');
      cy.url().should('include', '/sample/customer/1001');
      cy.url().should('not.include', '/customers');
    });

    it('should remain on detail page after canceling delete', () => {
      cy.stubNativeConfirm(false);
      
      cy.get('[data-testid="delete-button"]').click();
      
      cy.get('mat-card-title').should('contain', 'Customer Detail');
      cy.get('mat-card-content').should('be.visible');
    });
  });

  describe('Deep Linking', () => {
    it('should load customer directly via URL', () => {
      cy.visit('/sample/customer/1001');
      cy.get('mat-card-title', { timeout: 10000 }).should('contain', 'Customer Detail');
      
      cy.get('mat-card-content').should('contain', '1001');
    });

    it.skip('should handle invalid customer ID in URL - requires API mode', () => {
      cy.log('Invalid ID handling requires API mode');
    });
  });
});

function mockLoadCustomer(customerId: number) {
  cy.intercept('GET', `**/api/customers/${customerId}`, {
    statusCode: 200,
    body: {
      customerNumber: customerId,
      customerName: 'Test Customer',
      address: '123 Test St',
      customerType: 'Standard',
      likesCandy: true
    }
  }).as('loadCustomer');
}

function mockCustomerNotFound(customerId: number) {
  cy.intercept('GET', `**/api/customers/${customerId}`, {
    statusCode: 404,
    body: { message: 'Customer not found' }
  }).as('loadCustomer');
}
