var app = angular.module('starter.controllers');

app.controller('ScanCtrl', function($scope, $ionicPlatform, $ionicHistory, $state, DBService, $cordovaVibration) {
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
});