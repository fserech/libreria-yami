import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersFiltersDialogComponent } from './orders-filters-dialog.component';

describe('OrdersFiltersDialogComponent', () => {
  let component: OrdersFiltersDialogComponent;
  let fixture: ComponentFixture<OrdersFiltersDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersFiltersDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrdersFiltersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
