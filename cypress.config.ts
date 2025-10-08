import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'e2e/reports',
      overwrite: true,
      html: true,
      json: true,
      charts: true,
      reportFilename: 'index',
      reportPageTitle: 'CO Business Portal E2E Tests',
      reportTitle: 'CO Business Portal Test Results'
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      return config;
    },
    env: {
      // Test user credentials (these should be valid test accounts)
      testEmail: 'testuser@chambers-owen.com',
      testPassword: 'it2T*&gf',
      invalidEmail: 'invalid@example.com',
      invalidPassword: 'wrongpassword'
    }
  },
});
