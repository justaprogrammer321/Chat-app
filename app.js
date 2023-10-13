const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => console.log("How are you doing"));
const path = require("path");
const socketsConected = new Set();
const io = require("socket.io")(server);

let waitingUsers = [];
let chatRooms = new Map();

io.on('connection', OnConnected);

function OnConnected(socket) {
    socketsConected.add(socket.id);
    io.emit('clients-total', socketsConected.size);

    socket.on('disconnect', () => {
        socketsConected.delete(socket.id);
        removeUserFromChatRoom(socket);
        io.emit('clients-total', socketsConected.size);
    });

    socket.on('message', (data) => {
        const roomName = chatRooms.get(socket.id);
        if (roomName) {
            const messageText = data.message.trim();
            if (messageText !== '') {
                socket.to(roomName).emit('chat-message', data);
            }
        }
    });

    socket.on('join-room', (roomName, username) => {
        removeUserFromChatRoom(socket);
        socket.join(roomName);
        chatRooms.set(socket.id, roomName);
        socket.to(roomName).emit('user-joined', username);
    });

    socket.on('leave-room', () => {
        removeUserFromChatRoom(socket);
    });
}

function removeUserFromChatRoom(socket) {
    const roomName = chatRooms.get(socket.id);
    if (roomName) {
        socket.leave(roomName);
        socket.to(roomName).emit('user-left', socket.id);
        chatRooms.delete(socket.id);
    }
}

app.use(express.static(path.join(__dirname, 'public')));
