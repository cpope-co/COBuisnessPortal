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

  namespace Cypress {
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

      // Customer-specific commands

      /**
       * Navigate to the customer list page and wait for data to load
       */
      navigateToCustomerList(): Chainable<Element>;

      /**
       * Open a specific customer detail page by customer number
       * @param custNumber - The customer number to view
       */
      openCustomerDetail(custNumber: number): Chainable<Element>;

      /**
       * Fill out the customer edit form with provided data
       * @param data - Form data with optional typeCode and candyLiker
       */
      fillCustomerEditForm(data: { typeCode?: string; candyLiker?: boolean }): Chainable<Element>;

      /**
       * Type into the table search field (requires 4+ characters to activate)
       * @param searchText - Text to search for
       */
      searchTable(searchText: string): Chainable<Element>;

      /**
       * Open the advanced filters dialog
       */
      openAdvancedFilters(): Chainable<Element>;

      /**
       * Apply a column filter in the advanced filters dialog
       * @param columnName - The column formControlName
       * @param value - The value to filter by
       */
      applyColumnFilter(columnName: string, value: string): Chainable<Element>;

      /**
       * Clear all active filters from the advanced filters dialog
       */
      clearAllFilters(): Chainable<Element>;

      /**
       * Verify a customer appears in the table
       * @param customer - Customer object to verify
       */
      verifyCustomerInTable(customer: any): Chainable<Element>;

      /**
       * Click a specific table row by index
       * @param index - Zero-based row index
       */
      clickTableRow(index: number): Chainable<Element>;

      /**
       * Sort the table by clicking a column header
       * @param columnName - The column to sort
       */
      sortTableByColumn(columnName: string): Chainable<Element>;

      /**
       * Verify table is sorted in a specific direction
       * @param columnName - The column that should be sorted
       * @param direction - Sort direction ('asc' or 'desc')
       */
      verifyTableSort(columnName: string, direction: 'asc' | 'desc'): Chainable<Element>;

      /**
       * Change the pagination page size
       * @param pageSize - The page size to select (10, 25, 50, 100)
       */
      changePagination(pageSize: number): Chainable<Element>;

      /**
       * Stub the native window.confirm dialog
       * @param returnValue - What the confirm should return
       */
      stubNativeConfirm(returnValue: boolean): Chainable<any>;

      /**
       * Verify a success message is displayed
       * @param text - Text that should appear in the message
       */
      shouldShowSuccessMessage(text: string): Chainable<Element>;

      /**
       * Verify an error message is displayed
       * @param text - Text that should appear in the message
       */
      shouldShowErrorMessage(text: string): Chainable<Element>;

      /**
       * Verify a warning message is displayed
       * @param text - Text that should appear in the message
       */
      shouldShowWarningMessage(text: string): Chainable<Element>;

      /**
       * Verify an info message is displayed
       * @param text - Text that should appear in the message
       */
      shouldShowInfoMessage(text: string): Chainable<Element>;

      /**
       * Verify no message is currently displayed
       */
      shouldNotShowMessage(): Chainable<Element>;

      /**
       * Dismiss the currently displayed message
       */
      dismissMessage(): Chainable<Element>;

      // Fixture validation commands

      /**
       * Validate customer fixtures schema
       * @param fixturePath - Path to the customer fixture file
       */
      validateCustomerFixture(fixturePath: string): Chainable<void>;

      /**
       * Validate UDC options fixtures schema
       * @param fixturePath - Path to the UDC fixture file
       */
      validateUDCFixture(fixturePath: string): Chainable<void>;
    }
  }
}

export {};
