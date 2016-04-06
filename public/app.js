
var app = angular.module('app', ['ui-notification']);

app.controller('mainCtrl', [ '$scope', 'Notification', '$timeout' ,function ($scope, Notification, $timeout) {
	
	$scope.myHandle = "Butters Stotch";
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
      socket.emit('chat message', {msg: $('#m').val(), hnd: $scope.myHandle}); //send the message and handle as an object to the server
      $('#m').val(''); //empty the input
      $scope.SentTypingNotification = false; //reset the typing notification flag
      return false;
    });

 	//Alert a new user
   socket.on('newUser', function(totalUsers){
    $scope.newUserNofication(totalUsers);
  });

   //alert when somone leaves
   socket.on('userLeft', function(totalUsers){
    $scope.userLeftNotification(totalUsers);
  });

   //alert when somone is typing;
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

     var incomingMessage = msg.msg.toString();

     var prettyMessage = "<span class='handle " + 
     handleClass + "'>" + 
     msg.hnd + 
     ": </span>" + 
     incomingMessage.replace(/(<([^>]+)>)/ig,"");


     $('#messages').append($('<li>').html( prettyMessage ));
   });

    //modal popup directive
    $scope.showModal = false; //Show the modal when page loads
    $scope.toggleModal = function(){
        $scope.showModal = !$scope.showModal;
    };

    $scope.tempHandle = "Butters Stotch";

    $scope.updateHandle = function(newHandle){
    $scope.myHandle = newHandle;
    $scope.showModal = !$scope.showModal;
  };

}]);

app.directive('modal', [ '$timeout' , function ($timeout) {
    return {
      template: '<div class="modal fade">' + 
          '<div class="modal-dialog">' + 
            '<div class="modal-content">' + 
              '<div class="modal-header">' + 
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' + 
                '<h4 class="modal-title">Options</h4>' + 
              '</div>' + 
              '<div class="modal-body" ng-transclude></div>' + 
            '</div>' + 
          '</div>' + 
        '</div>',
      restrict: 'E',
      transclude: true,
      replace:true,
      scope:true,
      link: function postLink(scope, element, attrs) {
        scope.title = attrs.title;

        scope.$watch(attrs.visible, function(value){
         

            $timeout(function() {
            // We must reevaluate the value in case it was changed by a subsequent
            // watch handler in the digest.
           if(value == true) {
              $(element).modal('show');
            } else
            $(element).modal('hide');

          }, 0, false);
        
           
          
        });

        $(element).on('shown.bs.modal', function(){
          scope.$apply(function(){
            scope.$parent[attrs.visible] = true;
          });
        });

        $(element).on('hidden.bs.modal', function(){
          scope.$apply(function(){
            scope.$parent[attrs.visible] = false;
          });
        });
      }
    };
}]);