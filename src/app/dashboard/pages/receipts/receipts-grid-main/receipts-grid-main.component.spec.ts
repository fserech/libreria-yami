import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptsGridMainComponent } from './receipts-grid-main.component';

describe('ReceiptsGridMainComponent', () => {
  let component: ReceiptsGridMainComponent;
  let fixture: ComponentFixture<ReceiptsGridMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceiptsGridMainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReceiptsGridMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
