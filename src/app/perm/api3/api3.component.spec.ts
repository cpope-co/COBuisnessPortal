import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Api3Component } from './api3.component';

describe('Api3Component', () => {
  let component: Api3Component;
  let fixture: ComponentFixture<Api3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Api3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Api3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
