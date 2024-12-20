import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApiTokenManagementComponent } from './api-token-management.component';

describe('ApiTokenManagementComponent', () => {
  let component: ApiTokenManagementComponent;
  let fixture: ComponentFixture<ApiTokenManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApiTokenManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApiTokenManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
