import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UeComponent } from './ue.component';

describe('UeComponent', () => {
  let component: UeComponent;
  let fixture: ComponentFixture<UeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
