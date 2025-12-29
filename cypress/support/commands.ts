/// <reference types="cypress" />

// Import auth-mocks for centralized authentication mocking
import { 
  mockLoginSuccess, 
  mockLogout, 
  setupMockSession, 
  clearAuthSession,
  UserRole 
} from './auth-mocks';

// Custom commands for the COBusiness Portal e2e tests

/**
 * Custom command to login a user (uses mock authentication)
 */
// @ts-ignore
Cypress.Commands.add('login', (email: string, password: string) => {
  // Clear any existing session data
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
  cy.clearAllSessionStorage();

  // Setup mock login response
  mockLoginSuccess(UserRole.Admin);

  // Visit login page
  cy.visit('/auth/login');

  // Fill in the form
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();

  // Wait for the request - the app should handle session storage
  cy.wait('@loginRequest');
  
  // Give the app time to process the response and set session
  cy.wait(100);
});

/**
 * Custom command to logout a user (uses mock authentication)
 */
// @ts-ignore
Cypress.Commands.add('logout', () => {
  // Setup mock logout response
  mockLogout();

  // Click profile menu and logout
  cy.get('button').contains('Profile').click();
  cy.get('a[mat-menu-item]').contains('Logout').click();

  // Wait for logout request
  cy.wait('@logoutRequest');
});

/**
 * Custom command to setup a logged-in user session without going through the UI
 * Now uses centralized auth-mocks for consistency
 */
// @ts-ignore
Cypress.Commands.add('setupLoggedInUser', (userRole: number = 1) => {
  setupMockSession(userRole as UserRole);
});

/**
 * Custom command to clear all storage
 */
// @ts-ignore
Cypress.Commands.add('clearSession', () => {
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
  cy.clearAllSessionStorage();
  clearAuthSession();
});

/**
 * Custom command to check if user is logged in
 */
// @ts-ignore
Cypress.Commands.add('shouldBeLoggedIn', () => {
  cy.get('button').contains('Profile').should('be.visible');
  cy.get('mat-toolbar').should('contain', 'Chambers & Owen');
});

/**
 * Custom command to check if user is logged out
 */
// @ts-ignore
Cypress.Commands.add('shouldBeLoggedOut', () => {
  cy.url().should('include', '/auth/login');
  cy.contains('h2', 'Login').should('be.visible');
});

/**
 * Custom command to fill supplier registration form
 */
// @ts-ignore
Cypress.Commands.add('fillSupplierForm', () => {
  const testData = {
    email: 'supplier@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '1234567890',
    accountName: 'Test Supplier Account'
  };

  // Wait for the form to be visible first
  cy.get('div[formgroupname="matchEmails"]', { timeout: 10000 }).should('be.visible');

  // Fill form fields using component ID selectors
  cy.get('co-input[id="email-usemail"]').find('input').type(testData.email);
  cy.get('co-input[id="email-verifyEmail"]').find('input').type(testData.email);
  cy.get('co-input[id="text-usfname"]').find('input').type(testData.firstName);
  cy.get('co-input[id="text-uslname"]').find('input').type(testData.lastName);
  cy.get('co-input[id="tel-wphone"]').find('input').type(testData.phone);
  cy.get('co-input[id="text-wacctname"]').find('input').type(testData.accountName);

  // Select category manager for supplier (wait for it to be available)
  cy.get('co-select[id="select-wcatmgr"]', { timeout: 10000 }).should('be.visible').click();
  cy.get('mat-option', { timeout: 10000 }).eq(1).click();
});
/**
 * Custom command to fill supplier registration form
 */
// @ts-ignore
Cypress.Commands.add('fillSupplierWithInUseEmail', () => {
  const testData = {
    email: 'cstore@draxlers.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '1234567890',
    accountName: 'Test Supplier Account'
  };

  // Wait for the form to be visible first
  cy.get('div[formgroupname="matchEmails"]', { timeout: 10000 }).should('be.visible');

  // Fill form fields using component ID selectors
  cy.get('co-input[id="email-usemail"]').find('input').type(testData.email);
  cy.get('co-input[id="email-verifyEmail"]').find('input').type(testData.email);
  cy.get('co-input[id="text-usfname"]').find('input').type(testData.firstName);
  cy.get('co-input[id="text-uslname"]').find('input').type(testData.lastName);
  cy.get('co-input[id="tel-wphone"]').find('input').type(testData.phone);
  cy.get('co-input[id="text-wacctname"]').find('input').type(testData.accountName);

  // Select category manager for supplier (wait for it to be available)
  cy.get('co-select[id="select-wcatmgr"]', { timeout: 10000 }).should('be.visible').click();
  cy.get('mat-option', { timeout: 10000 }).eq(1).click();
});
/**
 * Custom command to fill retailer registration form
 */
