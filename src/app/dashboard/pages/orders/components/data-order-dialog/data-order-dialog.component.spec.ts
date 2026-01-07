import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataOrderDialogComponent } from './data-order-dialog.component';

describe('DataOrderDialogComponent', () => {
  let component: DataOrderDialogComponent;
  let fixture: ComponentFixture<DataOrderDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataOrderDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DataOrderDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
