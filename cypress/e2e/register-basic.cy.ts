describe('Registration Component - Basic Tests', () => {
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
      cy.get('mat-radio-button').should('have.length', 2);
      cy.get('mat-radio-button').contains('Supplier').should('be.visible');
      cy.get('mat-radio-button').contains('Retailer').should('be.visible');
    });
  });

  describe('Registration Type Selection', () => {
    it('should show supplier registration fields when supplier is selected', () => {
  // Select supplier - click the label/input to ensure the form control updates
  cy.get('mat-radio-button').contains('Supplier').click({ force: true });
  // small delay to allow Angular to render conditional fields
  cy.wait(250);
  // Wait for form fields to appear (inputs are rendered with formControlName)
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
  // Wait for form fields to appear
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

  describe('Form Interaction', () => {
    beforeEach(() => {
    cy.get('mat-radio-button').contains('Supplier').click({ force: true });
    cy.get('input[formcontrolname="usemail"]', { timeout: 10000 }).should('exist');
      });

    it('should be able to type in input fields', () => {
      const testData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        accountName: 'Test Account'
      };

  cy.get('input[formcontrolname="usemail"]').type(testData.email);
  cy.get('input[formcontrolname="usemail"]').should('have.value', testData.email);

  cy.get('input[formcontrolname="verifyEmail"]').type(testData.email);
  cy.get('input[formcontrolname="verifyEmail"]').should('have.value', testData.email);

  cy.get('input[formcontrolname="usfname"]').type(testData.firstName);
  cy.get('input[formcontrolname="usfname"]').should('have.value', testData.firstName);

  cy.get('input[formcontrolname="uslname"]').type(testData.lastName);
  cy.get('input[formcontrolname="uslname"]').should('have.value', testData.lastName);

  cy.get('input[formcontrolname="wacctname"]').type(testData.accountName);
  cy.get('input[formcontrolname="wacctname"]').should('have.value', testData.accountName);
    });

    it('should apply phone number mask', () => {
  cy.get('input[formcontrolname="wphone"]')
        .type('1234567890')
        .should('have.value', '(123) 456-7890');
    });

    it('should be able to select category manager', () => {
  cy.get('mat-select[formcontrolname="wcatmgr"]').click();
  cy.get('mat-option').should('have.length.at.least', 1);
  cy.get('mat-option').first().click();
    });
  });

  describe('Navigation', () => {
    it('should navigate to login page when cancel button is clicked', () => {
      cy.get('button').contains('Cancel').click();
      cy.url().should('include', '/auth/login');
    });
  });

  describe('Form Validation Basic', () => {
    beforeEach(() => {
      cy.get('mat-radio-button').contains('Supplier').click();
      cy.wait(500);
    });

    it('should show validation errors when submitting empty form', () => {
      cy.get('button').contains('Submit').click();
      
      // Should show error message
      cy.get('body').should('contain.text', 'Please correct the errors on the form');
    });

    it('should validate required fields', () => {
      cy.get('input[formcontrolname="usfname"]').focus().blur();
      cy.get('input[formcontrolname="usfname"]').parent().find('mat-error')
        .should('contain.text', 'Please enter your first name');
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
      cy.wait(500);

      // Fill form with valid data
      const testData = {
        email: 'supplier@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '1234567890',
        accountName: 'Test Supplier Account'
      };

  cy.get('input[formcontrolname="usemail"]').type(testData.email);
  cy.get('input[formcontrolname="verifyEmail"]').type(testData.email);
  cy.get('input[formcontrolname="usfname"]').type(testData.firstName);
  cy.get('input[formcontrolname="uslname"]').type(testData.lastName);
  cy.get('input[formcontrolname="wphone"]').type(testData.phone);
  cy.get('input[formcontrolname="wacctname"]').type(testData.accountName);
      
  // Select category manager
  cy.get('mat-select[formcontrolname="wcatmgr"]').click();
  cy.get('mat-option').first().click();

      cy.get('button').contains('Submit').click();

      cy.wait('@registerSupplier');
      
      cy.get('body').should('contain.text', 'Registration successful. Please check your email for further instructions');
    });
  });
});
