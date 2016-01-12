// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ngCordova','ionic.service.core', 'ionic.service.push', 'starter.services', 'ionic-material', 'ionMdInput'])

.run(function($ionicPlatform, $rootScope, $ionicUser, $ionicPush) {

  $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
          // org.apache.cordova.statusbar required
          StatusBar.styleDefault();
      }

    // PUSH!
      $rootScope.$on('$cordovaPush:tokenReceived', function(event, data) {
        console.log('Ionic Push: Got token ', data.token, data.platform);
      });

    /*
     var user = $ionicUser.get();
     if(!user.user_id) {
      user.user_id = $ionicUser.generateGUID();
     };

    // Add some metadata to your user object.
    angular.extend(user, {
      name: 'Ionitron',
      bio: 'I come from planet Ion'
    });

    // Identify your user with the Ionic User Service
    $ionicUser.identify(user)
    */
    // Register with the Ionic Push service.  All parameters are optional.
    $ionicPush.register({
      canShowAlert: true, //Can pushes show an alert on your screen?
      canSetBadge: true, //Can pushes update app icon badges?
      canPlaySound: true, //Can notifications play a sound?
      canRunActionsOnWake: true, //Can run actions outside the app,
      onNotification: function(notification) {
        // Handle new push notifications here
        console.log(notification);
        return true;
      }
    });

  });
})

.config(['$ionicAppProvider', function($ionicAppProvider) {
  // Identify app
  $ionicAppProvider.identify({
    // The App ID (from apps.ionic.io) for the server
    app_id: 'f0257d87',
    // The public API key all services will use for this app
    api_key: 'a86e32f0c28df276b06483b17aab1be303facb9f118e5d76',
    // Set the app to use development pushes
    dev_push: true
  });
}])


.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  // Turn off caching for demo simplicity's sake
  $ionicConfigProvider.views.maxCache(0);

  /*
  // Turn off back button text
  $ionicConfigProvider.backButton.previousTitleText(false);
  */

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
    url: '/feed/:event_id',
    views: {
      'tab-feed': {
        templateUrl: 'templates/tab-feed-comments.html',
        controller: 'CommentsCtrl'
      }
    }
  })

  .state('tab.friends', {
    url: '/friends',
    views: {
      'tab-friends': {
        templateUrl: 'templates/tab-friends.html',
        controller: 'FriendsCtrl'
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

  .state('tab.scan', {
    url: '/scan',
    views: {
      'tab-scan': {
        templateUrl: 'templates/tab-scan.html',
        controller: 'ScanCtrl'
      }
    }
  });  

  // $stateProvider.state('app', {
  //     url: '/app',
  //     abstract: true,
  //     templateUrl: 'templates/menu.html',
  //     controller: 'AppCtrl'
  // })

  // .state('app.activity', {
  //     url: '/activity',
  //     views: {
  //         'menuContent': {
  //             templateUrl: 'templates/activity.html',
  //             controller: 'ActivityCtrl'
  //         },
  //        'fabContent': {
  //             template: ''
  //         }
  //     }
  // })

  // .state('app.friends', {
  //     url: '/friends',
  //     views: {
  //         'menuContent': {
  //             templateUrl: 'templates/friends.html',
  //             controller: 'FriendsCtrl'
  //         },
  //         'fabContent': {
  //             template: '<button id="fab-friends" class="button button-fab button-fab-top-left expanded button-energized-900 spin"><i class="icon ion-chatbubbles"></i></button>',
  //             controller: function ($timeout) {
  //                 $timeout(function () {
  //                     document.getElementById('fab-friends').classList.toggle('on');
  //                 }, 900);
  //             }
  //         }
  //     }
  // })

  // .state('app.gallery', {
  //     url: '/gallery',
  //     views: {
  //         'menuContent': {
  //             templateUrl: 'templates/gallery.html',
  //             controller: 'GalleryCtrl'
  //         },
  //        'fabContent': {
  //             template: ''
  //         }
  //     }
  // })

  // .state('app.login', {
  //     url: '/login',
  //     views: {
  //         'menuContent': {
  //             templateUrl: 'templates/login.html',
  //             controller: 'LoginCtrl'
  //         },
  //         'fabContent': {
  //             template: ''
  //         }
  //     }
  // })

  // .state('app.profile', {
  //     url: '/profile',
  //     views: {
  //         'menuContent': {
  //             templateUrl: 'templates/profile.html',
  //             controller: 'ProfileCtrl'
  //         },
  //         'fabContent': {
  //             template: ''
  //         }
  //     }
  // });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});
