angular.module('toga.controllers.home', [])

.controller('HomeCtrl', function ($scope, $stateParams, $ionicTabsDelegate, Utils, Config, DataSrv) {
	if (!!$stateParams.tab) {
		$ionicTabsDelegate.select($stateParams.tab);
	}

	$scope.selectedTab = function () {
		return $ionicTabsDelegate.selectedIndex();
	};

	/*
	 * Requests Tab
	 */
	$scope.requests = null;

	Utils.loading();
	DataSrv.getRequests(Config.PROFESSIONAL_ID_1, Config.SERVICE_TYPE).then(
		function (requests) {
			$scope.requests = requests;
			Utils.loaded();
		},
		function (reason) {
			// TODO handle errors
		}
	);

	/*
	 * Offers Tab
	 */
	$scope.offers = null;

	Utils.loading();
	DataSrv.getOffers(Config.PROFESSIONAL_ID_1, Config.SERVICE_TYPE).then(
		function (offers) {
			$scope.offers = offers;
			Utils.loaded();
		},
		function (reason) {
			Utils.loaded();
			// TODO handle error
			Utils.toast();
		}
	);
})

.controller('NotificationsCtrl', function ($scope) {})

.controller('HistoryCtrl', function ($scope) {})

.controller('ProfileCtrl', function ($scope) {});
