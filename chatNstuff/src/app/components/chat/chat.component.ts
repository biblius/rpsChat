import { RockPaperScissors } from '../../../../../backend/lib/rps';
import { ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { MessageService } from 'src/app/services/message.service';
import { Message, Room, ChatUser } from '../../../../../backend/lib/interfaces';
import { state, trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  animations: [
    trigger('toggleBox', [
      transition(':enter', [
        style({
          width: '0%'
        }),
        animate("100ms 100ms", style({ width: '100%' }))
      ]),
      transition(':leave', [
        style({
          width: '100%'
        }),
        animate("100ms 100ms", style({ width: '0%' }))
      ]),
    ]),

    trigger('fadeInOut', [
      transition(':enter', [
        style({
          opacity: '0%'
        }),
        animate("100ms 100ms", style({ opacity: '100%' }))
      ]),
      transition(':leave', [
        style({
          opacity: '100%'
        }),
        animate("100ms", style({ opacity: '0%' }))
      ]),
    ])
  ]
})


export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messageList') messageList!: ElementRef;
  @ViewChild('musicPlayer') musicPlayer!: ElementRef;

  messageContent!: string;
  newRoomName!: string;

  activeUser!: ChatUser
  challengedUsers: string[] = [];

  messages: Message[] = [];
  privateMessageSubscription!: Subscription;
  roomMessageSubscription!: Subscription;

  users!: ChatUser[];
  chatUsersSubscription!: Subscription;
  selected?: ChatUser | Room;
  selectedRPS?: RockPaperScissors;

  rooms!: Room[];
  roomsSub!: Subscription;

  rpsRooms!: RockPaperScissors[];
  rpsRoomsSub!: Subscription;
  userIsInRoom: boolean = false;

  showChat: boolean = false;
  showGame: boolean = false;
  showRoomForm: boolean = false;

  constructor(private messageService: MessageService) { }


  ngOnInit(): void {
    console.log(this.messageList)

    this.chatUsersSubscription = this.messageService.usersSubject.subscribe(users => {
      this.users = users;
      for (let i = 0; i < users.length; i++) {
        if (users[i].active) {
          this.activeUser = users[i];
          break;
        }
      }
    })

    this.privateMessageSubscription = this.messageService.privateMessagesSubject.subscribe(messages => {
      if (this.selected) {
        if (this.isInstanceOfChatUser(this.selected)) {
          this.messages = messages;
          if (this.messageList)
            this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight
        }
      }
    })

    this.roomsSub = this.messageService.publicRoomsSubject.subscribe((rooms) => {
      this.rooms = rooms;
      if (this.selected && this.isInstanceOfRoom(this.selected)) {
        for (let i = 0; i < rooms.length; i++) {
          const { id } = rooms[i];
          if (id == this.selected.id) {
            this.selected = rooms[i];
          }
        }
      }
    })

    this.roomMessageSubscription = this.messageService.roomMessagesSubject.subscribe({
      next: (messages) => {
        if (this.selected) {
          if (this.isInstanceOfRoom(this.selected)) {
            this.messages = messages;
          }
        }
      },
      complete: () => {
        if (this.messageList)
          this.messageList.nativeElement.scrollTop = this.messageList.nativeElement.scrollHeight
      }
    })

    this.rpsRoomsSub = this.messageService.rpsRoomsSubject.subscribe(rooms => {
      this.rpsRooms = rooms;
      if (this.selectedRPS) {
        for (let i = 0; i < rooms.length; i++) {
          const { _id } = rooms[i];
          if (_id == this.selectedRPS._id) {
            this.selectedRPS = rooms[i];
          }
        }
      }
    })
  }

  ngAfterViewInit() {
    console.log(this.messageList)
  }

  isInstanceOfChatUser(object: Object): object is ChatUser {
    return 'userID' in object;
  }
  isInstanceOfRoom(object: Object): object is Room {
    return 'users' in object
  }
  isInstanceOfRPS(object: Object): object is RockPaperScissors {
    return '_challenged' in object;
  }

  toggleRoomForm(): void {
    this.showRoomForm = !this.showRoomForm;
  }

  toggleSelected(selected: ChatUser | Room | RockPaperScissors) {
    if (this.selected == selected || this.selectedRPS == selected) {
      if (this.isInstanceOfRPS(selected)) {
        delete this.selectedRPS;
        this.showGame = false;
      } else {
        delete this.selected;
        this.messageService.selectUser(undefined);
        this.messages = [];
        this.showChat = false;
      }
      return;
    }

    if (this.isInstanceOfChatUser(selected)) {
      this.selected = selected;
      this.removeMessageNotification(selected);
      this.showChat = true;
      this.messageService.selectUser(selected);
      this.displayMessages();
      return;
    }

    if (this.isInstanceOfRoom(selected)) {
      this.messageService.selectUser(undefined)
      this.selected = selected;
      this.showChat = true;
      if (selected.users.find(({ userID }) => userID == this.activeUser.userID)) {
        this.displayPublicMessages(selected.id)
      }
      return;
    }

    if (this.isInstanceOfRPS(selected)) {
      this.selectedRPS = undefined;
      setTimeout(() => {
        this.selectedRPS = selected;
        this.showGame = true;
        return;
      })
    }
  }

  sendChallenge() {
    if (this.selected && this.isInstanceOfChatUser(this.selected)) {
      if (this.selected != this.activeUser) {
        this.messageService.sendChallenge(this.selected)
      }
    }
  }

  challengeExists(userId: string): boolean {
    for (let i = 0; i < this.rpsRooms.length; i++) {
      const { _challenger, _challenged } = this.rpsRooms[i];
      if ((_challenger.userID == this.activeUser.userID && _challenged.userID == userId) ||
        (_challenger.userID == userId && _challenged.userID == this.activeUser.userID)) {
        return true;
      }
    }
    return false;
  }

  /*********************ROOMS********************/
  createRoom() {
    if (this.newRoomName) {
      this.showRoomForm = false;
      this.messageService.createPublicRoom(this.newRoomName);
    }
    this.newRoomName = '';
  }

  joinRoom(room: Room) {
    if (!this.isInRoom(room))
      this.messageService.joinRoom(room.id);
  }

  leaveRoom(room: Room) {
    if (this.selected == room) {
      this.selected = undefined;
    }
    this.messageService.leaveRoom(room.id)
  }

  isInRoom(room: Room): boolean {
    if (room.users.find(({ userID }) => userID == this.activeUser.userID)) {
      return this.userIsInRoom = true;
    }
    return this.userIsInRoom = false;
  }

  /*************MESSAGES*********************/
  sendMessage() {
    //PRIVATE MESSAGE
    if (this.selected) {

      console.log('is room', this.isInstanceOfRoom(this.selected))
      console.log('is user ', this.isInstanceOfChatUser(this.selected))

      if (this.isInstanceOfChatUser(this.selected)) {
        const message: Message = {
          id: `${(+new Date).toString(36)}-${this.activeUser.userID}-${this.selected.userID}`,
          senderID: this.activeUser.userID,
          senderUsername: this.activeUser.username,
          receiverID: this.selected.userID,
          content: this.messageContent,
          read: false
        }
        this.messageService.sendMessage(message);
      }

      if (this.isInstanceOfRoom(this.selected)) {
        const message: Message = {
          id: `${(+new Date).toString(36)}-${this.activeUser.userID}-${this.selected.id}`,
          senderID: this.activeUser.userID,
          senderUsername: this.activeUser.username,
          content: this.messageContent
        }
        this.messageService.sendPublicMessage(this.selected.id, message)
      }
      this.messageContent = '';
    }
  }

  displayMessages() {
    this.messageService.updatePrivateMessages();
  }

  displayPublicMessages(roomId: string) {
    this.messageService.updateRoomMessages(roomId);
  }

  removeMessageNotification(user: ChatUser) {
    user.hasNewMessages = false;
  }

  generateEpicWord(): string {
    const epicWords = ['Deadly Dispute', 'Supreme Battle', 'Ultimate Showdown', 'Quest for Glory']
    let idx = Math.floor(Math.random() * (epicWords.length - 1));
    return epicWords[idx];
  }

  ngOnDestroy(): void {
    this.messageService.disconnect();
  }

}


