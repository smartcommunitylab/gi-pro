angular.module('toga.controllers.details', [])

.controller('RequestDetailsCtrl', function ($scope, $stateParams, $filter, $ionicPopup, Utils, Config, DataSrv, Login) {
	$scope.request = null;

	if (!!$stateParams['request']) {
		$scope.request = $stateParams['request'];
	} else {
      Utils.loading();
      DataSrv.getRequestById(Login.getUser().objectId, $stateParams.objectId).then(function(object) {
           Utils.loaded();
           $scope.request = object;
        }, Utils.commError);
    }

	$scope.isMine = function () {
		return $scope.request != null && $scope.request.requesterId == Login.getUser().objectId;
	};
	$scope.isEditable = function () {
		return $scope.isMine() && (!$scope.request.startTime || $scope.request.startTime > moment().startOf('date').valueOf());
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
                Utils.loading();
				DataSrv.deleteRequest($scope.request.objectId, Login.getUser().objectId).then(
					function (data) {
						$scope.goTo('app.home', {
							'reload': true,
							'tab': 0
						}, false, true, true);
						Utils.toast($filter('translate')('request_delete_done'));
					}, Utils.commError
				);
			}
		});
	};
})

.controller('OfferDetailsCtrl', function ($scope, $stateParams, $filter, $ionicPopup, Utils, Config, DataSrv, Login) {
	$scope.offer = null;

	if (!!$stateParams['offer']) {
		$scope.offer = $stateParams['offer'];
	} else {
      Utils.loading();
      DataSrv.getOfferById(Login.getUser().objectId, $stateParams.objectId).then(function(object) {
           Utils.loaded();
           $scope.offer = object;
        }, Utils.commError);
    }


	$scope.isMine = function () {
		return  $scope.offer!= null && $scope.offer.professional.objectId == Login.getUser().objectId;
	};
	$scope.isEditable = function () {
		return $scope.isMine() && (!$scope.offer.startTime || $scope.offer.startTime > moment().startOf('date').valueOf());
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
                Utils.loading();
				DataSrv.deleteOffer($scope.offer.objectId, Login.getUser().objectId).then(
					function (data) {
						$scope.goTo('app.home', {
							'reload': true,
							'tab': 1
						}, false, true, true);
						Utils.toast($filter('translate')('offer_delete_done'));
					}, Utils.commError
				);
			}
		});
	};
});
