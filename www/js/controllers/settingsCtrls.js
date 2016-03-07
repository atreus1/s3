var app = angular.module('starter.controllers');

app.controller('SettingsCtrl', function($scope, $state, DBService, SettingsService) {
  var storedSettings = SettingsService.getSettings()
  $scope.settings = {};  
  $scope.settings.cacheData = storedSettings.cacheData;
  $scope.settings.allowAudio = storedSettings.allowAudio;
  $scope.settings.allowVibration = storedSettings.allowVibration;

  $scope.$on('$ionicView.beforeEnter', function() {
    $scope.getUserDebt();

    $scope.firstname = window.localStorage['firstname'];
    $scope.lastname = window.localStorage['lastname'];
    $scope.email = window.localStorage['email'];
    $scope.admin = window.localStorage['admin'] === '1' ? true : false;
  });

  $scope.updateSetting = function(type) {
    if (type === 'cacheData') {
      SettingsService.updateSettings("cacheData", $scope.settings.cacheData);
    } else if (type === 'allowAudio') {
      SettingsService.updateSettings("allowAudio", $scope.settings.allowAudio);
    } else if (type === 'allowVibration') {
      SettingsService.updateSettings("allowVibration", $scope.settings.allowVibration);
    }    
  }

  $scope.getUserDebt = function() {    
    var sendData = {'tag':"getMyDebt", 'user_id':window.localStorage['user_id']};

    DBService.sendToDB(sendData, false).then(function(promise) {
      if (promise.data.success === 1) {
        $scope.debt = promise.data.debt;
      }
    });
  }

  $scope.logout = function() {
    localStorage.clear();
    $state.go('login');
  }  
});

app.controller('PurchasesCtrl', function($scope, $ionicPopup, DBService) {
  $scope.deleteItem = function(purchase_id, count, name, price) {
    $ionicPopup.confirm({
      title: 'Ångra köp',
      template: '<center>Ångra köpet av '+count+'st '+name+'?</center>',
      cancelText: 'Nej',
      okText: 'Ja'
    }).then(function(res) {
      if(res) {
        console.log("delete event "+ purchase_id + " " + count);
        var sendData = {'tag':"deletePurchase", 'item_id':purchase_id, 'count':count, 'price':price, 'user_id': window.localStorage['user_id']};
        DBService.sendToDB(sendData, false).then(function(promise) {
          if (promise.data.success === 1) {
            // console.log(promise.data);
            $scope.getMyPurchases();
          }
        });
      }
    });
  }

  $scope.$on('$ionicView.enter', function() {
    $scope.getMyPurchases();
  });

  $scope.getMyPurchases = function() {
  var sendData = {'tag':"getMyPurchases", 'user_id':window.localStorage['user_id']};

  DBService.sendToDB(sendData, false).then(function(promise) {
    if (promise.data.success === 1) {
      console.log(promise.data);
      $scope.myPurchases = promise.data.purchases;
      angular.forEach($scope.myPurchases, function(c) {
        c.date = moment(c.date, "YYYY-MM-DD HH:mm:ss").toDate();
        c.datediff = moment(c.date).diff(moment(new Date), 'days');
        c.hourdiff = Math.abs(moment(c.date).diff(moment(new Date), 'hours'));
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
              subTitle: "Din email är nu bytt"
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

app.controller('NewItemCtrl', function($scope, $state, $stateParams, $ionicPopup, DBService) {
  $scope.item = {};
  $scope.item.barcode = $stateParams.barcode;
  $scope.item.image = "";
  $scope.item.volume = "";
  $scope.item.alcohol = "";

  $scope.storeItem = function() {
    var name = $scope.item.name;
    if (name.indexOf("\'") > 0) {
      name = name.replace("\'", "\\\'");
    }

    if (name.indexOf("\"") > 0) {
      name = name.replace("\"", "\\\"");
    }

    var sendData = {
      'tag':"addCompleteItem",
      'name':name,
      'image':$scope.item.image,
      'price':$scope.item.price,
      'volume':$scope.item.volume,
      'alcohol':$scope.item.alcohol,
      'barcode':$scope.item.barcode
    };
    console.log(sendData);
    DBService.sendToDB(sendData, true).then(function(promise) {
      if (promise.data.success === 1) {
        $ionicPopup.alert({
          title : "Klart",
          subTitle: "Varan är tillagd!"
        }).then(function(res) {
            $state.go('tab.fav');
        });         
      }
    });
  }

  $scope.cancel = function() {
    $state.go("tab.settings");
  }
});