// @ts-ignore
Cypress.Commands.add('fillRetailerForm', () => {
  const testData = {
    email: 'retailer@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '9876543210',
    accountNumber: 'RET123456',
    accountName: 'Test Retailer Account'
  };

  // Wait for the form to be visible first
  cy.get('div[formgroupname="matchEmails"]', { timeout: 10000 }).should('be.visible');

  // Fill form fields using component ID selectors
  cy.get('co-input[id="email-usemail"]').find('input').type(testData.email);
  cy.get('co-input[id="email-verifyEmail"]').find('input').type(testData.email);
  cy.get('co-input[id="text-usfname"]').find('input').type(testData.firstName);
  cy.get('co-input[id="text-uslname"]').find('input').type(testData.lastName);
  cy.get('co-input[id="tel-wphone"]').find('input').type(testData.phone);
  cy.get('co-input[id="text-usabnum"]').find('input').type(testData.accountNumber);
  cy.get('co-input[id="text-wacctname"]').find('input').type(testData.accountName);
});
/**
 * Custom command to fill retailer registration form with an in use email
 */
// @ts-ignore
Cypress.Commands.add('fillReailerWithInUseEmail', () => {
  const testData = {
    email: 'cstore@draxlers.comm',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '9876543210',
    accountNumber: 'RET123456',
    accountName: 'Test Retailer Account'
  };

  // Wait for the form to be visible first
  cy.get('div[formgroupname="matchEmails"]', { timeout: 10000 }).should('be.visible');

  // Fill form fields using component ID selectors
  cy.get('co-input[id="email-usemail"]').find('input').type(testData.email);
  cy.get('co-input[id="email-verifyEmail"]').find('input').type(testData.email);
  cy.get('co-input[id="text-usfname"]').find('input').type(testData.firstName);
  cy.get('co-input[id="text-uslname"]').find('input').type(testData.lastName);
  cy.get('co-input[id="tel-wphone"]').find('input').type(testData.phone);
  cy.get('co-input[id="text-usabnum"]').find('input').type(testData.accountNumber);
  cy.get('co-input[id="text-wacctname"]').find('input').type(testData.accountName);
});
/**
 * Custom command for keyboard tab navigation
 */
// @ts-ignore
Cypress.Commands.add('tab', { prevSubject: true }, (subject) => {
  return cy.wrap(subject).trigger('keydown', { key: 'Tab' });
});

/**
 * Custom command to setup authenticated user for menu testing
 * Now uses mock sessions instead of real credentials
 */
// @ts-ignore
Cypress.Commands.add('setupAuthenticatedUser', (userRole: number = 2) => {
  // Clear any existing session data first
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
  cy.clearAllSessionStorage();

  // Setup mock authenticated session
  setupMockSession(userRole as UserRole);
  
  // Visit home page (will be authenticated)
  cy.visit('/');
  
  // Wait for the application to be ready
  cy.get('co-menu', { timeout: 10000 }).should('exist');
  
  // Log which user we're testing with
  const roleNames: {[key: number]: string} = {
    1: 'Admin',
    2: 'Customer', 
    3: 'Vendor',
    4: 'Employee',
    5: 'API User',
    6: 'Employee-Sales'
  };
  cy.log(`Authenticated as ${roleNames[userRole]} (Role ${userRole})`);
});

/**
 * Custom command to verify menu structure
 */
// @ts-ignore
Cypress.Commands.add('verifyMenuStructure', () => {
  cy.get('co-menu').should('exist');
  cy.get('button[id="co-menu-button"]').should('exist').click({ force: true });
  cy.get('nav[role="navigation"]').should('be.visible');
  cy.get('mat-nav-list[role="menubar"]').should('be.visible');
  cy.get('a[mat-list-item][role="menuitem"]').should('exist');
});

/**
 * Custom command to test menu navigation
 */
// @ts-ignore
Cypress.Commands.add('testMenuNavigation', (menuItemText: string, expectedRoute: string) => {
  // Open the navigation drawer first if not already open
  cy.get('body').then(($body) => {
    if ($body.find('mat-drawer.mat-drawer-opened').length === 0) {
      cy.get('#co-menu-button').should('exist').click({ force: true });
      cy.get('mat-drawer').should('have.class', 'mat-drawer-opened');
    }
  });
  
  cy.contains('mat-nav-list a[mat-list-item]', menuItemText).click();
  cy.url().should('include', expectedRoute);
});

/**
 * Custom command to check menu accessibility features
 */
// @ts-ignore
Cypress.Commands.add('checkMenuAccessibility', () => {
  // Open the navigation drawer first
  cy.get('#co-menu-button').should('exist').click({ force: true });
  
  // Wait for drawer to open and menu to be visible
  cy.get('mat-drawer').should('have.class', 'mat-drawer-opened');
  
  // Check for proper ARIA attributes
  cy.get('mat-nav-list').should('have.attr', 'role', 'menubar');
  
  // Check that menu items are focusable and have meaningful text
  cy.get('a[mat-list-item][role="menuitem"]').each(($el) => {
    cy.wrap($el).should('not.be.empty');
    cy.wrap($el).invoke('text').should('not.be.empty');
    cy.wrap($el).should('be.visible');
  });
  
  // Test keyboard navigation
  cy.get('a[mat-list-item][role="menuitem"]').first().focus();
  cy.focused().should('exist');
});

