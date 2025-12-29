/**
 * @fileoverview Shared Test Utilities and Mock Factories
 * 
 * This module provides reusable mock factories and test data for Jasmine/Karma tests.
 * It eliminates duplication across spec files by centralizing common mock patterns.
 * 
 * @example Import and use in spec files:
 * ```typescript
 * import { createRouterSpy, createMessagesServiceSpy, MOCK_CUSTOMERS } from '../../testing/test-helpers';
 * 
 * describe('MyComponent', () => {
 *   let routerSpy: jasmine.SpyObj<Router>;
 *   
 *   beforeEach(() => {
 *     routerSpy = createRouterSpy();
 *     // Use routerSpy in TestBed providers
 *   });
 * });
 * ```
 */

import { signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { SampleData, UDCOption } from '../app/customers/customers/customer.model';

/**
 * Mock customer data matching MOCK_SAMPLE_DATA from customers.service.ts
 * Use this in tests to ensure consistency with service mock data.
 */
export const MOCK_CUSTOMERS: SampleData[] = [
  {
    CustNumber: 1001,
    CustName: 'Acme Corporation',
    CustAddress: '123 Main St, Springfield, IL 62701',
    CustTypeCode: 'A',
    CustTypeDesc: 'Premium Customer',
    CandyLiker: true
  },
  {
    CustNumber: 1002,
    CustName: 'Global Industries LLC',
    CustAddress: '456 Oak Ave, Chicago, IL 60601',
    CustTypeCode: 'B',
    CustTypeDesc: 'Standard Customer',
    CandyLiker: false
  },
  {
    CustNumber: 1003,
    CustName: 'Tech Solutions Inc',
    CustAddress: '789 Pine Rd, Austin, TX 78701',
    CustTypeCode: 'A',
    CustTypeDesc: 'Premium Customer',
    CandyLiker: true
  },
  {
    CustNumber: 1004,
    CustName: 'Smith & Associates',
    CustAddress: '321 Elm St, Boston, MA 02101',
    CustTypeCode: 'C',
    CustTypeDesc: 'Budget Customer',
    CandyLiker: true
  },
  {
    CustNumber: 1005,
    CustName: 'Johnson Wholesale',
    CustAddress: '654 Maple Dr, Seattle, WA 98101',
    CustTypeCode: 'D',
    CustTypeDesc: 'Wholesale Customer',
    CandyLiker: false
  },
  {
    CustNumber: 1006,
    CustName: 'Metro Retail Group',
    CustAddress: '987 Broadway, New York, NY 10001',
    CustTypeCode: 'B',
    CustTypeDesc: 'Standard Customer',
    CandyLiker: true
  },
  {
    CustNumber: 1007,
    CustName: 'West Coast Distributors',
    CustAddress: '147 Beach Blvd, Los Angeles, CA 90001',
    CustTypeCode: 'D',
    CustTypeDesc: 'Wholesale Customer',
    CandyLiker: false
  },
  {
    CustNumber: 1008,
    CustName: 'Mountain View Partners',
    CustAddress: '258 Summit Ave, Denver, CO 80201',
    CustTypeCode: 'A',
    CustTypeDesc: 'Premium Customer',
    CandyLiker: true
  }
];

/**
 * Mock UDC options for customer type dropdown
 * Matches MOCK_UDC_OPTIONS from customers.service.ts
 */
export const MOCK_UDC_OPTIONS: UDCOption[] = [
  { TypeCodeList: 'A', TypeDescList: 'Premium Customer' },
  { TypeCodeList: 'B', TypeDescList: 'Standard Customer' },
  { TypeCodeList: 'C', TypeDescList: 'Budget Customer' },
  { TypeCodeList: 'D', TypeDescList: 'Wholesale Customer' }
];

/**
 * Creates a Jasmine spy object for Angular Router
 * 
 * @returns Router spy with navigate, createUrlTree, and serializeUrl methods
 * 
 * @example
 * ```typescript
 * const routerSpy = createRouterSpy();
 * 
 * // In TestBed
 * TestBed.configureTestingModule({
 *   providers: [{ provide: Router, useValue: routerSpy }]
 * });
 * 
 * // In tests
 * component.navigateToDetails(123);
 * expect(routerSpy.navigate).toHaveBeenCalledWith(['/details', 123]);
 * ```
 */
export function createRouterSpy(): jasmine.SpyObj<Router> {
  const spy = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree', 'serializeUrl']);
  spy.createUrlTree.and.returnValue({} as any);
  spy.serializeUrl.and.returnValue('/');
  return spy;
}

/**
 * Creates a mock ActivatedRoute with params and queryParams observables
 * 
 * @param params - Route parameters (e.g., { id: '123' })
 * @param queryParams - Query parameters (e.g., { filter: 'active' })
 * @returns Mock ActivatedRoute with snapshot.paramMap.get() support
 * 
 * @example
 * ```typescript
 * const activatedRoute = createActivatedRouteMock({ id: '1001' });
 * 
 * // In TestBed
 * TestBed.configureTestingModule({
 *   providers: [{ provide: ActivatedRoute, useValue: activatedRoute }]
 * });
 * 
 * // Component can access:
 * const id = activatedRoute.snapshot.paramMap.get('id'); // Returns '1001'
 * ```
 */
export function createActivatedRouteMock(
  params: { [key: string]: string } = {},
  queryParams: { [key: string]: string } = {}
): any {
  return {
    params: { subscribe: (fn: Function) => fn(params) },
    queryParams: { subscribe: (fn: Function) => fn(queryParams) },
    snapshot: {
      params,
      queryParams,
      paramMap: {
        get: (key: string) => params[key] || null,
        has: (key: string) => key in params,
        keys: Object.keys(params)
      },
      queryParamMap: {
        get: (key: string) => queryParams[key] || null,
        has: (key: string) => key in queryParams,
        keys: Object.keys(queryParams)
      }
    }
  };
}

/**
 * Creates a Jasmine spy object for MessagesService
 * 
 * @param includeSignal - Whether to include the message signal property
 * @returns MessagesService spy with showMessage method
 * 
 * @example
 * ```typescript
 * const messagesService = createMessagesServiceSpy(true);
 * 
 * // In TestBed
 * TestBed.configureTestingModule({
 *   providers: [{ provide: MessagesService, useValue: messagesService }]
 * });
 * 
 * // In tests
 * component.saveData();
 * expect(messagesService.showMessage).toHaveBeenCalledWith('Saved successfully', 'success');
 * ```
 */
export function createMessagesServiceSpy(includeSignal = false): jasmine.SpyObj<any> {
  const spy = jasmine.createSpyObj('MessagesService', ['showMessage']);
  if (includeSignal) {
    (spy as any).message = signal(null);
  }
  return spy;
}

/**
 * Creates a comprehensive Jasmine spy object for MatDialog
 * Includes internal properties required for MatDialog compatibility
 * 
 * @returns MatDialog spy with open, closeAll, getDialogById methods and internal properties
 * 
 * @example
 * ```typescript
 * const dialogSpy = createMatDialogSpy();
 * const mockDialogRef = createDialogRefMock<boolean>();
 * dialogSpy.open.and.returnValue(mockDialogRef.ref);
 * 
 * // In TestBed
 * TestBed.configureTestingModule({
 *   providers: [{ provide: MatDialog, useValue: dialogSpy }]
 * });
 * 
 * // In tests
 * component.openDialog();
 * expect(dialogSpy.open).toHaveBeenCalled();
 * 
 * // Simulate dialog close
 * mockDialogRef.subject.next(true);
 * mockDialogRef.subject.complete();
 * ```
 */
export function createMatDialogSpy(): jasmine.SpyObj<MatDialog> {
  const afterAllClosedSubject = new Subject<void>();
  const afterOpenedSubject = new Subject<any>();

  const spy = jasmine.createSpyObj('MatDialog', ['open', 'closeAll', 'getDialogById']);

  // Add internal properties that MatDialog expects
  (spy as any)._openDialogsAtThisLevel = [];
  (spy as any)._afterAllClosedAtThisLevel = afterAllClosedSubject;
  (spy as any)._afterOpenedAtThisLevel = afterOpenedSubject;
  (spy as any)._ariaHiddenElements = new Map();
  (spy as any).openDialogs = [];
  (spy as any).afterAllClosed = afterAllClosedSubject.asObservable();
  (spy as any).afterOpened = afterOpenedSubject.asObservable();

  return spy;
}

/**
 * Creates a Jasmine spy object for FormHandlingService
 * 
 * @returns FormHandlingService spy with getErrorMessages and createFormGroup methods
 * 
 * @example
 * ```typescript
 * const formHandlingSpy = createFormHandlingSpy();
 * const mockForm = new FormGroup({ email: new FormControl('') });
 * formHandlingSpy.createFormGroup.and.returnValue(mockForm);
 * 
 * // In TestBed
 * TestBed.configureTestingModule({
 *   providers: [{ provide: FormHandlingService, useValue: formHandlingSpy }]
 * });
 * ```
 */
export function createFormHandlingSpy(): jasmine.SpyObj<any> {
  const spy = jasmine.createSpyObj('FormHandlingService', ['getErrorMessages', 'createFormGroup']);
  spy.getErrorMessages.and.returnValue('');
  return spy;
}

/**
 * Creates a writable signal spy for testing signal-based reactivity
 * 
 * @param initialValue - Initial value for the signal
 * @returns WritableSignal that can be set/updated in tests
 * 
 * @example
 * ```typescript
 * const dataSpy = createSignalSpy<SampleData[]>([]);
 * 
 * // Add signal to mock service
 * const serviceSpy = jasmine.createSpyObj('MyService', ['loadData']);
 * Object.defineProperty(serviceSpy, 'dataSignal', {
 *   get: () => dataSpy,
 *   enumerable: true,
 *   configurable: true
 * });
 * 
 * // In tests, update the signal
 * dataSpy.set(MOCK_CUSTOMERS);
 * expect(component.data()).toEqual(MOCK_CUSTOMERS);
 * ```
 */
export function createSignalSpy<T>(initialValue: T): WritableSignal<T> {
  return signal(initialValue);
}

/**
 * Creates a MatDialogRef mock with Subject-based afterClosed observable
 * Use this for testing dialog interactions
 * 
 * @returns Object with dialogRef spy and subject for controlling afterClosed emissions
 * 
 * @example
 * ```typescript
 * const dialogRefMock = createDialogRefMock<boolean>();
 * const dialogSpy = createMatDialogSpy();
 * dialogSpy.open.and.returnValue(dialogRefMock.ref);
 * 
 * // Component opens dialog
 * component.openConfirmation();
 * 
 * // Simulate user clicking "Yes" (emits true)
 * dialogRefMock.subject.next(true);
 * dialogRefMock.subject.complete();
 * 
 * // Test component reaction to dialog result
 * expect(component.confirmed()).toBe(true);
 * 
 * // Clean up in afterEach
 * if (!dialogRefMock.subject.closed) {
 *   dialogRefMock.subject.complete();
 * }
 * ```
 */
export function createDialogRefMock<T>(): {
  ref: jasmine.SpyObj<MatDialogRef<any, T>>;
  subject: Subject<T>;
} {
  const subject = new Subject<T>();
  const ref = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']);
  ref.afterClosed.and.returnValue(subject.asObservable());
  
  return { ref, subject };
}
