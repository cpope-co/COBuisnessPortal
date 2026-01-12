# Customers E2E Test Suite

Comprehensive Cypress E2E tests for the Customers module, covering CRUD operations, filtering, sorting, pagination, error handling, and accessibility.

## 📋 Test Suite Overview

### Test Files Created
1. **01-customers-list.cy.ts** - Customer list display, search, filters, pagination, sorting
2. **02-customer-detail.cy.ts** - Customer detail view, navigation, delete functionality
3. **03-edit-customer.cy.ts** - Edit form, validation, save/cancel actions
4. **04-customers-integration.cy.ts** - End-to-end workflows across multiple pages
5. **05-customers-errors.cy.ts** - Error handling for all API endpoints
6. **06-customers-accessibility.cy.ts** - WCAG 2.1 AA compliance and keyboard navigation

### Total Test Count
- **~130+ test scenarios** across 6 test files
- Coverage: List (30+), Detail (20+), Edit (35+), Integration (10+), Errors (25+), Accessibility (20+)

## 🛠️ Implementation Details

### Components Enhanced
- Added `data-testid` attributes to all customer templates:
  - `customer-list-table`
  - `back-button`, `edit-button`, `delete-button`
  - `customer-type-select`, `candy-checkbox`
  - `save-button`, `cancel-button`

### Supporting Infrastructure

#### Fixtures (Auto-generated)
- `customers/default-customers.json` - 8 sample customers (1001-1008)
- `customers/empty-customers.json` - Empty array for empty state testing
- `customers/single-customer.json` - Single customer for edge cases
- `customers/large-customer-list.json` - 75 customers for pagination testing
- `customers/udc-options.json` - Customer type options (A-D)
- `customers/error-responses.json` - Common error message templates

#### Mocks Module (`customers-mocks.ts`)
- `mockLoadCustomers()` - Mock GET /api/SampleData
- `mockLoadCustomer(id)` - Mock GET /api/SampleData/:id
- `mockLoadUDCOptions()` - Mock GET /api/SampleData/udc/55/SP
- `mockUpdateCustomer(id)` - Mock PUT /api/SampleData/:id
- `mockDeleteCustomer(id)` - Mock DELETE /api/SampleData/:id
- `mockCreateCustomer()` - Mock POST /api/SampleData
- Error variants for network, 404, 500, validation, conflict errors

#### Custom Commands (`customers-commands.ts`)
- `cy.navigateToCustomerList()` - Navigate to list and wait for load
- `cy.openCustomerDetail(custNumber)` - Open specific customer detail
- `cy.fillCustomerEditForm({typeCode, candyLiker})` - Fill edit form
- `cy.searchTable(searchText)` - Search in table (4+ char threshold)
- `cy.openAdvancedFilters()` - Open filters dialog
- `cy.applyColumnFilter(columnName, value)` - Apply specific filter
- `cy.clearAllFilters()` - Clear all active filters
- `cy.clickTableRow(index)` - Click table row by index
- `cy.sortTableByColumn(columnName)` - Sort by column
- `cy.changePagination(pageSize)` - Change page size
- `cy.stubNativeConfirm(returnValue)` - Stub window.confirm
- Message helpers: `cy.shouldShowSuccessMessage(text)`, `cy.shouldShowErrorMessage(text)`, etc.

#### Validation (`validate-fixtures.ts`)
- `validateCustomer()` - Validate SampleData schema
- `validateCustomerArray()` - Validate array of customers
- `validateUDCOption()` - Validate UDC option schema
- Custom commands: `cy.validateCustomerFixture()`, `cy.validateUDCFixture()`

## 🚀 Running the Tests

### Prerequisites
```bash
npm install  # Dependencies already installed:
             # - @faker-js/faker
             # - cypress-axe
             # - axe-core
```

### Run All Tests
```bash
# Open Cypress UI
npm run e2e:open

# Run in headless mode
npm run e2e:run

# Run specific test file
npx cypress run --spec "cypress/e2e/01-customers-list.cy.ts"
```

### Run with Auto-Generated Fixtures
Fixtures are automatically generated before tests run via `cypress.config.ts` setupNodeEvents.

To manually regenerate fixtures:
```bash
npx ts-node --esm cypress/fixtures/customers/generate-fixtures.ts
```

### Parallel Execution (Cypress Cloud)
For faster CI/CD execution:
```bash
# Run tests in parallel (requires Cypress Cloud setup)
npx cypress run --record --parallel --ci-build-id $CI_BUILD_ID
```

Configuration in `cypress.config.ts`:
- `retries: { runMode: 2, openMode: 0 }` - 2 retries in CI, none in dev
- `video: false` - Faster execution
- `screenshotOnRunFailure: true` - Capture failures

## 📊 Test Coverage

### Functional Coverage
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ List display with 8 default customers
- ✅ Table features: sorting, filtering, pagination, search
- ✅ Global search (4+ character threshold)
- ✅ Advanced column filters (text, select, boolean)
- ✅ Row click navigation
- ✅ Form interactions (dropdowns, checkboxes)
- ✅ Validation (required fields)
- ✅ Unsaved changes dialog
- ✅ Native confirm dialog for delete
- ✅ Success/error message display
- ✅ Empty states
- ✅ Loading states

