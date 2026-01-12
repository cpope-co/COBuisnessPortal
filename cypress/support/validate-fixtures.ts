/**
 * Fixture validation utilities for Cypress tests
 * Validates fixture data integrity and schema compliance
 */

interface SampleData {
  CustNumber: number;
  CustName: string;
  CustAddress: string;
  CustTypeCode: string;
  CustTypeDesc: string;
  CandyLiker: boolean;
}

interface UDCOption {
  id: string;
  name: string;
}

/**
 * Validates a single SampleData customer object
 */
export function validateCustomer(customer: any): customer is SampleData {
  if (!customer || typeof customer !== 'object') {
    console.error('Customer validation failed: Not an object');
    return false;
  }

  const requiredFields = [
    { field: 'CustNumber', type: 'number' },
    { field: 'CustName', type: 'string' },
    { field: 'CustAddress', type: 'string' },
    { field: 'CustTypeCode', type: 'string' },
    { field: 'CustTypeDesc', type: 'string' },
    { field: 'CandyLiker', type: 'boolean' }
  ];

  for (const { field, type } of requiredFields) {
    if (!(field in customer)) {
      console.error(`Customer validation failed: Missing field "${field}"`);
      return false;
    }
    if (typeof customer[field] !== type) {
      console.error(`Customer validation failed: Field "${field}" should be ${type}, got ${typeof customer[field]}`);
      return false;
    }
  }

  // Validate CustTypeCode is one of A, B, C, D
  const validTypeCodes = ['A', 'B', 'C', 'D'];
  if (!validTypeCodes.includes(customer.CustTypeCode)) {
    console.error(`Customer validation failed: Invalid CustTypeCode "${customer.CustTypeCode}". Must be one of: ${validTypeCodes.join(', ')}`);
    return false;
  }

  // Validate CustNumber is positive
  if (customer.CustNumber <= 0) {
    console.error(`Customer validation failed: CustNumber must be positive, got ${customer.CustNumber}`);
    return false;
  }

  return true;
}

/**
 * Validates an array of customer objects
 */
export function validateCustomerArray(customers: any[]): customers is SampleData[] {
  if (!Array.isArray(customers)) {
    console.error('Customer array validation failed: Not an array');
    return false;
  }

  for (let i = 0; i < customers.length; i++) {
    if (!validateCustomer(customers[i])) {
      console.error(`Customer array validation failed at index ${i}`);
      return false;
    }
  }

  return true;
}

/**
 * Validates UDC option object
 */
export function validateUDCOption(option: any): option is UDCOption {
  if (!option || typeof option !== 'object') {
    console.error('UDC option validation failed: Not an object');
    return false;
  }

  if (!('id' in option) || typeof option.id !== 'string') {
    console.error('UDC option validation failed: Missing or invalid "id" field');
    return false;
  }

  if (!('name' in option) || typeof option.name !== 'string') {
    console.error('UDC option validation failed: Missing or invalid "name" field');
    return false;
  }

  return true;
}

/**
 * Validates an array of UDC options
 */
export function validateUDCOptionsArray(options: any[]): options is UDCOption[] {
  if (!Array.isArray(options)) {
    console.error('UDC options validation failed: Not an array');
    return false;
  }

  for (let i = 0; i < options.length; i++) {
    if (!validateUDCOption(options[i])) {
      console.error(`UDC options validation failed at index ${i}`);
      return false;
    }
  }

  return true;
}

/**
 * Cypress custom command to validate customer fixtures
 */
Cypress.Commands.add('validateCustomerFixture', (fixturePath: string) => {
  cy.fixture(fixturePath).then((data) => {
    const isValid = validateCustomerArray(data);
    expect(isValid, `Fixture ${fixturePath} should be valid`).to.be.true;
  });
});

/**
 * Cypress custom command to validate UDC options fixtures
 */
Cypress.Commands.add('validateUDCFixture', (fixturePath: string) => {
  cy.fixture(fixturePath).then((data) => {
    const isValid = validateUDCOptionsArray(data);
    expect(isValid, `Fixture ${fixturePath} should be valid`).to.be.true;
  });
});

// Type declarations for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      validateCustomerFixture(fixturePath: string): Chainable<void>;
      validateUDCFixture(fixturePath: string): Chainable<void>;
    }
  }
}
