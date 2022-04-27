import { Component, Input, OnInit } from '@angular/core';
import { UsersService } from 'src/app/services/users.service';
import { MessageService } from 'src/app/services/message.service';
import { ChatUser } from '../../../../../../backend/lib/interfaces';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-user-dash',
  templateUrl: './chat-user-dash.component.html',
  styleUrls: ['./chat-user-dash.component.css']
})
export class ChatUserDashComponent implements OnInit {
  @Input() user!: ChatUser;
  username!: string 

  constructor() { }

  ngOnInit(): void { 
    this.username = this.user.username;
  }

}
