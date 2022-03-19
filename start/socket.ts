import Ws from 'App/Services/Ws'
Ws.boot()

/**
 * Listen for incoming socket connections
 */
Ws.io.on('connection', (socket) => {
  socket.emit('news', { hello: 'world' })

  socket.on('my other event', (_) => {
    // console.log(data)
  })
})
