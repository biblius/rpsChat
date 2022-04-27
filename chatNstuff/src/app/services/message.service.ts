import { RockPaperScissors } from '../../../../backend/lib/rps';
import { Message, ChatUser, Room } from '../../../../backend/lib/interfaces';
import { UsersService } from './users.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { Injectable, OnDestroy } from "@angular/core";
import { io, Socket } from "socket.io-client";
@Injectable({
  providedIn: 'root'
})

export class MessageService implements OnDestroy {
  private socket: Socket;

  messages: Message[] = [];
  activeUserId!: string;

  privateMessages: Message[] = [];
  privateMessagesSubject = new Subject<Message[]>();

  users: ChatUser[] = []
  usersSubject = new Subject<ChatUser[]>();

  selectedUser!: ChatUser | undefined;

  publicRooms: Room[] = [];
  publicRoomsSubject = new BehaviorSubject<Room[]>(this.publicRooms);
  roomMessages: Map<string, Message[]> = new Map();

  roomMessagesSubject = new Subject<Message[]>();
  private rpsRooms: RockPaperScissors[] = [];
  rpsRoomsSubject = new BehaviorSubject<RockPaperScissors[]>(this.rpsRooms);

  resetSubject = new Subject<RockPaperScissors>();
  winnerSubject = new Subject<string | undefined>();

  constructor(private usersService: UsersService) {
    this.socket = io("http://192.168.0.11:5000", { autoConnect: false });
    const sessionID = localStorage.getItem("sessionID");

    //set the socket auth handshake for the username and session, then connect
    this.usersService.getActiveUser().subscribe({
      next: (user) => {
        if (sessionID) {
          this.socket.auth = { sessionID: sessionID, username: user.username };
        } else {
          this.socket.auth = { username: user.username };
        }
      },
      error: (error) => console.log(error),
      complete: () => {
        this.socket.connect();
      }
    });

    //if the username property of socket.auth.handshake doesn't exist
    this.socket.on("connect_error", (err) => {
      if (err.message) {
        console.log('User is not logged in')
        this.socket.off('connect_error')
      }
    });

    /**********************************ON CONNECTION********************/
    this.socket.on("session", ({ sessionID, session }) => {
      // attach the session ID to the next reconnection attempts
      this.socket.auth = { sessionID: sessionID };
      // store it in the localStorage
      localStorage.setItem("sessionID", sessionID);
      this.activeUserId = session.userID
    });

    this.socket.on("users", (users: ChatUser[]) => {
      users.forEach((user) => {
        for (let i = 0; i < this.users.length; i++) {
          const existingUser = this.users[i];
          if (existingUser.userID === user.userID) {
            existingUser.connected = user.connected;
            return;
          }
        }
        user.active = user.userID === this.activeUserId
        this.users.push(user);
      })
      this.users.sort((a, b) => {
        if (a.active) return -1;
        if (b.active) return 1;
        if (a.username < b.username) return -1
        return a.username > b.username ? 1 : 0;
      })
      this.usersSubject.next(this.users)
    });

    this.socket.on('messages', (messages) => {
      this.messages = messages;
      this.messages.forEach(({ senderID, read }) => {
        if (read == false) {
          for (let i = 0; i < this.users.length; i++) {
            const { userID } = this.users[i];
            if (userID == senderID && senderID != this.selectedUser?.userID && senderID != this.activeUserId) {
              this.users[i].hasNewMessages = true;
              break;
            }
          }
        }
      })
      this.updatePrivateMessages()
    });

    this.socket.on('rooms', (rooms: Room[]) => {
      this.publicRooms = rooms
      rooms.forEach(({ id, messages, users }) => {
        for (let i = 0; i < users.length; i++) {
          const { userID } = users[i];
          if (this.activeUserId == userID) {
            this.roomMessages.set(id, messages)
            break;
          }
        }

      })
      this.publicRoomsSubject.next(this.publicRooms)
    })

    /**********************************SOCKET LOGIC********************/

    /********* MESSAGES *************/
    this.socket.on("private message", (message: Message) => {
      for (let i = 0; i < this.users.length; i++) {
        const user = this.users[i];
        if (user.userID == message.senderID && user != this.selectedUser && !user.active) {
          user.hasNewMessages = true;
          this.usersSubject.next(this.users);
        }
      }
      if (message.senderID == this.selectedUser?.userID) {
        message.read = true;
        this.messages.push(message);
        this.socket.emit('update read', message);
        return;
      }
      this.messages.push(message);
      this.updatePrivateMessages();
    });

    this.socket.on('public message', ({ roomId, message }) => {
      this.roomMessages.has(roomId) ? this.roomMessages.get(roomId)!.push(message) : this.roomMessages.set(roomId, [message])
      this.roomMessagesSubject.next(this.roomMessages.get(roomId)!)
    })

    this.socket.on('room messages', ({ roomId, messages }) => {
      this.roomMessages.set(roomId, messages);
      this.roomMessagesSubject.next(this.roomMessages.get(roomId)!);
    })

    this.socket.on('update room', (room: Room) => {
      for (let i = 0; i < this.publicRooms.length; i++) {
        const { id } = this.publicRooms[i];
        if (id == room.id) {
          console.log(this.publicRooms)
          this.publicRooms[i] = room;
          break;
        }
      }
      this.publicRoomsSubject.next(this.publicRooms)
    })

    /************ USERS *************/
    this.socket.on('user connected', (user: ChatUser) => {
      for (let i = 0; i < this.users.length; i++) {
        if (user.userID === this.users[i].userID) {
          this.users[i].connected = true;
          this.usersSubject.next(this.users);
          return;
        }
      }
      this.users.push(user);
      this.usersSubject.next(this.users);
    })

    this.socket.on('user disconnected', (userID) => {
      this.users.forEach(existingUser => {
        if (userID === existingUser.userID) existingUser.connected = false;
      })
      this.usersSubject.next(this.users)
    })

    this.socket.on('delete outdated', (existingUserID) => {
      this.users.splice(this.users.findIndex(({ userID }) => existingUserID == userID), 1)
      this.usersSubject.next(this.users)
    })

    /************ RPS ********/

    this.socket.on('rps rooms', rpsRooms => {
      this.rpsRooms = rpsRooms;
      this.rpsRoomsSubject.next(this.rpsRooms);
    })

    this.socket.on('rps update', room => {
      console.log(room)
      for (let i = 0; i < this.rpsRooms.length; i++) {
        if (this.rpsRooms[i]._id == room._id) {
          this.rpsRooms[i] = room;
          this.rpsRoomsSubject.next(this.rpsRooms);
          break;
        }
      }
    })

    this.socket.on('rps reset', rps => {
      for (let i = 0; i < this.rpsRooms.length; i++) {
        if (this.rpsRooms[i]._id == rps._id) {
          this.rpsRooms[i] = rps;
          this.resetSubject.next(rps);
          this.rpsRoomsSubject.next(this.rpsRooms)
          break;
        }
      }
    })

    this.socket.on('resolve', (winnerUsername) => {
      console.log(winnerUsername)
      this.winnerSubject.next(winnerUsername);
    })
  }

