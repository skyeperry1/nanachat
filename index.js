var express = require('express');
var mongoose = require ("mongoose");
var app = express();
var server = require('http').createServer(app);
app.use(express.static(__dirname + '/public'));

var io = require('socket.io')(server);

//**************************************************
//DB stuff
//**************************************************
var uristring =
    process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/HelloMongoose';

mongoose.connect(uristring, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
  console.log ('Succeeded connected to: ' + uristring);
  }
});

var userSchema = new mongoose.Schema({
  name: {
    first: String,
    last: { type: String, trim: true }
  },
  age: { type: Number, min: 0 }
});

var PUser = mongoose.model('PowerUsers', userSchema);
...
// Creating one user.
var johndoe = new PUser ({
  name: { first: 'John', last: '  Doe   ' },
  age: 25
});

// Saving it to the database.
johndoe.save(function (err) {if (err) console.log ('Error on save!')});

//**************************************************
//Chat stuff
//**************************************************
var totalUsers = 0;

app.get('/about', function (request, response) {
  response.sendFile(__dirname + '/public/about.html');
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

server.listen(process.env.PORT || 5000, function(){
  console.log('listening on port:5000');
});
