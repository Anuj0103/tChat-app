// NODE SERVER WHICH WILL HANDLE SOCKET IO CONNECTION
const io = require('socket.io')(7000);
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'postgres',
    password: 'admin',
    database: 'hackathon',
  },
});

const users = {};

io.on('connection', (socket) => {
  // If any new user joins, let other users connected to the server know!
  socket.on('new-user-joined', (name) => {
    //console.log("New User",name);
    db.insert({
      name: name,
    });
    users[socket.id] = name;
    socket.broadcast.emit('user-joined', name);
  });

  // If someone sends a message, broadcast it to other people
  socket.on('send', (message) => {
    db.insert({
      message: message,
    });
    socket.broadcast.emit('receive', {
      message: message,
      name: users[socket.id],
    });
  });

  // If someone leaves the chat, let others know
  socket.on('disconnect', (message) => {
    socket.broadcast.emit('left', users[socket.id]);
    delete users[socket.id];
  });
});
