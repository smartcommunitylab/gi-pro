angular.module('toga.controllers.home', [])

.controller('HomeCtrl', function ($scope, $ionicTabsDelegate) {
	$scope.selectedTab = function () {
		return $ionicTabsDelegate.selectedIndex();
	};
})

.controller('SearchCtrl', function ($scope) {})

.controller('SearchResultsCtrl', function ($scope) {})

.controller('NewRequestCtrl', function ($scope) {})

.controller('NewOfferCtrl', function ($scope) {})

.controller('NotificationsCtrl', function ($scope) {})

.controller('HistoryCtrl', function ($scope) {})

.controller('ProfileCtrl', function ($scope) {});
