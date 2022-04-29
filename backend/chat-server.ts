require('dotenv').config()

import express from 'express';
import { createServer } from 'http';
import { Server } from "socket.io";
import crypto from 'crypto';

import { RockPaperScissors, RPSStore } from './lib/rps';
import { Message, ChatUser } from './lib/interfaces'
import { InMemorySessionStore, InMemoryMessageStore, InMemoryRoomStore } from './lib/stores';
const sessionStore = new InMemorySessionStore();
const messageStore = new InMemoryMessageStore();
const roomStore = new InMemoryRoomStore();
const rpsStore = new RPSStore;


const app = express();
const httpServer = createServer(app);
const whitelist = ["http://localhost:4200", 'http://192.168.0.11:4200', 'http://25.62.25.2:4200']

const io = new Server(httpServer, {
    cors: {
        origin: whitelist,
        methods: ["GET", "POST"]
    }
});

//check if the user is logged in before we open the socket
io.use((socket, next) => {
    // find existing session
    const sessionID = socket.handshake.auth.sessionID;
    console.log('sessionID', sessionID)
    if (sessionID) {
        const session = sessionStore.findSession(sessionID);
        if (session) {
            console.log('Session found', session)
            socket.handshake.auth.sessionID = sessionID;
            socket.handshake.auth.userID = session.userID;
            socket.handshake.auth.username = session.username;
            return next();
        }
    }

    //If no session is found, authenticate username, throw error if none
    const username: string = socket.handshake.auth.username;
    console.log('username', username);
    if (!username) {
        return next(new Error("User is not logged in"));
    }
    //Create a new session
    const randomId = () => crypto.randomBytes(8).toString("hex");
    console.log('Session not found, creating new')
    socket.handshake.auth.sessionID = randomId();
    socket.handshake.auth.userID = randomId();
    socket.handshake.auth.username = username;
    next();
});

