import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { apiUserGuard } from './api-user.guard';

describe('apiUserGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => apiUserGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
