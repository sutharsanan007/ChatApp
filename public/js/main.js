const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users') 

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io()

// Join chatroom
socket.emit('joinRoom', { username, room })

// Get room users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Msg from server
socket.on('message', (message) => {
  console.log(message)
  outPutMessage(message)

  // Scroll down automatically
  chatMessages.scrollTop = chatMessages.scrollHeight
})

chatForm.addEventListener('submit', (e) => {
  e.preventDefault() // To prevent the value entered in form saving to a file

  // Get message text from form input area
  const msg = e.target.elements.msg.value

  // Emit message to server
  socket.emit('chatMessage', msg)

  // clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outPutMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username}<span> ${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`
  // To create a new div element inside the div element with class = chat- messages
  document.querySelector('.chat-messages').appendChild(div)
}

// Add roomname to DOM
function outputRoomName(room) {
  roomName.innerText = room
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
  ${users.map((user) => `<li>${user.username}</li>`).join('')}`;
}