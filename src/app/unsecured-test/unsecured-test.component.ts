import { Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormHandlingService } from '../services/form-handling.service';
import { MultiSelectComponent } from '../shared/multi-select/multi-select.component';
import { PickListComponent } from '../shared/pick-list/pick-list.component';
import { InputComponent } from '../shared/input/input.component';
import { SelectComponent } from '../shared/select/select.component';
import { CheckboxComponent } from '../shared/checkbox/checkbox.component';
import { RadioComponent } from '../shared/radio/radio.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { JsonPipe } from '@angular/common';

// Create a simple model for the multi-select test
const multiSelectTestModel = {
  selectedItems: {
    Validators: [Validators.required],
    ErrorMessages: {
      required: 'Please select at least one item.'
    },
    value: [
      { id: 1, name: 'JavaScript Framework' },
      { id: 3, name: 'TypeScript' }
    ]
  }
};

// Create a model for the pick-list test
const pickListTestModel = {
  manufacturers: {
    Validators: [Validators.required],
    ErrorMessages: {
      required: 'Please select at least one manufacturer.'
    },
    value: { 
      items: [
        { id: 2, name: 'AMERICAN LICORICE CO' },
        { id: 6, name: 'DANONE U.S., LLC' },
        { id: 12, name: 'GENERAL MILLS INC' }
      ], 
      primary: { id: 6, name: 'DANONE U.S., LLC' }
    }
  }
};

// Create models for basic form components
const basicFormComponentsModel = {
  firstName: {
    Validators: [Validators.required, Validators.minLength(2)],
    ErrorMessages: {
      required: 'First name is required.',
      minlength: 'First name must be at least 2 characters.'
    },
    value: 'John'
  },
  lastName: {
    Validators: [Validators.required, Validators.minLength(2)],
    ErrorMessages: {
      required: 'Last name is required.',
      minlength: 'Last name must be at least 2 characters.'
    },
    value: 'Doe'
  },
  email: {
    Validators: [Validators.required, Validators.email],
    ErrorMessages: {
      required: 'Email is required.',
      email: 'Please enter a valid email address.'
    },
    value: 'john.doe@example.com'
  },
  country: {
    Validators: [Validators.required],
    ErrorMessages: {
      required: 'Please select a country.'
    },
    value: { id: 1, name: 'United States' }
  },
  agreeToTerms: {
    Validators: [Validators.requiredTrue],
    ErrorMessages: {
      required: 'You must agree to the terms and conditions.'
    },
    value: true
  },
  gender: {
    Validators: [Validators.required],
    ErrorMessages: {
      required: 'Please select a gender.'
    },
    value: 'male'
  }
};

@Component({
  selector: 'app-unsecured-test',
  imports: [
    ReactiveFormsModule,
    MultiSelectComponent,
    PickListComponent,
    InputComponent,
    SelectComponent,
    CheckboxComponent,
    RadioComponent,
    MatCardModule,
    MatButtonModule,
    MatTabsModule,
    JsonPipe
  ],
  templateUrl: './unsecured-test.component.html',
  styleUrl: './unsecured-test.component.scss'
})
export class UnsecuredTestComponent {
  formHandlerService = inject(FormHandlingService);
  
  form!: FormGroup;
  multiSelectTestModel = multiSelectTestModel;
  pickListTestModel = pickListTestModel;
  basicFormComponentsModel = basicFormComponentsModel;
  
  // Sample options for multi-select testing
  sampleOptions = [
    { id: 1, name: 'JavaScript Framework' },
    { id: 2, name: 'Angular Material' },
    { id: 3, name: 'TypeScript' },
    { id: 4, name: 'RxJS Observables' },
    { id: 5, name: 'Bootstrap Grid' },
    { id: 6, name: 'Form Validation' },
    { id: 7, name: 'HTTP Client' },
    { id: 8, name: 'Routing Guards' }
  ];

  // Sample manufacturers for pick-list testing
  sampleManufacturers = [
    { id: 1, name: 'THERMO SERV' },
    { id: 2, name: 'AMERICAN LICORICE CO' },
    { id: 3, name: 'HORMEL FINANCIAL SERVICES - DON MIGUEL' },
    { id: 4, name: 'NEMO\'S BAKERY' },
    { id: 5, name: 'BADGER POPCORN' },
    { id: 6, name: 'DANONE U.S., LLC' },
    { id: 7, name: 'BERRY PLASTICS CORP' },
    { id: 8, name: 'BEST MAID COOKIE COMPANY' },
    { id: 9, name: 'KRAFT HEINZ COMPANY' },
    { id: 10, name: 'PEPSI CO BEVERAGES' },
    { id: 11, name: 'COCA COLA BOTTLING' },
    { id: 12, name: 'GENERAL MILLS INC' },
    { id: 13, name: 'KELLOGG COMPANY' },
    { id: 14, name: 'NESTLE USA INC' },
    { id: 15, name: 'UNILEVER UNITED STATES' },
    { id: 16, name: 'PROCTER & GAMBLE CO' },
    { id: 17, name: 'JOHNSON & JOHNSON' },
    { id: 18, name: 'MONDELEZ INTERNATIONAL' },
    { id: 19, name: 'CAMPBELL SOUP COMPANY' },
    { id: 20, name: 'MARS INCORPORATED' }
  ];

  // Sample countries for select testing
  sampleCountries = [
    { id: 1, name: 'United States' },
    { id: 2, name: 'Canada' },
    { id: 3, name: 'United Kingdom' },
    { id: 4, name: 'Germany' },
    { id: 5, name: 'France' },
    { id: 6, name: 'Japan' },
    { id: 7, name: 'Australia' },
    { id: 8, name: 'Brazil' }
  ];

  // Sample gender options for radio testing
  genderOptions = [
    { id: 'male', name: 'Male' },
    { id: 'female', name: 'Female' },
  ];

  constructor() {
    this.form = this.formHandlerService.createFormGroup({
      ...this.multiSelectTestModel,
      ...this.pickListTestModel,
      ...this.basicFormComponentsModel
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    console.log('Form values:', this.form.value);
    alert(`Form values: ${JSON.stringify(this.form.value, null, 2)}`);
  }

  onReset() {
    this.form.reset();
  }
}
