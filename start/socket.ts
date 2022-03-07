import Ws from 'App/Services/Ws'

Ws.boot()

Ws.io.on('connection', (socket) => {
  socket.emit('annoucement', { messag: 'You are connected' })
})
