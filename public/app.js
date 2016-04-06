
var app = angular.module('app', ['ui-notification','modal']);

app.controller('mainCtrl', [ '$scope', 'Notification', '$timeout' ,function ($scope, Notification, $timeout) {
  //*********************************
  //User Variables
  //*********************************
  $scope.tempHandle = "Butters Stotch"; //Temporary handle for the options popup
	$scope.myHandle = "Butters Stotch"; //User handle
	$scope.myMessage = "";
	$scope.SentTypingNotification = false; //typing notification bool flag

  //*********************************
  //Typing Notification
  //*********************************
	$scope.nowTyping = function(){
		if(!$scope.SentTypingNotification){
			socket.emit('typing', $scope.myHandle);  //send a notification to the server that user is typing
			$scope.SentTypingNotification = true;    //change the typing notification bool flag so we don't keep emiting
		}		
	}

  //Listen for 'typing' alert from the server and
  //call the typing notification function for the client when we get an alert
   socket.on('typing', function(typerHandle){
    if(typerHandle != $scope.myHandle){
      $scope.typingeNotification(typerHandle);
    }
  });

  //Configure typing notification message
  $scope.typingeNotification = function(userName) {
      Notification('<strong>' + userName + ' is typing...<strong>');
  };  

  //*********************************
  //New User Notification
  //*********************************
  
  //Listen to 'newUser' alert from the server and
  //call the newUser notification function for the client when we get an alert
  socket.on('newUser', function(totalUsers){
    $scope.newUserNofication(totalUsers);
  });

  //Configure new user notification message
  $scope.newUserNofication = function(totalUsers) {
      Notification.success({message: "<strong>New User Joined!</strong><br/> Total in Room: " + totalUsers, delay:10000});
  };

  //*********************************
  //User leaving Notification
  //*********************************
  
  //Listen to 'userLeft' alert from the server and
  //call the UserLeft notification function for the client when we get an alert
  socket.on('userLeft', function(totalUsers){
    $scope.userLeftNotification(totalUsers);
  });

  //Configure  user leaving notification message
  $scope.userLeftNotification = function(totalUsers){
    Notification.error({message: "<strong>Someone Left, You Loser!</strong><br/> Total in Room: " + totalUsers, delay:10000});
  }

  //*********************************
  //Options Popup Window
  //*********************************
  $scope.showModal = false; //Show the modal when page loads

  //Toggle the option popup window
  $scope.toggleModal = function(){
      $scope.showModal = !$scope.showModal;
  };  

  //Update the user handle and hide the popup window
  $scope.updateHandle = function(newHandle){
    $scope.myHandle = newHandle.replace(/(<([^>]+)>)/ig,"");  //update handle and sanatize new name
    $scope.showModal = !$scope.showModal; //hide popup window
  };

  //*********************************
	//Recieving Messages
  //*********************************

  //configure new message notification	
  $scope.newMessageNotification = function(message, userName) {
    Notification('<strong>New Message From:<strong>' + userName + '<br>' + message);
  };

  //listen for new messages. sanatize message and print to DOM
  socket.on('chat message', function(msg){
      var handleClass;
      var incomingMessage;

      if(msg.hnd === $scope.myHandle){
       handleClass = "me"; //add 'me' class to handle
     }else{
       $scope.newMessageNotification(msg.msg, msg.hnd); 
       handleClass = "someoneElse"; //add 'someoneElse' class to handle
     }

     incomingMessage = msg.msg.toString(); //convert out incoming message into a string
     incomingMessage = incomingMessage.replace(/(<([^>]+)>)/ig,""); //sanatize the message

     //make a nice pretty string of html to print
     var prettyMessage = "<span class='handle " + 
     handleClass + "'>" + 
     msg.hnd + 
     ": </span>" + 
     incomingMessage; 

     //add the new message to the DOM
     $('#messages').append($('<li>').html( prettyMessage ));
   });

  //*********************************
  //Sending Messages
  //*********************************    

  //Send a message on for submit or enter press
  var socket = io();
  $('form').submit(function(){
    socket.emit('chat message', {msg: $('#m').val(), hnd: $scope.myHandle}); //send the message and handle as an object to the server
    $('#m').val(''); //empty the input
    $scope.SentTypingNotification = false; //reset the typing notification flag
    return false;
  });

}]);//END mainCtrl

