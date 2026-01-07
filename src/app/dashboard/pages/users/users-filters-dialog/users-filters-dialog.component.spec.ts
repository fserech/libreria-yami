import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersFiltersDialogComponent } from './users-filters-dialog.component';

describe('UsersFiltersDialogComponent', () => {
  let component: UsersFiltersDialogComponent;
  let fixture: ComponentFixture<UsersFiltersDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersFiltersDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UsersFiltersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
