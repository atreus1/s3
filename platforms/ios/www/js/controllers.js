/* global angular, document, window */
'use strict';

angular.module('starter.controllers', ['angularMoment', 'ngCordova'])

.controller('AppCtrl', function($scope, $ionicModal, $ionicPopover, $timeout) {
    // Form data for the login modal
    $scope.loginData = {};
    $scope.isExpanded = false;
    $scope.hasHeaderFabLeft = false;
    $scope.hasHeaderFabRight = false;

    // var navIcons = document.getElementsByClassName('ion-navicon');
    // for (var i = 0; i < navIcons.length; i++) {
    //     navIcons.addEventListener('click', function() {
    //         this.classList.toggle('active');
    //     });
    // }

    // ////////////////////////////////////////
    // // Layout Methods
    // ////////////////////////////////////////

    // $scope.hideNavBar = function() {
    //     document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
    //     document.getElementsByTagName('ion-footer-bar')[0].style.display = 'none';
    // };

    // $scope.showNavBar = function() {
    //     document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
    //     document.getElementsByTagName('ion-footer-bar')[0].style.display = 'block';
    // };

    // $scope.noHeader = function() {
    //     var content = document.getElementsByTagName('ion-content');
    //     for (var i = 0; i < content.length; i++) {
    //         if (content[i].classList.contains('has-header')) {
    //             content[i].classList.toggle('has-header');
    //         }
    //         if (content[i].classList.contains('has-footer')) {
    //             content[i].classList.toggle('has-footer');
    //         }
    //     }
    // };

    // $scope.setExpanded = function(bool) {
    //     $scope.isExpanded = bool;
    // };

    // $scope.setHeaderFab = function(location) {
    //     var hasHeaderFabLeft = false;
    //     var hasHeaderFabRight = false;

    //     switch (location) {
    //         case 'left':
    //             hasHeaderFabLeft = true;
    //             break;
    //         case 'right':
    //             hasHeaderFabRight = true;
    //             break;
    //     }

    //     $scope.hasHeaderFabLeft = hasHeaderFabLeft;
    //     $scope.hasHeaderFabRight = hasHeaderFabRight;
    // };

    // $scope.hasHeader = function() {
    //     var content = document.getElementsByTagName('ion-content');
    //     for (var i = 0; i < content.length; i++) {
    //         if (!content[i].classList.contains('has-header')) {
    //             content[i].classList.toggle('has-header');
    //         }
    //         if (!content[i].classList.contains('has-footer')) {
    //             content[i].classList.toggle('has-footer');
    //         }
    //     }

    // };

    // $scope.hideHeader = function() {
    //     $scope.hideNavBar();
    //     $scope.noHeader();
    // };

    // $scope.showHeader = function() {
    //     $scope.showNavBar();
    //     $scope.hasHeader();
    // };

    // $scope.clearFabs = function() {
    //     var fabs = document.getElementsByClassName('button-fab');
    //     if (fabs.length && fabs.length > 1) {
    //         fabs[0].remove();
    //     }
    // };
})

.controller('LoginCtrl', function($scope, $timeout, $stateParams, ionicMaterialInk, $state) {
    $scope.user = {};
    // $scope.$parent.clearFabs();
    // $timeout(function() {
    //     $scope.$parent.hideHeader();
    // }, 0);
    // ionicMaterialInk.displayEffect();
    $scope.login = function() {
        $state.go('tab.activity');

        console.log($scope.user);

        // window.localStorage["user_id"] = user.username;
    }    
})

.controller('FriendsCtrl', function($scope, $stateParams, $timeout, ionicMaterialInk, ionicMaterialMotion) {
    // Set Header
    // $scope.$parent.showHeader();
    // $scope.$parent.clearFabs();
    // $scope.$parent.setHeaderFab('left');

    // Delay expansion
    $timeout(function() {
        $scope.isExpanded = true;
        // $scope.$parent.setExpanded(true);
    }, 300);

    // Set Motion
    ionicMaterialMotion.fadeSlideInRight();

    // Set Ink
    ionicMaterialInk.displayEffect();
})

