angular.module('toga', [
	'ionic',
	'ngCordova',
	'ngSanitize',
	'toga.services.utils',
	'toga.services.config',
	'pascalprecht.translate',
	'toga.controllers.main',
	'toga.controllers.home'
])

.run(function ($ionicPlatform) {
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
})

.config(function ($ionicConfigProvider, $translateProvider) {
	$ionicConfigProvider.tabs.position('top');
	$ionicConfigProvider.tabs.style('striped');
	$ionicConfigProvider.backButton.previousTitleText(false).text('');

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

.config(function ($stateProvider, $urlRouterProvider) {
	$stateProvider.state('app', {
		url: '/app',
		abstract: true,
		templateUrl: 'templates/menu.html',
		controller: 'AppCtrl'
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

	.state('app.search', {
		url: '/search',
		views: {
			'menuContent': {
				templateUrl: 'templates/search.html',
				controller: 'SearchCtrl'
			}
		}
	})

	.state('app.searchresults', {
		url: '/search/results',
		views: {
			'menuContent': {
				templateUrl: 'templates/searchresults.html',
				controller: 'SearchResultsCtrl'
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
	});

	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/app/home');
});
