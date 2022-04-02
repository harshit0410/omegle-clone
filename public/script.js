// const socket = io('/'),
//   myPeer = new Peer(undefined, {
//     host: '/',
//     port: '3001'
//   }),
//   videoGrid = document.getElementById('video-grid'),
//   myVideo = document.createElement('video'),
//   peers = {};

// myVideo.muted = true;
// navigator.mediaDevices.getUserMedia({
//   video: true,
//   audio: true
// }).then (stream => {
//   addVideoStream(myVideo, stream);

//   myPeer.on('call', call => {
//     call.answer(stream);
//     const video = document.createElement('video');
//     call.on('stream', userVideoStream => {
//       addVideoStream(video, userVideoStream);
//     });
//   })
//   socket.on('user-connected', userId => {
//     console.log(userId);
//     connectToNewUser(userId, stream)
//   });
// });

// socket.on('user-disconnected', userId => {
//   console.log(userId);
//   if( peers[userId]) peers[userId].close();
// });

// myPeer.on('open', id => {
//   socket.emit('join-room', ROOM_ID, id);
// });

// function connectToNewUser (userId, stream) {
//   const call = myPeer.call(userId, stream),
//     video = document.createElement('video');
//   call.on('stream', userVideoStream => {
//     addVideoStream(video, userVideoStream);
//   });
//   call.on('close', () => {
//     video.close();
//   });

//   peers[userId] = call;
// }

// function addVideoStream (video, stream) {
//   video.srcObject = stream;
//   video.addEventListener('loadedmetadata', () => {
//     video.play()
//   });
//   videoGrid.append(video);
// }

const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
  host: '/',
  port: '3001'
})
const myVideo = document.getElementById('local');
myVideo.muted = true
const peers = {}

navigator.mediaDevices = navigator.mediaDevices || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: false
}).then(stream => {

  window.lstream = stream;
  addVideoStream(myVideo, stream)

 
  socket.on('user-connected', userId => {
    console.log(userId);
    connectToNewUser(userId, stream)
    connectforchat(userId)
  })



})


myPeer.on('call', call => {

  setTimeout(() => {
    console.log('call received')
    console.log(window.lstream);
    call.answer(window.lstream)
    let remotevideo = document.getElementById('remote');
    call.on('stream', userVideoStream => {
      addVideoStream(remotevideo, userVideoStream)
    })
  }, 1000);
  
})

myPeer.on('connection', conn => {
  console.log('mess', conn)
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
})
  
socket.on('user-disconnected', userId => {
  console.log(userId);
   if (peers[userId]){ peers[userId].close()}
})
myPeer.on('open', id => {
  console.log('My peer ID is: ' + id);
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  //sending data to others who joined
  let call;
  try {
    call = myPeer.call(userId, stream)
  }
  catch (err) {
    console.log('callingerr', err);
  }
  console.log("calling",call);
  let remotevideo = document.getElementById('remote');
  call.on('stream', userVideoStream => {
    console.log('stream recieved from user 1')
    //console.log(video, userVideoStream);
    addVideoStream(remotevideo, userVideoStream)
  })
  call.on('close', () => {
    remotevideo.srcObject = null;
  })

  peers[userId] = call;
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
}
function addVideoStream(video, stream) {
  video.srcObject = stream
  //video.play()
  console.log('tasa');
}

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
})