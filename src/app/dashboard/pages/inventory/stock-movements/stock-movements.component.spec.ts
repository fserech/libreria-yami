import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockMovementsComponent } from './stock-movements.component';

describe('StockMovementsComponent', () => {
  let component: StockMovementsComponent;
  let fixture: ComponentFixture<StockMovementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockMovementsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StockMovementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
