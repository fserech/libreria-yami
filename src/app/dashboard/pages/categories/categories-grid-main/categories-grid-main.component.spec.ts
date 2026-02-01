import { ComponentFixture, TestBed } from '@angular/core/testing';
import {CategoriesGridMainComponent} from './categories-grid-main.component';


describe('CategoriesGridMainComponent', () => {
  let component: CategoriesGridMainComponent;
  let fixture: ComponentFixture<CategoriesGridMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoriesGridMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoriesGridMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
