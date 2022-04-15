const socket = io('/');
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
});
const myVideo = document.getElementById('local');
myVideo.muted = true
const peers = {}

navigator.mediaDevices = navigator.mediaDevices || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: false
}).then(stream => {
  window.lstream = stream;
  addVideoStream(myVideo, stream);

  // 1st person who joined
  socket.on('user-connected', userId => {
    console.log('user-connected', userId);
    console.log('I am doing function call');
    connectToNewUser(userId, stream);
    connectforchat(userId);
  });
});


// 2nd user when they receive a call
myPeer.on('call', call => {
  setTimeout(() => {
    console.log('call received');
    window.mycall = call;

    call.answer(window.lstream)
    
    let remotevideo = document.getElementById('remote');
    
    call.on('stream', userVideoStream => {
      console.log('stream recieved from user 1')
      addVideoStream(remotevideo, userVideoStream)
    });

    call.on('close', () => {
      remotevideo.srcObject = null;
    })
  }, 1000);
});

//2nd user when they chat
myPeer.on('connection', conn => {
  window.myconn = conn;

  conn.on('open', function() {
    // Receive messages
    conn.on('data', function(data) {
      console.log('Received', data);
      var parElement = document. getElementById("message-container");
      var item = document.createElement('li');
      item.textContent= "Stranger: " +data;
      parElement. appendChild(item);
    });
  });

  conn.on('close', () => {
    var parElement = document. getElementById("message-container");
    parElement.replaceChildren();
  });
});
  
socket.on('user-disconnected', userId => {
  console.log('user-disconnected', userId);
  handlePeerDisconnect();
});

myPeer.on('open', id => {
  console.log('My peer ID is: ' + id);
  sessionStorage.setItem("myId", id);
})

myPeer.on('disconnected', () => {
  console.log('disconnecting');
  socket.emit('leave');
  handlePeerDisconnect();
});

function connectToNewUser(userId, stream) {
  //sending data to 2nd user who joined room
  let call;
  try {
    call = myPeer.call(userId, stream)
  }
  catch (err) {
    console.log('callingerr', err);
  }

  window.mycall = call;
  console.log("calling the user 2", call);
  let remotevideo = document.getElementById('remote');
  call.on('stream', userVideoStream => {
    console.log('stream recieved from user 2')
    addVideoStream(remotevideo, userVideoStream)
  });
  call.on('close', () => {
    remotevideo.srcObject = null;
  });
}

function connectforchat (userId) {
  var conn = myPeer.connect(userId);

  window.myconn = conn;
  conn.on('open', function() {
    // Receive messages
    conn.on('data', function(data) {
      console.log('Received', data);
      var parElement = document. getElementById("message-container");
      var item = document.createElement('li');
      item.textContent= "Stranger: " + data;
      parElement. appendChild(item);
    });
  });
  conn.on('close', () => {
    var parElement = document. getElementById("message-container");
    parElement.replaceChildren();
  });
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  console.log('tasa');
}

//for sending message 
document.getElementById('pqrs').addEventListener('click', function () {
  message = document.getElementById('abcd').value;
  if (message) {
    window.myconn.send(message);
    document.getElementById('abcd').value = '';
    var parElement = document. getElementById("message-container");
    var item = document.createElement('li');
    item.textContent= "You: "+ message;
    parElement. appendChild(item);
  }
});

//for connect
document.getElementById('connect-to-random-user')
.addEventListener('click', () => {
  console.log('connect to random user');
  myPeer.disconnected && myPeer.reconnect();
  sessionStorage.getItem("myId") && socket.emit('vcall', sessionStorage.getItem("myId"));
});

//for disconnect
document.getElementById('disconnect-to-random-user')
.addEventListener('click', () => {
  myPeer.disconnect();
});



function handlePeerDisconnect() {
  window.myconn.close();
  window.mycall.close();
}