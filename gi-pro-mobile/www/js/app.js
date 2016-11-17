angular.module('gi-pro', [
  'ionic',
  'ngCordova',
  'ngSanitize',
  'leaflet-directive',
  'ionic-datepicker',
  'ionic-timepicker',
  'gi-pro.services.utils',
  'gi-pro.services.login',
  'gi-pro.services.config',
  'gi-pro.services.push',
  'gi-pro.services.notifications',
  'pascalprecht.translate',
  'gi-pro.services.data',
  'gi-pro.services.geo',
  'gi-pro.services.mapservice',
  'gi-pro.services.data',
  'gi-pro.controllers.main',
  'gi-pro.controllers.login',
  'gi-pro.controllers.reqandoffer',
  'gi-pro.controllers.serviceandprof',
  'gi-pro.controllers.details',
  'gi-pro.controllers.profile',
  'gi-pro.controllers.search',
  'gi-pro.controllers.new',
  'gi-pro.directives'
])

.run(function ($ionicPlatform, $rootScope, Login, PushSrv) {
  $ionicPlatform.ready(function () {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });

  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {
    PushSrv.fgOf();
  });
})

.config(function ($ionicConfigProvider, $httpProvider, $translateProvider) {
  $httpProvider.defaults.withCredentials = true;

  // PROBLEM WITH SCROLL RESIZE ON OLD ANDROID DEVICES
  $ionicConfigProvider.scrolling.jsScrolling(ionic.Platform.isIOS() || (ionic.Platform.isAndroid() && parseFloat(ionic.Platform.version()) < 4.4));

  $ionicConfigProvider.tabs.position('top');
  $ionicConfigProvider.tabs.style('striped');
  $ionicConfigProvider.backButton.previousTitleText(false).text('');

  //$ionicConfigProvider.navBar.alignTitle('left');

  //$translateProvider.translations('it', {});
  $translateProvider.preferredLanguage('it');
  $translateProvider.useStaticFilesLoader({
    prefix: 'languages/',
    suffix: '.json'
  });
  //$translateProvider.useSanitizeValueStrategy('sanitize');
  //$translateProvider.useSanitizeValueStrategy('sanitizeParameters');
  $translateProvider.useSanitizeValueStrategy('escapeParameters');
})

.config(function (ionicDatePickerProvider, ionicTimePickerProvider) {
  // FIXME language fixed to 'it' dev only!
  moment.locale('it');

  var datePickerObj = {
    inputDate: new Date(),
    mondayFirst: true,
    weeksList: moment.weekdaysMin(),
    monthsList: moment.monthsShort(),
    templateType: 'popup',
    from: new Date(),
    showTodayButton: true,
    dateFormat: 'dd MMMM yyyy',
  };
  ionicDatePickerProvider.configDatePicker(datePickerObj);

  var timePickerObj = {
    inputTime: (((new Date()).getHours() * 60 * 60) + ((new Date()).getMinutes() * 60)),
    format: 24,
    step: 1
  };
  ionicTimePickerProvider.configTimePicker(timePickerObj);
})

