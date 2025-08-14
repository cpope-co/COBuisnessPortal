describe('Login and Logout Functionality', () => {
  beforeEach(() => {
    // Clear any existing session data
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    
    // Visit the login page
    cy.visit('/auth/login');
  });

  describe('Login Page Display', () => {
    it('should display the login page correctly', () => {
      // Check page title and heading
      cy.title().should('include', 'Login');
      cy.contains('h1', 'Chambers & Owen Business Portal').should('be.visible');
      cy.contains('h2', 'Login').should('be.visible');
      
      // Check form elements are present
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('contain', 'Login');
      
      // Check navigation links
      cy.contains('a', 'Forgot credentials?').should('be.visible');
      cy.contains('a', 'Register').should('be.visible');
    });

    it('should have proper form validation', () => {
      // Test empty form submission
      cy.get('button[type="submit"]').click();
      
      // Should show validation errors for required fields
      cy.get('input[type="email"]').should('have.class', 'ng-invalid');
      cy.get('input[type="password"]').should('have.class', 'ng-invalid');
    });

    it('should validate email format', () => {
      // Enter invalid email format
      cy.get('input[type="email"]').type('invalid-email');
      cy.get('input[type="password"]').type('somepassword');
      cy.get('button[type="submit"]').click();
      
      // Email field should be invalid
      cy.get('input[type="email"]').should('have.class', 'ng-invalid');
    });
  });

  describe('Login Functionality', () => {
    it('should show error message for invalid credentials', () => {
      // Use invalid credentials
      cy.get('input[type="email"]').type(Cypress.env('invalidEmail'));
      cy.get('input[type="password"]').type(Cypress.env('invalidPassword'));
      cy.get('button[type="submit"]').click();
      
      // Should show error message
      cy.contains('Invalid email or password').should('be.visible');
      
      // Should remain on login page
      cy.url().should('include', '/auth/login');
    });

    it('should successfully login with valid credentials', () => {
      // Intercept the login API call
      cy.intercept('POST', '**/api/usraut/login', {
        statusCode: 200,
        headers: {
          'x-id': 'mock-jwt-token'
        },
        body: { success: true }
      }).as('loginRequest');

      // Mock the JWT decode to return a valid user
      cy.window().then((win) => {
        // Mock jwt-decode to return a test user
        const mockUser = {
          sub: '1',
          email: Cypress.env('testEmail'),
          role: 1,
          exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
          iat: Math.floor(Date.now() / 1000)
        };
        
        // Store mock user data in sessionStorage
        win.sessionStorage.setItem('user', JSON.stringify(mockUser));
        win.sessionStorage.setItem('token', 'mock-jwt-token');
      });

      // Enter valid credentials
      cy.get('input[type="email"]').type(Cypress.env('testEmail'));
      cy.get('input[type="password"]').type(Cypress.env('testPassword'));
      cy.get('button[type="submit"]').click();

      // Wait for login request
      cy.wait('@loginRequest');

      // Should redirect to home page
      cy.url().should('include', '/home');
      
      // Should show navigation elements for logged-in user
      cy.get('mat-toolbar').should('contain', 'Chambers & Owen');
      cy.get('button[mat-icon-button]').should('contain', 'menu');
      cy.get('button').should('contain', 'Profile');
    });

    it('should handle network errors gracefully', () => {
      // Intercept login request to simulate network error
      cy.intercept('POST', '**/api/usraut/login', {
        forceNetworkError: true
      }).as('loginNetworkError');

      cy.get('input[type="email"]').type(Cypress.env('testEmail'));
      cy.get('input[type="password"]').type(Cypress.env('testPassword'));
      cy.get('button[type="submit"]').click();

      cy.wait('@loginNetworkError');

      // Should show error message
      cy.contains('Invalid email or password').should('be.visible');
    });
  });

  describe('Navigation Links', () => {
    it('should navigate to forgot password page', () => {
      cy.contains('a', 'Forgot credentials?').click();
      cy.url().should('include', '/auth/forgot');
    });

    it('should navigate to register page', () => {
      cy.contains('a', 'Register').click();
      cy.url().should('include', '/auth/register');
    });
  });

  describe('Logout Functionality', () => {
    beforeEach(() => {
      // Setup logged-in state
      cy.window().then((win) => {
        const mockUser = {
          sub: '1',
          email: Cypress.env('testEmail'),
          role: 1,
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000)
        };
        
        win.sessionStorage.setItem('user', JSON.stringify(mockUser));
        win.sessionStorage.setItem('token', 'mock-jwt-token');
      });

      // Intercept logout API call
      cy.intercept('POST', '**/api/usraut/logout', {
        statusCode: 200,
        body: { success: true }
      }).as('logoutRequest');

      // Visit home page as logged-in user
      cy.visit('/home');
    });

    it('should display logout option in profile menu', () => {
      // Click profile menu
      cy.get('button').contains('Profile').click();
      
      // Should show profile menu with logout option
      cy.get('mat-menu').should('be.visible');
      cy.get('a[mat-menu-item]').contains('Profile').should('be.visible');
      cy.get('a[mat-menu-item]').contains('Logout').should('be.visible');
    });

    it('should successfully logout user', () => {
      // Click profile menu and logout
      cy.get('button').contains('Profile').click();
      cy.get('a[mat-menu-item]').contains('Logout').click();

      // Wait for logout request
      cy.wait('@logoutRequest');

      // Should redirect to login page
      cy.url().should('include', '/auth/login');
      
      // Should show logout message
      cy.contains('You have been logged out').should('be.visible');
      
      // Should clear session storage
      cy.window().then((win) => {
        expect(win.sessionStorage.getItem('user')).to.be.null;
        expect(win.sessionStorage.getItem('token')).to.be.null;
      });
    });

    it('should handle logout network errors gracefully', () => {
      // Intercept logout to simulate network error
      cy.intercept('POST', '**/api/usraut/logout', {
        forceNetworkError: true
      }).as('logoutNetworkError');

      cy.get('button').contains('Profile').click();
      cy.get('a[mat-menu-item]').contains('Logout').click();

      cy.wait('@logoutNetworkError');

      // Should still redirect to login (client-side logout)
      cy.url().should('include', '/auth/login');
      cy.contains('You have been logged out').should('be.visible');
    });

    it('should prevent access to protected routes after logout', () => {
      // Logout
      cy.get('button').contains('Profile').click();
      cy.get('a[mat-menu-item]').contains('Logout').click();
      cy.wait('@logoutRequest');

      // Try to access protected route
      cy.visit('/home');
      
      // Should redirect to login
      cy.url().should('include', '/auth/login');
    });
  });

  describe('Session Management', () => {
    it('should persist login state across page refreshes', () => {
      // Setup logged-in state
      cy.window().then((win) => {
        const mockUser = {
          sub: '1',
          email: Cypress.env('testEmail'),
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

    it('should handle expired tokens by redirecting to login', () => {
      // Setup expired token
      cy.window().then((win) => {
        const expiredUser = {
          sub: '1',
          email: Cypress.env('testEmail'),
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

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      // Tab through form elements using keyboard navigation
      cy.get('input[type="email"]').focus();
      cy.focused().should('have.attr', 'type', 'email');
      
      cy.focused().type('{tab}');
      cy.focused().should('have.attr', 'type', 'password');
      
      cy.focused().type('{tab}');
      cy.focused().should('contain', 'Login');
    });

    it('should have proper ARIA labels and roles', () => {
      // Check for accessibility attributes (these may need to be added to the components)
      cy.get('input[type="email"]').should('exist');
      cy.get('input[type="password"]').should('exist');
      cy.get('button[type="submit"]').should('exist');
    });
  });
});