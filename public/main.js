const socket = io();
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startBtn = document.getElementById('startBtn');

let localStream;
let peerConnection;

const servers = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

startBtn.onclick = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;

  peerConnection = new RTCPeerConnection(servers);
  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

  peerConnection.ontrack = event => {
    remoteVideo.srcObject = event.streams[0];
  };

  peerConnection.onicecandidate = event => {
    if (event.candidate) socket.emit('candidate', event.candidate);
  };

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit('offer', offer);
};

socket.on('offer', async offer => {
  peerConnection = new RTCPeerConnection(servers);

  peerConnection.ontrack = event => {
    remoteVideo.srcObject = event.streams[0];
  };
  peerConnection.onicecandidate = event => {
    if (event.candidate) socket.emit('candidate', event.candidate);
  };

  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;
  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit('answer', answer);
});

socket.on('answer', async answer => {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

socket.on('candidate', async candidate => {
  if (candidate) await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});
