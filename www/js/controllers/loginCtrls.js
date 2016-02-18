var app = angular.module('starter.controllers');

app.controller('LoginCtrl', function($scope, $ionicPopup, $state, DBService) {

  $scope.$on('$ionicView.loaded', function() {
    // Check if user is already logged in
    if(window.localStorage['email'] && window.localStorage['last_login']) {
      var last_login = moment(new Date(window.localStorage['last_login']));
      var now = moment(new Date());
      var diff = Math.abs(last_login.diff(now, 'days'));

      // Make user have to re-login every 60 days (to check if user is blocked)
      if (diff < 60) {
        $state.go('tab.fav');
      }
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
          window.localStorage['lobare'] = promise.data.user.lobare;
          window.localStorage['admin'] = promise.data.user.admin;
          window.localStorage['last_login'] = new Date();

          // Go to global feed
          $state.go('tab.feed');
        }
      }
    });
  }
});

app.controller('ResetCtrl', function($scope, $ionicPopup, $state, DBService) {
  $scope.user = {};

  $scope.resetPassword = function() {
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

      DBService.sendToDB(sendData, false).then(function(promise) {
        if (promise.data.success === 1) {
          //console.log("user_id is correct");

          var email = $scope.user.email;
          email = email.toLowerCase();

          if (promise.data.user.email === email) {
            var sendData = {'tag':"updatePassword", 'email':email, 'password':$scope.user.new_password};
            DBService.sendToDB(sendData, true).then(function(promise) {
              if (promise.data.success === 1) {              
                $ionicPopup.alert({
                  title : "Klart!",
                  subTitle: "Ditt lösenord är nu bytt"
                }).then(function(res) {
                  $state.go('login');
                });                            
              }
            });
          } else {
            $ionicPopup.alert({
              title : "Fel email",
              subTitle: "Kunde inte hitta användare med email "+$scope.user.email
            }).then(function(res) {
              $scope.user.email = "";
            });
          }
        } else {
          $ionicPopup.alert({
            title : "Fel personnummer",
            subTitle: "Kunde inte hitta användare med personnummer \""+$scope.user.user_id+"\""
          }).then(function(res) {
            $scope.user.user_id = "";
          });
        }
      });
    }
  }
});