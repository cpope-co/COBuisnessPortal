import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormControl } from '@angular/forms';

import { PickListComponent } from './pick-list.component';

describe('PickListComponent', () => {
  let component: PickListComponent;
  let fixture: ComponentFixture<PickListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PickListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PickListComponent);
    component = fixture.componentInstance;
    
    // Set required inputs
    fixture.componentRef.setInput('sourceOptions', []);
    fixture.componentRef.setInput('sourceLabel', 'Source Items');
    fixture.componentRef.setInput('targetLabel', 'Selected Items');
    fixture.componentRef.setInput('formGroup', new FormGroup({
      testControl: new FormControl([])
    }));
    fixture.componentRef.setInput('formControlName', 'testControl');
    fixture.componentRef.setInput('model', {});
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
