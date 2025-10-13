describe('Menu Component E2E Tests', () => {
    beforeEach(() => {
        // Clear any existing session data
        cy.clearAllCookies();
        cy.clearAllLocalStorage();
        cy.clearAllSessionStorage();
    });

    describe('Menu Accessibility Compliance', () => {
        beforeEach(() => {
            cy.setupAuthenticatedUser(2);
            cy.visit('/home');
            // Open the sidenav/drawer if it's closed
            cy.get('body').then(($body) => {
                if ($body.find('mat-drawer-container mat-drawer.mat-drawer-opened').length === 0) {
                    cy.get('button[mat-icon-button]').first().click();
                }
            });
        });

        it('should meet WCAG 2.1 AA standards', () => {
            cy.verifyMenuAccessibility();
        });

        it('should support full keyboard navigation', () => {
            cy.testMenuKeyboardNavigation();
        });

        it('should have proper focus indicators', () => {
            cy.get('a[mat-list-item][role="menuitem"]').each(($item) => {
                cy.wrap($item).focus();
                cy.wrap($item).should('have.css', 'outline');
                cy.wrap($item).should('have.css', 'outline-width', '2px');
            });
        });

        it('should indicate current page correctly', () => {
            // Click on a menu item first to ensure we have a matching route
            cy.get('a[mat-list-item][role="menuitem"]').first().then(($firstItem) => {
                const href = $firstItem.attr('href');
                if (href) {
                    cy.wrap($firstItem).click();
                    // Wait for navigation to complete
                    cy.url().should('include', href);
                    // Now check that this item has the current-page class
                    cy.get(`a[mat-list-item][href="${href}"]`).should('have.class', 'current-page');
                }
            });
        });

        it('should have proper heading structure', () => {
            cy.get('h3[mat-subheader].nav-heading').each(($heading, index) => {
                cy.wrap($heading).should('have.attr', 'id').and('include', 'heading-');
            });
        });

        it('should use roving tabindex pattern for accessibility', () => {
            // First menu item should have tabindex="0", rest should have tabindex="-1" (roving tabindex pattern)
            cy.get('a[mat-list-item][role="menuitem"]').each(($item, index) => {
                if (index === 0) {
                    cy.wrap($item).should('have.attr', 'tabindex', '0');
                } else {
                    cy.wrap($item).should('have.attr', 'tabindex', '-1');
                }
            });
        });

        it('should set focused item to tabindex="0" when navigating', () => {
            // Focus first menu item
            cy.get('a[mat-list-item][role="menuitem"]').first().focus();
            
            // The focused item should have tabindex="0"
            cy.get('a[mat-list-item][role="menuitem"]').first().should('have.attr', 'tabindex', '0');
            
            // Other items should still have tabindex="-1"
            cy.get('a[mat-list-item][role="menuitem"]').not(':first').each(($item) => {
                cy.wrap($item).should('have.attr', 'tabindex', '-1');
            });
        });
    });

    xdescribe('Menu Structure and Navigation', () => {
        beforeEach(() => {
            cy.setupAuthenticatedUser(2);
            cy.visit('/home');
            // Open the sidenav/drawer if it's closed
            cy.get('body').then(($body) => {
                if ($body.find('mat-drawer-container mat-drawer.mat-drawer-opened').length === 0) {
                    cy.get('button[mat-icon-button]').first().click();
                }
            });
        });

        it('should display menu items with proper structure', () => {
            cy.verifyMenuStructure();
            
            // Verify menu items have proper routing attributes
            cy.get('a[mat-list-item][role="menuitem"]').each(($el) => {
                cy.wrap($el).should('have.attr', 'href');
            });
        });

        it('should navigate correctly when menu items are clicked', () => {
            cy.get('a[mat-list-item][role="menuitem"]').not('[aria-current="page"]').first().then(($link) => {
                const href = $link.attr('href');
                if (href) {
                    cy.wrap($link).click();
                    cy.url().should('include', href);
                    cy.verifyMenuStructure(); // Ensure menu is still accessible after navigation
                }
            });
        });

        it('should support Enter key activation', () => {
            cy.get('a[mat-list-item][role="menuitem"]').not('[aria-current="page"]').first().then(($link) => {
                const href = $link.attr('href');
                if (href) {
                    cy.wrap($link).focus().trigger('keydown', { key: 'Enter' });
                    cy.url().should('include', href);
                }
            });
        });
    });

    xdescribe('Menu Visibility and Authentication', () => {
        it('should not display menu when user is not authenticated', () => {
            cy.visit('/auth/login');
            cy.get('co-menu').should('exist');
            cy.get('mat-nav-list').should('be.empty');
        });

        it('should display menu after successful login', () => {


            // Visit login and authenticate
            cy.visit('/auth/login');
            cy.get('input[type="email"]').type('testuser@chambers-owen.com');
            cy.get('input[type="password"]').type('it2T*&gf');
            cy.get('button').contains('Login').click();


            cy.get('button[id="co-menu-button"]').click();

            // Menu should appear after authentication
            cy.get('co-menu').should('exist');
            cy.get('mat-nav-list').should('be.visible');
        });
    });

    xdescribe('Menu Structure and Navigation', () => {
        beforeEach(() => {
            // Setup authenticated user before each test
            cy.setupAuthenticatedUser(1); // Regular user role
        });

        it('should display menu items with proper structure', () => {
            // Visit login and authenticate

            // Wait for menu to load
            cy.get('co-menu').should('exist');

            // Verify menu items exist with correct Material Design structure
            cy.get('a[mat-list-item]').should('exist');

            // Verify each menu item has proper structure
            cy.get('a[mat-list-item]').each(($el) => {
                // Should have Material Design classes
                cy.wrap($el).should('have.class', 'mat-mdc-list-item');
                cy.wrap($el).should('have.class', 'mdc-list-item');

                // Should have href attribute
                cy.wrap($el).should('have.attr', 'href');

                // Should have text content
                cy.wrap($el).find('.mat-mdc-list-item-unscoped-content').should('not.be.empty');
            });
        });

        it('should display headings when present', () => {
            cy.visit('/home');

            // Look for heading elements if they exist in the menu
            cy.get('mat-nav-list').within(() => {
                cy.get('h2.nav-heading').should('exist');
            });
        });

        it('should navigate to correct routes when menu items are clicked', () => {
            cy.visit('/home');

            // Test navigation to different routes
            cy.get('mat-nav-list a[mat-list-item]').first().then(($link) => {
                const href = $link.attr('ng-reflect-router-link');
                if (href && href !== '/home') {
                    cy.wrap($link).click();
                    cy.url().should('include', href);
                }
            });
        });
    });

    xdescribe('Role-Based Menu Access', () => {
        it('should show admin-specific menu items for admin users', () => {
            // Setup admin user
            cy.setupAuthenticatedUser(1); // Admin role

            cy.visit('/home');

            // Admin should see admin-specific menu items
            cy.verifyMenuStructure();

            // Check for admin-specific items (this will depend on your actual routes)
            cy.get('mat-nav-list').within(() => {
                // Look for admin-specific navigation items
                // Adjust these selectors based on your actual admin menu items
                cy.contains('Admin').should('exist');
            });
        });

        it('should show limited menu items for regular users', () => {
            // Setup regular user
            cy.setupAuthenticatedUser(3); // Regular user role

            cy.visit('/home');

            // Regular user should see limited menu items
            cy.verifyMenuStructure();

            // Verify admin items are not visible
            cy.get('mat-nav-list').within(() => {
                cy.contains('Admin').should('not.exist');
            });
        });
    });

    xdescribe('Menu Refresh and Updates', () => {
        beforeEach(() => {
            // Setup authenticated user
            cy.setupAuthenticatedUser(2);
        });

        it('should refresh menu when navigating between routes', () => {
            cy.visit('/home');

            // Verify menu is displayed
            cy.verifyMenuStructure();
            let initialMenuItemsCount: number = 0;

            cy.get('mat-nav-list a[mat-list-item]').then(($items) => {
                initialMenuItemsCount = $items.length;

                // Navigate to different route and back
                cy.get('mat-nav-list a[mat-list-item]').first().then(($link) => {
                    const href = $link.attr('ng-reflect-router-link');
                    if (href && href !== '/home') {
                        cy.wrap($link).click();

                        // Navigate back to home
                        cy.visit('/home');

                        // Menu should still be present and consistent
                        cy.verifyMenuStructure();
                        cy.get('mat-nav-list a[mat-list-item]').should('have.length', initialMenuItemsCount);
                    }
                });
            });
        });

        it('should clear menu on logout', () => {
            cy.visit('/home');

            // Verify menu is displayed
            cy.verifyMenuStructure();

            // Mock logout
            cy.intercept('POST', '**/auth/logout', {
                statusCode: 200,
                body: { success: true }
            }).as('logoutRequest');

            // Trigger logout (this would typically be done through a logout button)
            cy.window().then((win) => {
                win.sessionStorage.clear();
                win.localStorage.clear();
            });

            // Navigate to login page (simulating redirect after logout)
            cy.visit('/auth/login');

            // Menu should not be visible
            cy.get('co-menu').should('exist');
            cy.get('mat-nav-list').should('be.empty');
        });
    });

    xdescribe('Menu Accessibility', () => {
        beforeEach(() => {
            // Setup authenticated user
            cy.setupAuthenticatedUser(2);
        });

        it('should have proper ARIA attributes and keyboard navigation', () => {
            cy.visit('/home');

            // Use custom command to check accessibility
            cy.checkMenuAccessibility();
        });

        it('should have meaningful text content for screen readers', () => {
            cy.visit('/home');

            // Verify menu items have descriptive text
            cy.get('mat-nav-list a[mat-list-item]').each(($el) => {
                cy.wrap($el).should('not.be.empty');
                cy.wrap($el).invoke('text').should('not.be.empty');
            });

            // Check headings are properly structured
            cy.get('h2.nav-heading').each(($heading) => {
                cy.wrap($heading).invoke('text').should('not.be.empty');
            });
        });
    });

    xdescribe('Menu Performance and Error Handling', () => {
        it('should handle menu building errors gracefully', () => {
            // Setup user with invalid/corrupted data
            cy.window().then((win) => {
                win.sessionStorage.setItem('user', 'invalid-json');
                win.sessionStorage.setItem('token', 'mock-jwt-token');
            });

            cy.intercept('GET', '**/auth/verify', {
                statusCode: 200,
                body: { success: true, valid: true }
            });

            cy.visit('/home');

            // Application should not crash, even with invalid user data
            cy.get('body').should('exist');
            // Menu might not be present, but page should still load
        });

        it('should handle route changes efficiently', () => {
            // Setup authenticated user
            cy.setupAuthenticatedUser(2);

            cy.visit('/home');

            // Rapidly navigate between routes to test performance
            cy.get('mat-nav-list a[mat-list-item]').first().click();
            cy.verifyMenuStructure(); // Menu should remain stable

            // Navigate back
            cy.go('back');
            cy.verifyMenuStructure(); // Menu should still be present
        });
    });

    xdescribe('Menu Component E2E Tests', () => {
        it('should show customer menu for customer role', () => {
            cy.setupAuthenticatedUser(2); // Customer: cstore@draxlers.com
            cy.visit('/home');
            // Test customer-specific menu items
        });

        it('should show vendor menu for vendor role', () => {
            cy.setupAuthenticatedUser(3); // Vendor: jvigna@swisher.com
            cy.visit('/home');
            // Test vendor-specific menu items
        });

        it('should show employee menu for employee role', () => {
            cy.setupAuthenticatedUser(4); // Employee: bart@bart.com
            cy.visit('/home');
            // Test employee-specific menu items
        });

        it('should show sales employee menu for sales role', () => {
            cy.setupAuthenticatedUser(6); // Employee-Sales: ryan@blackbuffalo.com
            cy.visit('/home');
            // Test sales-specific menu items
        });
    });
});