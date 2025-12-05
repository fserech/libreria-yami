import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientsGridMainComponent } from './clients-grid-main.component';

describe('ClientsGridMainComponent', () => {
  let component: ClientsGridMainComponent;
  let fixture: ComponentFixture<ClientsGridMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientsGridMainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClientsGridMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
