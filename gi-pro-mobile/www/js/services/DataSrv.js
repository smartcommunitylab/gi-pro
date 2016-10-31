angular.module('gi-pro.services.data', [])

.factory('DataSrv', function ($rootScope, $http, $q, Utils, Config) {
    var dataService = {
        internalCache: {}
    };
    var professionMap = null;
    var zoneMap = null;
    var servicesMap = null;




    var createMap = function (data) {
            map = {};
            //add new object with name id and data the rest of the data
            for (var i = 0; i < data.length; i++) {
                map[data[i].id] = data[i];
            }
            return map;
        }
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


    /* get Professions (local) */
    dataService.getProfessionsDefinition = function () {
        var deferred = $q.defer();

        $http.get('data/poifilters.json')

        .then(
            function (response) {
                if (!professionMap) {
                    professionMap = createMap(response.data.professions)
                };
                deferred.resolve(response.data.professions);
            },
            function (reason) {
                deferred.reject(reason);
            }
        );

        return deferred.promise;
    };
    /* get Services (local) */
    dataService.getServicesDefinition = function () {
        var deferred = $q.defer();

        $http.get('data/poifilters.json')

        .then(
            function (response) {
                if (!servicesMap) {
                    servicesMap = createMap(response.data.services);
                }
                deferred.resolve(response.data.services);
            },
            function (reason) {
                deferred.reject(reason);
            }
        );

        return deferred.promise;
    };
    /* get Zones (local) */
    dataService.getZonesDefinition = function () {
        var deferred = $q.defer();

        $http.get('data/poifilters.json')

        .then(
            function (response) {
                if (!zoneMap) {
                    zoneMap = createMap(response.data.zones);
                }
                deferred.resolve(response.data.zones);
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

    /*
    get ilst with all professionist
    */
    dataService.getProfessionals = function () {
            var tempProf = [{
                name: "Tullio Pinter",
                picture: "https://pixabay.com/static/uploads/photo/2012/04/26/19/43/profile-42914_960_720.png",
                professionId: "idpro_1"
            }, {
                name: "yabba dabba",
                picture: "http://jovesnavegants.org/wp-content/uploads/2015/09/PerfilSinFotoMujer.jpg",
                professionId: "idpro_2"
            }, {
                name: "zigo zago",
                picture: "http://jornaldepenedo-al.com.br/teste/wp-content/uploads/2016/08/user.png",
                professionId: "idpro_1"
            }];
            var deferred = $q.defer();
            //add information
            dataService.getProfessionsDefinition().then(function (professions) {
                for (var i = 0; i < tempProf.length; i++) {
                    tempProf[i]["profession"] = professionMap[tempProf[i].professionId].name;
                }
                deferred.resolve(tempProf);

            });
            return deferred.promise;

        }
        /*get ilst with all services*/
    dataService.getServices = function () {
        var tempServ = [{
            serviceId: "1",
            owner: "Tullio Pinter"
            }, {
            serviceId: "2",
            owner: "yabba dabba"
            }, {
            serviceId: "1",
            owner: "zigo zago"
            }];
        var deferred = $q.defer();
        dataService.getServicesDefinition().then(function (services) {
            for (var i = 0; i < tempServ.length; i++) {
                tempServ[i]["service"] = servicesMap[tempProf[i].serviceId].name;
            }
            deferred.resolve(tempServ);
        });
        return deferred.promise;
    }
    dataService.getZones = function () {
            var tempZones = [{
                zoneId: "1",
            }, {
                zoneId: "2",
            }, {
                zoneId: "3",
            }];
            var deferred = $q.defer();
            dataService.getZonesDefinition().then(function (zones) {
                for (var i = 0; i < tempZones.length; i++) {
                    tempZones[i]["service"] = zoneMap[tempProf[i].serviceId].name;
                }
                deferred.resolve(tempZones);
            });
            return deferred.promise;
        }
        /* get offers */
    dataService.getOffers = function (professionalId, serviceType, timeFrom, timeTo, withTime, page, limit) {
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

        if (!!timeFrom) {
            httpConfWithParams.params['timeFrom'] = timeFrom;
        }
        if (!!timeTo) {
            httpConfWithParams.params['timeTo'] = timeTo;
        }
        if (!!page) {
            httpConfWithParams.params['page'] = page;
        }
        if (!!limit) {
            httpConfWithParams.params['limit'] = limit;
        }
        if (withTime != null) {
            httpConfWithParams.params['withTime'] = withTime;
        }


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

        $http.post(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/service/offer', serviceOffer, Config.getHTTPConfig())

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

        $http.delete(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/service/offer/' + objectId + '/' + professionalId, Config.getHTTPConfig())

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
    dataService.searchOffers = function (professionalId, poiId, serviceType, startTime, page, limit) {
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

        if (!!page) {
            httpConfWithParams.params['page'] = page;
        }
        if (!!limit) {
            httpConfWithParams.params['limit'] = limit;
        }

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

        if (!!timeFrom) {
            httpConfWithParams.params['timeFrom'] = timeFrom;
        }
        if (!!timeTo) {
            httpConfWithParams.params['timeTo'] = timeTo;
        }
        if (!!page) {
            httpConfWithParams.params['page'] = page;
        }
        if (!!limit) {
            httpConfWithParams.params['limit'] = limit;
        }

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

        $http.post(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/service/request/public', serviceRequest, Config.getHTTPConfig())

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

        $http.delete(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/service/request/' + objectId + '/' + professionalId, Config.getHTTPConfig())

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

    dataService.notificationTypes = {
        NEW_SERVICE_REQUEST: 'NEW_SERVICE_REQUEST',
        NEW_SERVICE_OFFER: 'NEW_SERVICE_OFFER',
        APPLICATION_ACCEPTED: 'APPLICATION_ACCEPTED',
        APPLICATION_REJECTED: 'APPLICATION_REJECTED',
        SERVICE_REQUEST_DELETED: 'SERVICE_REQUEST_DELETED',
        SERVICE_OFFER_DELETED: 'SERVICE_OFFER_DELETED',
        NEW_APPLICATION: 'NEW_APPLICATION',
        APPLICATION_DELETED: 'APPLICATION_DELETED'
    };

    /* get matching offers */
    dataService.getMatchingOffers = function (professionalId, requestId) {
        var deferred = $q.defer();

        $http.get(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/service/request/' + professionalId + '/' + requestId + '/matches', Config.getHTTPConfig())

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

    /* get matching requests */
    dataService.getMatchingRequests = function (professionalId, offerId) {
        var deferred = $q.defer();

        $http.get(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/service/offer/' + professionalId + '/' + offerId + '/matches', Config.getHTTPConfig())

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

    /* get notifications */
    dataService.getNotifications = function (professionalId, type, read, timeFrom, timeTo, page, limit) {
        var deferred = $q.defer();

        var httpConfWithParams = Config.getHTTPConfig();
        httpConfWithParams.params = {};

        // professionalId is required
        if (!professionalId || !angular.isString(professionalId)) {
            deferred.reject('Invalid professionalId');
        }

        if (!!timeFrom) {
            httpConfWithParams.params['type'] = type;
        }
        if (!!timeFrom) {
            httpConfWithParams.params['timeFrom'] = timeFrom;
        }
        if (!!timeTo) {
            httpConfWithParams.params['timeTo'] = timeTo;
        }
        if (!!page) {
            httpConfWithParams.params['page'] = page;
        }
        if (!!limit) {
            httpConfWithParams.params['limit'] = limit;
        }
        if (read != 0) {
            httpConfWithParams.params['read'] = read > 0 ? true : false;
        }


        $http.get(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/notification/' + professionalId, httpConfWithParams)

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

    /* single offer */
    dataService.getOfferById = function (professionalId, objectId) {
        var deferred = $q.defer();

        var httpConfWithParams = Config.getHTTPConfig();
        httpConfWithParams.params = {};

        // professionalId is required
        if (!professionalId || !angular.isString(professionalId)) {
            deferred.reject('Invalid professionalId');
        }

        // objectId is required
        if (!objectId || !angular.isString(objectId)) {
            deferred.reject('Invalid serviceType');
        }

        $http.get(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/service/offer/' + professionalId + '/' + objectId, httpConfWithParams)

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
    /* single request */
    dataService.getRequestById = function (professionalId, objectId) {
        var deferred = $q.defer();

        var httpConfWithParams = Config.getHTTPConfig();
        httpConfWithParams.params = {};

        // professionalId is required
        if (!professionalId || !angular.isString(professionalId)) {
            deferred.reject('Invalid professionalId');
        }

        // objectId is required
        if (!objectId || !angular.isString(objectId)) {
            deferred.reject('Invalid serviceType');
        }

        $http.get(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/service/request/' + professionalId + '/' + objectId, httpConfWithParams)

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

    dataService.updateProfile = function (profile) {
        var deferred = $q.defer();

        var httpConfWithParams = Config.getHTTPConfig();
        httpConfWithParams.params = {};
        $http.put(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/profile/' + profile.objectId, profile, httpConfWithParams)
            .then(
                function (response) {
                    var data = response.data;
                    if (!data || data.status != 'OK') {
                        deferred.reject();
                        return;
                    }
                    localStorage.setItem(Config.getUserVar(), JSON.stringify(profile));
                    $rootScope.user = profile;
                    deferred.resolve(profile);
                },
                function (reason) {
                    loginService.logout();
                    deferred.reject(reason);
                }
            );
        return deferred.promise;

    }

    return dataService;
});
