/**
 * Centralized Authentication Mock Service for Cypress E2E Tests
 * 
 * This module provides standardized mock functions for authentication flows,
 * eliminating the need for inline cy.intercept calls throughout test files.
 * 
 * IMPORTANT: When API contracts change (e.g., /api/usraut/* endpoints),
 * fixture files in cypress/fixtures/auth/ MUST be updated in the same PR.
 * Run `npm run validate:fixtures` before committing to ensure fixture integrity.
 * 
 * @module auth-mocks
 */

/**
 * User roles in the application
 */
export enum UserRole {
  Admin = 1,
  Customer = 2,
  Vendor = 3,
  Employee = 4,
  ApiUser = 5,
  EmployeeSales = 6
}

/**
 * Error types for authentication failures
 */
export type ErrorType = 'invalid' | 'network' | 'server';

/**
 * Mock user structure matching JWT payload
 */
export interface MockUser {
  sub: string;
  email: string;
  role: UserRole;
  exp: number;
  iat: number;
}

/**
 * Mock login response structure
 */
export interface MockLoginResponse {
  success: boolean;
  permissions?: Array<{ resource: string; per: number }>;
  error?: string;
}

/**
 * Permission sets by role for realistic testing
 */
const ROLE_PERMISSIONS: Record<UserRole, Array<{ resource: string; per: number }>> = {
  [UserRole.Admin]: [
    { resource: 'admin', per: 3 },
    { resource: 'config', per: 3 }
  ],
  [UserRole.Customer]: [
    { resource: 'orders', per: 3 },
    { resource: 'invoices', per: 1 }
  ],
  [UserRole.Vendor]: [
    { resource: 'products', per: 3 },
    { resource: 'orders', per: 1 }
  ],
  [UserRole.Employee]: [
    { resource: 'basic', per: 1 }
  ],
  [UserRole.ApiUser]: [
    { resource: 'api', per: 3 }
  ],
  [UserRole.EmployeeSales]: [
    { resource: 'sales', per: 3 },
    { resource: 'orders', per: 1 }
  ]
};

/**
 * Get a mock user object for the specified role
 * 
 * @param role - The user role to generate
 * @param expired - Whether the token should be expired (default: false)
 * @returns Mock user object with JWT structure
 * 
 * @example
 * const adminUser = getMockUser(UserRole.Admin);
 * const expiredUser = getMockUser(UserRole.Customer, true);
 */
export function getMockUser(role: UserRole, expired: boolean = false): MockUser {
  const users = {
    [UserRole.Admin]: { sub: '1', email: 'testuser@chambers-owen.com' },
    [UserRole.Customer]: { sub: '2', email: 'cstore@draxlers.com' },
    [UserRole.Vendor]: { sub: '3', email: 'jvigna@swisher.com' },
    [UserRole.Employee]: { sub: '4', email: 'bart@bart.com' },
    [UserRole.ApiUser]: { sub: '5', email: 'apiuser@example.com' },
    [UserRole.EmployeeSales]: { sub: '6', email: 'ryan@blackbuffalo.com' }
  };

  const userBase = users[role];
  const now = Math.floor(Date.now() / 1000);
  
  return {
    ...userBase,
    role,
    exp: expired ? now - 3600 : now + 3600,
    iat: expired ? now - 7200 : now
  };
}

/**
 * Generate a mock JWT token for the specified user
 * 
 * @param user - The mock user object
 * @returns Base64-encoded mock JWT token
 */
function generateMockToken(user: MockUser): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify(user));
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
}

/**
 * Mock successful login response
 * 
 * Intercepts POST /api/usraut/login and returns success response with JWT token
 * and role-based permissions.
 * 
 * @param role - The user role to authenticate as (default: Admin)
 * @param expired - Whether the token should be expired (default: false)
 * 
 * @example
 * mockLoginSuccess(UserRole.Customer);
 * cy.visit('/login');
 * // Login will succeed with customer role
 * 
 * @example
 * mockLoginSuccess(UserRole.Admin, true);
 * // Login succeeds but token is already expired
 */
export function mockLoginSuccess(role: UserRole = UserRole.Admin, expired: boolean = false): void {
  const user = getMockUser(role, expired);
  const token = generateMockToken(user);
  const permissions = ROLE_PERMISSIONS[role];

  cy.intercept('POST', '**/api/usraut/login', {
    statusCode: 200,
    headers: {
      'x-id': token
    },
    body: {
      success: true,
      permissions
    }
  }).as('loginRequest');
}

/**
 * Mock login error response
 * 
 * Intercepts POST /api/usraut/login and returns error response based on error type.
 * 
 * @param errorType - Type of error: 'invalid' (401), 'network' (network failure), 'server' (500)
 * 
 * @example
 * mockLoginError('invalid');
 * cy.visit('/login');
 * cy.get('input[type="email"]').type('wrong@example.com');
 * cy.get('input[type="password"]').type('wrongpass');
 * cy.get('button[type="submit"]').click();
 * // Will show invalid credentials error
 * 
 * @example
 * mockLoginError('network');
 * // Simulates network failure
 */