io.on("connect", (socket) => {
    let connectedCount = io.engine.clientsCount;;
    console.log('user connected,', 'active: ', connectedCount);

    /**************************************** ON CONNECTION ********************************/
    /**
     * Emits : session, users, messages, rooms
     */
    const sessionId: string = socket.handshake.auth.sessionID;
    const userId: string = socket.handshake.auth.userID;
    const username: string = socket.handshake.auth.username;

    //automatically join user to their room
    socket.join(userId)

    //Save the session and emit it to the socket
    sessionStore.saveSession(sessionId, {
        userID: userId,
        username: username,
        connected: true,
    });
    socket.emit("session", {
        sessionID: sessionId,
        session: {
            userID: userId,
            username: username,
            connected: true
        }
    });

    //every time a user connects push them to users[]
    const users: ChatUser[] = [];
    sessionStore.findAllSessions().forEach((session) => {
        //finds an outdated session from the user and deletes it
        if (session.username == username && !session.connected && session.userID != userId) {
            console.log('deleting old session', session)
            sessionStore.deleteSession(session);
            roomStore.removeUserFromAll(session);
            io.emit('delete outdated', session.userID);
            io.emit('rooms', roomStore.getRooms());
        } else {
            users.push({
                userID: session.userID,
                username: session.username,
                connected: session.connected
            });
        }
    });
    socket.emit("users", users);
    socket.emit('messages', messageStore.getAllUserMessages(userId))
    const activeUser = users.find(({ userID }) => userId == userID)!;

    //Emit to everyone connected to the server
    io.emit('user connected', {
        userID: userId,
        username: username,
        connected: true
    });

    //emit rooms to socket
    const rooms = roomStore.getRooms();
    rooms.forEach(({ id, users }) => {
        users.forEach(({ userID }) => {
            if (userID == userId) {
                console.log('Rejoining room ' + id)
                socket.join(id)
            }
        })
    })
    socket.emit('rooms', rooms);
    /**************************************** SOCKET LOGIC ********************************/

    socket.on('private message', (message: Message) => {
        messageStore.saveMessage(message);
        io.to(message.receiverID!).to(userId).emit('private message', message);
    });

    socket.on('public message', ({ roomId, message }) => {
        roomStore.saveMessageToRoom(roomId, message);
        io.to(roomId).emit('public message', { roomId, message })
    })

    socket.on('update read', message => {
        messageStore.updateRead(message)
        io.emit('messages', messageStore.getAllUserMessages(userId))
    });

    socket.on('create room', (roomId: string) => {
        roomStore.createRoom(roomId, activeUser);
        socket.join(roomId)
        io.emit('rooms', roomStore.getRooms())
    })

    socket.on('join room', roomId => {
        socket.join(roomId)
        roomStore.addUserToRoom(roomId, activeUser)
        socket.emit('room messages', { roomId, messages: roomStore.getMessagesFromRoom(roomId) })
        io.emit('update room', roomStore.getRoom(roomId))
    })

    socket.on('leave room', roomId => {
        socket.leave(roomId);
        roomStore.removeUserFromRoom(roomId, activeUser)
        const room = roomStore.getRoom(roomId);
        room ? io.emit('update room', room) : io.emit('delete room', roomId);
    })
    /************************************** RPS ***************************/
    const rpsRooms: RockPaperScissors[] = rpsStore.getRooms();
    rpsRooms.forEach(({ _challenger, _challenged, _spectators, _id }) => {
        if (_challenger.userID == userId || _challenged.userID == userId) {
            console.log('Rejoining RPS: ' + _id);
            socket.join(_id);
            return;
        }
        for (let i = 0; i < _spectators.length; i++) {
            const { userID } = _spectators[i];
            if (userID == userId) {
                console.log('Rejoining RPS as spectator')
                socket.join(_id);
                return;
            }
        }
    });
    socket.emit('rps rooms', rpsRooms)

    socket.on('rps challenge', (challenged: ChatUser) => {
        const rps = new RockPaperScissors(activeUser, challenged);
        socket.join(rps.id);
        rps.challengerConn = true;
        rpsStore.createRoom(rps);
        io.emit('rps rooms', rpsRooms)
    });

    socket.on('rps accept challenge', (from: ChatUser) => {
        rpsStore.getRooms().forEach(rps => {
            if (from.userID == rps._challenger.userID && rps._challenged.userID == userId) {
                socket.join(rps._id)
                rps.challengedConn = true;
                io.emit('rps rooms', rpsRooms)
            }
        });
    })

    socket.on('rps spectate', roomId => {
        socket.join(roomId);
        const rps = rpsStore.getRoom(roomId)!;
        rps.addToSpectators(activeUser);
        io.to(roomId).emit('rps update', rps);
    })

    socket.on('rps choose', ({ choice, roomId }) => {
        const rps = rpsStore.getRoom(roomId)!
        rps.chooseRPS(choice, userId);
        io.to(roomId).emit('rps update', rps)
        if (rps.challengerChoice && rps.challengedChoice) {
            let winner = rps.resolveRPS(rps.challengerChoice, rps.challengedChoice)
            if (winner) {
                rps.winnerName = winner.username;
                winner.userID == rps.challenger.userID ? rps.challengerScore++ : rps.challengedScore++;
                io.to(roomId).emit('resolve', rps.winnerName)
            } else {
                io.to(roomId).emit('resolve', undefined)
            }
            setTimeout(() => {
                rps.resetChoices();
                console.log(rps)
                io.to(roomId).emit('rps reset', rps);
            }, rps.fastMode ? 750 : 1500)
        }
    })

    socket.on('rps fast', roomId => {
        const rps = rpsStore.getRoom(roomId)!;
        rps.toggleFast();
        io.to(roomId).emit('rps update', rps)
    })

    socket.on('rps reset', roomId => {
        const rps = rpsStore.getRoom(roomId)!;
        rps.resetChoices();
        io.emit('rps rooms', rpsRooms);
    })

    //On disconnect 
    socket.on('disconnect', async () => {
        console.log('user disconnected,', 'remaining: ', connectedCount);

        const matchingSockets = await io.in(userId).allSockets();
        const isDisconnected = matchingSockets.size === 0;
        if (isDisconnected) {

            // notify other users
            io.emit("user disconnected", userId);

            // update the connection status of the session
            sessionStore.saveSession(sessionId, {
                userID: userId,
                username: username,
                connected: false
            });
        }
    });

});

httpServer.listen(process.env.CHAT_SERVER_PORT || 5000, () => console.log('Listening for requests on ' + process.env.CHAT_SERVER_PORT || 5000))