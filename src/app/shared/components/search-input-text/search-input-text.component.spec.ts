import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchInputTextComponent } from './search-input-text.component';

describe('SearchInputTextComponent', () => {
  let component: SearchInputTextComponent;
  let fixture: ComponentFixture<SearchInputTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchInputTextComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchInputTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
