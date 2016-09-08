angular.module('toga.controllers.details', [])

.controller('RequestDetailsCtrl', function ($scope, $stateParams, $filter, $ionicPopup, Utils, Config, DataSrv) {
	$scope.request = null;

	if (!!$stateParams['request']) {
		$scope.request = $stateParams['request'];
	}

	$scope.isMine = function () {
		// TODO check if is mine
		return true;
	};

	$scope.deleteRequest = function () {
		var confirmPopup = $ionicPopup.confirm({
			title: $filter('translate')('request_delete_confirm_title'),
			template: $filter('translate')('request_delete_confirm_text'),
			cancelText: $filter('translate')('cancel'),
			cancelType: 'button-light',
			okText: $filter('translate')('delete'),
			okType: 'button-assertive'
		});

		confirmPopup.then(function (yes) {
			if (yes) {
				DataSrv.deleteRequest($scope.request.objectId, Config.PROFESSIONAL_ID_1).then(
					function (data) {
						$scope.goTo('app.home', {
							'reload': true,
							'tab': 0
						}, false, true, true);
						Utils.toast($filter('translate')('request_delete_done'));
					}
				);
			}
		});
	};
})

.controller('OfferDetailsCtrl', function ($scope, $stateParams, $filter, $ionicPopup, Utils, Config, DataSrv) {
	$scope.offer = null;

	if (!!$stateParams['offer']) {
		$scope.offer = $stateParams['offer'];
	}

	$scope.isMine = function () {
		// TODO check if is mine
		return false;
	};

	$scope.deleteOffer = function () {
		var confirmPopup = $ionicPopup.confirm({
			title: $filter('translate')('offer_delete_confirm_title'),
			template: $filter('translate')('offer_delete_confirm_text'),
			cancelText: $filter('translate')('cancel'),
			cancelType: 'button-light',
			okText: $filter('translate')('delete'),
			okType: 'button-assertive'
		});

		confirmPopup.then(function (yes) {
			if (yes) {
				DataSrv.deleteOffer($scope.offer.objectId, Config.PROFESSIONAL_ID_1).then(
					function (data) {
						$scope.goTo('app.home', {
							'reload': true,
							'tab': 1
						}, false, true, true);
						Utils.toast($filter('translate')('offer_delete_done'));
					}
				);
			}
		});
	};
});
