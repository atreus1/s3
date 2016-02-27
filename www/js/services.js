var app = angular.module('starter.services', [])

app.factory('SettingsService', function() {
  var settings;

  if (!window.localStorage['settings']) {
    // default settings
    settings = {
      "cacheData": true,
      "allowAudio": true
    };
    window.localStorage['settings'] = JSON.stringify(settings);
  } else {
    var parsed = JSON.parse(window.localStorage['settings']); 
    settings = {
      "cacheData": parsed.cacheData,
      "allowAudio": parsed.allowAudio
    };    
  }

  function getSettings() {
    console.log("returning settings");
    return settings;
  };
  function updateSettings(key, value) {
    settings[key] = value;
    window.localStorage['settings'] = JSON.stringify(settings);
  };

  return {
    getSettings,
    updateSettings
  };
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