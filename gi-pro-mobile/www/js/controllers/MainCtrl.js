angular.module('toga.controllers.main', [])

/*
 * App generic controller
 */
.controller('AppCtrl', function ($scope, $rootScope, $state, $location, $ionicHistory, $ionicModal, $ionicPopup, $timeout, $filter, Config, Utils, Prefs, DataSrv, Login) {
	$scope.goTo = function (state, params, disableAnimate, disableBack, historyRoot, internalCache) {
		var options = {
			disableAnimate: false,
			disableBack: false,
			historyRoot: false
		};

		if (disableAnimate) {
			options.disableAnimate = disableAnimate;
		}

		if (disableBack) {
			options.disableBack = disableBack;
		}

		if (historyRoot) {
			options.historyRoot = historyRoot;
		}

		$ionicHistory.nextViewOptions(options);

        if (internalCache) {
          DataSrv.internalCache[state] = params;
          $state.go(state);
        } else {
          $state.go(state, params);
        }
	};

	/*
	 * POIs MODAL
	 */
	$ionicModal.fromTemplateUrl('templates/modal_pois.html', {
		scope: $scope,
		animation: 'slide-in-up'
	}).then(
		function (modal) {
			$scope.poisModal = modal;
		},
		function (error) {
			console.log(error);
		}
	);

	$scope.openPoisModal = function (getSelectedPoi) {
		if (angular.isFunction(getSelectedPoi)) {
			$scope.getSelectedPoi = getSelectedPoi;
		}

		$scope.poisModal.show();

		$scope.types = null;
		$scope.regions = null;

		DataSrv.getPoiTypes().then(function (types) {
			$scope.types = types;
		});

		DataSrv.getPoiRegions().then(function (regions) {
			$scope.regions = regions;
		});

		$scope.search = {
			params: {
				type: null,
				region: null
			},
			poi: null
		};

		$scope.openTypesPopup = function () {
			var typesPopup = $ionicPopup.show({
				templateUrl: 'templates/popup_types.html',
				scope: $scope,
				cssClass: 'popup-types',
				buttons: [
					{
						text: $filter('translate')('cancel')
					}
				]
			});

			$scope.selectType = function (type) {
				$scope.search.poi = null;
				$scope.search.params.type = type;

				if (!$scope.search.params.type.region) {
					$scope.search.params.region = null;
				}

				typesPopup.close();
			};
		};

		$scope.openRegionsPopup = function () {
			if (!$scope.search.params.type || $scope.search.params.type.region) {
				var regionsPopup = $ionicPopup.show({
					templateUrl: 'templates/popup_regions.html',
					scope: $scope,
					cssClass: 'popup-regions',
					buttons: [
						{
							text: $filter('translate')('cancel')
						}
					]
				});

				$scope.selectRegion = function (region) {
					$scope.search.poi = null;
					$scope.search.params.region = region;
					regionsPopup.close();
				};
			}
		};

		$scope.unregisterPoiWatch = $scope.$watch('search.params', function (params, oldParams) {
			if (!!params.type) {
				if (params.type.region && !!params.region) {
					// search by type and region
					console.log(params.type.name + ' | ' + params.type.region + ' | ' + params.region);

					Utils.loading();
					DataSrv.getPois($scope.search.params.type.name, $scope.search.params.region).then(
						function (pois) {
							$scope.pois = pois;
							Utils.loaded();
						},
						function (reason) {
							console.log(reason);
							Utils.loaded();
						}
					);
				} else if (params.type.region && !params.region) {
					$scope.pois = null;
				} else if (!params.type.region) {
					// search by type only
					console.log(params.type.name + ' | ' + params.type.region + ' | ' + params.region);

					Utils.loading();
					DataSrv.getPois(params.type.name).then(
						function (pois) {
							$scope.pois = pois;
							Utils.loaded();
						},
						function (reason) {
							console.log(reason);
							Utils.loaded();
						}
					);
				}
			}
		}, true);
	};

	$scope.closePoisModal = function () {
		$scope.unregisterPoiWatch();
		$scope.pois = null;

		if (angular.isFunction($scope.getSelectedPoi) && !!$scope.search.poi) {
			Prefs.lastPOI($scope.search.poi);
			$scope.poisModal.hide().then($scope.getSelectedPoi($scope.search.poi));
		} else {
			$scope.poisModal.hide();
		}
	};

	// Cleanup the modal when we're done with it!
	$scope.$on('$destroy', function () {
		$scope.poisModal.remove();
	});

	// Execute action on hide modal
	$scope.$on('modal.hidden', function () {});

	// Execute action on remove modal
	$scope.$on('modal.removed', function () {});

	$scope.logout = function () {
		$timeout(function () {
			Login.logout();
			$ionicHistory.nextViewOptions({
				historyRoot: true,
				disableBack: true
			});
//			$state.go('app.login');
//			window.location.href = '/';
//			$location.path('/');
            $state.go('app.tutorial',{forceReload:true});
//			window.location.reload(true);
//            $state.go('app.tutorial');
		});
	};
})

/*
 * Tutorial controller
 */
.controller('TutorialCtrl', function ($scope, $stateParams, $ionicSideMenuDelegate, $ionicHistory) {
	// disable sidemenu
	$ionicSideMenuDelegate.canDragContent(false);
	// ion-slides options
	$scope.options = {};

    $scope.$on('$ionicView.enter', function (event, args) {
      $ionicHistory.clearCache();
      $ionicHistory.clearHistory();
      if ($stateParams.forceReload) {
        window.location.reload(true);
      }
	});

	$scope.endTutorial = function () {
		$scope.goTo('app.login');
	};
});
