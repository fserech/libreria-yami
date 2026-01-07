import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersProductsSelectComponent } from './orders-products-select.component';

describe('OrdersProductsSelectComponent', () => {
  let component: OrdersProductsSelectComponent;
  let fixture: ComponentFixture<OrdersProductsSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersProductsSelectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrdersProductsSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
