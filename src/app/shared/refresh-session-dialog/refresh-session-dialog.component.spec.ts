import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefreshSessionDialogComponent } from './refresh-session-dialog.component';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('RefreshSessionDialogComponent', () => {
  let component: RefreshSessionDialogComponent;
  let fixture: ComponentFixture<RefreshSessionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RefreshSessionDialogComponent,
        HttpClientTestingModule
      ],
      providers: [
        { provide: MatDialog, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RefreshSessionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
