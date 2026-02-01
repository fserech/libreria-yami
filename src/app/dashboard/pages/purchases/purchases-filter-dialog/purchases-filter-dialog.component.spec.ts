import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasesFilterDialogComponent } from './purchases-filter-dialog.component';

describe('PurchasesFilterDialogComponent', () => {
  let component: PurchasesFilterDialogComponent;
  let fixture: ComponentFixture<PurchasesFilterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasesFilterDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasesFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
