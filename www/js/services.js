angular.module('starter.services', [])

.factory('DBService', function($http, $ionicPopup) {
  return {
    sendToDB: function (json, showPopup) {
      var promise = $http({method:"POST", data:json, url:"http://userapan.myds.me/streckbase2_server/index.php"})
        .success(function (data, status, headers, config) {
          if (data.success !== 1) {
            console.log(data.error_msg);
            if (showPopup) {
              var welcomePopup = $ionicPopup.alert({
                title : "Fel",
                subTitle: data.error_msg
              });
            }
          }
        })
        .error(function (data, status, headers, config) {
          console.log("Error in DBService");
        });
      return promise;
    }
  };
});