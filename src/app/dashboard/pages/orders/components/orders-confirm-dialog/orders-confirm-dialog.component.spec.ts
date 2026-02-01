import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersConfirmDialogComponent } from './orders-confirm-dialog.component';

describe('OrdersConfirmDialogComponent', () => {
  let component: OrdersConfirmDialogComponent;
  let fixture: ComponentFixture<OrdersConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersConfirmDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrdersConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
