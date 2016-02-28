var app = angular.module('starter.controllers');

app.controller('FeedCtrl', function($scope, DBService, SettingsService) {
  $scope.feed = {};

  if (window.localStorage["feed"]) {
    if (SettingsService.getSettings.cacheData) {
      $scope.feed = JSON.parse(window.localStorage["feed"]);
    } else {
      window.localStorage["feed"] = "";
    }
  }    

  function getColor() {
    var color = ['#ED1176', '#E23227', '#086788', '#FF773D', '#87E752'];
    color = color[Math.floor(Math.random()*color.length)];
    return color;
  }
      
  var sendData = {'tag':'getFeed'};
  $scope.doRefresh = function() {
    
    DBService.sendToDB(sendData, false).then(function(promise) {
      if (promise.data.success === 1) {
        var events = promise.data.feed;

        angular.forEach(events, function(c) {
          c.date = new Date(c.date*1000);
          c.datediff = moment(c.date).diff(moment(new Date), 'days');
          if (c.comments > 0) {
            c.multi = c.multi-(c.comments-1);
          }

          if (!c.image) {
            c.image = getColor();
          } else {
            if (c.image === "local") {
              c.image = "img/items/"+c.item_id+".jpg";
            }
          }
        });

        $scope.feed = events;

        // Save for cache
        if (SettingsService.getSettings.cacheData) {
          window.localStorage["feed"] = JSON.stringify(events);
        }        
      }
    }).finally(function() {
      // Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  // Update feed when user enters scene
  $scope.$on('$ionicView.beforeEnter', function(){
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