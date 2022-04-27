import { ChatUser, Room, Message } from './interfaces';

//TO DO : Currently the store is in memory, need to transfer to mongoDB

export interface Session {
    userID: string;
    username: string;
    connected: boolean;
}

export class InMemorySessionStore {
    sessions!: Map<string, Session>;
    constructor() {
        this.sessions = new Map();
    }

    findSession(id: string): Session | undefined {
        return this.sessions.get(id)
    }
    findAllSessions(): Session[] {
        return [...this.sessions.values()];
    }

    saveSession(id: string, session: Session): void {
        this.sessions.set(id, session)
    }

    deleteSession(session: Session): void {
        for(let [key] of this.sessions) {
            if(this.sessions.get(key) == session) {
                this.sessions.delete(key);
                return;
            }
        }
    }
}

export class InMemoryRoomStore {
    rooms!: Map<string, Room>

    constructor() {
        this.rooms = new Map();
    }

    createRoom(roomId: string, user: ChatUser): void {
        const room: Room = {
            id: roomId,
            users: [user],
            connected: 1,
            messages: []
        }
        this.rooms.set(roomId, room)
    }

    addUserToRoom(roomId: string, user: ChatUser): void {
        if (this.rooms.has(roomId)) {
            this.rooms.get(roomId)!.users.push(user);
            this.rooms.get(roomId)!.connected++;
        }
    }
    
    removeUserFromRoom(roomId: string, user: ChatUser): void {
        if (this.rooms.has(roomId)) {
            const index = this.rooms.get(roomId)!.users.indexOf(user);
            this.rooms.get(roomId)!.users.splice(index, 1);
            this.rooms.get(roomId)!.connected--;
            if(this.rooms.get(roomId)!.connected == 0) {
                this.rooms.delete(roomId)
            }
        }
    }

    getRoom(roomId: string): Room {
        return this.rooms.get(roomId)!;
    }

    getRooms(): Room[] {
        const rooms = [];
        for (let [key] of this.rooms) {
            rooms.push(this.rooms.get(key)!)
        }
        return rooms;
    }

    saveMessageToRoom(roomId: string, message: Message) {
        this.rooms.get(roomId)!.messages.push(message)
    }

    getMessagesFromRoom(roomId: string): Message[] {
        return this.rooms.get(roomId)!.messages
    }
}

export class InMemoryMessageStore{
    messages!: Message[];
    constructor() {
        this.messages = [];
    }

    saveMessage(message: Message): void {
        this.messages.push(message);
    }


    getAllUserMessages(userId: string): Message[] {
        const messages = this.messages.filter(({ senderID, receiverID }) => senderID == userId || receiverID == userId);
        return messages;
    }

    updateRead(message: Message) {
        for (let i = 0; i < this.messages.length; i++) {
            if (this.messages[i].id == message.id) {
                this.messages[i] = message;
                break;
            }
        }
    }
}