  sendChallenge(challenged: ChatUser) {
    this.socket.emit('rps challenge', challenged);
  }

  acceptChallenge(challenger: ChatUser) {
    this.socket.emit('rps accept challenge', challenger)
  }

  toggleFastMode(gameId: string) {
    this.socket.emit('rps fast', gameId);
  }

  spectateGame(gameId: string) {
    this.socket.emit('rps spectate', gameId);
  }

  chooseRPS(choice: 'r' | 'p' | 's' | 'kn', roomId: string) {
    this.socket.emit('rps choose', { choice, roomId })
  }

  resetChoices(roomId: string) {
    this.socket.emit('rps reset', roomId)
  }

  createPublicRoom(roomId: string) {
    if (!this.publicRooms.find(({ id }) => roomId == id)) {
      this.socket.emit('create room', roomId)
    }
  }

  joinRoom(roomId: string) {
    for (let i = 0; i < this.publicRooms.length; i++) {
      const { id } = this.publicRooms[i];
      if (id == roomId) {
        this.socket.emit('join room', roomId)
        break;
      }
    }
  }

  leaveRoom(roomId: string) {
    this.socket.emit('leave room', roomId);
  }

  sendMessage(message: Message) {
    this.socket.emit('private message', message);
  }

  sendPublicMessage(roomId: string, message: Message) {
    this.socket.emit('public message', { roomId, message })
  }

  selectUser(user: ChatUser | undefined) {
    this.selectedUser = user;
    if (user && !user.active) {
      console.log(user)
      for (let i = 0; i < this.messages.length; i++) {
        const { senderID, senderUsername } = this.messages[i];
        if (senderID === this.selectedUser?.userID) {
          console.log(senderUsername)
          this.messages[i].read = true;
          this.socket.emit('update read', this.messages[i])
        }
      }
    }
  }

  updateRoomMessages(roomId: string) {
    this.roomMessagesSubject.next(this.roomMessages.get(roomId)!)
  }

  updatePrivateMessages() {
    this.privateMessages = [];
    for (let i = 0; i < this.messages.length; i++) {
      const { senderID, receiverID } = this.messages[i];
      if ((senderID == this.activeUserId && receiverID == this.selectedUser?.userID)
        || (senderID == this.selectedUser?.userID && receiverID == this.activeUserId)) {
        this.privateMessages.push(this.messages[i]);
      }
    }
    this.privateMessagesSubject.next(this.privateMessages);
  }

  disconnect() {
    this.socket.disconnect();
  }

  ngOnDestroy() {
    this.socket.off("connect");
    this.socket.off("disconnect");
    this.socket.off("users");
    this.socket.off("user connected");
    this.socket.off("user disconnected");
    this.socket.off("private message");
  }
}
