import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Api8Component } from './api8.component';

describe('Api8Component', () => {
  let component: Api8Component;
  let fixture: ComponentFixture<Api8Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Api8Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Api8Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
