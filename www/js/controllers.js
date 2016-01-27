/* global angular, document, window */
'use strict';

angular.module('starter.controllers', ['angularMoment', 'ngCordova', 'nvd3', 'ionic.service.core', 'ionic.service.push'])

.controller('AppCtrl', function($scope) {

})

.controller('LoginCtrl', function($scope, $ionicPopup, $state, DBService) {

  $scope.$on('$ionicView.loaded', function() {
    // Check if user is already logged in
    if(window.localStorage['email']) {
      $state.go('tab.fav');
    }
  });

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
            subTitle: "Du har blivit blockerad att använda tjänsten"
          });
        } else {
          // Store user in cache
          //console.log(promise.data);
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
  $scope.user.user_id = window.localStorage['user_id'];
  $scope.user.firstname = window.localStorage['firstname'];
  $scope.user.lastname = window.localStorage['lastname'];

  // Register user
  $scope.register = function() {
    if ($scope.user.password !== $scope.user.repeat_password) {
      $ionicPopup.alert({
        title : "Fel",
        subTitle: "Lösenorden matchar inte! Var god försök igen"
      }).then(function(res) {
        $scope.user.password = "";
        $scope.user.repeat_password = "";
      });
    } else {
      var sendData = {'tag':"register", 'user_id':window.localStorage['user_id'], 'email':$scope.user.email, 'password':$scope.user.password};

      DBService.sendToDB(sendData, true).then(function(promise) {
        if (promise.data.success === 1) {

          window.localStorage['email'] = $scope.user.email;
          window.localStorage['debt'] = 0;

          $ionicPopup.alert({
            title : "Registering klar!",
            subTitle: "Välkommen "+window.localStorage['firstname']+" "+window.localStorage['lastname']+"!"
          }).then(function(res) {
            $state.go('tab.feed');
          });
        }
      });
    }
  }
})

.controller('IDCtrl', function($scope, $state, $ionicPopup, DBService) {
  $scope.user = {};

  $scope.checkID = function() {
    var isOK = false;
    var id = $scope.user.user_id;

    if (id.length === 10) {
      isOK = true;
    } else if (id.length === 12) {
      id = id.substring(2, 12);
      isOK = true;
    } else {
      $ionicPopup.alert({
        title : "Ogiltigt personnummer",
        subTitle: "Vänligen ange personnummer på formen 123456XXXX"
      }).then(function(res) {
        $scope.user.user_id = "";
      });
    }

    if (isOK) {
      var sendData = {'tag':"isUserExisting", 'user_id':id};
      DBService.sendToDB(sendData, true).then(function(promise) {
        if (promise.data.success === 1) {
          // Store user in cache
          console.log("user_id exists in db");
          console.log(promise.data);

          if (promise.data.user.email === "") {
            // user is new, should enter pw and email on new page
            window.localStorage['user_id'] = id;
            window.localStorage['firstname'] = promise.data.user.firstname.charAt(0).toUpperCase() + promise.data.user.firstname.slice(1);
            window.localStorage['lastname'] = promise.data.user.lastname.charAt(0).toUpperCase() + promise.data.user.lastname.slice(1);

            $state.go('register');
          } else {
            $ionicPopup.alert({
              title : "Användare redan registrerad!",
              subTitle: "Ditt personnummer finns redan med i systemet. Logga in med din email och ditt lösenord!"
            }).then(function(res) {
              $state.go('login');
            });
          }
        }
      });
    }
  }
})

.controller('ProfileCtrl', function($scope, DBService) {
  $scope.chartPie = {
    options: {
      chart: {
        type: 'pie'
      },
      colors: [
        '#ED1176',
        '#E24E1B',
        '#AF4319',
        '#FF773D',
        '#D0E37F',
        '#2E86AB',
        '#A23B72',
        '#086788',
        '#07A0C3',
        '#92DCE5',
        '#54494B',
        '#F1F7ED',
        '#7FB800'
      ],
    },
    series: [{
      data: [
        // ['Download', 100],
        // ['Upload', 500]
      ],
      name: ' ',
      dataLabels: {
        rotation: 0,
        enabled: false,
        format: ''
      }
    }],
    title: {
      text: 'Mina köp'
    },
    credits: {
      enabled: false
    },
    loading: false
  }

  $scope.doRefresh = function() {
    var sendData = {'tag':'getProfile', 'user_id': window.localStorage['user_id']};
    DBService.sendToDB(sendData, false).then(function(promise) {
      if (promise.data.success === 1) {
        $scope.profile = promise.data.profile; 
        console.log($scope.profile);

        var tempArray = [];

        for (var i = 0; i < $scope.profile.length; i++) {
          // Create tuples
          tempArray[i] = [$scope.profile[i].name, parseInt($scope.profile[i].sum)];
        }

        console.log(tempArray);
        $scope.chartPie.series[0].data = tempArray;
        $scope.chartPie.series[0].name = $scope.profile[0].firstname + " " + $scope.profile[0].lastname;
      }
    });
  }  

  $scope.$on('$ionicView.loaded', function(){
    $scope.doRefresh();
  });

 //     $scope.doRefresh = function() {
 //        var sendData = {'tag':'getProfile', 'user_id': window.localStorage['user_id']};
 //            DBService.sendToDB(sendData, false).then(function(promise) {
 //              if (promise.data.success === 1) {
 //                $scope.profile = promise.data.profile; 
 //              }

 //            $scope.options = {
 //            chart: {
 //                type: 'pieChart',
 //                height: 500,
 //                margin: {
 //                        top: -100,
 //                        right: 0,
 //                        bottom: 0,
 //                        left: 0
 //                },
 //                donut: true,
 //                title: $scope.profile[0].debt,
 //                titleOffset: -30,
 //                x: function(d){return d.name;},
 //                y: function(d){return d.sum;},
 //                showLabels: false,             
 //                pie: {
 //                    startAngle: function(d) { return d.startAngle/2 -Math.PI/2 },
 //                    endAngle: function(d) { return d.endAngle/2 -Math.PI/2 }
 //                },
 //                duration: 500,
 //                legend: {
 //                    margin: {
 //                        top: 8,
 //                        right: 100,
 //                        bottom: 0,
 //                        left: 0
 //                    }
 //                }
 //            }
 //        };


 //            });
 //        };

 //        $scope.$on('$ionicView.loaded', function(){
 //            $scope.doRefresh();
 //        });

 // // Set Motion
 //    ionicMaterialMotion.blinds();

 //    // Set Ink
 //    ionicMaterialInk.displayEffect();
})

