import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsGridMainComponent } from './reports-grid-main.component';

describe('ReportsGridMainComponent', () => {
  let component: ReportsGridMainComponent;
  let fixture: ComponentFixture<ReportsGridMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsGridMainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReportsGridMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
