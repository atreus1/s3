var app = angular.module('starter.controllers');

app.controller('RegisterCtrl', function($scope, $state, $ionicPopup, DBService) {
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
});

app.controller('IDCtrl', function($scope, $state, $ionicPopup, DBService) {
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
            window.localStorage['debt'] = promise.data.user.debt;
            window.localStorage['lobare'] = promise.data.user.lobare;
            window.localStorage['admin'] = promise.data.user.admin;

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
});