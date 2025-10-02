import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNgxMask } from 'ngx-mask';

import { UnsecuredTestComponent } from './unsecured-test.component';

describe('UnsecuredTestComponent', () => {
  let component: UnsecuredTestComponent;
  let fixture: ComponentFixture<UnsecuredTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnsecuredTestComponent],
      providers: [
        provideNgxMask()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnsecuredTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
