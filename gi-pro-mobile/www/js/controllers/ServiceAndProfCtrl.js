angular.module('gi-pro.controllers.serviceandprof', [])

.controller('ServiceAndProfCtrl', function ($scope, $rootScope, $stateParams, $q, $state, $filter, $ionicScrollDelegate, $ionicTabsDelegate, $ionicPopup, DataSrv, mapService, Utils, Login, GeoLocate, Config) {
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
  $scope.professionistTab = true;
  $scope.allProfessionist = Config.getPageProfessional();
  $scope.startProfessionist = 0;
  $scope.endProfessionist_reached = false;
  $scope.allServices = Config.getPageServices();
  $scope.startServices = 0;
  $scope.endServices_reached = false;

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
    $scope.searchString = '';
    $scope.searchBarVisible = false;
    $scope.title = $filter('translate')('app');
  }

  var loadFilters = function () {
    // load professions
    // load services
    // load zones
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
    // if logged add also service meta info
    if (Login.userIsLogged()) {
      //if (true) {
      for (var i = 0; i < $scope.activeServices.length; i++) {
        $scope.activeServices[i]["service"] = servicesMap[$scope.activeServices[i].serviceType].name;
        $scope.activeServices[i]["zone"] = zoneMap[$scope.activeProfessionals[i].area].name;
      }
    }
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

  $scope.selectFilter = function (kind, type, selection) {
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
    if (kind === 'profession') {
      $scope.activeProfessionals = null;
      $scope.startProfessionist = 0;
      $scope.allProfessionist = Config.getPageProfessional();
      $scope.loadMoreProfessionist();
    }
    if (kind === 'service') {
      $scope.activeServices = null;
      $scope.startServices = 0;
      $scope.allServices = Config.getPageServices();
      $scope.loadMoreServices();
    }
    $ionicScrollDelegate.resize();
  }

  $scope.switchToMap = function () {
    $scope.listVisualization = !$scope.listVisualization;
  }

  $scope.initServiceMap = function () {
    $scope.professionistTab = false;
    $scope.searchBarVisible = false;

    if ($ionicTabsDelegate.selectedIndex() == 1) { //1 is the second
      mapService.initMap('serviceMap').then(function () {
        GeoLocate.locate().then(function (pos) {
          $scope.center = {
            lat: pos[0],
            lng: pos[1],
            zoom: 18
          };
          $scope.servicesMarkers = mapService.getServicesPoints($scope.activeServices);
          mapService.refresh('serviceMap');
        }, function () {
          //$scope.filterMarkers(false);
        });
      });
    }
  };

  $scope.initProfessionMap = function () {
    $scope.professionistTab = true;

    if ($ionicTabsDelegate.selectedIndex() == 0) { //0 is the first
      mapService.initMap('professionMap').then(function () {
        GeoLocate.locate().then(function (pos) {
          $scope.center = {
            lat: pos[0],
            lng: pos[1],
            zoom: 18
          };
          $scope.professionalMarkers = mapService.getProfessionalsPoints($scope.activeProfessionals);
          mapService.refresh('professionMap');
        }, function () {
          //$scope.filterMarkers(false);
        });
      });
    }
  };

  /* Currently commented because I can't order by alpha or price because they are fixed */
  /*var orderList = function (orderBy) {
    $ionicLoading.show();
    listPathsService.getPathsByCategoryIdAndOrder($stateParams, $scope.data.actualOrder, length).then(function (paths) {
      $scope.emptylist = false;
      $scope.paths = paths;

      if ($scope.paths.length == 0) {
        $scope.emptylist = true;
      } else {
        $scope.emptylist = false;
      }
      $ionicLoading.hide();
    }, function () {
      $ionicLoading.hide();
    });
  }

  $scope.orderServices = function () {
    $scope.data = {
      actualOrder: 'alpha'
    }

    $scope.orderList = [
      {
        text: $filter('translate')('orderby_alphabetically'),
        value: "alpha"
      },
      {
        text: $filter('translate')('orderby_price'),
        value: "price"
      }
    ];

    var orderPopup = $ionicPopup.confirm({
      //      cssClass: 'order-popup',
      title: $filter('translate')('oder_popup_title'),
      templateUrl: 'templates/order-popover.html',
      scope: $scope,
      buttons: [
        { // Array[Object] (optional). Buttons to place in the popup footer.
          text: $filter('translate')('close'),
        },
        {
          text: $filter('translate')('ok'),
          onTap: function (e) {
            return $scope.data.actualOrder;
          }
        }
      ]
    });

    orderPopup.then(function (res) {
      if (res) {
        //orderList(res);
        loadMoreServices
      }
    });
  }*/

  $scope.loadMoreServices = function () {
    var deferred = $q.defer();
    var professionalID = Login.getUser().objectId;
    DataSrv.getServices(professionalID, ($scope.filters.selectedService == null) ? null : $scope.filters.selectedService.id, ($scope.filters.selectedZone == null) ? null : $scope.filters.selectedZone.id, (($scope.activeServices == null) ? 1 : Math.floor(($scope.activeServices.length / $scope.allServices)) + 1), $scope.allServices, "objectId").then(function (services) {
      /*type, area, page, limit, orderBy*/
      if (services) {
        $scope.activeServices = !!$scope.services ? $scope.services.concat(services) : services;
        if ($scope.activeServices.length == 0) {
          $scope.emptylist = true;
        }
        if (services.length >= $scope.allServices) {
          $scope.$broadcast('scroll.infiniteScrollComplete');
          $scope.startServices += $scope.allServices;
          $scope.servicesMarkers = mapService.getServicesPoints($scope.activeServices);
          $scope.endServices_reached = false;
        } else {
          $scope.endServices_reached = true;
        }
      } else {
        // $scope.emptylist = true;
        $scope.endServices_reached = true;
        Toast.show($filter('translate')("pop_up_error_server_template"), "short", "bottom");
      }

      Config.loaded();
      deferred.resolve();
      $scope.$broadcast('scroll.infiniteScrollComplete');
      $scope.$broadcast('scroll.refreshComplete');
    }, function (err) {
      Utils.commError;
      $scope.$broadcast('scroll.infiniteScrollComplete');
      $scope.$broadcast('scroll.refreshComplete');
      $scope.endServices_reached = true;
      Config.loaded();
    });
    return deferred.promise;
  }

  $scope.loadServices = function () {
    reload();
  }

  $scope.loadMoreProfessionist = function () {
    var deferred = $q.defer();
    DataSrv.getProfessionals(($scope.filters.selectedProfession == null) ? null : $scope.filters.selectedProfession.id, ($scope.filters.selectedZone == null) ? null : $scope.filters.selectedZone.id, (($scope.activeProfessionals == null) ? 1 : Math.floor(($scope.activeProfessionals.length / $scope.allProfessionist)) + 1), $scope.allProfessionist, "surname").then(function (professional) { /*type, area, page, limit, orderBy*/
      if (professional) {
        $scope.activeProfessionals = !!$scope.activeProfessionals ? $scope.activeProfessionals.concat(professional) : professional;

        if ($scope.activeProfessionals.length == 0) {
          $scope.emptylist = true;
        } else {
          if ($scope.filters.allZones.length == 0) {
            loadFilters().then(function () {
              addExtraDataToProf();
            });
          } else {
            addExtraDataToProf();
          }
        }
        if (professional.length >= $scope.allProfessionist) {
          $scope.$broadcast('scroll.infiniteScrollComplete');
          $scope.startProfessionist += $scope.allProfessionist;
          $scope.professionalMarkers = mapService.getProfessionalsPoints($scope.activeProfessionals);
          $scope.endProfessionist_reached = false;
        } else {
          $scope.endProfessionist_reached = true;
        }
      } else {
        // $scope.emptylist = true;
        $scope.endProfessionist_reached = true;
        Toast.show($filter('translate')("pop_up_error_server_template"), "short", "bottom");
      }

      Config.loaded();
      deferred.resolve();
      $scope.$broadcast('scroll.infiniteScrollComplete');
      $scope.$broadcast('scroll.refreshComplete');
    }, function (err) {
      Utils.commError;
      $scope.$broadcast('scroll.infiniteScrollComplete');
      $scope.$broadcast('scroll.refreshComplete');
      $scope.endProfessionist_reached = true;
      Config.loaded();
    });
    return deferred.promise;
  }

  var reload = function () {
    if (!Login.userIsLogged()) {
      //show tutorial
    }
    $scope.activeProfessionals = null;
    $scope.activeServices = null;
    $scope.startProfessionist = 0;
    $scope.allProfessionist = Config.getPageProfessional();
    $scope.endProfessionist_reached = false;
    $scope.startServices = 0;
    $scope.allServices = Config.getPageServices();
    $scope.endServices_reached = false;
    //get Professionist
    $scope.loadMoreProfessionist().then(
      function () {
        // get zones
        DataSrv.getZones().then(function (zones) {
            $scope.activeZones = zones;
            if (Login.userIsLogged()) {
              //if (true) {
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

  $scope.loadProfessionist = function () {
    reload();
  }

  angular.extend($scope, {
    center: {
      lat: Config.getMapPosition().lat,
      lng: Config.getMapPosition().long,
      zoom: 18
    },
    servicesMarkers: $scope.servicesMarkers,
    professionalMarkers: $scope.professionalMarkers,
    events: {}
  });

  $scope.openServiceDetails = function (service) {
    $scope.goTo('app.servicedetails', {
      'objectId': service.objectId
    });
  };
});
