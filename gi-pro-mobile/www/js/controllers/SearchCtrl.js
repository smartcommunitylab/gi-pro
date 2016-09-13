angular.module('toga.controllers.search', [])

.controller('SearchOffersCtrl', function ($scope, $filter, ionicDatePicker, ionicTimePicker, Config, Utils, DataSrv) {
	$scope.searchOffer = {
		poi: null,
		date: null,
		time: null
	};

	var getSelectedPoi = function (poi) {
		console.log(poi);
		$scope.searchOffer.poi = poi;
	};

	$scope.openPoisModal = function () {
		$scope.$parent.openPoisModal(getSelectedPoi);
	};

	var datePickerCfg = {
		setLabel: $filter('translate')('set'),
		todayLabel: $filter('translate')('today'),
		closeLabel: $filter('translate')('close'),
		callback: function (val) {
			$scope.searchOffer.date = val;
		}
	};
	$scope.openDatePicker = function () {
		ionicDatePicker.openDatePicker(datePickerCfg);
	};

	$scope.openTimePicker = function () {
      var epochs = (((new Date()).getHours() * 60) + ((new Date()).getMinutes()));
      epochs = Math.floor(epochs / 15) * 15 * 60;
		var timePickerCfg = {
			setLabel: $filter('translate')('set'),
			closeLabel: $filter('translate')('close'),
            inputTime: epochs,
            step: 15,
			callback: function (val) {
				console.log(val);
				$scope.searchOffer.time = val * 1000;
			}
		};

		ionicTimePicker.openTimePicker(timePickerCfg);
	};

	$scope.searchOffers = function () {
		var startTime = $scope.searchOffer.date + $scope.searchOffer.time;

		// FIXME dev only: hardcoded professionalId
		DataSrv.searchOffers(Config.PROFESSIONAL_ID_2, $scope.searchOffer.poi.objectId, Config.SERVICE_TYPE, startTime).then(
			function (results) {
				$scope.goTo('app.searchresults', {
					'results': results
				});
			},
			function (reason) {
				// TODO handle error
			}
		);
	};
})

.controller('SearchOffersResultsCtrl', function ($scope, $stateParams) {
	$scope.offers = $stateParams['results'];

	$scope.openOfferDetails = function (offer) {
		$scope.goTo('app.offerdetails', {
			'objectId': offer.objectId,
			'offer': offer
		});
	};
})
