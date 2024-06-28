import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoseChangesDialogComponent } from './lose-changes-dialog.component';

describe('LoseChangesDialogComponent', () => {
  let component: LoseChangesDialogComponent;
  let fixture: ComponentFixture<LoseChangesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoseChangesDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoseChangesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
