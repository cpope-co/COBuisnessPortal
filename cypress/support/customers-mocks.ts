/**
 * Centralized Customer Data Mock Service for Cypress E2E Tests
 * 
 * This module provides standardized mock functions for customer CRUD operations,
 * eliminating the need for inline cy.intercept calls throughout test files.
 * 
 * IMPORTANT: When API contracts change (e.g., /api/SampleData/* endpoints),
 * fixture files in cypress/fixtures/customers/ MUST be updated in the same PR.
 * 
 * @module customers-mocks
 */

/**
 * Sample customer data structure
 */
export interface SampleData {
  CustNumber: number;
  CustName: string;
  CustAddress: string;
  CustTypeCode: string;
  CustTypeDesc: string;
  CandyLiker: boolean;
}

/**
 * API response structure
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  validationErrors?: Array<{ errDesc: string }>;
}

/**
 * UDC option structure for dropdowns
 */
export interface UDCOption {
  id: string;
  name: string;
}

/**
 * Error types for API failures
 */
export type ErrorType = 'network' | 'server' | 'validation' | 'notfound' | 'conflict';

/**
 * Mock successful load of all customers
 * 
 * @param fixture - Path to fixture file (default: 'customers/default-customers.json')
 * @param delay - Response delay in ms (default: 100)
 * 
 * @example
 * mockLoadCustomers(); // Uses default 8 customers
 * mockLoadCustomers('customers/large-customer-list.json'); // Uses large dataset
 * mockLoadCustomers('customers/empty-customers.json'); // Empty state
 */
export function mockLoadCustomers(fixturePath: string = 'customers/default-customers.json', delay: number = 100): void {
  cy.intercept('GET', '**/api/SampleData', (req) => {
    // Read fixture and wrap in API response format
    return cy.fixture(fixturePath).then((customers: SampleData[]) => {
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          data: customers
        },
        delay: delay
      });
    });
  }).as('loadCustomers');
}

/**
 * Mock error when loading customers
 * 
 * @param errorType - Type of error ('network' or 'server')
 * 
 * @example
 * mockLoadCustomersError('network'); // Simulates network failure
 * mockLoadCustomersError('server'); // Simulates 500 error
 */
export function mockLoadCustomersError(errorType: 'network' | 'server'): void {
  if (errorType === 'network') {
    cy.intercept('GET', '**/api/SampleData', {
      forceNetworkError: true
    }).as('loadCustomers');
  } else {
    cy.intercept('GET', '**/api/SampleData', (req) => {
      return cy.fixture('customers/error-responses.json').then((errors) => {
        req.reply({
          statusCode: 500,
          body: errors.loadCustomersFailed
        });
      });
    }).as('loadCustomers');
  }
}

/**
 * Mock successful load of single customer by ID
 * 
 * @param id - Customer number
 * @param success - Whether the load should succeed (default: true)
 * 
 * @example
 * mockLoadCustomer(1001); // Loads customer 1001
 * mockLoadCustomer(9999, false); // Simulates 404 not found
 */
export function mockLoadCustomer(id: number, success: boolean = true): void {
  if (!success) {
    cy.intercept('GET', `**/api/SampleData/${id}`, (req) => {
      return cy.fixture('customers/error-responses.json').then((errors) => {
        req.reply({
          statusCode: 404,
          body: errors.customerNotFound
        });
      });
    }).as('loadCustomer');
    return;
  }

  cy.intercept('GET', `**/api/SampleData/${id}`, (req) => {
    return cy.fixture('customers/default-customers.json').then((customers: SampleData[]) => {
      const customer = customers.find(c => c.CustNumber === id);
      if (customer) {
        return req.reply({
          statusCode: 200,
          body: {
            success: true,
            data: customer
          }
        });
      } else {
        // Customer not in fixture, return 404
        return cy.fixture('customers/error-responses.json').then((errors) => {
          req.reply({
            statusCode: 404,
            body: errors.customerNotFound
          });
        });
      }
    });
  }).as('loadCustomer');
}

/**
 * Mock customer not found (404 error)
 * 
 * @param id - Customer number that doesn't exist
 * 
 * @example
 * mockCustomerNotFound(9999);
 */
export function mockCustomerNotFound(id: number): void {
  cy.intercept('GET', `**/api/SampleData/${id}`, (req) => {
    return cy.fixture('customers/error-responses.json').then((errors) => {
      req.reply({
        statusCode: 404,
        body: errors.customerNotFound
      });
    });
  }).as('loadCustomer');
}

/**
 * Mock successful load of UDC options (customer types)
 * 
 * @example
 * mockLoadUDCOptions();
 */
export function mockLoadUDCOptions(): void {
  cy.intercept('GET', '**/api/SampleData/udc/55/SP', (req) => {
    return cy.fixture('customers/udc-options.json').then((options: UDCOption[]) => {
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          data: options
        }
      });
    });
  }).as('loadUDCOptions');
}

