import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuCustomizerComponent } from './menu-customizer.component';

describe('MenuCustomizerComponent', () => {
  let component: MenuCustomizerComponent;
  let fixture: ComponentFixture<MenuCustomizerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuCustomizerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MenuCustomizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
