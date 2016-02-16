var app = angular.module('starter.controllers');

app.controller('ScanCtrl', function($scope, $ionicPlatform, $ionicPopup, $ionicHistory, $state, DBService, $cordovaVibration, $cordovaFlashlight) {
  $scope.$on('$ionicView.enter', function(){
    $scope.openScanner();
  });

  $scope.buy = function(barcode) {
    var sendData = {'tag':'purchaseBarcodeItem', 'user_id':window.localStorage['user_id'], 'barcode':barcode};        

    DBService.sendToDB(sendData, false).then(function(promise) {
      if (promise.data.success === 1) {
        if (window.cordova) {
          $ionicPlatform.ready(function() {
            $cordovaVibration.vibrate(100);
            $state.go('tab.feed');
          });
        }
      } else {
        $ionicPopup.alert({
          title : "Fel",
          subTitle: promise.data.error_msg
        }).then(function(res) {
          var admin = window.localStorage['admin']
          if (admin && admin === "1") {
            $ionicPopup.confirm({
              title: 'Lägg till vara',
              template: '<center>Vill du lägga till varan?',
              cancelText: 'Nej',
              okText: 'Ja'
            }).then(function(res) {
              if(res) {
                $state.go("tab.new-item", {"barcode": barcode});
              } else {
                $ionicHistory.goBack(-1);    
              }
            });
          } else {
            $ionicHistory.goBack(-1);
          }
        });
      }
    });
  }

  $scope.openScanner = function() {
    if (window.cordova) {
      var avail;    
      $ionicPlatform.ready(function() {      
        $cordovaFlashlight.available().then(function(availability) {
          avail = availability; // is available
          $cordovaFlashlight.switchOn();
        }, function () {
          avail = false;
        }); 

        cordova.plugins.barcodeScanner.scan(
          function (result) {
            if (result.cancelled) {
              $ionicHistory.goBack(-1);
            } else {
              $scope.buy(result.text);
            }
            if (avail) {
              $cordovaFlashlight.switchOff();
            }          
          }, 
          function (error) {
            console.log("Issue with barcode scanner within app");
            if (avail) {
              $cordovaFlashlight.switchOff();
            }          
            $ionicHistory.goBack(-1);
          }
        );
      });        
    } else {
      $scope.infoText = "Denna funktion fungerar ej i webbläsaren.";
    }
  }
});