angular.module('toga.controllers.new', [])

.controller('NewRequestCtrl', function ($scope, $filter, ionicDatePicker, ionicTimePicker, Config, Utils, DataSrv) {
	$scope.newRequest = {
		poi: null,
		date: null,
		time: null
	};

	var getSelectedPoi = function (poi) {
		$scope.newRequest.poi = poi;
	};

	$scope.openPoisModal = function () {
		$scope.$parent.openPoisModal(getSelectedPoi);
	};

	var datePickerCfg = {
		setLabel: $filter('translate')('set'),
		todayLabel: $filter('translate')('today'),
		closeLabel: $filter('translate')('close'),
		callback: function (val) {
			$scope.newRequest.date = val;
		}
	};
	$scope.openDatePicker = function () {
		ionicDatePicker.openDatePicker(datePickerCfg);
	};

	$scope.openTimePicker = function (field) {
        var epochs = (((new Date()).getHours() * 60) + ((new Date()).getMinutes()));
        epochs = Math.floor(epochs / 15) * 15 * 60;
		var timePickerCfg = {
			setLabel: $filter('translate')('set'),
			closeLabel: $filter('translate')('close'),
            step: 15,
            inputTime: epochs,
			callback: function (val) {
				$scope.newRequest.time = val * 1000;
			}
		};

		ionicTimePicker.openTimePicker(timePickerCfg);
	};

	$scope.createNewRequest = function () {
		var serviceRequest = {
			poiId: $scope.newRequest.poi.objectId,
			privateRequest: false,
			requesterId: Config.PROFESSIONAL_ID_1,
			serviceType: Config.SERVICE_TYPE,
			startTime: $scope.newRequest.date + $scope.newRequest.time,
			customProperties: {},
		};

		DataSrv.createRequestPublic(serviceRequest).then(
			function (data) {
				$scope.goTo('app.home', {
					'reload': true,
					'tab': 0
				}, false, true, true);
				Utils.toast($filter('translate')('newrequest_done'));
			},
			function (reason) {}
		);
	};
})

.controller('NewOfferCtrl', function ($scope, $filter, ionicDatePicker, ionicTimePicker, Config, Utils, DataSrv) {
	$scope.newOffer = {
		poi: null,
		useDateTime: false,
		date: null,
		fromTime: null,
		toTime: null
	};

	var getSelectedPoi = function (poi) {
		$scope.newOffer.poi = poi;
	};

	$scope.openPoisModal = function () {
		$scope.$parent.openPoisModal(getSelectedPoi);
	};

	var datePickerCfg = {
		setLabel: $filter('translate')('set'),
		todayLabel: $filter('translate')('today'),
		closeLabel: $filter('translate')('close'),
		callback: function (val) {
			$scope.newOffer.date = val;
		}
	};
	$scope.openDatePicker = function () {
		ionicDatePicker.openDatePicker(datePickerCfg);
	};

	$scope.openTimePicker = function (field) {
        var epochs = (((new Date()).getHours() * 60) + ((new Date()).getMinutes()));
        epochs = Math.floor(epochs / 15) * 15 * 60;
		var timePickerCfg = {
			setLabel: $filter('translate')('set'),
			closeLabel: $filter('translate')('close'),
            step: 15,
            inputTime: epochs,
			callback: function (val) {
				$scope.newOffer[field + 'Time'] = val * 1000;
			}
		};

		ionicTimePicker.openTimePicker(timePickerCfg);
	};

	var unregisterNewOfferWatch = $scope.$watch('newOffer', function (newOffer, offer) {
		if (!!newOffer.poi) {
			if (newOffer.useDateTime && (!newOffer.date || !newOffer.fromTime || !newOffer.toTime || (newOffer.fromTime > newOffer.toTime))) {
				$scope.isFormValid = false;
			} else {
				$scope.isFormValid = true;
			}
		} else {
			$scope.isFormValid = false;
		}
	}, true);

	$scope.createNewOffer = function () {
		var serviceOffer = {
			serviceType: Config.SERVICE_TYPE,
			poiId: $scope.newOffer.poi.objectId,
			professionalId: Config.PROFESSIONAL_ID_1
		};

		if ($scope.newOffer.useDateTime) {
			serviceOffer.startTime = $scope.newOffer.date + $scope.newOffer.fromTime;
			serviceOffer.endTime = $scope.newOffer.date + $scope.newOffer.toTime;
		}

		DataSrv.createOffer(serviceOffer).then(
			function (data) {
				unregisterNewOfferWatch();
				$scope.goTo('app.home', {
					'reload': true,
					'tab': 1
				}, false, true, true);
				Utils.toast($filter('translate')('newoffer_done'));
			},
			function (reason) {}
		);
	};
});
