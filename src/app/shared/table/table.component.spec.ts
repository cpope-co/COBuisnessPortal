import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableDataSource } from '@angular/material/table';

import { TableComponent } from './table.component';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    
    // Set required inputs
    const dataSource = new MatTableDataSource([
      { col1: 'value1', col2: 'value2' },
      { col1: 'value3', col2: 'value4' }
    ]);
    fixture.componentRef.setInput('dataSource', dataSource);
    fixture.componentRef.setInput('displayedColumns', ['col1', 'col2']);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
