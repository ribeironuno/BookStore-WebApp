import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorAfterPaymentComponent } from './error-after-payment.component';

describe('ErrorAfterPaymentComponent', () => {
  let component: ErrorAfterPaymentComponent;
  let fixture: ComponentFixture<ErrorAfterPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErrorAfterPaymentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorAfterPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
