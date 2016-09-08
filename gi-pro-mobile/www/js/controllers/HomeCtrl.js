angular.module('toga.controllers.home', [])

.controller('HomeCtrl', function ($scope, $stateParams, $ionicTabsDelegate, Utils, Config, DataSrv) {
	$scope.requests = null;
	$scope.offers = null;

	var reload = function () {
		Utils.loading();
		DataSrv.getRequests(Config.PROFESSIONAL_ID_1, Config.SERVICE_TYPE).then(
			function (requests) {
				$scope.requests = requests;
				Utils.loaded();
			},
			function (reason) {
				// TODO handle error
			}
		);

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
	};

	if (!$stateParams.reload) {
		// prevent double load (WHY?!?!?)
		reload();
		console.log('LOAD');
	}

	$scope.$on('$ionicView.beforeEnter', function (event, args) {
		if (!!args.stateParams.reload) {
			reload();
			console.log('RELOAD');
		}

		if (!!args.stateParams.tab) {
			$ionicTabsDelegate.select(args.stateParams.tab);
		}
	});

	$scope.selectedTab = function () {
		return $ionicTabsDelegate.selectedIndex();
	};

	$scope.openRequestDetails = function (request) {
		$scope.goTo('app.requestdetails', {
			'objectId': request.objectId,
			'request': request
		});
	};

	$scope.openOfferDetails = function (offer) {
		$scope.goTo('app.offerdetails', {
			'objectId': offer.objectId,
			'offer': offer
		});
	};
})

.controller('NotificationsCtrl', function ($scope) {})

.controller('HistoryCtrl', function ($scope) {})

.controller('ProfileCtrl', function ($scope) {});
