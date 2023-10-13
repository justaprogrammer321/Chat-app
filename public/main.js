
const socket = io();
const messageContainer = document.getElementById('message-container');
const nameInput = document.getElementById('name-input');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const clientTotal = document.getElementById("client-total");
const joinQueueButton = document.getElementById('join-queue-button');
const leaveRoomButton = document.getElementById('leave-room-button');
const roomInput = document.getElementById('room-input');

socket.on('clients-total', (data) => {
    clientTotal.textContent = `Total-clients ${data}`;
});

messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
});

joinQueueButton.addEventListener('click', () => {
    const roomName = roomInput.value;
    if (roomName.trim() !== '') {
        socket.emit('join-room', roomName, nameInput.value);
        roomInput.value = '';
    }
});

leaveRoomButton.addEventListener('click', () => {
    socket.emit('leave-room');
});

function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText !== '') {
        const data = {
            name: nameInput.value,
            message: messageText,
            dateTime: new Date()
        };
        socket.emit('message', data);
        addMessage(true, data);
        messageInput.value = '';
    }
}

socket.on('chat-message', (data) => {
    addMessage(false, data);
});

socket.on('user-joined', (username) => {
    const data = {
        name: 'System',
        message: `${username} has joined the room.`,
        dateTime: new Date()
    };
    addMessage(false, data);
});

const roomLinks = document.querySelectorAll('.room-link');
roomLinks.forEach((roomLink) => {
    roomLink.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent the default link behavior
        const roomName = roomLink.getAttribute('href').substr(1); // Remove the '#' symbol
        if (roomName) {
            socket.emit('join-room', roomName, nameInput.value);
        }
    });
});

socket.on('user-left', (userId) => {
    const data = {
        name: 'System',
        message: `A user with ID ${userId} has left the room.`,
        dateTime: new Date()
    };
    addMessage(false, data);
});

function addMessage(isOwnMessage, data) {
    const element = `
        <li class="${isOwnMessage ? "message-right" : "message-left"}">
            <p class="message">
                ${data.name}: ${data.message}
            </p>
        </li>`;
    messageContainer.innerHTML += element;
}

