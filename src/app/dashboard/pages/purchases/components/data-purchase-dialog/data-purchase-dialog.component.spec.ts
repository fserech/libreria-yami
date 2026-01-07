import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataPurchaseDialogComponent, } from './data-purchase-dialog.component';

describe('DataPurchaseDialogComponent', () => {
  let component: DataPurchaseDialogComponent;
  let fixture: ComponentFixture<DataPurchaseDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataPurchaseDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataPurchaseDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
