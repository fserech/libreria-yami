import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasesProductsSelectListDialogComponent } from './purchases-products-select-list-dialog.component';

describe('PurchasesProductsSelectListDialogComponent', () => {
  let component: PurchasesProductsSelectListDialogComponent;
  let fixture: ComponentFixture<PurchasesProductsSelectListDialogComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasesProductsSelectListDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasesProductsSelectListDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
