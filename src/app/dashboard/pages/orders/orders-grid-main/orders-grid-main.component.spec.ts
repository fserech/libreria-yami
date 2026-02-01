import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersGridMainComponent } from './orders-grid-main.component';

describe('OrdersGridMainComponent', () => {
  let component: OrdersGridMainComponent;
  let fixture: ComponentFixture<OrdersGridMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersGridMainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrdersGridMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
