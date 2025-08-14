import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    env: {
      // Test user credentials (these should be valid test accounts)
      testEmail: 'testuser@chambers-owen.com',
      testPassword: 'A975$pQ8',
      invalidEmail: 'invalid@example.com',
      invalidPassword: 'wrongpassword'
    }
  },
});
