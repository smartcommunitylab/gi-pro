angular.module('toga.controllers.login', [])

.controller('LoginCtrl', function ($scope, $state, $ionicHistory, $ionicPopup, $filter, Utils, Config, Login) {
	$scope.user = {};

	$scope.login = function () {
		Utils.loading();
		Login.login($scope.user.cf, $scope.user.pwd).then(function () {
			$ionicHistory.nextViewOptions({
				historyRoot: true,
				disableBack: true
			});
			$state.go('app.home');
		}, function () {
			$ionicPopup.alert({
				title: $filter('translate')('error_popup_title'),
				template: $filter('translate')('error_signin')
			});
		}).finally(Utils.loaded);
	}

	$scope.reset = function () {
		window.open(Config.SERVER_URL + '/reset', '_system', 'location=no,toolbar=no');
	};

	$scope.register = function () {
		//window.open(Config.SERVER_URL + '/register', '_system', 'location=no,toolbar=no');
		$scope.goTo('app.registration');
	};
})

.controller('RegistrationCtrl', function ($scope, $state, $ionicHistory, $ionicPopup, $filter, $window, Utils, Config, Login) {
	$scope.registration = {};

	$scope.openPrivacyLink = function () {
		$window.open($filter('translate')('register_privacy_link'), '_system', 'location=yes');
		return false;
	};

	$scope.cancel = function () {
		$ionicHistory.goBack();
	};

	$scope.register = function () {
		if (!$scope.registration.cf) {
			Utils.toast($filter('translate')('register_form_cf_empty'));
			return;
		} else if (!Utils.checkFiscalCode($scope.registration.cf)) {
			Utils.toast($filter('translate')('register_form_cf_invalid'));
			return;
		} else if (!$scope.registration.pwd || !$scope.registration.pwdagain) {
			Utils.toast($filter('translate')('register_form_pwd_empty'));
			return;
		} else if ($scope.registration.pwd != $scope.registration.pwdagain) {
			Utils.toast($filter('translate')('register_form_pwd_different'));
			return;
		}

		console.log($scope.registration);

		Utils.loading();
		Login.register($scope.registration.cf, $scope.registration.pwd).then(
			function () {
				Utils.toast($filter('translate')('register_done'));
				$scope.goTo('app.login', {}, false, true, true);
			},
			Utils.commError
		).finally(Utils.loaded);
	}
});
