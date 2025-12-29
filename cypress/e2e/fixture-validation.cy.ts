/**
 * Fixture Validation Tests
 * 
 * These tests validate the structure and integrity of auth fixtures.
 * Run first to fail fast if fixtures are misconfigured or out of sync with API contracts.
 * 
 * Run manually: npm run validate:fixtures
 */

describe('Auth Fixture Validation', () => {
  describe('Login Fixtures', () => {
    it('should have valid login-success.json structure', () => {
      cy.fixture('auth/login-success.json').then((fixture) => {
        expect(fixture).to.have.property('success', true);
        expect(fixture).to.have.property('permissions');
        expect(fixture.permissions).to.be.an('array');
        
        if (fixture.permissions.length > 0) {
          expect(fixture.permissions[0]).to.have.property('resource');
          expect(fixture.permissions[0]).to.have.property('per');
        }
      });
    });

    it('should have valid login-error-invalid.json structure', () => {
      cy.fixture('auth/login-error-invalid.json').then((fixture) => {
        expect(fixture).to.have.property('success', false);
        expect(fixture).to.have.property('error');
        expect(fixture.error).to.be.a('string');
      });
    });

    it('should have valid login-error-network.json structure', () => {
      cy.fixture('auth/login-error-network.json').then((fixture) => {
        expect(fixture).to.have.property('success', false);
        expect(fixture).to.have.property('error');
      });
    });

    it('should have valid login-error-server.json structure', () => {
      cy.fixture('auth/login-error-server.json').then((fixture) => {
        expect(fixture).to.have.property('success', false);
        expect(fixture).to.have.property('error');
      });
    });
  });

  describe('Logout Fixtures', () => {
    it('should have valid logout-success.json structure', () => {
      cy.fixture('auth/logout-success.json').then((fixture) => {
        expect(fixture).to.have.property('success', true);
      });
    });
  });

  describe('Registration Fixtures', () => {
    it('should have valid register-success.json structure', () => {
      cy.fixture('auth/register-success.json').then((fixture) => {
        expect(fixture).to.have.property('success', true);
        expect(fixture).to.have.property('message');
        expect(fixture.message).to.be.a('string');
      });
    });

    it('should have valid register-error.json structure', () => {
      cy.fixture('auth/register-error.json').then((fixture) => {
        expect(fixture).to.have.property('success', false);
        expect(fixture).to.have.property('error');
      });
    });

    it('should have valid category-managers.json structure', () => {
      cy.fixture('auth/category-managers.json').then((fixture) => {
        expect(fixture).to.have.property('success', true);
        expect(fixture).to.have.property('data');
        expect(fixture.data).to.be.an('array');
        
        if (fixture.data.length > 0) {
          expect(fixture.data[0]).to.have.property('id');
          expect(fixture.data[0]).to.have.property('name');
          expect(fixture.data[0]).to.have.property('email');
        }
      });
    });
  });

  describe('Mock Users Fixture', () => {
    it('should have all 6 user roles defined', () => {
      cy.fixture('auth/mock-users.json').then((users) => {
        expect(users).to.have.property('admin');
        expect(users).to.have.property('customer');
        expect(users).to.have.property('vendor');
        expect(users).to.have.property('employee');
        expect(users).to.have.property('apiUser');
        expect(users).to.have.property('employeeSales');
      });
    });

    it('should have valid JWT structure for admin user', () => {
      cy.fixture('auth/mock-users.json').then((users) => {
        const admin = users.admin;
        expect(admin).to.have.property('sub');
        expect(admin).to.have.property('email');
        expect(admin).to.have.property('role');
        expect(admin).to.have.property('exp');
        expect(admin).to.have.property('iat');
        expect(admin.role).to.equal(1);
        expect(admin.email).to.include('@');
      });
    });

    it('should have valid JWT structure for customer user', () => {
      cy.fixture('auth/mock-users.json').then((users) => {
        const customer = users.customer;
        expect(customer).to.have.property('sub');
        expect(customer).to.have.property('email');
        expect(customer).to.have.property('role');
        expect(customer).to.have.property('exp');
        expect(customer).to.have.property('iat');
        expect(customer.role).to.equal(2);
      });
    });

    it('should have valid JWT structure for vendor user', () => {
      cy.fixture('auth/mock-users.json').then((users) => {
        const vendor = users.vendor;
        expect(vendor).to.have.property('sub');
        expect(vendor).to.have.property('email');
        expect(vendor).to.have.property('role');
        expect(vendor).to.have.property('exp');
        expect(vendor).to.have.property('iat');
        expect(vendor.role).to.equal(3);
      });
    });

    it('should have valid JWT structure for employee user', () => {
      cy.fixture('auth/mock-users.json').then((users) => {
        const employee = users.employee;
        expect(employee).to.have.property('sub');
        expect(employee).to.have.property('email');
        expect(employee).to.have.property('role');
        expect(employee).to.have.property('exp');
        expect(employee).to.have.property('iat');
        expect(employee.role).to.equal(4);
      });
    });

    it('should have valid JWT structure for apiUser', () => {
      cy.fixture('auth/mock-users.json').then((users) => {
        const apiUser = users.apiUser;
        expect(apiUser).to.have.property('sub');
        expect(apiUser).to.have.property('email');
        expect(apiUser).to.have.property('role');
        expect(apiUser).to.have.property('exp');
        expect(apiUser).to.have.property('iat');
        expect(apiUser.role).to.equal(5);
      });
    });

    it('should have valid JWT structure for employeeSales user', () => {
      cy.fixture('auth/mock-users.json').then((users) => {
        const employeeSales = users.employeeSales;
        expect(employeeSales).to.have.property('sub');
        expect(employeeSales).to.have.property('email');
        expect(employeeSales).to.have.property('role');
        expect(employeeSales).to.have.property('exp');
        expect(employeeSales).to.have.property('iat');
        expect(employeeSales.role).to.equal(6);
      });
    });

    it('should have unique emails for all users', () => {
      cy.fixture('auth/mock-users.json').then((users) => {
        const emails = [
          users.admin.email,
          users.customer.email,
          users.vendor.email,
          users.employee.email,
          users.apiUser.email,
          users.employeeSales.email
        ];
        const uniqueEmails = new Set(emails);
        expect(uniqueEmails.size).to.equal(emails.length);
      });
    });

    it('should have unique subject IDs for all users', () => {
      cy.fixture('auth/mock-users.json').then((users) => {
        const subs = [
          users.admin.sub,
          users.customer.sub,
          users.vendor.sub,
          users.employee.sub,
          users.apiUser.sub,
          users.employeeSales.sub
        ];
        const uniqueSubs = new Set(subs);
        expect(uniqueSubs.size).to.equal(subs.length);
      });
    });
  });

  describe('Fixture JSON Validity', () => {
    const fixtureFiles = [
      'auth/login-success.json',
      'auth/login-error-invalid.json',
      'auth/login-error-network.json',
      'auth/login-error-server.json',
      'auth/logout-success.json',
      'auth/register-success.json',
      'auth/register-error.json',
      'auth/category-managers.json',
      'auth/mock-users.json'
    ];

    fixtureFiles.forEach((fixturePath) => {
      it(`should be valid JSON: ${fixturePath}`, () => {
        cy.fixture(fixturePath).should('exist');
      });
    });
  });
});
