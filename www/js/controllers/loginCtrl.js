var app = angular.module('starter.controllers');

app.controller('LoginCtrl', function($scope, $ionicPopup, $state, DBService) {

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
});