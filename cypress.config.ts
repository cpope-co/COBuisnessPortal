import { defineConfig } from "cypress";
import { execSync } from 'child_process';

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
    retries: {
      runMode: 2,
      openMode: 0
    },
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      
      // Generate customer fixtures before tests run
      on('before:run', () => {
        console.log('Generating customer fixtures...');
        try {
          execSync('npx ts-node --esm cypress/fixtures/customers/generate-fixtures.ts', {
            stdio: 'inherit'
          });
        } catch (error) {
          console.error('Failed to generate fixtures:', error);
        }
      });
      
      return config;
    }
  },
});
