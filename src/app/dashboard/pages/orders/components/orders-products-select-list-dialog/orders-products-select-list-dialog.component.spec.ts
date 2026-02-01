import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersProductsSelectListDialogComponent } from './orders-products-select-list-dialog.component';

describe('OrdersProductsSelectListDialogComponent', () => {
  let component: OrdersProductsSelectListDialogComponent;
  let fixture: ComponentFixture<OrdersProductsSelectListDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersProductsSelectListDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrdersProductsSelectListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
