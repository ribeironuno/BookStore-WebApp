import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestSaleComponent } from './request-sale.component';

describe('RequestSaleComponent', () => {
  let component: RequestSaleComponent;
  let fixture: ComponentFixture<RequestSaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestSaleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequestSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
