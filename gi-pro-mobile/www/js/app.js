angular.module('toga', [
	'ionic',
	'ngCordova',
	'ngSanitize',
	'ionic-datepicker',
	'ionic-timepicker',
	'toga.services.utils',
	'toga.services.login',
	'toga.services.config',
	'toga.services.push',
	'toga.services.notifications',
	'pascalprecht.translate',
	'toga.services.data',
	'toga.controllers.main',
	'toga.controllers.login',
	'toga.controllers.home',
	'toga.controllers.details',
	'toga.controllers.search',
	'toga.controllers.new'
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

	//  	$ionicConfigProvider.navBar.alignTitle('left');

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

	.state('app.home', {
		url: '/home',
		views: {
			'menuContent': {
				templateUrl: 'templates/home.html',
				controller: 'HomeCtrl'
			}
		}
	})

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

	.state('app.notifications', {
		url: '/notifications',
		views: {
			'menuContent': {
				templateUrl: 'templates/notifications.html',
				controller: 'NotificationsCtrl'
			}
		}
	})

	.state('app.history', {
		url: '/history',
		views: {
			'menuContent': {
				templateUrl: 'templates/history.html',
				controller: 'HistoryCtrl'
			}
		}
	})

	.state('app.profile', {
		url: '/profile',
		views: {
			'menuContent': {
				templateUrl: 'templates/profile.html',
				controller: 'ProfileCtrl'
			}
		}
	})
	.state('app.initprofile', {
		url: '/initprofile',
		params: {
			'firstRun': true
		},
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

	.state('app.registration', {
		cache: false,
		url: '/registration',
		views: {
			'menuContent': {
				templateUrl: 'templates/registration.html',
				controller: 'RegistrationCtrl'
			}
		}
	});

	// if none of the above states are matched, use this as the fallback$state
	$urlRouterProvider.otherwise(function ($injector) {
		//var StorageSrv = $injector.get('StorageSrv');
		//var $rootScope = $injector.get('$rootScope');
		//var logged = $injector.get('LoginSrv').userIsLogged();
		/*
		if (!logged || StorageSrv.getUserId() == null || !StorageSrv.isProfileComplete()) {
		    $rootScope.initialSetup = true;
		    return '/app/profilo';
		}
		*/
		var Login = $injector.get('Login');
		var logged = Login.getUser();
		if (!logged) {
			return '/app/tutorial';
		} else {
			$injector.get('$rootScope').user = logged;
            var Config = $injector.get('Config');
            var checked = localStorage.getItem(Config.getUserVarProfileCheck());
            if ('true' != checked && !Login.checkUser(logged)) {
              return '/app/initprofile';
            }
			Login.updateUser().then(function () {}, function (errCode) {
				if (errCode == Login.USER_ERRORS.NO_USER) {
					Login.logout();
					$injector.get('$state').go('app.tutorial', {});
				}
			});

		}
		return '/app/home';
	});
});
