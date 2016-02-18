var app = angular.module('starter.controllers');

app.controller('FavCtrl', function($scope, $state, $ionicPlatform, $timeout, $ionicPopup, DBService, $cordovaVibration, $cordovaNativeAudio) {
  $scope.items = {};
  $scope.taps = 0;
  $scope.query = {}
  var locked = false;
  var allItems = {};
  var thisItem;
  $scope.passiveStyle = {
    "-webkit-filter": "blur(10px)",
    "-moz-filter": "blur(10px)",
    "-o-filter": "blur(10px)",
    "-ms-filter": "blur(10px)",
    "filter": "blur(10px)",
    "opacity": "0.4"
  }

  if (window.cordova) {
    $ionicPlatform.ready(function() {
      $cordovaNativeAudio.preloadSimple("open", "audio/open.mp3");
      $cordovaNativeAudio.preloadSimple("eating", "audio/eating.mp3");
    });
  }

  if (window.localStorage["items"]) {
    $scope.items = JSON.parse(window.localStorage["items"]);
  }

  $scope.isSelected = function(item) {
    if ($scope.selected) {
      return $scope.selected === item;  
    } else {
      return true;
    }
  }

  $scope.$watch("query.text.name",function() {
    if ($scope.selected) {
      $scope.deselect(thisItem);
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
        $scope.deselect(thisItem);
      }
    }, 0);
  }

  $scope.deselect = function(item) {
    $scope.selected = null;
    item.count = 0;
  }

  $scope.onHold = function(item) {
    thisItem = item;
    console.log(item);

    if (!$scope.selected) {
      item.count = 1;
    }

    var totalPrice = item.count * parseInt(item.price);
    if (totalPrice >= 50 || item.count >= 10) {
      $ionicPopup.confirm({
        title: 'Bekräfta köp',
        template: '<center>Vill du verkligen köpa '+item.count+'st '+item.name+' för '+totalPrice+'kr?</center>',
        cancelText: 'Nej',
        okText: 'Ja'
      }).then(function(res) {
        if(res) {
          $scope.buy(item);
        } else {
          $scope.deselect(item);
        }
      });        
    } else {
      $scope.buy(item);
    }
  }


  $scope.buy = function(item) {
    var sendData = {'tag':'purchaseItem', 'user_id': window.localStorage['user_id'], 'item_id':item.id, 'count':item.count};
    DBService.sendToDB(sendData, false).then(function(promise) {
      if (promise.data.success === 1) {
        console.log("hej",item);
        if (window.cordova) {
          $ionicPlatform.ready(function() {

            if (item.volume || item.alcohol) {
              $cordovaNativeAudio.play("open");
            } else {
              $cordovaNativeAudio.play("eating");
            }
            
            $cordovaVibration.vibrate(100);
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

  function getColor() {
    var color = ['green.jpg', 'blue.jpg', 'purple.jpg'];
    color = color[Math.floor(Math.random()*color.length)];
    return "/img/" + color;
  }  

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
            itemsArray[index] = {id: objArray[key].id, amount: objArray[key].amount, name: objArray[key].name, price: objArray[key].price, volume: objArray[key].volume, alcohol: objArray[key].alcohol,  image: objArray[key].image}
            index++;
          }
        }

        // console.log(itemsArray);

        // Sort the array. (Angular sort did not work so I'm using this one instead)
        itemsArray.sort(function(a, b) {
          return parseFloat(b.amount) - parseFloat(a.amount);
        });

        // console.log(itemsArray);

        allItems = itemsArray;
        $scope.items = itemsArray;
        angular.forEach($scope.items, function(c) {
          if (!c.image) {
            c.image = getColor();            
          }
          c.count = 0;
        });

        // Save for cache
        window.localStorage["items"] = JSON.stringify($scope.items);
      }
    });    
  }
    // Update feed when user enters scene
  $scope.$on('$ionicView.loaded', function(){
    $scope.doRefresh();
  });
});