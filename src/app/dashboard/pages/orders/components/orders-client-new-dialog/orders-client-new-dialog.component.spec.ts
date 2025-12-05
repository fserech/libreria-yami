import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersClientNewDialogComponent } from './orders-client-new-dialog.component';

describe('OrdersClientNewDialogComponent', () => {
  let component: OrdersClientNewDialogComponent;
  let fixture: ComponentFixture<OrdersClientNewDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersClientNewDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrdersClientNewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
