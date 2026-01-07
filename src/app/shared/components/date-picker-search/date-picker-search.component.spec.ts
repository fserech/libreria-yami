import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatePickerSearchComponent } from './date-picker-search.component';

describe('DatePickerSearchComponent', () => {
  let component: DatePickerSearchComponent;
  let fixture: ComponentFixture<DatePickerSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatePickerSearchComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DatePickerSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
