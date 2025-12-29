/// <reference types="cypress" />

// Import auth-mocks types
import { UserRole, ErrorType, MockUser, MockLoginResponse } from './auth-mocks';

declare global {
  interface Window {
    grecaptcha?: {
      execute: (action: string) => Promise<string>;
    };
  }

  // Export auth-mocks types globally
  export { UserRole, ErrorType, MockUser, MockLoginResponse };
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
     * Fill retailer registration form with an in use emai
     */
    fillRetailerWithInUseEmail(): Chainable<Element>;

    /**
     * Fill retailer registration form with an in use emai
     */
    fillSupplierWithInUseEmail(): Chainable<Element>;

    /**
     * Keyboard tab navigation
     */
    tab(): Chainable<Element>;

    /**
     * Setup authenticated user for menu testing
     * @param userRole - User role (default: 2)
     */
    setupAuthenticatedUser(userRole?: number): Chainable<Element>;

    /**
     * Verify basic menu structure is present and visible
     */
    verifyMenuStructure(): Chainable<Element>;

    /**
     * Test navigation to a specific menu item
     * @param menuItemText - Text content of the menu item to click
     * @param expectedRoute - Expected route after navigation
     */
    testMenuNavigation(menuItemText: string, expectedRoute: string): Chainable<Element>;

    /**
     * Check menu accessibility features
     */
    checkMenuAccessibility(): Chainable<Element>;

    /**
     * Verify menu accessibility compliance with WCAG 2.1 AA
     */
    verifyMenuAccessibility(): Chainable<Element>;

    /**
     * Test menu keyboard navigation
     */
    testMenuKeyboardNavigation(): Chainable<Element>;
  }
}
