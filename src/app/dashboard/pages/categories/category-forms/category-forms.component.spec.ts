import { ComponentFixture, TestBed } from '@angular/core/testing';
import CategoryFormsComponent from './category-forms.component';



describe('CategoryFormsComponent', () => {
  let component: CategoryFormsComponent;
  let fixture: ComponentFixture<CategoryFormsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryFormsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
