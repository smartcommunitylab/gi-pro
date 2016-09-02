angular.module('toga.controllers.main', [])

/*
 * App generic controller
 */
.controller('AppCtrl', function ($scope, $state, $ionicHistory, $ionicModal, $ionicPopup, $filter, DataSrv) {
	$scope.goTo = function (state, params, disableAnimate, disableBack, historyRoot) {
		var options = {};

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
		$state.go(state, params);
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

	$scope.openPoisModal = function () {
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
			type: {},
			region: null,
			text: '',
			poi: null
		};

		$scope.openTypesPopup = function () {
			var typesPopup = $ionicPopup.show({
				templateUrl: 'templates/popup_types.html',
				scope: $scope,
				buttons: [
					{
						text: $filter('translate')('cancel')
					}
				]
			});

			$scope.selectType = function (type) {
				$scope.search.type = type;

				if (!$scope.search.type.region) {
					$scope.search.region = null;
				}

				typesPopup.close();
			};
		};

		$scope.openRegionsPopup = function () {
			if ($scope.search.type.region) {
				var regionsPopup = $ionicPopup.show({
					templateUrl: 'templates/popup_regions.html',
					scope: $scope,
					buttons: [
						{
							text: $filter('translate')('cancel')
						}
					]
				});

				$scope.selectRegion = function (region) {
					$scope.search.region = region;
					regionsPopup.close();
				};
			}
		};
	};

	$scope.closePoisModal = function (action) {
		if (angular.isFunction(action) && !!$scope.search.poi) {
			$scope.poisModal.hide().then(action($scope.search.poi));
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
});
