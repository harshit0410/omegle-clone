const express = require('express'),
  app = express(),
  server  = require('http').Server(app),
  io = require('socket.io')(server),
  path = require('path'),
  {v4: uuidV4} = require('uuid');

let sockets = [];

app.set('view engine', 'html');
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.redirect('/video-chat');
});

app.get('/video-chat', (req, res) => {
  res.sendFile(path.join(__dirname + '/views/vchat.html'));
});

io.on('connection', socket => {
  socket.on('vcall', (userId) => {
    let room ;

    if(sockets.length > 0) {
      let x = sockets.shift();
      socket.join(x.roomId);
      socket.to(x.roomId).emit('user-connected', userId);
      room =x.roomId;
    }
    else {
      room = uuidV4();
      socket.join(room);
      socket.to(room).emit('user-connected', userId);
      sockets.push({userId, roomId: room});
    }

    socket.on('disconnect', () => {
      socket.to(room).emit('user-disconnected', userId);
      console.log('disconnected');
    });

    socket.on('leave', () => {
      socket.in(room).emit('user-disconnected', userId);
      console.log('leave');
    });
  });
});

server.listen(3000);