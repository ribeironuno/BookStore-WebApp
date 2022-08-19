import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropMenuSaleComponent } from './drop-menu-sale.component';

describe('DropMenuComponent', () => {
  let component: DropMenuSaleComponent;
  let fixture: ComponentFixture<DropMenuSaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DropMenuSaleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropMenuSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
