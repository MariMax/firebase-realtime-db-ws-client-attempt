const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
app.use(express.static('public'))

server.listen(process.env.PORT || 4000);

let activeTasks = 0;
let left;
let right;

io.on('connection', (socket) => {
  socket.emit('HEY', {activeTasks, left, right});

  socket.on('ADD_TASK', () => {
    if (activeTasks > 5) {
      activeTasks = 5;
      return;
    }
    activeTasks++;
    socket.broadcast.emit('ADD_TASK');
    socket.emit('ADD_TASK');
  });

  socket.on('OPEN_LEFT', () => {
    left = true;
    socket.broadcast.emit('OPEN_LEFT');
    socket.emit('OPEN_LEFT');
  });

  socket.on('CLOSE_LEFT', () => {
    left = false;
    socket.broadcast.emit('CLOSE_LEFT');
    socket.emit('CLOSE_LEFT');
  });

  socket.on('OPEN_RIGHT', () => {
    right = true;
    socket.broadcast.emit('OPEN_RIGHT');
    socket.emit('OPEN_RIGHT');
  });

  socket.on('CLOSE_RIGHT', () => {
    right = false;
    socket.broadcast.emit('CLOSE_RIGHT');
    socket.emit('CLOSE_RIGHT');
  });

  socket.on('COMPLETE_TASK', () => {
    activeTasks--;
    socket.broadcast.emit('COMPLETE_TASK');
    socket.emit('COMPLETE_TASK');
  });
});