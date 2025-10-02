import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNgxMask } from 'ngx-mask';

import { TableComponent } from './table.component';

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent],
      providers: [
        provideNgxMask()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    
    // Set required inputs - use data and columns instead of dataSource and displayedColumns
    const testData = [
      { col1: 'value1', col2: 'value2' },
      { col1: 'value3', col2: 'value4' }
    ];
    const testColumns = [
      { column: 'col1', label: 'Column 1' },
      { column: 'col2', label: 'Column 2' }
    ];
    
    fixture.componentRef.setInput('data', testData);
    fixture.componentRef.setInput('columns', testColumns);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
