import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyComponent } from './verify.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('VerifyComponent', () => {
  let component: VerifyComponent;
  let fixture: ComponentFixture<VerifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerifyComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' }), // Mock route parameters
            snapshot: {
              paramMap: {
                get: (key: string) => '123' // Mock snapshot paramMap
              }
            }
          }
        }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
