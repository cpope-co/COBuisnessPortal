import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, NgControl, ReactiveFormsModule } from '@angular/forms';

import { RadioComponent } from './radio.component';

describe('RadioComponent', () => {
  let component: RadioComponent;
  let fixture: ComponentFixture<RadioComponent>;

  beforeEach(async () => {
    const formGroup = new FormGroup({
      radio: new FormControl('')
    });

    await TestBed.configureTestingModule({
      imports: [RadioComponent, ReactiveFormsModule],
      providers: [
        { provide: NgControl, useValue: { control: formGroup.get('radio') } }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RadioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
