var app = angular.module('starter.controllers');

app.controller('ScanCtrl', function($scope, $ionicPlatform, $ionicPopup, $ionicHistory, $state, DBService, SettingsService, $cordovaVibration, $cordovaFlashlight, $cordovaNativeAudio) {
  $scope.$on('$ionicView.enter', function(){
    $scope.openScanner();
  });

  if (window.cordova) {
    $ionicPlatform.ready(function() {
      $cordovaNativeAudio.preloadSimple("open", "audio/open.mp3");
      $cordovaNativeAudio.preloadSimple("eating", "audio/eating.mp3");
    });
  }  

  $scope.buy = function(barcode) {
    var sendData = {'tag':'purchaseBarcodeItem', 'user_id':window.localStorage['user_id'], 'barcode':barcode};        

    DBService.sendToDB(sendData, false).then(function(promise) {
      if (promise.data.success === 1) {
        if (window.cordova) {
          $ionicPlatform.ready(function() {
            if (SettingsService.getSettings().allowAudio) {
              if ((promise.data.item.volume || promise.data.item.alcohol) && (promise.data.item.volume !== "0" || promise.data.item.alcohol !== "0")) {
                  $cordovaNativeAudio.play("open");
              } else {
                $cordovaNativeAudio.play("eating");
              }
            }

            if (SettingsService.getSettings().allowVibration) {
              $cordovaVibration.vibrate(100); 
            }

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