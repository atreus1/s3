var app = angular.module('starter.services', [])

app.factory('SettingsService', function() {
  var settings;

  if (!window.localStorage['settings']) {
    // default settings
    settings = {
      "cacheData": true,
      "allowAudio": true,
      "allowVibration": true
    };
    window.localStorage['settings'] = JSON.stringify(settings);
  } else {
    var parsed = JSON.parse(window.localStorage['settings']); 
    settings = {
      "cacheData": parsed.cacheData,
      "allowAudio": parsed.allowAudio,
      "allowVibration": parsed.allowVibration
    };    
  }

  return {
    getSettings: function() {
      return settings;
    },
    updateSettings: function(key, value) {
      settings[key] = value;
      window.localStorage['settings'] = JSON.stringify(settings);
    }
  }
});

app.factory('DBService', function($http, $ionicPopup) {
  return {
    sendToDB: function (json, showPopup) {
      var promise = $http({method:"POST", data:json, url:"http://tolva.nu/streckbase2_server/index.php"})
        .success(function (data, status, headers, config) {
          if (data.success !== 1) {
            console.log(data);
            console.log(data.error_msg);
            if (showPopup) {
              $ionicPopup.alert({
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

app.factory('ThreeDeeService', function($q) {
  var isAvailable = false;

  return {
    check3DTouchAvailability: function() {
      return $q(function(resolve, reject) {              
        if (window.ThreeDeeTouch) {
          window.ThreeDeeTouch.isAvailable(function(available) {
            isAvailable = true;
            resolve(available);
          });
        } else {
          reject();
        }
      });
    },
    setup: function(array) {
      if (isAvailable) {
        // Configure Quick Actions
        window.ThreeDeeTouch.configureQuickActions(array);
      }
    }
  };
});