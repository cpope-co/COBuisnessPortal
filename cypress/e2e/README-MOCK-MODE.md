# Customer E2E Tests - Mock Mode

## Overview
These tests run against the Angular service's **built-in mock data mode**, not against HTTP endpoints.

## Service Mock Mode
The `SampleApplicationService` has `environment.useMockSampleData: true` which means:
- ✅ Service returns data directly from `MOCK_SAMPLE_DATA` array
- ✅ No HTTP requests are made
- ❌ Cypress HTTP intercepts won't work
- ❌ cy.wait('@routeAlias') will timeout

## How to Test

### ✅ Correct Approach
Test the UI behavior with the service's built-in mock data:

```typescript
describe('Customer List', () => {
  beforeEach(() => {
    cy.visit('/sample/customers');
    // Wait for UI element, not HTTP request
    cy.get('[data-testid="customer-list-table"]').should('be.visible');
  });
  
  it('should display 8 customers', () => {
    cy.get('co-table .mat-mdc-row').should('have.length', 8);
  });
});
```

### ❌ Incorrect Approach (Don't Do This)
```typescript
// This won't work because no HTTP requests are made
import { mockLoadCustomers } from '../support/customers-mocks';

beforeEach(() => {
  mockLoadCustomers(); // ❌ No effect - service uses its own mocks
  cy.visit('/sample/customers');
  cy.wait('@loadCustomers'); // ❌ Will timeout - no HTTP request
});
```

## Testing Strategy

### What to Test
- ✅ UI displays the mock data correctly
- ✅ Navigation between pages works
- ✅ Form inputs and validation
- ✅ Client-side filtering and sorting
- ✅ Success messages after operations

### What NOT to Test (Until API Exists)
- ❌ HTTP error responses (500, 404, etc.)
- ❌ Network failures
- ❌ API validation errors
- ❌ Server-side error recovery

## Mock Data Available
The service provides 8 mock customers (CustNumber 1001-1008):
- Acme Corporation (1001)
- TechCorp Industries (1002)
- Global Solutions Inc (1003)
- Blue Ocean Enterprises (1004)
- Sunrise Technologies (1005)
- Metro Manufacturing (1006)
- Pacific Trading Co (1007)
- Mountain View Partners (1008)

## When API is Ready
Once the real endpoints exist:
1. Set `environment.useMockSampleData: false`
2. Use the `customers-mocks.ts` intercepts
3. Enable all error handling tests
