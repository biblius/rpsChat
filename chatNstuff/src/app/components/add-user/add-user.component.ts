import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { User } from 'src/app/User';
import { UiService } from 'src/app/services/ui.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  @Output() onSubmitCredentials: EventEmitter<User> = new EventEmitter;

  username!: string;
  password!: string;
  subscription!: Subscription;

  constructor() {  }

  ngOnInit(): void { }

  onSubmit() {
    if (!this.username || !this.password) {
      alert('Cannot create user without username/password');
      return;
    }
    const newUser = {
      username: this.username,
      password: this.password
    }

    this.onSubmitCredentials.emit(newUser)

    this.username = '';
    this.password = '';
  }

}
