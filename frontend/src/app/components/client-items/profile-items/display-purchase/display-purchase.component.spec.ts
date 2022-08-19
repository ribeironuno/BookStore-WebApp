import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayPurchaseComponent } from './display-purchase.component';

describe('DisplayPurchaseComponent', () => {
  let component: DisplayPurchaseComponent;
  let fixture: ComponentFixture<DisplayPurchaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisplayPurchaseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayPurchaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
