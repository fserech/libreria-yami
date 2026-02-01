import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersClientSelectComponent } from './orders-client-select.component';

describe('OrdersClientSelectComponent', () => {
  let component: OrdersClientSelectComponent;
  let fixture: ComponentFixture<OrdersClientSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersClientSelectComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrdersClientSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
