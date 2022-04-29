import { User } from './../../User';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-user-dash',
  templateUrl: './user-dash.component.html',
  styleUrls: ['./user-dash.component.css']
})
export class UserDashComponent implements OnInit {
  @Input() user!: User;
  @Output() onDeleteUser: EventEmitter<User> = new EventEmitter;

  constructor() { }

  ngOnInit(): void {
  }

  onDelete(user: User) {
    console.log(user)
    this.onDeleteUser.emit(user)
  }
}