export function mockLoginError(errorType: ErrorType): void {
  if (errorType === 'network') {
    cy.intercept('POST', '**/api/usraut/login', { forceNetworkError: true }).as('loginRequest');
  } else if (errorType === 'invalid') {
    cy.intercept('POST', '**/api/usraut/login', {
      statusCode: 401,
      body: {
        success: false,
        error: 'Invalid email or password'
      }
    }).as('loginRequest');
  } else if (errorType === 'server') {
    cy.intercept('POST', '**/api/usraut/login', {
      statusCode: 500,
      body: {
        success: false,
        error: 'Internal server error'
      }
    }).as('loginRequest');
  }
}

/**
 * Mock logout response
 * 
 * Intercepts POST /api/usraut/logout and returns success response.
 * 
 * @example
 * mockLogout();
 * cy.get('[data-testid="logout-button"]').click();
 * cy.wait('@logoutRequest');
 */
export function mockLogout(): void {
  cy.intercept('POST', '**/api/usraut/logout', {
    statusCode: 200,
    body: {
      success: true
    }
  }).as('logoutRequest');
}

/**
 * Mock user registration response
 * 
 * Intercepts POST /api/usraut/register and returns success or error response.
 * 
 * @param success - Whether registration should succeed (default: true)
 * @param errorType - Type of error if success is false
 * 
 * @example
 * mockRegister(true);
 * // Registration will succeed
 * 
 * @example
 * mockRegister(false, 'invalid');
 * // Registration will fail with "Email already in use" error
 */
export function mockRegister(success: boolean = true, errorType?: ErrorType): void {
  if (success) {
    cy.intercept('POST', '**/api/usraut/register', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.'
      }
    }).as('registerRequest');
  } else {
    const statusCode = errorType === 'server' ? 500 : 400;
    cy.intercept('POST', '**/api/usraut/register', {
      statusCode,
      body: {
        success: false,
        error: errorType === 'server' ? 'Internal server error' : 'Email already in use'
      }
    }).as('registerRequest');
  }
}

/**
 * Mock category managers endpoint for registration
 * 
 * Intercepts GET /api/usraut/category-managers and returns mock manager list.
 * 
 * @example
 * mockCategoryManagers();
 * cy.visit('/register');
 * cy.get('select[name="categoryManager"]').should('have.length.gt', 0);
 */
export function mockCategoryManagers(): void {
  cy.intercept('GET', '**/api/usraut/category-managers', {
    statusCode: 200,
    body: {
      success: true,
      data: [
        { id: 1, name: 'John Manager', email: 'john@example.com' },
        { id: 2, name: 'Jane Supervisor', email: 'jane@example.com' }
      ]
    }
  }).as('categoryManagersRequest');
}

/**
 * Set up a mock authenticated session without UI interaction
 * 
 * Directly manipulates sessionStorage to create an authenticated state.
 * Use this to bypass login UI and start tests from an authenticated state.
 * 
 * @param role - The user role to authenticate as (default: Admin)
 * @param expired - Whether the token should be expired (default: false)
 * 
 * @example
 * setupMockSession(UserRole.Customer);
 * cy.visit('/dashboard');
 * // User is already logged in as customer
 * 
 * @example
 * setupMockSession(UserRole.Admin, true);
 * cy.visit('/dashboard');
 * // User is logged in but token is expired (for testing refresh logic)
 */
export function setupMockSession(role: UserRole = UserRole.Admin, expired: boolean = false): void {
  const user = getMockUser(role, expired);
  const token = generateMockToken(user);

  cy.window().then((win) => {
    win.sessionStorage.setItem('user', JSON.stringify(user));
    win.sessionStorage.setItem('token', token);
  });
}

/**
 * Mock reCAPTCHA for registration tests
 * 
 * Stubs the window.grecaptcha object to avoid requiring actual Google reCAPTCHA validation.
 * 
 * @param token - The mock reCAPTCHA token to return (default: 'mock-recaptcha-token')
 * 
 * @example
 * mockRecaptcha();
 * cy.visit('/register');
 * // reCAPTCHA will automatically resolve without user interaction
 */
export function mockRecaptcha(token: string = 'mock-recaptcha-token'): void {
  cy.window().then((win: any) => {
    win.grecaptcha = {
      execute: cy.stub().resolves(token),
      ready: cy.stub().callsFake((callback: () => void) => callback())
    };
  });
}

/**
 * Clear all authentication state
 * 
 * Removes all auth-related data from sessionStorage.
 * 
 * @example
 * clearAuthSession();
 * cy.visit('/dashboard');
 * // Should redirect to login since not authenticated
 */
export function clearAuthSession(): void {
  cy.window().then((win) => {
    win.sessionStorage.removeItem('user');
    win.sessionStorage.removeItem('token');
  });
}
