const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users')

const app = express()
const Server = http.createServer(app)
const io = socketio(Server)

const botName = 'ChatCord Bot'

app.use(express.static('./public'))
// const path = require('path')
// app.use(express.static(path.join(__dirName, 'public')))

// Run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room) // Socket function to show room name

    socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!')); // This will emit to single user connecting(us)

    // Broadcast when a user connects
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`)) // This will emit to everybody except the user(us)

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
    })
    })

    // Listen for chatMessages
    socket.on('chatMessage', (msg) => {
    const user = getCurrentUser(socket.id)
    
    io.to(user.room).emit('message', formatMessage(`${user.username}`, msg))
    })

    // Runs when client disconnects(other user)
    socket.on('disconnect', () => {
    const user = userLeave(socket.id)

    if(user) {
    io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left the chat`))
    }
    
    // send users and room info
    io.to(user.room).emit('roomUsers', {
    room: user.room,
    users: getRoomUsers(user.room)
    })
    })
})

const PORT = 3000 || process.env.PORT

Server.listen(PORT, () => console.log(`Server is running on port ${PORT}`))