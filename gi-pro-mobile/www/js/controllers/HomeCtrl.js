angular.module('toga.controllers.home', [])

.controller('HomeCtrl', function ($scope, $ionicTabsDelegate) {
	$scope.selectedTab = function () {
		return $ionicTabsDelegate.selectedIndex();
	};
})

.controller('SearchOffersCtrl', function ($scope, DataSrv) {})

.controller('SearchOffersResultsCtrl', function ($scope) {})

.controller('NewRequestCtrl', function ($scope, $filter, ionicDatePicker, ionicTimePicker) {
	var datePickerCfg = {
		setLabel: $filter('translate')('set'),
		todayLabel: $filter('translate')('today'),
		closeLabel: $filter('translate')('close'),
		callback: function (val) {}
	};
	$scope.openDatePicker = function () {
		ionicDatePicker.openDatePicker(datePickerCfg);
	};

	var timePickerCfg = {
		setLabel: $filter('translate')('set'),
		closeLabel: $filter('translate')('close'),
		callback: function (val) {}
	};
	$scope.openTimePicker = function () {
		ionicTimePicker.openTimePicker(timePickerCfg);
	};

	var getSelectedPoi = function (poi) {
		console.log(poi);
	};

	$scope.openPoisModal = function () {
		$scope.$parent.openPoisModal(getSelectedPoi);
	};
})

.controller('NewOfferCtrl', function ($scope) {})

.controller('NotificationsCtrl', function ($scope) {})

.controller('HistoryCtrl', function ($scope) {})

.controller('ProfileCtrl', function ($scope) {});
