var app = angular.module('starter.controllers');

app.controller('FavCtrl', function($scope, $state, $ionicPlatform, $ionicPopup, DBService, $cordovaVibration) {
  $scope.items = {};
  $scope.taps = 0;
  $scope.query = {}
  var locked = false;
  var allItems = {};

  $scope.onTap = function(i) {
    i.count += 1;
  }

  $scope.buy = function(item, count) {
    console.log("item: "+item+" count: "+count);
    var sendData = {'tag':'purchaseItem', 'user_id': window.localStorage['user_id'], 'item_id':item, 'count':count};
    DBService.sendToDB(sendData, false).then(function(promise) {
      if (promise.data.success === 1) {
        if (window.cordova) {
          $ionicPlatform.ready(function() {
            $cordovaVibration.vibrate(100);
            $state.go('tab.feed');
          });
        } else {
          $state.go('tab.feed');
        }
      }
    });    
  }

  // $scope.onHold = function(item, name, count, price) {   
  $scope.onHold = function(i) {     
    console.log("item: "+i.id+" count: "+i.count+" price: "+i.price);

    if (i.count > 0) {
      var totalPrice = i.count * parseInt(i.price);
      if (totalPrice >= 50 || i.count >= 10) {
        $ionicPopup.confirm({
          title: 'Bekräfta köp',
          template: '<center>Vill du verkligen köpa '+i.count+'st '+i.name+' för '+totalPrice+'kr?</center>',
          cancelText: 'Nej',
          okText: 'Ja'
        }).then(function(res) {
          if(res) {
            $scope.buy(i.id, i.count);
          } else {
            i.count = 0;
          }
        });        
      } else {
        $scope.buy(i.id, i.count);
      }
    }
  }

  function getColor() {
    var color = ['green.jpg', 'blue.jpg', 'purple.jpg'];
    color = color[Math.floor(Math.random()*color.length)];
    return "/img/" + color;
  }  

  $scope.doRefresh = function() {
    // var sendData = {'tag':'getMostBuyedItem', 'user_id':window.localStorage['user_id']};
    // DBService.sendToDB(sendData, false).then(function(promise) {
    //   if (promise.data.success === 1) {
    //     $scope.items = promise.data.items;
    //     //console.log($scope.items);
    //     angular.forEach($scope.items, function(c) {
    //       if (!c.image) {
    //         c.image = getColor();            
    //       }
    //       c.count = 0;
    //     });
    //   }
    // });

    var sendData = {'tag':'getAllItems', 'user_id':window.localStorage['user_id']};
    DBService.sendToDB(sendData, false).then(function(promise) {
      if (promise.data.success === 1) {
        var data = promise.data.items;
        console.log($scope.items);

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
            itemsArray[index] = {id: objArray[key].id, amount: objArray[key].amount, name: objArray[key].name, price: objArray[key].price, image: objArray[key].image}
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
      }
    });    
  }
    // Update feed when user enters scene
  $scope.$on('$ionicView.loaded', function(){
    $scope.doRefresh();
  });
});