import { mockLoginSuccess, mockLoginError, mockLogout, setupMockSession, UserRole } from '../support/auth-mocks';

describe('Authentication E2E Tests - Production Ready', () => {
  beforeEach(() => {
    // Clear any existing session data
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

  describe('Login Page Functionality', () => {
    it('should display the login page with all required elements', () => {
      cy.visit('/auth/login');
      
      // Verify page title and headings
      cy.title().should('include', 'Login');
      cy.contains('h1', 'Chambers & Owen Business Portal').should('be.visible');
      cy.contains('h2', 'Login').should('be.visible');
      
      // Verify form elements are present and visible
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button').contains('Login').should('be.visible');
      
      // Verify navigation links
      cy.contains('a', 'Forgot credentials?').should('be.visible');
      cy.contains('a', 'Register').should('be.visible');
    });

    it('should enforce form validation', () => {
      cy.visit('/auth/login');
      
      // Try to submit empty form
      cy.get('button').contains('Login').click();
      
      // Check validation states
      cy.get('input[type="email"]').should('have.class', 'ng-invalid');
      cy.get('input[type="password"]').should('have.class', 'ng-invalid');
    });

    it('should validate email format', () => {
      cy.visit('/auth/login');
      
      // Enter invalid email format
      cy.get('input[type="email"]').type('invalid-email-format');
      cy.get('input[type="password"]').type('somepassword');
      cy.get('button').contains('Login').click();
      
      // Email field should show validation error
      cy.get('input[type="email"]').should('have.class', 'ng-invalid');
    });

    it('should handle login errors gracefully', () => {
      // Mock failed login response
      mockLoginError('invalid');

      cy.visit('/auth/login');
      
      // Fill form with invalid credentials
      cy.get('input[type="email"]').type('invalid@example.com');
      cy.get('input[type="password"]').type('wrongpassword');
      cy.get('button').contains('Login').click();

      cy.wait('@loginRequest');

      // Should show error message and stay on login page
      cy.contains('Invalid email or password').should('be.visible');
      cy.url().should('include', '/auth/login');
    });

    it('should handle network errors during login', () => {
      // Mock network error
      mockLoginError('network');

      cy.visit('/auth/login');
      
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('password123');
      cy.get('button').contains('Login').click();

      cy.wait('@loginRequest');

      // Should show error message
      cy.contains('Invalid email or password').should('be.visible');
    });
  });

  describe('Navigation Flow', () => {
    it('should navigate to forgot password page', () => {
      cy.visit('/auth/login');
      cy.contains('a', 'Forgot credentials?').click();
      cy.url().should('include', '/auth/forgot');
    });

    it('should navigate to register page', () => {
      cy.visit('/auth/login');
      cy.contains('a', 'Register').click();
      cy.url().should('include', '/auth/register');
    });

    it('should prevent access to protected routes when not logged in', () => {
      cy.visit('/home');
      // Should redirect to login
      cy.url().should('include', '/auth/login');
    });
  });

  describe('Session Management', () => {
    it('should maintain login state across page refreshes', () => {
      // Setup logged-in state
      setupMockSession(UserRole.Admin);

      cy.visit('/home');
      
      // Should show logged-in state
      cy.get('button').contains('Profile').should('be.visible');
      
      // Refresh page
      cy.reload();
      
      // Should still be logged in
      cy.get('button').contains('Profile').should('be.visible');
      cy.url().should('include', '/home');
    });

    it('should handle expired tokens by redirecting to login', () => {
      // Setup expired token
      setupMockSession(UserRole.Admin, true);

      cy.visit('/home');
      
      // Should redirect to login due to expired token
      cy.url().should('include', '/auth/login');
    });
  });

  describe('Logout Functionality', () => {
    beforeEach(() => {
      // Setup logged-in state for logout tests
      setupMockSession(UserRole.Admin);
    });

    it('should show profile menu with logout option when logged in', () => {
      cy.visit('/home');
      
      // Should show logged-in state
      cy.get('button').contains('Profile').should('be.visible');
      
      // Click profile menu
      cy.get('button').contains('Profile').click();
      
      // Should show profile and logout options
      cy.get('a[mat-menu-item]').contains('Profile').should('be.visible');
      cy.get('a[mat-menu-item]').contains('Logout').should('be.visible');
    });

    it('should successfully logout and clear session', () => {
      // Mock logout response
      mockLogout();

      cy.visit('/home');
      
      // Click profile menu and logout
      cy.get('button').contains('Profile').click();
      cy.get('a[mat-menu-item]').contains('Logout').click();

      cy.wait('@logoutRequest');

      // Should redirect to login page
      cy.url().should('include', '/auth/login');
      
      // Verify session storage is cleared
      cy.window().then((win) => {
        expect(win.sessionStorage.getItem('user')).to.be.null;
        expect(win.sessionStorage.getItem('token')).to.be.null;
      });
    });

    it('should handle logout network errors gracefully', () => {
      // Mock logout network error - override any previous mock
      cy.intercept('POST', '**/api/usraut/logout', {
        forceNetworkError: true
      }).as('logoutNetworkError');

      cy.visit('/home');
      
      cy.get('button').contains('Profile').click();
      cy.get('a[mat-menu-item]').contains('Logout').click();

      cy.wait('@logoutNetworkError');

      // Should still redirect to login (client-side logout)
      cy.url().should('include', '/auth/login');
      
      // Session should still be cleared
      cy.window().then((win) => {
        expect(win.sessionStorage.getItem('user')).to.be.null;
        expect(win.sessionStorage.getItem('token')).to.be.null;
      });
    });
  });

  describe('Security and Route Guards', () => {
    it('should redirect unauthenticated users from protected routes', () => {
      const protectedRoutes = ['/home', '/profile'];
      
      protectedRoutes.forEach(route => {
        cy.visit(route);
        cy.url().should('include', '/auth/login');
      });
    });

    it('should maintain authentication state across different pages', () => {
      // Setup logged-in state
      setupMockSession(UserRole.Admin);

      // Visit different pages and verify authentication state
      cy.visit('/home');
      cy.get('button').contains('Profile').should('be.visible');

      cy.visit('/profile');
      cy.get('button').contains('Profile').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible form elements', () => {
      cy.visit('/auth/login');
      
      // Check that form elements exist and are accessible
      cy.get('input[type="email"]').should('exist');
      cy.get('input[type="password"]').should('exist');
      cy.get('button[type="submit"]').should('exist');
    });
  });
});
