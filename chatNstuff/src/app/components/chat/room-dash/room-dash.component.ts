import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Room, ChatUser } from '../../../../../../backend/lib/interfaces';

@Component({
  selector: 'app-room-dash',
  templateUrl: './room-dash.component.html',
  styleUrls: ['./room-dash.component.css']
})
export class RoomDashComponent implements OnInit {
  @Input() room!: Room;
  @Input() activeUser!: ChatUser
  @Output() onJoinRoom: EventEmitter<void> = new EventEmitter();
  @Output() onLeaveRoom: EventEmitter<void> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    console.log(this.activeUser)
  }

  joinRoom() {
    this.onJoinRoom.emit()
  }
  leaveRoom() {
    this.onLeaveRoom.emit()
  }
}
