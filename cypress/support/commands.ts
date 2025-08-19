/// <reference types="cypress" />

// Custom commands for the COBusiness Portal e2e tests

/**
 * Custom command to login a user
 */
// @ts-ignore
Cypress.Commands.add('login', (email: string, password: string) => {
  // Clear any existing session data
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
  cy.clearAllSessionStorage();

  // Mock the login API response
  cy.intercept('POST', '**/api/usraut/login', {
    statusCode: 200,
    headers: {
      'x-id': 'mock-jwt-token'
    },
    body: { success: true }
  }).as('loginRequest');

  // Visit login page
  cy.visit('/auth/login');

  // Fill in the form
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();

  // Wait for the request and setup session storage
  cy.wait('@loginRequest').then(() => {
    cy.window().then((win) => {
      const mockUser = {
        sub: '1',
        email: email,
        role: 1,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000)
      };
      
      win.sessionStorage.setItem('user', JSON.stringify(mockUser));
      win.sessionStorage.setItem('token', 'mock-jwt-token');
    });
  });
});

/**
 * Custom command to logout a user
 */
// @ts-ignore
Cypress.Commands.add('logout', () => {
  // Mock the logout API response
  cy.intercept('POST', '**/api/usraut/logout', {
    statusCode: 200,
    body: { success: true }
  }).as('logoutRequest');

  // Click profile menu and logout
  cy.get('button').contains('Profile').click();
  cy.get('a[mat-menu-item]').contains('Logout').click();

  // Wait for logout request
  cy.wait('@logoutRequest');
});

/**
 * Custom command to setup a logged-in user session without going through the UI
 */
// @ts-ignore
Cypress.Commands.add('setupLoggedInUser', (userRole: number = 1) => {
  cy.window().then((win) => {
    const mockUser = {
      sub: '1',
      email: Cypress.env('testEmail'),
      role: userRole,
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000)
    };
    
    win.sessionStorage.setItem('user', JSON.stringify(mockUser));
    win.sessionStorage.setItem('token', 'mock-jwt-token');
  });
});

/**
 * Custom command to clear all storage
 */
// @ts-ignore
Cypress.Commands.add('clearSession', () => {
  cy.clearAllCookies();
  cy.clearAllLocalStorage();
  cy.clearAllSessionStorage();
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

  cy.get('input[formcontrolname="usemail"]', { timeout: 10000 }).should('exist').type(testData.email);
  cy.get('input[formcontrolname="verifyEmail"]', { timeout: 10000 }).should('exist').type(testData.email);
  cy.get('input[formcontrolname="usfname"]', { timeout: 10000 }).should('exist').type(testData.firstName);
  cy.get('input[formcontrolname="uslname"]', { timeout: 10000 }).should('exist').type(testData.lastName);
  cy.get('input[formcontrolname="wphone"]', { timeout: 10000 }).should('exist').type(testData.phone);
  cy.get('input[formcontrolname="wacctname"]', { timeout: 10000 }).should('exist').type(testData.accountName);
  
  // Select category manager if available (app may cache wcatmgr)
  cy.window().then((win: any) => {
    if (win.localStorage.getItem('wcatmgr')) {
      cy.get('mat-select[formcontrolname="wcatmgr"]', { timeout: 10000 }).should('exist').click({ force: true });
      cy.get('mat-option', { timeout: 10000 }).first().click({ force: true });
    }
  });
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

  cy.get('input[formcontrolname="usemail"]', { timeout: 10000 }).should('exist').type(testData.email);
  cy.get('input[formcontrolname="verifyEmail"]', { timeout: 10000 }).should('exist').type(testData.email);
  cy.get('input[formcontrolname="usfname"]', { timeout: 10000 }).should('exist').type(testData.firstName);
  cy.get('input[formcontrolname="uslname"]', { timeout: 10000 }).should('exist').type(testData.lastName);
  cy.get('input[formcontrolname="wphone"]', { timeout: 10000 }).should('exist').type(testData.phone);
  cy.get('input[formcontrolname="usabnum"]', { timeout: 10000 }).should('exist').type(testData.accountNumber);
  cy.get('input[formcontrolname="wacctname"]', { timeout: 10000 }).should('exist').type(testData.accountName);
});

/**
 * Custom command for keyboard tab navigation
 */
// @ts-ignore
Cypress.Commands.add('tab', { prevSubject: true }, (subject) => {
  return cy.wrap(subject).trigger('keydown', { key: 'Tab' });
});