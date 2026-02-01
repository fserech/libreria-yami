import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsFiltersDialogComponent } from './clients-filters-dialog.component';

describe('ClientsFiltersDialogComponent', () => {
  let component: ClientsFiltersDialogComponent;
  let fixture: ComponentFixture<ClientsFiltersDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsFiltersDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClientsFiltersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
