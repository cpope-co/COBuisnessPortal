import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoseChangesDialogComponent } from './lose-changes-dialog.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('LoseChangesDialogComponent', () => {
  let component: LoseChangesDialogComponent;
  let fixture: ComponentFixture<LoseChangesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoseChangesDialogComponent,
        HttpClientTestingModule
      ],
      providers: [
        { provide: MatDialog, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} }
      ]
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
