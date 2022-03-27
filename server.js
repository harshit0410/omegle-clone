const express = require('express'),
  app = express(),
  server  = require('http').Server(app),
  io = require('socket.io')(server),
  {v4: uuidV4} = require('uuid');
//    { ExpressPeerServer  } = require('peer');

// const peerServer = ExpressPeerServer(server, {
//     path: '/myapp'
//   });
//   app.use('/myapp', peerServer);
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', {roomId: req.params.room});
});

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);

    console.log(roomId, userId);

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
      console.log('disconnected');
    })
  });
});

server.listen(3000);