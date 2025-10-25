const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const { configDotenv } = require('dotenv');
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 5000;
configDotenv();
app.use(express.static('public')); // Serve your HTML + JS

io.on('connection', socket => {
  console.log('User connected:', socket.id);

  socket.on('offer', data => {
    socket.broadcast.emit('offer', data);
  });

  socket.on('answer', data => {
    socket.broadcast.emit('answer', data);
  });

  socket.on('candidate', data => {
    socket.broadcast.emit('candidate', data);
  });
});

server.listen(PORT,  () => console.log('Server running on http://localhost:3000'));
