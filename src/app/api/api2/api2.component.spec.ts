import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Api2Component } from './api2.component';

describe('Api2Component', () => {
  let component: Api2Component;
  let fixture: ComponentFixture<Api2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Api2Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Api2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
