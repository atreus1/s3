var app = angular.module('starter.controllers');

app.controller('SettingsCtrl', function($scope, $state) {
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
});

app.controller('PurchasesCtrl', function($scope, $ionicPopup, DBService) {
  $scope.deleteItem = function(purchase_id, count, name, price) {
    var confirmPopup = $ionicPopup.confirm({
     title: 'faggot drick då ..',
     template: 'ångra köpet av ' +  count + 'st ' + name
   });

   confirmPopup.then(function(res) {
     if(res) {
          console.log("delete event "+ purchase_id + " " + count);
          var sendData = {'tag':"deletePurchase", 'item_id':purchase_id, 'count':count, 'price':price, 'user_id': window.localStorage['user_id']};
          DBService.sendToDB(sendData, false).then(function(promise) {
            if (promise.data.success === 1) {
              console.log(promise.data);
            }
          }); 
          // update list again:

     } 
   });
  //$scope.getMyPurchases();
 };

   $scope.$on('$ionicView.loaded', function() {
    $scope.getMyPurchases();
  });

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
});

app.controller('EmailCtrl', function($scope, $ionicPopup, $ionicHistory, DBService) {
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
});

app.controller('PasswordCtrl', function($scope, $ionicPopup, $ionicHistory, DBService) {
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