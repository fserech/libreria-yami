import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsFiltersDialogComponent } from './products-filters-dialog.component';

describe('ProductsFiltersDialogComponent', () => {
  let component: ProductsFiltersDialogComponent;
  let fixture: ComponentFixture<ProductsFiltersDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsFiltersDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductsFiltersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
