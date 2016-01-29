var app = angular.module('starter.controllers');

app.controller('FavCtrl', function($scope, $ionicPlatform, ionicMaterialMotion, DBService) { //, $cordovaVibration) {
    $scope.items = {};
    $scope.taps = 0;

    $scope.onHold = function(item, count) {   
        if (!count) 
            count = 1;
        var sendData = {'tag':'purchaseItem', 'user_id': window.localStorage['user_id'], 'item_id':item, 'count':count};
        DBService.sendToDB(sendData, false).then(function(promise) {
            if (promise.data.success === 1) {
                if (window.cordova) {
                    $ionicPlatform.ready(function() {
                        // Vibrate 100ms
                        $cordovaVibration.vibrate(100);
                    });
                }
            } else {
                // display popup here about try again
            }
        });
    }

    function getColor() {
        var color = ['green.jpg', 'blue.jpg', 'purple.jpg'];
        color = color[Math.floor(Math.random()*color.length)];
        return "/img/" + color;
    }

    var sendData = {'tag':'getMostBuyedItem', 'user_id':window.localStorage['user_id']};

    $scope.doRefresh = function() {
        DBService.sendToDB(sendData, false).then(function(promise) {
          if (promise.data.success === 1) {
             $scope.items = promise.data.items;
             console.log($scope.items);
             angular.forEach($scope.items, function(c) {
                    if (!c.image)
                    c.image = getColor();
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
   // Activate ink for controller
    // ionicMaterialInk.displayEffect();

    // ionicMaterialMotion.pushDown({
    //     selector: '.push-down'
    // });
    // ionicMaterialMotion.fadeSlideInRight({
    //     selector: '.animate-fade-slide-in .item'
    // });
});