.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider.state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.tutorial', {
    url: '/tutorial',
    params: {
      forceReload: false,
    },
    views: {
      'menuContent': {
        templateUrl: 'templates/tutorial.html',
        controller: 'TutorialCtrl'
      }
    }
  })

  .state('app.serviceAndProf', {
    url: '/serviceandproffessionist',
    views: {
      'menuContent': {
        templateUrl: 'templates/serviceAndProf.html',
        controller: 'ServiceAndProfCtrl'
      }
    }
  })

  .state('app.reqAndOffer', {
    url: '/reqandoffert',
    views: {
      'menuContent': {
        templateUrl: 'templates/reqAndOffer.html',
        controller: 'ReqAndOffCtrl'
      }
    }
  })

  .state('app.profdetails', {
    url: '/prof/{objectId}',
    params: {
      'objectId': null,
      'professionist': null
    },
    views: {
      'menuContent': {
        templateUrl: 'templates/profile.html',
        controller: 'ProfessionistDetailsCtrl'
      }
    }
  })

  .state('app.servicedetails', {
    url: '/prof/{objectId}',
    params: {
      'service': null,
      'objectId': null,
      'professionist': null
    },
    views: {
      'menuContent': {
        templateUrl: 'templates/serviceDetail.html',
        controller: 'ServiceDetailsCtrl'
      }
    }
  })

  /*
  .state('app.map', {
    url: "/map",
    views: {
      'menuContent': {
        templateUrl: "templates/map.html",
        controller: 'MapCtrl'
      }
    }
  })
  */

  /*
  .state('app.requestdetails', {
    url: '/request/{objectId}',
    params: {
      'objectId': null,
      'request': null
    },
    views: {
      'menuContent': {
        templateUrl: 'templates/request.html',
        controller: 'RequestDetailsCtrl'
      }
    }
  })
  */

  /*
  .state('app.offerdetails', {
    url: '/offer/{objectId}',
    params: {
      'objectId': null,
      'offer': null
    },
    views: {
      'menuContent': {
        templateUrl: 'templates/offer.html',
        controller: 'OfferDetailsCtrl'
      }
    }
  })
  */

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html',
        controller: 'SearchOffersCtrl'
      }
    }
  })

  .state('app.searchresults', {
    url: '/search/results',
    params: {
      'results': null
    },
    views: {
      'menuContent': {
        templateUrl: 'templates/searchresults.html',
        controller: 'SearchOffersResultsCtrl'
      }
    }
  })

  /*
  .state('app.newrequest', {
    url: '/request/new',
    views: {
      'menuContent': {
        templateUrl: 'templates/form_request.html',
        controller: 'NewRequestCtrl'
      }
    }
  })

  .state('app.newoffer', {
    url: '/offer/new',
    views: {
      'menuContent': {
        templateUrl: 'templates/form_offer.html',
        controller: 'NewOfferCtrl'
      }
    }
  })
  */

  .state('app.notifications', {
    url: '/notifications',
    views: {
      'menuContent': {
        templateUrl: 'templates/notifications.html',
        controller: 'NotificationsCtrl'
      }
    }
  })

  /*
  .state('app.history', {
    url: '/history',
    views: {
      'menuContent': {
        templateUrl: 'templates/history.html',
        controller: 'HistoryCtrl'
      }
    }
  })
  */

  .state('app.profile', {
    url: '/profile',
    views: {
      'menuContent': {
        templateUrl: 'templates/profile.html',
        controller: 'ProfileCtrl'
      }
    }
  })

  .state('app.credits', {
    url: '/credits',
    views: {
      'menuContent': {
        templateUrl: 'templates/credits.html'
      }
    }
  })

  .state('app.login', {
    cache: false,
    url: '/login',
    views: {
      'menuContent': {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      }
    }
  })

  .state('app.registration1', {
    cache: false,
    url: '/registration1',
    views: {
      'menuContent': {
        templateUrl: 'templates/registration_step_1.html',
        controller: 'RegistrationFirstCtrl'
      }
    }
  })

  .state('app.registration2', {
    cache: false,
    url: '/registration2',
    params: {
      obj: null
    },
    views: {
      'menuContent': {
        templateUrl: 'templates/registration_step_2.html',
        controller: 'RegistrationSecondCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback$state
  $urlRouterProvider.otherwise(function ($injector) {
    /*
    var Login = $injector.get('Login');
    var logged = Login.getUser();
    if (!logged) {
      return '/app/tutorial';
    } else {
      $injector.get('$rootScope').user = logged;
      Login.updateUser().then(function () {}, function (errCode) {
        if (errCode == Login.USER_ERRORS.NO_USER) {
          $injector.get('Utils').loaded();
          Login.logout();
          $injector.get('$state').go('app.tutorial', {});
        }
      });

    }
    return '/app/home';
    */
    return '/app/serviceandproffessionist'
  });
});
