import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockEntryExitComponent } from './stock-entry-exit.component';

describe('StockEntryExitComponent', () => {
  let component: StockEntryExitComponent;
  let fixture: ComponentFixture<StockEntryExitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockEntryExitComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StockEntryExitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
