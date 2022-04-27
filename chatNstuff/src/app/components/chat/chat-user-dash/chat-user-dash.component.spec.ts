import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatUserDashComponent } from './chat-user-dash.component';

describe('ChatUserDashComponent', () => {
  let component: ChatUserDashComponent;
  let fixture: ComponentFixture<ChatUserDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChatUserDashComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatUserDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
