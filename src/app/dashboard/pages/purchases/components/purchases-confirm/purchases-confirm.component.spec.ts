import { ComponentFixture, TestBed } from '@angular/core/testing';
import {  PurchasesConfirmComponent } from './purchases-confirm.component';


describe('PurchasesConfirmComponent', () => {
  let component: PurchasesConfirmComponent;
  let fixture: ComponentFixture<PurchasesConfirmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasesConfirmComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasesConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
