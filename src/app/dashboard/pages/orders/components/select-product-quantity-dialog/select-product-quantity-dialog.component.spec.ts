import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectProductQuantityDialogComponent } from './select-product-quantity-dialog.component';

describe('SelectProductQuantityDialogComponent', () => {
  let component: SelectProductQuantityDialogComponent;
  let fixture: ComponentFixture<SelectProductQuantityDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectProductQuantityDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectProductQuantityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
