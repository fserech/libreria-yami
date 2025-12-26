import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchasesProductsSelectComponent } from './purchases-products-select.component';


describe('PurchasesProductsSelectComponent', () => {
  let component: PurchasesProductsSelectComponent;
  let fixture: ComponentFixture<PurchasesProductsSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasesProductsSelectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasesProductsSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
