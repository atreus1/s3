var app = angular.module('starter.controllers');

app.controller('FavCtrl', function($scope, $state, $ionicPlatform, $timeout, $rootScope, $ionicModal, $ionicPopup, DBService, SettingsService, $cordovaVibration, $cordovaNativeAudio, ThreeDeeService) {
  $scope.items = [];
  $scope.taps = 0;
  $scope.query = {};  
  var allItems = {};
  var thisItem;
  var is3DbuttonsSet = false;

  $scope.passiveStyle = {
    "-webkit-filter": "blur(6px)",
    "-moz-filter": "blur(6px)",
    "-o-filter": "blur(6px)",
    "-ms-filter": "blur(6px)",
    "filter": "blur(6px)",
    "opacity": "0.5"
  }

  if (window.cordova) {
    $ionicPlatform.ready(function() {
      $cordovaNativeAudio.preloadSimple("open", "audio/open.mp3");
      $cordovaNativeAudio.preloadSimple("eating", "audio/eating.mp3");
    });
  }

  if (window.localStorage["items"]) {
    if (SettingsService.getSettings.cacheData) {
      $scope.items = JSON.parse(window.localStorage["items"]);      
    } else {
      window.localStorage["items"] = "";
    }
  }

  $ionicModal.fromTemplateUrl('../templates/infoModal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });  

  $scope.isSelected = function(item) {
    if ($scope.selected) {
      return $scope.selected === item;  
    } else {
      return true;
    }
  }

  $scope.hasInfo = function() {
    return (thisItem.info === "1");
  }

  $scope.$watch("query.text.name",function() {
    if ($scope.selected) {
      $scope.deselect();
    }
  });  

  $scope.onTap = function(item) {
    $timeout(function() {
      if (!$scope.selected) {
        $scope.selected = item;
        thisItem = item;      
      }
      
      if ($scope.isSelected(item)) {
        item.count += 1;
      } else {
        $scope.deselect();
      }
    }, 0);
  }

  $scope.deselect = function() {
    $scope.selected = null;
    thisItem.count = 0;
  }

  $scope.checkOut = function() {
    if (!$scope.selected) {
      thisItem.count = 1;
    }

    var totalPrice = thisItem.count * parseInt(thisItem.price);
    if (totalPrice >= 50 || thisItem.count >= 10) {
      $ionicPopup.confirm({
        title: 'Bekräfta köp',
        template: '<center>Vill du verkligen köpa '+thisItem.count+'st '+thisItem.name+' för '+totalPrice+'kr?</center>',
        cancelText: 'Nej',
        okText: 'Ja'
      }).then(function(res) {
        if(res) {
          $scope.buy(thisItem);
        } else {
          $scope.deselect();
        }
      });        
    } else {
      $scope.buy(thisItem);
    }
  }

  $scope.showInfo = function() {
    $scope.modal.show();
    $scope.infoItem = thisItem;

    var sendData = {'tag':'getItemInfo', 'item_id':thisItem.id};
    DBService.sendToDB(sendData, false).then(function(promise) {
      if (promise.data.success === 1) {
        console.log(promise.data);
      }
    });

    console.log(thisItem);
  }

  $scope.closeModal = function() {
    $scope.modal.hide();
    $scope.infoItem = null;
  }

  $scope.buy = function(item) {
    var sendData = {'tag':'purchaseItem', 'user_id': window.localStorage['user_id'], 'item_id':item.id, 'count':item.count};
    DBService.sendToDB(sendData, false).then(function(promise) {
      if (promise.data.success === 1) {
        if (window.cordova) {
          $ionicPlatform.ready(function() {
            if (SettingsService.getSettings().allowAudio) {
              if ((item.volume || item.alcohol) && (item.volume !== "0" || item.alcohol !== "0")) {
                $cordovaNativeAudio.play("open");
              } else {
                $cordovaNativeAudio.play("eating");
              }
            }

            if (SettingsService.getSettings().allowVibration) {
              $cordovaVibration.vibrate(100);	
            }
            
            $scope.deselect(thisItem);
            $state.go('tab.feed');
          });
        } else {
          $scope.deselect(thisItem);
          $state.go('tab.feed');
        }
      }
    });    
  }

  // function getColor() {
  //   var color = ['green.jpg', 'blue.jpg', 'purple.jpg'];
  //   color = color[Math.floor(Math.random()*color.length)];
  //   return "/img/" + color;
  // }  

  $scope.doRefresh = function() {
    var sendData = {'tag':'getAllItems', 'user_id':window.localStorage['user_id']};
    DBService.sendToDB(sendData, false).then(function(promise) {
      if (promise.data.success === 1) {
        var data = promise.data.items;

        var objArray = {};

        // Overwrite product where I have bought stuff
        for (var i = 0; i < data.length; i++) {
          objArray[data[i].id] = data[i];
        }

        var itemsArray = [];
        var index = 0;

        // Make it to a normal array of objects
        for (var key in objArray) {
          if (objArray.hasOwnProperty(key)) {
            var img;
            if (objArray[key].image === "local") {
              img = "img/items/"+objArray[key].id+".jpg";
            } else {
              img = objArray[key].image;
            }
            itemsArray[index] = {id: objArray[key].id, amount: objArray[key].amount, name: objArray[key].name, price: objArray[key].price, volume: objArray[key].volume, alcohol: objArray[key].alcohol,  image: img, info: objArray[key].info}
            index++;
          }
        }

        //console.log(itemsArray);

        // Sort the array. (Angular sort did not work so I'm using this one instead)
        itemsArray.sort(function(a, b) {
          return parseFloat(b.amount) - parseFloat(a.amount);
        });

        // console.log(itemsArray);

        allItems = itemsArray;
        $scope.items = itemsArray;
        angular.forEach($scope.items, function(c) {
          c.count = 0;
        });

        //console.log($scope.items);

        // Save for cache
        if (SettingsService.getSettings().cacheData) {
          window.localStorage["items"] = JSON.stringify($scope.items);
        }

        if (!is3DbuttonsSet && $scope.items.length > 0) {
          ThreeDeeService.setup(
            [
              {
                type: 'favorites',
                title: 'Gå till favoriter',
                subtitle: '',
                iconType: 'favorite'
              },
              {
                type: '3',
                title: 'Strecka Pripps Blå',
                subtitle: '',
                iconType: 'add'
              },
              {
                type: '4',
                title: 'Strecka G:N Long Drink',
                subtitle: '',
                iconType: 'add'
              },
              {
                type: '6',
                title: 'Strecka Powerking',
                subtitle: '',
                iconType: 'add'
              }
            ]
          );
          is3DbuttonsSet = true;
        }
      }
    });    
  }
    // Update feed when user enters scene
  $scope.$on('$ionicView.loaded', function(){
    $scope.doRefresh();
  });

  $rootScope.$on('buyFavorite', function(event, id) {
    if (window.localStorage['email']) {
      for (var i = 0; i < $scope.items.length; i++) {
        if ($scope.items[i].id === id) {
          var favItem = $scope.items[i];
          favItem.count = 1;

          $scope.buy(favItem);
          favItem.count = 0;        
          break;
        }
      }
    } else {
      $state.go('login');
    }
  });  
});