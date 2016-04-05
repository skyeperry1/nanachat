
var app = angular.module('app', ['ui-notification']);

app.controller('mainCtrl', function ($scope, Notification) {
	
	$scope.myHandle = "butters";
	$scope.myMessage = "";
	$scope.SentTypingNotification = false;

	$scope.nowTyping = function(){
		if(!$scope.SentTypingNotification){
			socket.emit('typing', $scope.myHandle);
			$scope.SentTypingNotification = true;
		}
		
	}

	//Get the Date
 $scope.date = new Date();
 $scope.time = new Date().getTime();
  	//notification stuff
  	$scope.newMessageNotification = function(message, userName) {
      Notification('<strong>New Message From:<strong>' + userName + '<br>' + message);
    };

    $scope.typingeNotification = function(userName) {
      Notification('<strong>' + userName + ' is typing...<strong>');
    };

    $scope.userLeftNotification = function(totalUsers){
      Notification.error({message: "<strong>Someone Left, You Loser!</strong><br/> Total in Room: " + totalUsers, delay:10000});
    }

    $scope.newUserNofication = function(totalUsers) {
      Notification.success({message: "<strong>New User Joined!</strong><br/> Total in Room: " + totalUsers, delay:10000});
    };

    //Send a message
    var socket = io();
    $('form').submit(function(){
      socket.emit('chat message', {msg: $('#m').val(), hnd: $scope.myHandle});
      $('#m').val('');
      $scope.SentTypingNotification = false;
      return false;
    });

 	//Alert a new user
   socket.on('newUser', function(totalUsers){
    $scope.newUserNofication(totalUsers);
  });

   socket.on('userLeft', function(totalUsers){
    $scope.userLeftNotification(totalUsers);
  });

   socket.on('typing', function(typerHandle){
    if(typerHandle != $scope.myHandle){
      $scope.typingeNotification(typerHandle);
    }
  });


  	//Add messages to DOM
    socket.on('chat message', function(msg){
      var handleClass;

      if(msg.hnd === $scope.myHandle){
       handleClass = "me";
     }else{
       $scope.newMessageNotification(msg.msg, msg.hnd);	
       handleClass = "someoneElse";
     }

     var prettyMessage = "<span class='handle " + 
     handleClass + "'>" + 
     msg.hnd + 
     ": </span>" + 
     msg.msg.toString();


     $('#messages').append($('<li>').html( prettyMessage ));
   });

  });