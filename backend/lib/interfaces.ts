export interface Message {
    id: string;
    senderID: string;
    senderUsername: string;
    content: string;
    receiverID?: string;
    read?: boolean;
}

export interface Room {
    id: string;
    users: ChatUser[];
    connected: number;
    messages: Message[]
}

export interface ChatUser {
    userID: string;
    username: string;
    active?: boolean;
    connected: boolean;
    selected?: boolean;
    hasNewMessages?: boolean;
    joinedRooms?: Room[];
}