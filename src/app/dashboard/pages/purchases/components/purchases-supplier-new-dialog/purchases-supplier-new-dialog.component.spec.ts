import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasesSupplierNewDialogComponent } from './purchases-supplier-new-dialog.component';

describe('PurchasesSupplierNewDialogComponent', () => {
  let component: PurchasesSupplierNewDialogComponent;
  let fixture: ComponentFixture<PurchasesSupplierNewDialogComponent>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasesSupplierNewDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasesSupplierNewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
