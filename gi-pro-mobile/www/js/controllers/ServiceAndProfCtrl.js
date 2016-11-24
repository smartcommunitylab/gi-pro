angular.module('gi-pro.controllers.serviceandprof', [])

.controller('ServiceAndProfCtrl', function ($scope, $rootScope, $stateParams, $q, $state, $filter, $ionicScrollDelegate, $ionicTabsDelegate, $ionicModal, $ionicPopup, DataSrv, mapService, Utils, Login, GeoLocate, Config) {
  $scope.servicesList = null; //list of active services
  $scope.professionalsList = null; //list of active professional
  $scope.zonesList = null; //list of active zones
  $scope.viewAsList = true;

  $scope.activeTab = null;
  // Search Bar
  $scope.searchBarVisible = false;
  $scope.searchString = "";

  $scope.allProfessional = Config.getPageProfessional();
  $scope.startProfessional = 0;
  $scope.endProfessional_reached = false;
  $scope.allServices = Config.getPageServices();
  $scope.startServices = 0;
  $scope.endServices_reached = false;

  var professionsMap = null;
  var zonesMap = null;
  var servicesMap = null;

  $scope.title = $filter('translate')('app');

  $scope.goBack = function () {
    $scope.searchString = '';
    $scope.searchBarVisible = false;
    $scope.title = $filter('translate')('app');
  }

  $scope.switchSearchBar = function () {
    $scope.searchBarVisible = true;
    $scope.title = '';
  }

  $scope.openProfessionalDetails = function (professional) {
    $state.go("app.profdetails", {
      'objectId': professional.objectId,
      'professional': professional
    });
  }

  $scope.openServiceDetails = function (service) {
    $scope.goTo('app.servicedetails', {
      'service': service,
      'objectId': service.objectId
    });
  }

  $scope.filters = {
    allServices: [],
    selectedService: null,
    allProfessions: [],
    selectedProfession: null,
    allZones: [],
    selectedZone: null
  }

  $scope.filterModals = {}

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

          professionsMap = DataSrv.getProfessionsMap();
          $ionicModal.fromTemplateUrl('templates/modal_professions.html', {
            scope: $scope
          }).then(function (modal) {
            $scope.filterModals['professions'] = modal;
          }, function (error) {
            console.log(error);
          });

          servicesMap = DataSrv.getServicesMap();
          $ionicModal.fromTemplateUrl('templates/modal_services.html', {
            scope: $scope
          }).then(function (modal) {
            $scope.filterModals['services'] = modal;
          }, function (error) {
            console.log(error);
          });

          zonesMap = DataSrv.getZonesMap();
          $ionicModal.fromTemplateUrl('templates/modal_zones.html', {
            scope: $scope
          }).then(function (modal) {
            $scope.filterModals['zones'] = modal;
          }, function (error) {
            console.log(error);
          });

          addExtraDataToProf();
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
    for (var i = 0; i < $scope.professionalsList.length; i++) {
      $scope.professionalsList[i]["profession"] = professionsMap[$scope.professionalsList[i].type].name;
      $scope.professionalsList[i]["zone"] = zonesMap[$scope.professionalsList[i].area] ? zonesMap[$scope.professionalsList[i].area].name : '';
    }

    // if logged add also service meta info
    if (Login.userIsLogged() && $scope.servicesList) {
      for (var i = 0; i < $scope.servicesList.length; i++) {
        $scope.servicesList[i]["service"] = servicesMap[$scope.servicesList[i].serviceType].name;
        $scope.servicesList[i]["zone"] = zonesMap[$scope.servicesList[i].area] ? zonesMap[$scope.servicesList[i].area].name : '';
      }
    }
  }

  $scope.styles = {
    'resultsList': Utils.resizeElement(44 + 48 + 40)
  };

  $scope.openFilter = function (type) {
    $scope.filterModals[type].show();
  }

  $scope.closeFilter = function (type) {
    $scope.filterModals[type].hide();
  }

  $scope.selectFilter = function (type, selection) {
    if (type === 'services' && servicesMap) {
      if (selection) {
        $scope.filters.selectedService = servicesMap[selection.id];
      } else {
        $scope.filters.selectedService = null;
      }
    }

    if (type === 'zones' && zonesMap) {
      if (selection) {
        $scope.filters.selectedZone = zonesMap[selection.id];
      } else {
        $scope.filters.selectedZone = null
      }
    }

    if (type === 'professions' && professionsMap) {
      if (selection) {
        $scope.filters.selectedProfession = professionsMap[selection.id];
      } else {
        $scope.filters.selectedProfession = null
      }
    }

    if ($scope.activeTab === 'professionals') {
      $scope.professionalsList = null;
      $scope.startProfessional = 0;
      $scope.allProfessional = Config.getPageProfessional();
      $scope.loadMoreProfessional();
    }

    if ($scope.activeTab === 'services') {
      $scope.servicesList = null;
      $scope.startServices = 0;
      $scope.allServices = Config.getPageServices();
      $scope.loadMoreServices();
    }

    $scope.closeFilter(type);

    $ionicScrollDelegate.resize();
  }

  $scope.switchToMap = function () {
    $scope.viewAsList = !$scope.viewAsList;
  }

  $scope.initServicesTab = function () {
    $scope.activeTab = 'services';
    $scope.searchBarVisible = false;

    if ($ionicTabsDelegate.selectedIndex() == 1) { //1 is the second
      mapService.initMap('serviceMap').then(function () {
        GeoLocate.locate().then(function (pos) {
          $scope.center = {
            lat: pos[0],
            lng: pos[1],
            zoom: 18
          };
          $scope.servicesMarkers = mapService.getServicesPoints($scope.servicesList);
          mapService.refresh('serviceMap');
        }, function () {
          //$scope.filterMarkers(false);
        });
      });
    }
  };

  $scope.initProfessionalsTab = function () {
    $scope.activeTab = 'professionals';

    if ($ionicTabsDelegate.selectedIndex() == 0) { //0 is the first
      mapService.initMap('professionsMap').then(function () {
        GeoLocate.locate().then(function (pos) {
          $scope.center = {
            lat: pos[0],
            lng: pos[1],
            zoom: 18
          };
          $scope.professionalMarkers = mapService.getProfessionalsPoints($scope.professionalsList);
          mapService.refresh('professionsMap');
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

    DataSrv.getServices(professionalID, ($scope.filters.selectedService == null) ? null : $scope.filters.selectedService.id, ($scope.filters.selectedZone == null) ? null : $scope.filters.selectedZone.id, (($scope.servicesList == null) ? 1 : Math.floor(($scope.servicesList.length / $scope.allServices)) + 1), $scope.allServices, "objectId").then(function (services) {
      /*type, area, page, limit, orderBy*/
      if (services) {
        $scope.servicesList = !!$scope.servicesList ? $scope.servicesList.concat(services) : services;

        if (!$scope.servicesList.length) {
          $scope.emptylist = true;
        } else {
          addExtraDataToProf();
        }

        if (services.length >= $scope.allServices) {
          $scope.$broadcast('scroll.infiniteScrollComplete');
          $scope.startServices += $scope.allServices;
          $scope.servicesMarkers = mapService.getServicesPoints($scope.servicesList);
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

  $scope.loadMoreProfessional = function () {
    var deferred = $q.defer();
    DataSrv.getProfessionals(($scope.filters.selectedProfession == null) ? null : $scope.filters.selectedProfession.id, ($scope.filters.selectedZone == null) ? null : $scope.filters.selectedZone.id, (($scope.professionalsList == null) ? 1 : Math.floor(($scope.professionalsList.length / $scope.allProfessional)) + 1), $scope.allProfessional, "surname").then(function (professional) {
      /*type, area, page, limit, orderBy*/
      if (professional) {
        $scope.professionalsList = !!$scope.professionalsList ? $scope.professionalsList.concat(professional) : professional;

        if (!$scope.professionalsList.length) {
          $scope.emptylist = true;
        } else {
          if (!$scope.filters.allZones.length) {
            loadFilters();
          } else {
            addExtraDataToProf();
          }
        }

        if (professional.length >= $scope.allProfessional) {
          $scope.$broadcast('scroll.infiniteScrollComplete');
          $scope.startProfessional += $scope.allProfessional;
          $scope.professionalMarkers = mapService.getProfessionalsPoints($scope.professionalsList);
          $scope.endProfessional_reached = false;
        } else {
          $scope.endProfessional_reached = true;
        }
      } else {
        // $scope.emptylist = true;
        $scope.endProfessional_reached = true;
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
      $scope.endProfessional_reached = true;
      Config.loaded();
    });
    return deferred.promise;
  }

  var reload = function () {
    if (!Login.userIsLogged()) {
      //show tutorial
    }
    $scope.professionalsList = null;
    $scope.servicesList = null;
    $scope.startProfessional = 0;
    $scope.allProfessional = Config.getPageProfessional();
    $scope.endProfessional_reached = false;
    $scope.startServices = 0;
    $scope.allServices = Config.getPageServices();
    $scope.endServices_reached = false;
    //get Professional
    $scope.loadMoreProfessional().then(
      function () {
        // get zones
        DataSrv.getZones().then(function (zones) {
            $scope.zonesList = zones;
            if (Login.userIsLogged()) {
              //if (true) {
              DataSrv.getServices().then(
                function (services) {
                  $scope.servicesList = services;
                  loadFilters();
                  Utils.loaded();
                },
                Utils.commError);
            } else {
              loadFilters();
              Utils.loaded();
            }
          },
          Utils.commError);
      },
      Utils.commError);
    //serve il loading delle chiamate asincrone

    //if Login.userIsLogged() load services
  };

  $scope.loadProfessional = function () {
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
});
