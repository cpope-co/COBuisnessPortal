import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, provideHttpClientTesting } from '@angular/common/http/testing'; // Import HttpClientTestingModule

import { SetPasswordComponent } from './set-password.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

describe('SetPasswordComponent', () => {
  let component: SetPasswordComponent;
  let fixture: ComponentFixture<SetPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SetPasswordComponent,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        NgxMaskDirective
      ],
      providers: [
        provideNgxMask()
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