/**
 * Mock successful customer update
 * 
 * @param id - Customer number to update
 * @param success - Whether the update should succeed (default: true)
 * @param errorType - Type of error if success is false
 * 
 * @example
 * mockUpdateCustomer(1001); // Successful update
 * mockUpdateCustomer(1001, false, 'validation'); // Validation error
 * mockUpdateCustomer(9999, false, 'notfound'); // Customer not found
 */
export function mockUpdateCustomer(id: number, success: boolean = true, errorType?: ErrorType): void {
  cy.intercept('PUT', `**/api/SampleData/${id}`, (req) => {
    if (!success) {
      return cy.fixture('customers/error-responses.json').then((errors) => {
        let statusCode = 500;
        let errorBody = errors.updateCustomerFailed;

        switch (errorType) {
          case 'validation':
            statusCode = 400;
            errorBody = errors.validationError;
            break;
          case 'notfound':
            statusCode = 404;
            errorBody = errors.customerNotFound;
            break;
          case 'server':
            statusCode = 500;
            errorBody = errors.serverError;
            break;
        }

        req.reply({
          statusCode,
          body: errorBody
        });
      });
    }
    
    // Success response
    return req.reply({
      statusCode: 200,
      body: {
        success: true,
        data: {
          ...req.body,
          CustNumber: id
        }
      }
    });
  }).as('updateCustomer');
}

/**
 * Mock validation error on update
 * 
 * @param id - Customer number
 * @param errors - Custom validation error messages
 * 
 * @example
 * mockUpdateCustomerValidationError(1001, [{ errDesc: 'Invalid customer type' }]);
 */
export function mockUpdateCustomerValidationError(id: number, errors?: Array<{ errDesc: string }>): void {
  const defaultErrors = errors || [{ errDesc: 'Please correct the errors on the form.' }];
  
  cy.intercept('PUT', `**/api/SampleData/${id}`, {
    statusCode: 400,
    body: {
      success: false,
      validationErrors: defaultErrors
    }
  }).as('updateCustomer');
}

/**
 * Mock successful customer delete
 * 
 * @param id - Customer number to delete
 * @param success - Whether the delete should succeed (default: true)
 * 
 * @example
 * mockDeleteCustomer(1001); // Successful delete
 * mockDeleteCustomer(9999, false); // Delete fails (404)
 */
export function mockDeleteCustomer(id: number, success: boolean = true): void {
  if (!success) {
    cy.intercept('DELETE', `**/api/SampleData/${id}`, (req) => {
      return cy.fixture('customers/error-responses.json').then((errors) => {
        req.reply({
          statusCode: 404,
          body: errors.customerNotFound
        });
      });
    }).as('deleteCustomer');
    return;
  }

  cy.intercept('DELETE', `**/api/SampleData/${id}`, {
    statusCode: 200,
    body: {
      success: true
    }
  }).as('deleteCustomer');
}

/**
 * Mock delete conflict error (409)
 * 
 * @param id - Customer number
 * 
 * @example
 * mockDeleteCustomerConflict(1001);
 */
export function mockDeleteCustomerConflict(id: number): void {
  cy.intercept('DELETE', `**/api/SampleData/${id}`, (req) => {
    return cy.fixture('customers/error-responses.json').then((errors) => {
      req.reply({
        statusCode: 409,
        body: errors.customerConflict
      });
    });
  }).as('deleteCustomer');
}

/**
 * Mock successful customer creation
 * 
 * @param success - Whether the create should succeed (default: true)
 * @param errorType - Type of error if success is false
 * 
 * @example
 * mockCreateCustomer(); // Successful create
 * mockCreateCustomer(false, 'conflict'); // Duplicate customer
 * mockCreateCustomer(false, 'validation'); // Validation error
 */
export function mockCreateCustomer(success: boolean = true, errorType?: ErrorType): void {
  cy.intercept('POST', '**/api/SampleData', (req) => {
    if (!success) {
      return cy.fixture('customers/error-responses.json').then((errors) => {
        let statusCode = 500;
        let errorBody = errors.serverError;

        switch (errorType) {
          case 'conflict':
            statusCode = 409;
            errorBody = errors.customerConflict;
            break;
          case 'validation':
            statusCode = 400;
            errorBody = errors.validationError;
            break;
          case 'server':
            statusCode = 500;
            errorBody = errors.serverError;
            break;
        }

        req.reply({
          statusCode,
          body: errorBody
        });
      });
    }
    
    // Success response with generated customer number
    return req.reply({
      statusCode: 200,
      body: {
        success: true,
        data: {
          ...req.body,
          CustNumber: 9999 // Generated ID
        }
      }
    });
  }).as('createCustomer');
}
