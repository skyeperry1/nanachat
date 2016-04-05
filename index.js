var express = require('express');
var app = express();
var server = require('http').createServer(app);
app.use(express.static(__dirname + '/public'));

var io = require('socket.io')(server);

var totalUsers = 0;

app.get('/', function (request, response) {
  response.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(user){
  
  console.log('a user connected');
  totalUsers++;
  io.emit('newUser', totalUsers);

  user.on('typing', function(handle){
    io.emit('typing', handle);
  });

  user.on('chat message', function(msg){
    console.log('message: ' + msg.msg);
    io.emit('chat message', {msg: msg.msg, hnd: msg.hnd});
  });


  user.on('disconnect', function(){
    console.log('user disconnected');
    totalUsers--;
    io.emit('userLeft', totalUsers);
  });

});

server.listen(3000, function(){
  console.log('listening on port:3000');
});
