/* global angular, document, window */
'use strict';

angular.module('starter.controllers', ['angularMoment', 'ngCordova', 'nvd3', 'ngCordova','ionic.service.core', 'ionic.service.push'])

.controller('AppCtrl', function($scope) {

})

.controller('LoginCtrl', function($scope, ionicMaterialInk, $ionicPopup, $state, DBService) {
  // Check if user is already logged in
  if(window.localStorage['email']) {
    $state.go('tab.fav');
  }

  // Create javascript object to get user parameters
  $scope.user = {};

  // Perform login function
  $scope.login = function() {
    var sendData = {'tag':"login", 'email':$scope.user.email, 'password':$scope.user.password};

    DBService.sendToDB(sendData, true).then(function(promise) {
      if (promise.data.success === 1) {
        if (promise.data.user.block === "1") {
          $ionicPopup.alert({
            title : "Åtkomst nekad",
            subTitle: "Du har tyvärr blivit blockerad att använda tjänsten"
          });
        } else {
          // Store user in cache
          console.log(promise.data);
          window.localStorage['user_id'] = promise.data.user.user_id;
          window.localStorage['email'] = $scope.user.email;
          window.localStorage['firstname'] = promise.data.user.firstname;
          window.localStorage['lastname'] = promise.data.user.lastname;
          window.localStorage['debt'] = promise.data.user.debt;

          // Go to global feed
          $state.go('tab.feed');
        }
      }
    });
  }
})

.controller('RegisterCtrl', function($scope, $state, $ionicPopup, DBService) {
  // Create javascript object to get user parameters
  $scope.user = {};

  // Register user
  $scope.register = function() {
    var firstname = $scope.user.firstname.charAt(0).toUpperCase() + $scope.user.firstname.slice(1);
    var lastname = $scope.user.lastname.charAt(0).toUpperCase() + $scope.user.lastname.slice(1);

    var sendData = {'tag':"register", 'user_id':$scope.user.user_id, 'email':$scope.user.email, 'password':$scope.user.password, 'firstname':firstname, 'lastname':lastname};

    DBService.sendToDB(sendData, true).then(function(promise) {
      if (promise.data.success === 1) {
        // Store user in cache
        window.localStorage['user_id'] = $scope.user.user_id;
        window.localStorage['email'] = $scope.user.email;
        window.localStorage['firstname'] = firstname;
        window.localStorage['lastname'] = lastname;
        window.localStorage['debt'] = 0;

        // Display welcome message
        $ionicPopup.alert({
          title : "Registering klar!",
          subTitle: "Välkommen "+firstname+" "+lastname+"!"
        }).then(function(res) {
          $state.go('tab.fav');
        });
      }
    });
  }
})

.controller('FriendsCtrl', function($scope, ionicMaterialInk, ionicMaterialMotion) {

    // Set Motion
    ionicMaterialMotion.fadeSlideInRight();

    // Set Ink
    ionicMaterialInk.displayEffect();
})

.controller('ProfileCtrl', function($scope, $state, ionicMaterialMotion, ionicMaterialInk, DBService) {

    $scope.logout = function() {
      window.localStorage['email'] = "";
      window.localStorage['firstname'] = "";
      window.localStorage['lastname'] = "";
      $state.go('login');
    }

     $scope.doRefresh = function() {
        var sendData = {'tag':'getProfile', 'user_id': '1'};
            DBService.sendToDB(sendData, false).then(function(promise) {
              if (promise.data.success === 1) {
                $scope.profile = promise.data.profile; 
              }

            $scope.options = {
            chart: {
                type: 'pieChart',
                height: 500,
                margin: {
                        top: -100,
                        right: 0,
                        bottom: 0,
                        left: 0
                },
                donut: true,
                title: $scope.profile[0].debt,
                titleOffset: -30,
                x: function(d){return d.name;},
                y: function(d){return d.sum;},
                showLabels: false,             
                pie: {
                    startAngle: function(d) { return d.startAngle/2 -Math.PI/2 },
                    endAngle: function(d) { return d.endAngle/2 -Math.PI/2 }
                },
                duration: 500,
                legend: {
                    margin: {
                        top: 8,
                        right: 100,
                        bottom: 0,
                        left: 0
                    }
                }
            }
        };


            });
        };

        $scope.$on('$ionicView.loaded', function(){
            $scope.doRefresh();
        });

 // Set Motion
    ionicMaterialMotion.blinds();

    // Set Ink
    ionicMaterialInk.displayEffect();
})

.controller('FeedCtrl', function($scope, ionicMaterialMotion, ionicMaterialInk, DBService) {
  function getColor() {
    var color = ['green.jpg', 'blue.jpg', 'purple.jpg'];
    color = color[Math.floor(Math.random()*color.length)];
    return "../img/" + color;
  }
      
  var sendData = {'tag':'getFeed'};
  $scope.doRefresh = function() {
    DBService.sendToDB(sendData, false).then(function(promise) {
      if (promise.data.success === 1) {
        $scope.feed = promise.data.feed;
        angular.forEach($scope.feed, function(c) {
          c.date = new Date(c.date*1000);
          c.datediff = moment(c.date).diff(moment(new Date), 'days');
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
  ionicMaterialMotion.blinds();
})

.controller('ViewCommentsCtrl', function($scope, $stateParams, DBService) {
  $scope.hello = "Hellluuuuu";
  $scope.event_id = $stateParams.event_id;
  $scope.event = {};

  var sendData = {'tag':"getFeedWithID", 'id':$stateParams.event_id};
  DBService.sendToDB(sendData, false).then(function(promise) {
    if (promise.data.success === 1) {
      console.log(promise.data);
    }
  });
})

.controller('FavCtrl', function($scope, $ionicPlatform, ionicMaterialMotion, DBService) { //, $cordovaVibration) {
    $scope.items = {};
    $scope.taps = 0;

    $scope.onHold = function(item, count) {   
        if (!count) {
            count = 1;
        }
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
        return "../img/" + color;
    }

    var sendData = {'tag':'getMostBuyedItem', 'user_id':'1'};

    $scope.doRefresh = function() {
        DBService.sendToDB(sendData, false).then(function(promise) {
          if (promise.data.success === 1) {
             $scope.items = promise.data.items;
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
})

.controller('ScanCtrl', function($scope, $ionicPlatform, $ionicHistory, $state, DBService, $cordovaVibration) {
  $scope.buy = function(barcode) {
    var sendData = {'tag':'purchaseBarcodeItem', 'user_id':window.localStorage['user_id'], 'barcode':barcode};        

    DBService.sendToDB(sendData, true).then(function(promise) {
      if (promise.data.success === 1) {
        if (window.cordova) {
          $ionicPlatform.ready(function() {
            $cordovaVibration.vibrate(100);
            $state.go('tab.feed');
          });
        }
      }
    });
  }

  if (window.cordova) {    
    $ionicPlatform.ready(function() {
      cordova.plugins.barcodeScanner.scan(
        function (result) {
          if (result.cancelled) {
            // Vad ska vi göra här? Visa en lista istället?
            $ionicHistory.goBack();
          } else {
            $scope.buy(result.text);
          }
        }, 
        function (error) {
          //alert("Scanning failed: " + error);
          console.log("Issue with barcode scanner within app");
          $ionicHistory.goBack();
        }
      );
    });        
  } else {
    $scope.infoText = "Denna funktion fungerar ej i webbläsaren.";
  }
});