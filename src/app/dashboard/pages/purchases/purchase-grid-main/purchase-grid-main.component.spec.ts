import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchaseGridMainComponent } from './purchase-grid-main.component';


describe('PurchaseGridMainComponent', () => {
  let component: PurchaseGridMainComponent;
  let fixture: ComponentFixture<PurchaseGridMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseGridMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseGridMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
