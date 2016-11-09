angular.module('gi-pro.controllers.serviceandprof', [])

.controller('ServiceAndProfCtrl', function ($scope, $rootScope, $stateParams, $q, $state, $filter, $ionicScrollDelegate, DataSrv, mapService, Utils, Login, GeoLocate, Config) {
  $scope.activeServices = null; //list of active services
  $scope.activeProfessionals = null; //list of active professional
  $scope.activeZones = null; //list of active zones
  $scope.selectingFilter = false; //if user is selecting some filter or not
  $scope.selectingServices = false;
  $scope.selectingZones = false;
  $scope.selectingProfession = false;
  $scope.listVisualization = true;
  $scope.searchBarVisible = false;
  $scope.searchString = "";


  var professionMap = null;
  var zoneMap = null;
  var servicesMap = null;
  $scope.title = $filter('translate')('app');
  $scope.filters = {
    allServices: [],
    selectedService: null,
    allProfessions: [],
    selectedProfession: null,
    allZones: [],
    selectedZone: null
  };

  $scope.goBack = function () {
      $scope.searchString = "";
      $scope.searchBarVisible = false;
      $scope.title = $filter('translate')('app');
    }
    //  $scope.clearSearch = function () {
    //    $scope.searchString = "";
    //    $scope.searchBarVisible = false;
    //    $scope.title = $filter('translate')('app');
    //  }
  var loadFilters = function () {
    //        load professions
    //        load services
    //        load zones
    var deferred = $q.defer();
    DataSrv.getProfessionsDefinition().then(function (professions) {
      $scope.filters.allProfessions = professions;
      DataSrv.getServicesDefinition().then(function (services) {
        $scope.filters.allServices = services;
        DataSrv.getZonesDefinition().then(function (zones) {
          $scope.filters.allZones = zones;
          professionMap = DataSrv.getProfessionsMap();
          zoneMap = DataSrv.getZonesMap();
          servicesMap = DataSrv.getServicesMap();
          deferred.resolve();
        }, function (error) {
          deferred.reject();
        });
      }, function (error) {
        deferred.reject();
      });
    }, function (error) {
      deferred.reject();
    });
    return deferred.promise;


  }
  var addExtraDataToProf = function () {
    for (var i = 0; i < $scope.activeProfessionals.length; i++) {
      $scope.activeProfessionals[i]["profession"] = professionMap[$scope.activeProfessionals[i].type].name;
      $scope.activeProfessionals[i]["zone"] = zoneMap[$scope.activeProfessionals[i].area].name;
    }
    //if logged add also service meta info
    if (Login.userIsLogged()) {
      for (var i = 0; i < $scope.activeServices.length; i++) {
        $scope.activeServices[i]["service"] = servicesMap[$scope.activeServices[i].serviceId].name;
        $scope.activeServices[i]["zone"] = zoneMap[$scope.activeProfessionals[i].area].name;
      }
    }

  }
  var reload = function () {
    if (!Login.userIsLogged()) {
      //show tutorial
    }

    Utils.loading();
    //get Professionist
    DataSrv.getProfessionals().then(
      function (professionals) {
        if (professionals) {
          $scope.activeProfessionals = professionals;
          $scope.markers = mapService.getProfessionalsPoints($scope.activeProfessionals);
        }
        //                get zones
        DataSrv.getZones().then(function (zones) {
            $scope.activeZones = zones;
            if (Login.userIsLogged()) {
              //                        if (true) {
              DataSrv.getServices().then(
                function (services) {
                  $scope.activeServices = services;
                  loadFilters().then(function () {
                    addExtraDataToProf();
                  });
                  Utils.loaded();
                },
                Utils.commError);
            } else {
              loadFilters().then(function () {
                addExtraDataToProf();
              });
              Utils.loaded();
            }
          },
          Utils.commError);
      },
      Utils.commError);
    //serve il loading delle chiamate asincrone



    //if Login.userIsLogged() load services

  };

  if (!$stateParams.reload) {
    // prevent double load (WHY?!?!?)
    reload();
  }
  $scope.openFilters = function (type) {
    $scope.selectingFilter = true;
    if (type === 'service') {
      $scope.selectingServices = true;
    }
    if (type === 'zone') {
      $scope.selectingZones = true;
    }
    if (type === 'profession') {
      $scope.selectingProfession = true;
    }
  }

  $scope.switchSearchBar = function () {
    $scope.searchBarVisible = true;
    $scope.title = '';
  }
  $scope.openDetailsProf = function (professionist) {
    $state.go("app.profdetails", {
      'professionist': professionist
    });
  }

  $scope.selectFilter = function (type, selection) {
    $scope.selectingFilter = false;
    $scope.selectingServices = false;
    $scope.selectingZones = false;
    $scope.selectingProfession = false;

    if (type === 'service') {
      if (servicesMap) {
        if (selection) {
          $scope.filters.selectedService = servicesMap[selection.id];
        } else {
          $scope.filters.selectedService = null;
        }
      }
    }
    if (type === 'zone') {
      if (zoneMap) {
        if (selection) {
          $scope.filters.selectedZone = zoneMap[selection.id];
        } else {
          $scope.filters.selectedZone = null
        }
      }
    }
    if (type === 'profession') {
      if (professionMap) {
        if (selection) {
          $scope.filters.selectedProfession = professionMap[selection.id];
        } else {
          $scope.filters.selectedProfession = null
        }
      }

    }
    $ionicScrollDelegate.resize();
  }
  $scope.$on('$ionicView.enter', function (event, args) {
    var params = DataSrv.internalCache['app.serviceAndProf'] || {};
    if (!!params.reload) {
      reload();
    }

    if (!!params.tab) {
      $ionicTabsDelegate.select(params.tab);
    }
    DataSrv.internalCache['app.serviceAndProf'] = null;
  });
  $scope.switchToMap = function () {
    $scope.listVisualization = !$scope.listVisualization;
  }

  $scope.initMap = function () {
    mapService.initMap('serviceMap').then(function () {
      GeoLocate.locate().then(function (pos) {
        $scope.center = {
          lat: pos[0],
          lng: pos[1],
          zoom: 18
        };
      }, function () {
        //                $scope.filterMarkers(false);
      });

    });
  };
  angular.extend($scope, {
    center: {
      lat: Config.getMapPosition().lat,
      lng: Config.getMapPosition().long,
      zoom: 18
    },
    markers: $scope.markers,
    events: {}
  });
});
