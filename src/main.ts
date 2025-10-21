import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Handle unhandled promise rejections (including Angular router internal errors)
window.addEventListener('unhandledrejection', (event) => {
  // Suppress the "Params are not set" error from Angular router internals
  if (event.reason?.message?.includes('Params are not set')) {
    console.warn('Suppressed Angular router internal error:', event.reason.message);
    event.preventDefault();
    return;
  }
  // Let other errors through
  console.error('Unhandled promise rejection:', event.reason);
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
