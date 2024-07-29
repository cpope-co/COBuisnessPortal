import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeShowComponent } from './trade-show.component';

describe('TradeShowComponent', () => {
  let component: TradeShowComponent;
  let fixture: ComponentFixture<TradeShowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradeShowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TradeShowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
