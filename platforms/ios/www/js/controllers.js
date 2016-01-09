/* global angular, document, window */
'use strict';

angular.module('starter.controllers', ['angularMoment', 'ngCordova', 'nvd3'])

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
        $state.go('tab.fav');
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

.controller('ProfileCtrl', function($scope, $stateParams, $timeout, ionicMaterialMotion, ionicMaterialInk, DBService) {
    // Set Header
    // $scope.$parent.showHeader();
    // $scope.$parent.clearFabs();
    $scope.isExpanded = true;
    // $scope.$parent.setExpanded(true);
    // $scope.$parent.setHeaderFab(false);

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
    //$timeout(function() {
    //    ionicMaterialMotion.slideUp({
    //        selector: '.slide-up'
    //    });
    //}, 300);

 // Set Motion
    ionicMaterialMotion.blinds();

    // Set Ink
    ionicMaterialInk.displayEffect();
})

.controller('FeedCtrl', function($scope, $state, $filter, $stateParams, $timeout, ionicMaterialMotion, ionicMaterialInk, DBService) {
    // $scope.$parent.showHeader();
    // $scope.$parent.clearFabs();
    $scope.isExpanded = true;
    // $scope.$parent.setExpanded(true);
    // $scope.$parent.setHeaderFab(false);

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

    ionicMaterialMotion.blinds();

    // // Activate ink for controller
    // ionicMaterialInk.displayEffect();
    

})

.controller('FavCtrl', function($scope, $ionicPlatform, ionicMaterialMotion, DBService) { //, $cordovaVibration) {
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
        var sendData = {'tag':'purchaseItem', 'user_id': '1', 'item_id':item, 'count':count};
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

.controller('ScanCtrl', function($scope, $ionicPlatform, DBService, $cordovaVibration, $timeout, ionicMaterialInk, ionicMaterialMotion) {
    $scope.loading = false;
    $scope.purchaseComplete = false;

    $scope.name = "";
    $scope.price = "";
    $scope.volume = "";
    $scope.alcohol = "";
    $scope.image = "";

    $scope.message = "";

    $scope.randomMessage = function() {
        var messages = [
            "DDDJF",
            "Ahh mumma, fan så gott med "+$scope.name+"!",
            "Drick då!",
            "Svagdricka?!",
            "Häv en 12:a då!",
            "Du vågar aldrig...",
            $scope.price+" spänn? Hur fan har du råd med det?",
            $scope.price+" ohhh där ryker studiebidraget!",
            $scope.alcohol+"%? Ska du bli nykter eller?",
            "Fy fan vad äckligt! Bäsk är tamifan godare.",
            "Kan du läsa det här är du för nykter.",
            "Se för fan till att inte spilla nu."
        ];

        var random = Math.floor((Math.random() * messages.length) + 1);
        $scope.message = messages[random];
    }


    $scope.buy = function(barcode) {
        var sendData = {'tag':'purchaseBarcodeItem', 'user_id': '1', 'barcode':barcode};        

        DBService.sendToDB(sendData, true).then(function(promise) {
            if (promise.data.success === 1) {
                $scope.loading = false;

                if (window.cordova) {
                    $ionicPlatform.ready(function() {
                        // Vibrate 100ms
                        $cordovaVibration.vibrate(100);

                        $scope.name = promise.data.item.name;
                        $scope.price = promise.data.item.price;
                        $scope.volume = promise.data.item.volume;
                        $scope.alcohol = promise.data.item.alcohol;
                        $scope.image = promise.data.item.image;

                        $scope.randomMessage();
                        $scope.purchaseComplete = true;
                    });
                }
            }
        });        
    }

    if (window.cordova) {
        $scope.loading = true;
        $ionicPlatform.ready(function() {
            cordova.plugins.barcodeScanner.scan(
                function (result) {
                    if (result.cancelled) {
                        // Vad ska vi göra här? Visa en lista istället?
                    } else {
                        $scope.buy(result.text);
                    }
                }, 
                function (error) {
                    //alert("Scanning failed: " + error);
                }
            );
        });        
    } else {
        $scope.infoText = "Denna funktion fungerar ej i webbläsaren.";
    }

})

;