/**
 * Custom command to verify menu accessibility compliance with WCAG 2.1 AA
 */
// @ts-ignore
Cypress.Commands.add('verifyMenuAccessibility', () => {
  // Open the navigation drawer first
  cy.get('#co-menu-button').should('exist').click({ force: true });
  
  // Wait for drawer to open
  cy.get('mat-drawer').should('have.class', 'mat-drawer-opened');
  
  // Check semantic structure
  cy.get('nav[role="navigation"][aria-label="Main navigation"]').should('exist');
  cy.get('mat-nav-list[role="menubar"]').should('exist');
  
  // Check menu items have proper roles and roving tabindex pattern
  cy.get('a[mat-list-item][role="menuitem"]').should('exist').each(($item, index) => {
    cy.wrap($item).should('have.attr', 'role', 'menuitem');
    // First item should have tabindex="0", rest should have tabindex="-1" (roving tabindex pattern)
    if (index === 0) {
      cy.wrap($item).should('have.attr', 'tabindex', '0');
    } else {
      cy.wrap($item).should('have.attr', 'tabindex', '-1');
    }
  });
  
  // Check headings are properly structured (using Material subheaders)
  cy.get('h3[mat-subheader].nav-heading').each(($heading) => {
    cy.wrap($heading).should('have.attr', 'id');
  });
  
  // Check current page is indicated visually (if there's a matching menu item for current route)
  cy.url().then((currentUrl) => {
    cy.get('a[mat-list-item][role="menuitem"]').then(($items) => {
      const matchingItem = Array.from($items).find(item => {
        const href = item.getAttribute('href');
        return href && (currentUrl.endsWith(href) || currentUrl.includes(href));
      });
      
      if (matchingItem) {
        cy.wrap(matchingItem).should('have.class', 'current-page');
      } else {
        cy.log('No matching menu item found for current route, skipping current page check');
      }
    });
  });
});

/**
 * Custom command to test menu keyboard navigation
 */
// @ts-ignore
Cypress.Commands.add('testMenuKeyboardNavigation', () => {
  // Open the navigation drawer first
  cy.get('#co-menu-button').should('exist').click({ force: true });
  
  // Wait for drawer to open
  cy.get('mat-drawer').should('have.class', 'mat-drawer-opened');
  
  // Focus first menu item
  cy.get('a[mat-list-item][role="menuitem"]').first().focus();
  
  // First item should now have tabindex="0"
  cy.get('a[mat-list-item][role="menuitem"]').first().should('have.attr', 'tabindex', '0');
  
  // Test that roving tabindex pattern works (the core accessibility requirement)
  // We test the programmatic behavior rather than browser-specific focus handling
  cy.get('a[mat-list-item][role="menuitem"]').should('have.length.greaterThan', 1);
  
  // Verify initial state: first item should be focusable (tabindex="0")
  cy.get('a[mat-list-item][role="menuitem"]').first().should('have.attr', 'tabindex', '0');
  
  // Test keyboard navigation by directly invoking the component method
  cy.window().then((win) => {
    // Get the menu component instance and test keyboard navigation
    const menuComponent = win.document.querySelector('co-menu');
    if (menuComponent) {
      // Simulate ArrowDown keypress programmatically
      const firstItem = menuComponent.querySelector('a[mat-list-item][role="menuitem"]');
      if (firstItem) {
        const keydownEvent = new KeyboardEvent('keydown', { 
          key: 'ArrowDown', 
          bubbles: true, 
          cancelable: true 
        });
        firstItem.dispatchEvent(keydownEvent);
        
        // Allow time for event processing
        cy.wait(100);
        
        // Verify tabindex management after keyboard interaction
        cy.get('a[mat-list-item][role="menuitem"]').eq(1).should('have.attr', 'tabindex', '0');
        cy.get('a[mat-list-item][role="menuitem"]').first().should('have.attr', 'tabindex', '-1');
      }
    }
  });
  
  // Test Home key functionality (should set first item as focusable)
  cy.window().then((win) => {
    const menuComponent = win.document.querySelector('co-menu');
    if (menuComponent) {
      const firstItem = menuComponent.querySelector('a[mat-list-item][role="menuitem"]');
      if (firstItem) {
        const homeEvent = new KeyboardEvent('keydown', { key: 'Home', bubbles: true });
        firstItem.dispatchEvent(homeEvent);
      }
    }
  });
  cy.get('a[mat-list-item][role="menuitem"]').first().should('have.attr', 'tabindex', '0');
  
  // Test End key functionality (should set last item as focusable)  
  cy.window().then((win) => {
    const menuComponent = win.document.querySelector('co-menu');
    if (menuComponent) {
      const firstItem = menuComponent.querySelector('a[mat-list-item][role="menuitem"]');
      if (firstItem) {
        const endEvent = new KeyboardEvent('keydown', { key: 'End', bubbles: true });
        firstItem.dispatchEvent(endEvent);
      }
    }
  });
  cy.get('a[mat-list-item][role="menuitem"]').last().should('have.attr', 'tabindex', '0');
});