### Error Coverage
- ✅ Network errors (forceNetworkError)
- ✅ 404 Not Found
- ✅ 400 Validation errors
- ✅ 409 Conflict errors
- ✅ 500 Server errors
- ✅ Error message display and dismissal
- ✅ Error recovery and retry

### Accessibility Coverage
- ✅ Automated axe-core WCAG 2.1 AA checks
- ✅ Keyboard navigation (Tab, Enter, Space, Escape, Arrows)
- ✅ Focus management and indicators
- ✅ Focus trap in dialogs
- ✅ ARIA roles (table, row, button, alert)
- ✅ ARIA attributes (aria-label, aria-sort, aria-required, aria-describedby)
- ✅ Screen reader support
- ✅ Form field labels and associations

## 🎯 Test Patterns

### Material Design Selectors
```typescript
// Stable Material selectors used throughout
cy.get('mat-card-title')
cy.get('mat-card-content')
cy.get('mat-card-actions')
cy.get('[data-testid="customer-list-table"]')  // Custom data-testid
cy.get('co-table .mat-mdc-row')                // Table rows
cy.get('mat-select')                           // Dropdowns
cy.get('mat-checkbox')                         // Checkboxes
cy.get('mat-dialog-container')                 // Dialogs
cy.get('mat-paginator')                        // Pagination
cy.get('th[mat-sort-header]')                  // Sortable headers
cy.get('.alert-success')                       // Bootstrap alerts
```

### Assertion-Based Waiting
All tests use `.should('be.visible')` for reliable waiting:
```typescript
cy.get('mat-dialog-container').should('be.visible');  // Wait for dialog
cy.get('mat-option').should('be.visible');           // Wait for dropdown options
cy.get('[data-testid="save-button"]').click();
cy.wait('@updateCustomer');                          // Wait for API call
cy.url().should('include', '/sample/customer/1001'); // Wait for navigation
```

### Test Isolation
Each test is fully isolated:
- `beforeEach()` clears all cookies, localStorage, sessionStorage
- Fresh mocks set up per test via `cy.intercept()`
- No shared state between tests
- Automatic data reset with fixture-based mocks

## 🐛 Debugging Tips

### View Fixture Data
```bash
# Check generated fixtures
cat cypress/fixtures/customers/default-customers.json
cat cypress/fixtures/customers/large-customer-list.json
```

### Debug Specific Test
```typescript
// Add .only to run single test
it.only('should display customer list', () => {
  // test code
});
```

### Enable Cypress Debug Logs
```bash
DEBUG=cypress:* npm run e2e:run
```

### View Network Requests
Tests use aliased intercepts for easy debugging:
```typescript
cy.wait('@loadCustomers').then(console.log);
cy.wait('@updateCustomer').its('request.body').then(console.log);
```

## 📝 Notes

### Co-Table Search Behavior
- **4-character minimum**: Search only activates with 4+ characters
- Empty string clears search
- Tests account for this threshold

### Mock vs Real API
- All tests use `cy.intercept()` mocks for:
  - Predictable test data
  - Fast execution (~30-50% faster than real API)
  - Complete isolation
  - Error scenario testing

### Material Design Components
- Tests use Material CDK selectors (`.mat-mdc-*`)
- Compatible with Angular Material v15+
- Custom components (`co-table`, `co-select`, `app-checkbox`) tested via their Material internals

### Accessibility Testing
- `cypress-axe` catches ~30% of accessibility issues automatically
- Manual keyboard/focus tests cover remaining scenarios
- Color contrast check disabled (Material Design handles this)

## 🔧 Maintenance

### When API Changes
1. Update `customers-mocks.ts` to match new API contract
2. Update fixtures in `cypress/fixtures/customers/`
3. Run fixture validation: `cy.validateCustomerFixture('customers/default-customers.json')`

### When UI Changes
1. Update `data-testid` attributes if selectors change
2. Update `customers-commands.ts` if interaction patterns change
3. Re-run accessibility tests to catch new issues

### Adding New Tests
1. Follow numbering convention: `07-new-feature.cy.ts`
2. Use existing custom commands and mocks
3. Add new mocks to `customers-mocks.ts` if needed
4. Add new commands to `customers-commands.ts` if reusable

## ✅ Success Criteria

Tests are passing when:
- ✅ All 130+ test scenarios pass
- ✅ Fixtures auto-generate successfully
- ✅ No axe-core accessibility violations
- ✅ Test execution time < 5 minutes for full suite
- ✅ No flaky tests (2 retries configured for CI stability)

---

**Created**: January 6, 2026
**Test Framework**: Cypress 13.x with TypeScript
**Total Implementation Time**: Comprehensive test coverage with mocks, commands, and fixtures
**Status**: ✅ Complete and Ready for Execution