.controller('FeedCtrl', function($scope, ionicMaterialMotion, ionicMaterialInk, DBService) {
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
})

.controller('ViewCommentsCtrl', function($scope, $stateParams, DBService) {
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

})

.controller('FavCtrl', function($scope, $ionicPlatform, ionicMaterialMotion, DBService) { //, $cordovaVibration) {
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
      } else {
        $ionicHistory.goBack(-1);
      }
    });
  }

  if (window.cordova) {    
    $ionicPlatform.ready(function() {
      cordova.plugins.barcodeScanner.scan(
        function (result) {
          if (result.cancelled) {
            $ionicHistory.goBack(-1);
          } else {
            $scope.buy(result.text);
          }
        }, 
        function (error) {
          //alert("Scanning failed: " + error);
          console.log("Issue with barcode scanner within app");
          $ionicHistory.goBack(-1);
        }
      );
    });        
  } else {
    $scope.infoText = "Denna funktion fungerar ej i webbläsaren.";
  }
})

.controller('SettingsCtrl', function($scope, $state) {
  $scope.hello = "Tjenna";

  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.firstname = window.localStorage['firstname'];
    $scope.lastname = window.localStorage['lastname'];
    $scope.email = window.localStorage['email'];
  });

  $scope.logout = function() {
    window.localStorage['user_id'] = "";
    window.localStorage['email'] = "";
    window.localStorage['firstname'] = "";
    window.localStorage['lastname'] = "";
    window.localStorage['debt'] = "";
    $state.go('login');
  }  
})

.controller('PurchasesCtrl', function($scope, $ionicPopup, DBService) {
  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.getMyPurchases();
  });

  $scope.deleteItem = function(purchase_id) {
    console.log("delete event "+purchase_id);

    // update list again:
    $scope.getMyPurchases();
  }

  $scope.getMyPurchases = function() {
    var sendData = {'tag':"getMyPurchases", 'user_id':window.localStorage['user_id']};

    DBService.sendToDB(sendData, false).then(function(promise) {
      if (promise.data.success === 1) {
        console.log(promise.data);
        $scope.myPurchases = promise.data.purchases;
        angular.forEach($scope.myPurchases, function(c) {
          c.date = new Date(c.date*1000);
          c.datediff = moment(c.date).diff(moment(new Date), 'days');
        });
      } else {
        $scope.infoText = "Kunde inte hitta några köp";
      }
    });    
  }
})

.controller('EmailCtrl', function($scope, $ionicPopup, $ionicHistory, DBService) {
  $scope.user = {};

  $scope.updateEmail = function() {
    var sendData = {'tag':"login", 'email':window.localStorage['email'], 'password':$scope.user.password};

    DBService.sendToDB(sendData, false).then(function(promise) {
      if (promise.data.success === 1) {
        // console.log("old password is correct");
        var sendData = {'tag':"updateEmail", 'email':$scope.user.new_email, 'old_email':window.localStorage['email']};
        DBService.sendToDB(sendData, true).then(function(promise) {
          if (promise.data.success === 1) {
            // console.log("new password is stored");
            window.localStorage['email'] = $scope.user.new_email;
            $ionicPopup.alert({
              title : "Klart!",
              subTitle: "Ditt email är nu bytt"
            }).then(function(res) {
              $ionicHistory.goBack();
            });                            
          }
        });
      } else {
        $ionicPopup.alert({
          title : "Fel lösenord!",
          subTitle: "Ange ditt lösenord för att gå vidare"
        }).then(function(res) {
          $scope.user.password = "";
        });          
      }
    });    
  }
})

.controller('PasswordCtrl', function($scope, $ionicPopup, $ionicHistory, DBService) {
  $scope.user = {};

  $scope.updatePassword = function() {
    var sendData = {'tag':"login", 'email':window.localStorage['email'], 'password':$scope.user.password};

    DBService.sendToDB(sendData, false).then(function(promise) {
      if (promise.data.success === 1) {
        // console.log("old password is correct");
        var sendData = {'tag':"updatePassword", 'email':window.localStorage['email'], 'password':$scope.user.new_password};
        DBService.sendToDB(sendData, true).then(function(promise) {
          if (promise.data.success === 1) {
            // console.log("new password is stored");
            $ionicPopup.alert({
              title : "Klart!",
              subTitle: "Ditt lösenord är nu bytt"
            }).then(function(res) {
              $ionicHistory.goBack();
            });                            
          }
        });
      } else {
        $ionicPopup.alert({
          title : "Fel lösenord!",
          subTitle: "Det gamla lösenordet stämmer inte"
        }).then(function(res) {
          $scope.user.password = "";
        });          
      }
    });
  }
});