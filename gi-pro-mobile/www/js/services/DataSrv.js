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

	/* get POIs by type and region */
	dataService.getPois = function (type, region, page, limit) {
		var deferred = $q.defer();

		var httpConfWithParams = Config.getHTTPConfig();
		httpConfWithParams.params = {};

		// type is required
		if (!type || !angular.isString(type)) {
			deferred.reject('Invalid type');
		}

		httpConfWithParams.params = {
			type: type
		};

		if (!!region && angular.isString(region)) {
			httpConfWithParams.params.region = region;
		}

		// TODO handle pagination

		$http.get(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/poi/bypage', httpConfWithParams)

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

	/* get POIs by ids */
	dataService.getPoisByIds = function (ids) {
		var deferred = $q.defer();

		var httpConfWithParams = Config.getHTTPConfig();
		httpConfWithParams.params = {};

		// type is required
		if (!ids || !angular.isArray(ids)) {
			deferred.reject('Invalid ids array');
		}

		httpConfWithParams.params.ids = ids;

		$http.get(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/poi/byids', httpConfWithParams)

		.then(
			function (response) {
				// POIs array to map
				var poisMap = {};
				angular.forEach(response.data, function (poi) {
					poisMap[poi.objectId] = poi;
				});

				deferred.resolve(poisMap);
			},
			function (reason) {
				deferred.reject(reason.data ? reason.data.errorMessage : reason);
			}
		);

		return deferred.promise;
	};

	/* get offers */
	dataService.getOffers = function (professionalId, serviceType, timeFrom, timeTo, page, limit) {
		var deferred = $q.defer();

		var httpConfWithParams = Config.getHTTPConfig();
		httpConfWithParams.params = {};

		// professionalId is required
		if (!professionalId || !angular.isString(professionalId)) {
			deferred.reject('Invalid professionalId');
		}

		// serviceType is required
		if (!serviceType || !angular.isString(serviceType)) {
			deferred.reject('Invalid serviceType');
		}

		httpConfWithParams.params['serviceType'] = serviceType;

		// TODO handle timeFrom, timeTo, page, limit

		$http.get(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/service/offer/' + professionalId, httpConfWithParams)

		.then(
			function (response) {
				// offers
				deferred.resolve(response.data);
			},
			function (reason) {
				deferred.reject(reason.data ? reason.data.errorMessage : reason);
			}
		);

		return deferred.promise;
	};

	/* create offer */
	dataService.createOffer = function (serviceOffer) {
		var deferred = $q.defer();

		$http.post(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/service/offer', serviceOffer, Config.HTTP_CONFIG)

		.then(
			function (response) {
				// offer created
				deferred.resolve(response.data);
			},
			function (reason) {
				deferred.reject(reason.data ? reason.data.errorMessage : reason);
			}
		);

		return deferred.promise;
	};

	/* delete offer */
	dataService.deleteOffer = function (objectId, professionalId) {
		var deferred = $q.defer();

		$http.delete(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/service/offer/' + objectId + '/' + professionalId, Config.HTTP_CONFIG)

		.then(
			function (response) {
				deferred.resolve(response.data);
			},
			function (reason) {
				deferred.reject(reason.data ? reason.data.errorMessage : reason);
			}
		);

		return deferred.promise;
	};

	/* search offers */
	dataService.searchOffers = function (professionalId, poiId, serviceType, startTime) {
		var deferred = $q.defer();

		var httpConfWithParams = Config.getHTTPConfig();
		httpConfWithParams.params = {};

		// professionalId is required
		if (!professionalId || !angular.isString(professionalId)) {
			deferred.reject('Invalid professionalId');
		}

		// poiId is required
		if (!poiId || !angular.isString(poiId)) {
			deferred.reject('Invalid poiId');
		}

		// serviceType is required
		if (!serviceType || !angular.isString(serviceType)) {
			deferred.reject('Invalid serviceType');
		}

		// startTime is required
		if (!startTime || !angular.isNumber(startTime)) {
			deferred.reject('Invalid startTime');
		}

		httpConfWithParams.params['poiId'] = poiId;
		httpConfWithParams.params['serviceType'] = serviceType;
		httpConfWithParams.params['startTime'] = startTime;

		// TODO handle pagination

		$http.get(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/service/searchoffer/' + professionalId, httpConfWithParams)

		.then(
			function (response) {
				// offers
				deferred.resolve(response.data);
			},
			function (reason) {
				deferred.reject(reason.data ? reason.data.errorMessage : reason);
			}
		);

		return deferred.promise;
	};

	/* get requests */
	dataService.getRequests = function (professionalId, serviceType, timeFrom, timeTo, page, limit) {
		var deferred = $q.defer();

		var httpConfWithParams = Config.getHTTPConfig();
		httpConfWithParams.params = {};

		// professionalId is required
		if (!professionalId || !angular.isString(professionalId)) {
			deferred.reject('Invalid professionalId');
		}

		// serviceType is required
		if (!serviceType || !angular.isString(serviceType)) {
			deferred.reject('Invalid serviceType');
		}

		httpConfWithParams.params['serviceType'] = serviceType;

		// TODO handle timeFrom, timeTo, page, limit

		$http.get(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/service/request/' + professionalId, httpConfWithParams)

		.then(
			function (response) {
				// requests
				deferred.resolve(response.data);
			},
			function (reason) {
				deferred.reject(reason.data ? reason.data.errorMessage : reason);
			}
		);

		return deferred.promise;
	};

	/* create request */
	dataService.createRequestPublic = function (serviceRequest) {
		var deferred = $q.defer();

		$http.post(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/service/request/public', serviceRequest, Config.HTTP_CONFIG)

		.then(
			function (response) {
				// request created
				deferred.resolve(response.data);
			},
			function (reason) {
				deferred.reject(reason.data ? reason.data.errorMessage : reason);
			}
		);

		return deferred.promise;
	};

	/* delete request */
	dataService.deleteRequest = function (objectId, professionalId) {
		var deferred = $q.defer();

		$http.delete(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/service/request/' + objectId + '/' + professionalId, Config.HTTP_CONFIG)

		.then(
			function (response) {
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
