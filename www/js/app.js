// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','starter.controllers','starter.services','ngCordova','highcharts-ng'])

.run(function($ionicPlatform, ThreeDeeService, $state, $rootScope) {

  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }

    //ThreeDeeService.setup();
    ThreeDeeService.check3DTouchAvailability().then(function(available) {
      if (available) {
        // Set event handler to check which Quick Action was pressed
        window.ThreeDeeTouch.onHomeIconPressed = function(payload) {
          if (payload.type == 'favorites') {
            if (window.localStorage['email']) {
              $state.go('tab.fav');
            }
          } else {
            $rootScope.$broadcast('buyFavorite', payload.type);
          }
        };        
      }
    });
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  // Turn off back button text
  $ionicConfigProvider.backButton.text('').previousTitleText(false);
  $ionicConfigProvider.tabs.position('bottom');
  
  $stateProvider
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

  .state('register', {
    url: '/register',
    templateUrl: 'templates/register.html',
    controller: 'RegisterCtrl'
  })

  .state('reset', {
    url: '/reset',
    templateUrl: 'templates/reset_password.html',
    controller: 'ResetCtrl'
  })

  .state('id', {
    url: '/id',
    templateUrl: 'templates/id.html',
    controller: 'IDCtrl'
  })

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.feed', {
    url: '/feed',
    views: {
      'tab-feed': {
        templateUrl: 'templates/tab-feed.html',
        controller: 'FeedCtrl'
      }
    }
  })
  .state('tab.feed-comments', {
    url: '/feed/:event_id?tmp',
    views: {
      'tab-feed': {
        templateUrl: 'templates/tab-feed-comments.html',
        controller: 'ViewCommentsCtrl'
      }
    }
  })

  .state('tab.scan', {
    url: '/scan',
    views: {
      'tab-scan': {
        templateUrl: 'templates/tab-scan.html',
        controller: 'ScanCtrl'
      }
    }
  })  

  .state('tab.fav', {
    url: '/fav',
    views: {
      'tab-fav': {
        templateUrl: 'templates/tab-fav.html',
        controller: 'FavCtrl'
      }
    }
  })

  .state('tab.profile', {
    url: '/profile',
    views: {
      'tab-profile': {
        templateUrl: 'templates/tab-profile.html',
        controller: 'ProfileCtrl'
      }   
    }
  })

  .state('tab.settings', {
    url: '/settings',
    views: {
      'tab-settings': {
        templateUrl: 'templates/tab-settings.html',
        controller: 'SettingsCtrl'
      }
    }
  })
  .state('tab.purchases', {
    url: '/settings/purchases',
    views: {
      'tab-settings': {
        templateUrl: 'templates/settings-purchases.html',
        controller: 'PurchasesCtrl'
      }
    }
  })
  .state('tab.email', {
    url: '/settings/email',
    views: {
      'tab-settings': {
        templateUrl: 'templates/settings-email.html',
        controller: 'EmailCtrl'
      }
    }
  })  
  .state('tab.password', {
    url: '/settings/password',
    views: {
      'tab-settings': {
        templateUrl: 'templates/settings-password.html',
        controller: 'PasswordCtrl'
      }
    }
  })
  .state('tab.new-item', {
    url: '/settings/new/:barcode',
    views: {
      'tab-settings': {
        templateUrl: 'templates/settings-add-item.html',
        controller: 'NewItemCtrl'
      }
    }
  });

  $urlRouterProvider.otherwise('/login');
});
