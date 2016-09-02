angular.module('toga.services.data', [])

.factory('DataSrv', function ($rootScope, $http, $q, Utils, Config) {
	var dataService = {};

	/* POI types (local) */
	dataService.getPoiTypes = function () {
		var deferred = $q.defer();

		$http.get('data/poifilters.json')

		.then(
			function (response) {
				deferred.resolve(response.data.types);
			},
			function (reason) {
				deferred.reject(reason);
			}
		);

		return deferred.promise;
	};

	/* POI regions (local) */
	dataService.getPoiRegions = function () {
		var deferred = $q.defer();

		$http.get('data/poifilters.json')

		.then(
			function (response) {
				deferred.resolve(response.data.regions);
			},
			function (reason) {
				deferred.reject(reason);
			}
		);

		return deferred.promise;
	};

	/* POIs */
	dataService.getPOIs = function () {
		var deferred = $q.defer();

		var httpConfWithParams = angular.copy(Config.HTTP_CONFIG);
		httpConfWithParams.params = {};

		// TODO params

		//$http.get(Config.SERVER_URL + '/api/chargingPoints/' + Config.OWNER_ID, httpConfWithParams)
		$http.get('data/pois.json', httpConfWithParams)

		.then(
			function (response) {
				// POIs list
				deferred.resolve(response.data);
			},
			function (reason) {
				deferred.reject(reason.data ? reason.data.errorMessage : reason);
			}
		);

		return deferred.promise;
	};

	return dataService;
});
