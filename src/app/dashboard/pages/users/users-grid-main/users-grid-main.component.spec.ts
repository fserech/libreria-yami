import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersGridMainComponent } from './users-grid-main.component';

describe('UsersGridMainComponent', () => {
  let component: UsersGridMainComponent;
  let fixture: ComponentFixture<UsersGridMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersGridMainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UsersGridMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
