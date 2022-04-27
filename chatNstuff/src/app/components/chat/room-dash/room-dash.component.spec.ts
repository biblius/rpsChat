import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomDashComponent } from './room-dash.component';

describe('RoomDashComponent', () => {
  let component: RoomDashComponent;
  let fixture: ComponentFixture<RoomDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RoomDashComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
