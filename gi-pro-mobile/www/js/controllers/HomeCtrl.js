angular.module('toga.controllers.home', [])

.controller('HomeCtrl', function ($scope, $ionicTabsDelegate) {
	$scope.selectedTab = function () {
		return $ionicTabsDelegate.selectedIndex();
	};
})

.controller('SearchOffersCtrl', function ($scope, DataSrv) {})

.controller('SearchOffersResultsCtrl', function ($scope) {})

.controller('NewRequestCtrl', function ($scope) {
	$scope.getSelectedPoi = function (poi) {
		console.log(poi);
	};
})

.controller('NewOfferCtrl', function ($scope) {})

.controller('NotificationsCtrl', function ($scope) {})

.controller('HistoryCtrl', function ($scope) {})

.controller('ProfileCtrl', function ($scope) {});
