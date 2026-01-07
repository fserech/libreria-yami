import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsGridMainComponent } from './products-grid-main.component';

describe('ProductsGridMainComponent', () => {
  let component: ProductsGridMainComponent;
  let fixture: ComponentFixture<ProductsGridMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsGridMainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductsGridMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
