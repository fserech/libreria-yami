import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseFormsComponent } from './purchase-forms.component';

describe('PurchaseFormsComponent', () => {
  let component: PurchaseFormsComponent;
  let fixture: ComponentFixture<PurchaseFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseFormsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