.controller('ProfileCtrl', function($scope, $stateParams, $timeout, ionicMaterialMotion, ionicMaterialInk) {
    // Set Header
    // $scope.$parent.showHeader();
    // $scope.$parent.clearFabs();
    $scope.isExpanded = true;
    // $scope.$parent.setExpanded(true);
    // $scope.$parent.setHeaderFab(false);

    // Set Motion
    $timeout(function() {
        ionicMaterialMotion.slideUp({
            selector: '.slide-up'
        });
    }, 300);

 // Set Motion
    ionicMaterialMotion.fadeSlideInRight();

    // Set Ink
    ionicMaterialInk.displayEffect();
})

.controller('ActivityCtrl', function($scope, $filter, $stateParams, $timeout, ionicMaterialMotion, ionicMaterialInk, DBService) {
    // $scope.$parent.showHeader();
    // $scope.$parent.clearFabs();
    $scope.isExpanded = true;
    // $scope.$parent.setExpanded(true);
    // $scope.$parent.setHeaderFab(false);
    $scope.hello = "TJAAAA";
      
    var sendData = {'tag':'getFeed'};
    $scope.doRefresh = function() {
        DBService.sendToDB(sendData, false).then(function(promise) {
          if (promise.data.success === 1) {
             $scope.feed = promise.data.feed;
             console.log(promise.data.feed);
             angular.forEach($scope.feed, function(c) {
                c.date = new Date(c.date);
                c.datediff = moment(c.date).diff(moment(new Date), 'days');
            }); 
          }
        }).finally(function() {
          // Stop the ion-refresher from spinning
          $scope.$broadcast('scroll.refreshComplete');
        });
      };
        // Update feed when user enters scene
      $scope.$on('$stateChangeSuccess', function(event, toState) {
          if (toState.name === "app.activity") {
            $scope.doRefresh();
        }
      });

    // ionicMaterialMotion.fadeSlideInRight();

    // // Activate ink for controller
    // ionicMaterialInk.displayEffect();
    

})

.controller('GalleryCtrl', function($scope, $ionicPlatform, DBService) { //, $cordovaVibration) {
    // Set Header
    // $scope.$parent.showHeader();
    // $scope.$parent.clearFabs();
    // $scope.$parent.setHeaderFab('left');
    // $scope.isExpanded = true;
    // $scope.$parent.setExpanded(true);
    $scope.items = {};
    $scope.taps = 0;

    $scope.onHold = function(item, count) {   

        if (!count) {
            count = 1;
        }

        console.log("köp");

        var sendData = {'tag':'purchaseItem', 'user_id': '1', 'item_id':item, 'count':count};

        console.log(sendData);

        DBService.sendToDB(sendData, false).then(function(promise) {
          if (promise.data.success === 1) {
            console.log("köp klart!");
            console.log(promise.data);

            // vibrate here
            // $ionicPlatform.ready(function() {
            //     // Vibrate 100ms
            //     $cordovaVibration.vibrate(100);                
            // });
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
      $scope.$on('$stateChangeSuccess', function(event, toState) {
          if (toState.name === "app.activity") {
            $scope.doRefresh();
        }
      });
      $scope.doRefresh();

   // Activate ink for controller
    // ionicMaterialInk.displayEffect();

    // ionicMaterialMotion.pushDown({
    //     selector: '.push-down'
    // });
    // ionicMaterialMotion.fadeSlideInRight({
    //     selector: '.animate-fade-slide-in .item'
    // });
})

.controller('ScanCtrl', function($scope, $ionicPlatform, DBService) {
  $scope.scanBarcode = function() {
    console.log("Knappen");
    $ionicPlatform.ready(function() {
      console.log("we are ready!");
      // navigator.helloworld.say();
      cordova.plugins.barcodeScanner.scan(
        function (result) {
          alert(result.text);
        }, 
        function (error) {
          alert("Scanning failed: " + error);
        }
      );
    });    
  }
})

;
