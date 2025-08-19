describe('Registration Component E2E Tests', () => {
  beforeEach(() => {
    // Mock category managers API for all tests (service calls GET .../register)
    cy.intercept('GET', '**/register', {
      statusCode: 200,
      body: [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' },
        { id: 3, name: 'Bob Johnson' }
      ]
    }).as('loadCategoryManagers');

    // Ensure no cached data prevents the category-manager request from firing
    cy.clearLocalStorage();
    cy.clearCookies();

    // Pre-flight the route to detect bad proxy/api routing that may return JSON
    cy.request({ url: '/auth/register', failOnStatusCode: false }).then((res) => {
      const rawCt = res.headers['content-type'] || '';
      const ct = Array.isArray(rawCt) ? rawCt.join(';') : rawCt;
      if (ct.toLowerCase().includes('application/json')) {
        throw new Error('Preflight request returned application/json for /auth/register - server/proxy may be misconfigured');
      }
      // If preflight looks good, visit SPA route
      cy.visit('/auth/register');

      // Only wait for the GET request if the app does not already have cached data
      cy.window().then((win: any) => {
        if (!win.localStorage.getItem('wcatmgr')) {
          cy.wait('@loadCategoryManagers');
        }
      });

      // Wait for form to load
      cy.get('mat-card', { timeout: 10000 }).should('be.visible');
      cy.get('h2').should('contain.text', 'Register');
    });
  });

  describe('Page Structure', () => {
    it('should display the registration form with correct title and content', () => {
      cy.get('mat-card-title h1').should('contain.text', 'Chambers & Owen Business Portal');
      cy.get('mat-card-subtitle h2').should('contain.text', 'Register');
      
      // Check registration instructions
      cy.get('mat-card-content p')
        .should('contain.text', 'You must be a current supplier or retailer')
        .and('contain.text', 'This process may take 1 to 2 business days');
      
      // Check form exists
      cy.get('form').should('exist');
      
      // Check buttons
      cy.get('button').contains('Cancel').should('be.visible');
      cy.get('button').contains('Submit').should('be.visible');
    });

    it('should have registration type radio buttons', () => {
      cy.get('co-radio').should('be.visible');
      cy.get('h3').should('contain.text', 'Choose account type');
    });
  });

  describe('Registration Type Selection', () => {
    it('should show supplier registration fields when supplier is selected', () => {
  // Select supplier
  cy.get('mat-radio-button').contains('Supplier').click({ force: true });
  // small delay to allow Angular to render conditional fields
  cy.wait(250);
  // Should show common fields
  cy.get('input[formcontrolname="usemail"]', { timeout: 10000 }).should('be.visible');
      cy.get('input[formcontrolname="verifyEmail"]').should('be.visible');
      cy.get('input[formcontrolname="usfname"]').should('be.visible');
      cy.get('input[formcontrolname="uslname"]').should('be.visible');
      cy.get('input[formcontrolname="wphone"]').should('be.visible');
      cy.get('input[formcontrolname="wacctname"]').should('be.visible');
      
      // Should show category manager dropdown (supplier specific)
      cy.get('mat-select[formcontrolname="wcatmgr"]').should('be.visible');
      
      // Should NOT show account number field (retailer specific)
      cy.get('input[formcontrolname="usabnum"]').should('not.exist');
    });

    it('should show retailer registration fields when retailer is selected', () => {
  // Select retailer
  cy.get('mat-radio-button').contains('Retailer').click({ force: true });
  cy.wait(250);
  // Should show common fields
  cy.get('input[formcontrolname="usemail"]', { timeout: 10000 }).should('be.visible');
      cy.get('input[formcontrolname="verifyEmail"]').should('be.visible');
      cy.get('input[formcontrolname="usfname"]').should('be.visible');
      cy.get('input[formcontrolname="uslname"]').should('be.visible');
      cy.get('input[formcontrolname="wphone"]').should('be.visible');
      cy.get('input[formcontrolname="wacctname"]').should('be.visible');
      
      // Should show account number field (retailer specific)
      cy.get('input[formcontrolname="usabnum"]').should('be.visible');
      
      // Should NOT show category manager dropdown (supplier specific)
      cy.get('mat-select[formcontrolname="wcatmgr"]').should('not.exist');
    });

    it('should hide form fields when no registration type is selected', () => {
  // Initially no fields should be visible except the radio buttons
  cy.get('input[formcontrolname="usemail"]').should('not.exist');
  cy.get('input[formcontrolname="verifyEmail"]').should('not.exist');
  cy.get('input[formcontrolname="usfname"]').should('not.exist');
    });
  });

  describe('Form Validation - Supplier Registration', () => {
    beforeEach(() => {
      cy.get('mat-radio-button').contains('Supplier').click({ force: true });
  cy.get('input[formcontrolname="usemail"]', { timeout: 10000 }).should('exist');
    });

    it('should show validation errors when submitting empty form', () => {
      cy.get('button').contains('Submit').click();
      
      // Should show error message
      cy.get('.alert-danger, .mat-snack-bar-container')
        .should('contain.text', 'Please correct the errors on the form');
      
      // Form fields should be marked as touched and show errors
  cy.get('input[formcontrolname="usemail"]').should('have.class', 'ng-invalid');
  cy.get('input[formcontrolname="verifyEmail"]').should('have.class', 'ng-invalid');
  cy.get('input[formcontrolname="usfname"]').should('have.class', 'ng-invalid');
  cy.get('input[formcontrolname="uslname"]').should('have.class', 'ng-invalid');
    });

    it('should validate email format', () => {
      cy.get('input[formcontrolname="usemail"]').type('invalid-email');
      cy.get('input[formcontrolname="usemail"]').blur();
      
      cy.get('input[formcontrolname="usemail"]')
        .should('have.class', 'ng-invalid')
        .parent()
        .find('mat-error')
        .should('contain.text', 'Please enter a valid email address');
    });

    it('should validate email matching', () => {
      const email = 'test@example.com';
      const differentEmail = 'different@example.com';
      
  cy.get('input[formcontrolname="usemail"]').type(email);
  cy.get('input[formcontrolname="verifyEmail"]').type(differentEmail);
  cy.get('input[formcontrolname="verifyEmail"]').blur();
      
      // Should show mismatch error
      cy.get('mat-error').should('contain.text', 'Emails do not match');
    });

    it('should validate name minimum length', () => {
      cy.get('input[formcontrolname="usfname"]').type('ab');
      cy.get('input[formcontrolname="usfname"]').blur();
      
      cy.get('input[formcontrolname="usfname"]')
        .parent()
        .find('mat-error')
        .should('contain.text', 'First name must be at least 3 characters long');
    });

    it('should validate phone number format', () => {
  cy.get('input[formcontrolname="wphone"]').type('123');
  cy.get('input[formcontrolname="wphone"]').blur();
      
  cy.get('input[formcontrolname="wphone"]').should('have.class', 'ng-invalid');
    });

    it('should require category manager selection for supplier', () => {
      cy.fillSupplierForm();
      // Don't select category manager
      cy.get('button').contains('Submit').click();
      
      cy.get('mat-select[formcontrolname="wcatmgr"]')
        .should('have.class', 'ng-invalid');
    });
  });

  describe('Form Validation - Retailer Registration', () => {
    beforeEach(() => {
      cy.get('mat-radio-button').contains('Retailer').click();
    });

    it('should require account number for retailer', () => {
      cy.fillRetailerForm();
      // Clear account number
  cy.get('input[formcontrolname="usabnum"]').clear();
      cy.get('button').contains('Submit').click();
      
      cy.get('input[formcontrolname="usabnum"]').should('have.class', 'ng-invalid')
        .parent()
        .find('mat-error')
        .should('contain.text', 'Please enter your Address book number');
    });
  });

  describe('Successful Registration', () => {
    it('should successfully register a supplier account', () => {
      cy.intercept('POST', '**/register', {
        statusCode: 200,
        body: {
          success: true,
          data: {},
          validationErrors: []
        }
      }).as('registerSupplier');

      // Mock reCAPTCHA
      cy.window().then((win: any) => {
        win.grecaptcha = {
          execute: cy.stub().resolves('mock-recaptcha-token')
        };
      });

      cy.get('mat-radio-button').contains('Supplier').click();
      cy.fillSupplierForm();
      cy.get('button').contains('Submit').click();

      cy.wait('@registerSupplier');
      
      cy.get('.alert-success, .mat-snack-bar-container')
        .should('contain.text', 'Registration successful. Please check your email for further instructions');
    });

    it('should successfully register a retailer account', () => {
      cy.intercept('POST', '**/register', {
        statusCode: 200,
        body: {
          success: true,
          data: {},
          validationErrors: []
        }
      }).as('registerRetailer');

      // Mock reCAPTCHA
      cy.window().then((win: any) => {
        win.grecaptcha = {
          execute: cy.stub().resolves('mock-recaptcha-token')
        };
      });

      cy.get('mat-radio-button').contains('Retailer').click();
      cy.fillRetailerForm();
      cy.get('button').contains('Submit').click();

      cy.wait('@registerRetailer');
      
      cy.get('.alert-success, .mat-snack-bar-container')
        .should('contain.text', 'Registration successful. Please check your email for further instructions');
    });
  });

  describe('Registration Errors', () => {
    it('should handle server validation errors', () => {
      cy.intercept('POST', '**/register', {
        statusCode: 400,
        body: {
          success: false,
          validationErrors: [
            {
              field: 'usemail',
              message: 'Email address is already registered'
            },
            {
              field: 'usabnum',
              message: 'Invalid account number'
            }
          ]
        }
      }).as('registerError');

      // Mock reCAPTCHA
      cy.window().then((win: any) => {
        win.grecaptcha = {
          execute: cy.stub().resolves('mock-recaptcha-token')
        };
      });

      cy.get('mat-radio-button').contains('Retailer').click();
      cy.fillRetailerForm();
      cy.get('button').contains('Submit').click();

      cy.wait('@registerError');
      
      // Should show field-specific errors
  cy.get('input[formcontrolname="usemail"]').parent().find('mat-error')
        .should('contain.text', 'Email address is already registered');
  cy.get('input[formcontrolname="usabnum"]').parent().find('mat-error')
        .should('contain.text', 'Invalid account number');
    });

    it('should handle network errors', () => {
      cy.intercept('POST', '**/register', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('networkError');

      // Mock reCAPTCHA
      cy.window().then((win: any) => {
        win.grecaptcha = {
          execute: cy.stub().resolves('mock-recaptcha-token')
        };
      });

      cy.get('mat-radio-button').contains('Supplier').click();
      cy.fillSupplierForm();
      cy.get('button').contains('Submit').click();

      cy.wait('@networkError');
      
      // Should show generic error message
      cy.get('.alert-danger, .mat-snack-bar-container')
        .should('be.visible');
    });
  });

  describe('Navigation', () => {
    it('should navigate to login page when cancel button is clicked', () => {
      cy.get('button').contains('Cancel').click();
      cy.url().should('include', '/auth/login');
    });

    it('should be accessible from login page', () => {
      cy.visit('/auth/login');
      cy.get('a[href*="register"], button[routerlink*="register"]').click();
      cy.url().should('include', '/auth/register');
    });
  });

  describe('Form Interaction', () => {
    beforeEach(() => {
      cy.get('mat-radio-button').contains('Supplier').click();
    });

    it('should apply phone number mask correctly', () => {
      cy.get('input[formcontrolname="wphone"]')
        .type('1234567890')
        .should('have.value', '(123) 456-7890');
    });

    it('should clear form after successful registration', () => {
      cy.intercept('POST', '**/register', {
        statusCode: 200,
        body: {
          success: true,
          data: {},
          validationErrors: []
        }
      }).as('registerSuccess');

      // Mock reCAPTCHA
      cy.window().then((win: any) => {
        win.grecaptcha = {
          execute: cy.stub().resolves('mock-recaptcha-token')
        };
      });

      cy.fillSupplierForm();
      cy.get('button').contains('Submit').click();

      cy.wait('@registerSuccess');

      // Form should be reset
  cy.get('input[formcontrolname="usemail"]').should('have.value', '');
  cy.get('input[formcontrolname="usfname"]').should('have.value', '');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels and ARIA attributes', () => {
      cy.get('mat-radio-button').contains('Supplier').click();
      
      // Check that form inputs have proper labels
  cy.get('input[formcontrolname="usemail"]').parent().should('contain.text', 'Email');
  cy.get('input[formcontrolname="usfname"]').parent().should('contain.text', 'First Name');
  cy.get('input[formcontrolname="uslname"]').parent().should('contain.text', 'Last Name');
      
      // Check ARIA attributes
      cy.get('form').should('have.attr', 'role');
      cy.get('mat-radio-group').should('have.attr', 'role', 'radiogroup');
    });

    it('should support keyboard navigation', () => {
      cy.get('body').tab();
      cy.focused().should('contain.text', 'Supplier');
      
      cy.focused().tab();
      cy.focused().should('contain.text', 'Retailer');
    });

    it('should announce validation errors to screen readers', () => {
      cy.get('mat-radio-button').contains('Supplier').click();
      cy.get('input[formcontrolname="usemail"]').type('invalid-email').blur();
      
      cy.get('input[formcontrolname="usemail"]').parent().find('mat-error')
        .should('have.attr', 'aria-live')
        .and('be.visible');
    });
  });

  describe('Category Manager Integration', () => {
    it('should load and display category managers for supplier registration', () => {
      // Mock category managers API
      cy.intercept('GET', '**/wcatmgr**', {
        statusCode: 200,
        body: [
          { id: 1, name: 'John Doe' },
          { id: 2, name: 'Jane Smith' },
          { id: 3, name: 'Bob Johnson' }
        ]
      }).as('loadCategoryManagers');

      cy.get('mat-radio-button').contains('Supplier').click();

      cy.wait('@loadCategoryManagers');

  cy.get('mat-select[formcontrolname="wcatmgr"]').click();
  cy.get('mat-option').should('have.length.at.least', 3);
  cy.get('mat-option').should('contain.text', 'John Doe');
  cy.get('mat-option').should('contain.text', 'Jane Smith');
  cy.get('mat-option').should('contain.text', 'Bob Johnson');
    });

    it('should handle category manager loading errors', () => {
      cy.intercept('GET', '**/wcatmgr**', {
        statusCode: 500,
        body: { error: 'Failed to load category managers' }
      }).as('loadCategoryManagersError');

      cy.get('mat-radio-button').contains('Supplier').click();

      cy.wait('@loadCategoryManagersError');

  // Should still show the select field, but may be empty
  cy.get('mat-select[formcontrolname="wcatmgr"]').should('be.visible');
    });
  });

  describe('reCAPTCHA Integration', () => {
    it('should include reCAPTCHA token in registration request', () => {
      let requestBody = {};
      
      cy.intercept('POST', '**/register', (req) => {
        requestBody = req.body;
        req.reply({
          statusCode: 200,
          body: { success: true, data: {}, validationErrors: [] }
        });
      }).as('registerWithRecaptcha');

      // Mock reCAPTCHA
      cy.window().then((win: any) => {
        win.grecaptcha = {
          execute: cy.stub().resolves('test-recaptcha-token-123')
        };
      });

      cy.get('mat-radio-button').contains('Supplier').click();
      cy.fillSupplierForm();
      cy.get('button').contains('Submit').click();

      cy.wait('@registerWithRecaptcha').then(() => {
        expect(requestBody).to.have.property('wrecaptchatoken', 'test-recaptcha-token-123');
      });
    });
  });
});
