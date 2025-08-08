import { ComponentFixture, TestBed } from '@angular/core/testing';

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
    fixture.componentRef.setInput('dataSource', []);
    fixture.componentRef.setInput('displayedColumns', ['col1']);
    fixture.componentRef.setInput('columnSettings', [{ key: 'col1', label: 'Column 1' }]);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
