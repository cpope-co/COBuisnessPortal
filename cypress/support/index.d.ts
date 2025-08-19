/// <reference types="cypress" />

declare global {
  interface Window {
    grecaptcha?: {
      execute: (action: string) => Promise<string>;
    };
  }
}

declare namespace Cypress {
  interface Chainable {
    /**
     * Login with email and password
     * @param email - User email
     * @param password - User password
     */
    login(email: string, password: string): Chainable<Element>;
    
    /**
     * Logout the current user
     */
    logout(): Chainable<Element>;
    
    /**
     * Setup a logged-in user session without UI interaction
     * @param userRole - User role (default: 1)
     */
    setupLoggedInUser(userRole?: number): Chainable<Element>;
    
    /**
     * Clear all session data
     */
    clearSession(): Chainable<Element>;
    
    /**
     * Assert that user is logged in
     */
    shouldBeLoggedIn(): Chainable<Element>;
    
    /**
     * Assert that user is logged out
     */
    shouldBeLoggedOut(): Chainable<Element>;
    
    /**
     * Fill supplier registration form with test data
     */
    fillSupplierForm(): Chainable<Element>;
    
    /**
     * Fill retailer registration form with test data
     */
    fillRetailerForm(): Chainable<Element>;
    
    /**
     * Keyboard tab navigation
     */
    tab(): Chainable<Element>;
  }
}
