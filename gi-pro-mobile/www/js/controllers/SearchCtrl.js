angular.module('toga.controllers.search', [])

.controller('SearchOffersCtrl', function ($scope, $filter, ionicDatePicker, ionicTimePicker, Config, Utils, Prefs, DataSrv, Login) {

	$scope.searchOffer = {
		poi: Prefs.lastPOI(),
		date: moment().startOf('date').valueOf(),
		time: 9 * 60 * 60 * 1000//Utils.roundTime()
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
		var timePickerCfg = {
			setLabel: $filter('translate')('set'),
			closeLabel: $filter('translate')('close'),
			inputTime: Math.floor($scope.searchOffer.time / 1000),
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
		DataSrv.searchOffers(Login.getUser().objectId, $scope.searchOffer.poi.objectId, Config.SERVICE_TYPE, startTime).then(
			function (results) {
				$scope.goTo('app.searchresults', {
					'results': results
				});
			}, Utils.commError
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
