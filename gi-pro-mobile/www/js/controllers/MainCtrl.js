angular.module('toga.controllers.main', [])

/*
 * App generic controller
 */
.controller('AppCtrl', function ($scope, $state, $ionicHistory) {
	$scope.goTo = function (state, params, disableAnimate, disableBack, historyRoot) {
		var options = {};

		if (disableAnimate) {
			options.disableAnimate = disableAnimate;
		}

		if (disableBack) {
			options.disableBack = disableBack;
		}

		if (historyRoot) {
			options.historyRoot = historyRoot;
		}

		$ionicHistory.nextViewOptions(options);
		$state.go(state, params);
	};
});
