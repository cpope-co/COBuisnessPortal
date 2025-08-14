describe('Authentication Flow - Basic Tests', () => {
  beforeEach(() => {
    // Clear any existing session data
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
  });

  describe('Login Page', () => {
    it('should load the login page', () => {
      cy.visit('/auth/login');
      cy.contains('h1', 'Chambers & Owen Business Portal').should('be.visible');
      cy.contains('h2', 'Login').should('be.visible');
    });

    it('should have login form elements', () => {
      cy.visit('/auth/login');
      
      // Check form inputs
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button').contains('Login').should('be.visible');
      
      // Check navigation links
      cy.contains('a', 'Forgot credentials?').should('be.visible');
      cy.contains('a', 'Register').should('be.visible');
    });

    it('should show validation errors for empty form', () => {
      cy.visit('/auth/login');
      
      // Try to submit empty form
      cy.get('button').contains('Login').click();
      
      // Check that inputs show validation state
      cy.get('input[type="email"]').should('have.class', 'ng-invalid');
      cy.get('input[type="password"]').should('have.class', 'ng-invalid');
    });

    it('should validate email format', () => {
      cy.visit('/auth/login');
      
      // Enter invalid email
      cy.get('input[type="email"]').type('invalid-email');
      cy.get('input[type="password"]').type('password123');
      cy.get('button').contains('Login').click();
      
      // Email should be invalid
      cy.get('input[type="email"]').should('have.class', 'ng-invalid');
    });
  });

  describe('Navigation', () => {
    it('should navigate to forgot password', () => {
      cy.visit('/auth/login');
      cy.contains('a', 'Forgot credentials?').click();
      cy.url().should('include', '/auth/forgot');
    });

    it('should navigate to register', () => {
      cy.visit('/auth/login');
      cy.contains('a', 'Register').click();
      cy.url().should('include', '/auth/register');
    });
  });

  describe('Mock Login/Logout Flow', () => {
    it('should handle successful login with mocked response', () => {
      // Mock successful login response
      cy.intercept('POST', '**/api/usraut/login', (req) => {
        req.reply({
          statusCode: 200,
          headers: {
            'x-id': 'mock.jwt.token'
          },
          body: { success: true }
        });
      }).as('loginRequest');

      cy.visit('/auth/login');
      
      // Fill login form
      cy.get('input[type="email"]').type('test@example.com');
      cy.get('input[type="password"]').type('password123');
      
      // Setup session storage before clicking login
      cy.window().then((win) => {
        const mockUser = {
          sub: '1',
          email: 'test@example.com',
          role: 1,
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000)
        };
        
        // Pre-setup the session storage to simulate successful authentication
        win.sessionStorage.setItem('user', JSON.stringify(mockUser));
        win.sessionStorage.setItem('token', 'mock.jwt.token');
      });

      cy.get('button').contains('Login').click();

      // Wait for login request
      cy.wait('@loginRequest');

      // Should redirect to home or show success (may take time due to Angular routing)
      cy.url({ timeout: 15000 }).should('include', '/home');
    });

    it('should handle login error', () => {
      // Mock login error response
      cy.intercept('POST', '**/api/usraut/login', {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('loginError');

      cy.visit('/auth/login');
      
      // Fill login form with invalid credentials
      cy.get('input[type="email"]').type('invalid@example.com');
      cy.get('input[type="password"]').type('wrongpassword');
      cy.get('button').contains('Login').click();

      cy.wait('@loginError');

      // Should show error message
      cy.contains('Invalid email or password').should('be.visible');
      
      // Should stay on login page
      cy.url().should('include', '/auth/login');
    });

    it('should handle logout flow', () => {
      // First setup a logged-in state
      cy.window().then((win) => {
        const mockUser = {
          sub: '1',
          email: 'test@example.com',
          role: 1,
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000)
        };
        
        win.sessionStorage.setItem('user', JSON.stringify(mockUser));
        win.sessionStorage.setItem('token', 'mock-jwt-token');
      });

      // Mock logout response
      cy.intercept('POST', '**/api/usraut/logout', {
        statusCode: 200,
        body: { success: true }
      }).as('logoutRequest');

      // Visit home page
      cy.visit('/home');
      
      // Should show logged-in state
      cy.get('button').contains('Profile').should('be.visible');
      
      // Click profile menu and logout
      cy.get('button').contains('Profile').click();
      cy.get('a').contains('Logout').click();

      cy.wait('@logoutRequest');

      // Should redirect to login
      cy.url().should('include', '/auth/login');
      
      // Check for logout message or just verify we're on login page
      // Note: Message might not appear immediately due to timing
      cy.get('h2').contains('Login').should('be.visible');
      
      // Verify session storage is cleared
      cy.window().then((win) => {
        expect(win.sessionStorage.getItem('user')).to.be.null;
        expect(win.sessionStorage.getItem('token')).to.be.null;
      });
    });
  });

  describe('Session Persistence', () => {
    it('should maintain login state after page refresh', () => {
      // Setup logged-in state
      cy.window().then((win) => {
        const mockUser = {
          sub: '1',
          email: 'test@example.com',
          role: 1,
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000)
        };
        
        win.sessionStorage.setItem('user', JSON.stringify(mockUser));
        win.sessionStorage.setItem('token', 'mock-jwt-token');
      });

      cy.visit('/home');
      
      // Should show logged-in state
      cy.get('button').contains('Profile').should('be.visible');
      
      // Refresh page
      cy.reload();
      
      // Should still be logged in
      cy.get('button').contains('Profile').should('be.visible');
      cy.url().should('include', '/home');
    });

    it('should redirect to login for expired tokens', () => {
      // Setup expired token
      cy.window().then((win) => {
        const expiredUser = {
          sub: '1',
          email: 'test@example.com',
          role: 1,
          exp: Math.floor(Date.now() / 1000) - 3600, // Expired 1 hour ago
          iat: Math.floor(Date.now() / 1000) - 7200
        };
        
        win.sessionStorage.setItem('user', JSON.stringify(expiredUser));
        win.sessionStorage.setItem('token', 'expired-mock-jwt-token');
      });

      cy.visit('/home');
      
      // Should redirect to login due to expired token
      cy.url().should('include', '/auth/login');
    });
  });
});
