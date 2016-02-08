var app = angular.module('starter.controllers');

app.controller('FeedCtrl', function($scope, ionicMaterialMotion, ionicMaterialInk, DBService) {
  function getColor() {
    var color = ['pink', 'green', 'blue', 'purple'];
    color = color[Math.floor(Math.random()*color.length)];
    return color;
  }
      
  var sendData = {'tag':'getFeed'};
  $scope.doRefresh = function() {
    DBService.sendToDB(sendData, false).then(function(promise) {
      if (promise.data.success === 1) {
        $scope.feed = promise.data.feed;
        console.log($scope.feed);
        angular.forEach($scope.feed, function(c) {
          c.date = new Date(c.date*1000);
          c.datediff = moment(c.date).diff(moment(new Date), 'days');
          if(c.comments > 0)
            c.multi = c.multi-(c.comments-1);
          if (!c.image) {
            c.image = getColor();
          }
        }); 
      }
    }).finally(function() {
      // Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  // Update feed when user enters scene
  $scope.$on('$ionicView.loaded', function(){
      $scope.doRefresh();
  });
  //ionicMaterialMotion.blinds();
});

app.controller('ViewCommentsCtrl', function($scope, $stateParams, DBService) {
  var firstname = $stateParams.tmp[0];
  var amount = $stateParams.tmp[1]; 
  var item = $stateParams.tmp[2];
  $scope.event = {};
  $scope.comment = {};

  //console.log("amount "+typeof($scope.amount));

  if (amount === "1") {
    $scope.title = firstname+ " buys a "+item;
  } else {
    $scope.title = firstname+ " buys "+amount+" "+item;
  }

  $scope.doRefresh = function() {
    var sendData = {'tag':"getComments", 'id':$stateParams.event_id};
    DBService.sendToDB(sendData, false).then(function(promise) {
      if (promise.data.success === 1) {
        console.log(promise.data.event);
        $scope.event = promise.data.event;
      }
    });
  }

  $scope.addComment = function() {
    var sendData = {'tag':"addComment", 'user_id':window.localStorage['user_id'], 'event_id':$stateParams.event_id, 'comment':$scope.comment.text};
    DBService.sendToDB(sendData, true).then(function(promise) {
      if (promise.data.success === 1) {
        $scope.doRefresh();
        $scope.comment.text ="";
      }
    });
  }

  $scope.$on('$ionicView.loaded', function(){
      $scope.doRefresh();
  });
});