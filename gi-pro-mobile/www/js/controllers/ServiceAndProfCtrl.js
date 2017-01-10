/* global angular */
angular.module('gi-pro.controllers.serviceandprof', [])

.controller('ServiceAndProfCtrl', function ($scope, $rootScope, $stateParams, $q, $state, $filter, $ionicScrollDelegate, $ionicTabsDelegate, $ionicModal, $ionicPopup, DataSrv, mapService, Utils, Login, GeoLocate, Config) {
  $scope.title = $filter('translate')('app')
  $scope.servicesList = null
  $scope.professionalsList = null
  $scope.viewAsList = true

  // can be 'professionals' or 'services'
  $scope.activeTab = null

  // Search Bar
  $rootScope.searchBar = {
    show: false,
    searchString: ''
  }

  $scope.allProfessional = Config.getProfessionalsPageSize()
  $scope.endProfessional_reached = false
  $scope.allServices = Config.getServicesPageSize()
  $scope.endServices_reached = false

  var professionsMap = null
  var zonesMap = null
  var servicesMap = null

  $scope.toggleSearchBar = function () {
    $rootScope.searchBar.show = !$rootScope.searchBar.show
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
    var deferred = $q.defer()
    DataSrv.getProfessionsDefinition().then(function (professions) {
      $scope.filters.allProfessions = professions
      DataSrv.getServicesDefinition().then(function (services) {
        $scope.filters.allServices = services
        DataSrv.getZonesDefinition().then(function (zones) {
          $scope.filters.allZones = zones

          professionsMap = DataSrv.getProfessionsMap()
          $ionicModal.fromTemplateUrl('templates/modal_professions.html', {
            scope: $scope
          }).then(function (modal) {
            $scope.filterModals['professions'] = modal
          }, function (error) {
            console.log(error)
          })

          servicesMap = DataSrv.getServicesMap()
          $ionicModal.fromTemplateUrl('templates/modal_services.html', {
            scope: $scope
          }).then(function (modal) {
            $scope.filterModals['services'] = modal
          }, function (error) {
            console.log(error)
          })

          zonesMap = DataSrv.getZonesMap()
          $ionicModal.fromTemplateUrl('templates/modal_zones.html', {
            scope: $scope
          }).then(function (modal) {
            $scope.filterModals['zones'] = modal
          }, function (error) {
            console.log(error)
          })

          addExtraDataToProf()
          deferred.resolve()
        }, function (error) {
          deferred.reject(error)
        })
      }, function (error) {
        deferred.reject(error)
      })
    }, function (error) {
      deferred.reject(error)
    })
    return deferred.promise
  }

  var addExtraDataToProf = function () {
    if ($scope.professionalsList) {
      for (var i = 0; i < $scope.professionalsList.length; i++) {
        $scope.professionalsList[i]['profession'] = professionsMap[$scope.professionalsList[i].type].name
        $scope.professionalsList[i]['zone'] = zonesMap[$scope.professionalsList[i].area] ? zonesMap[$scope.professionalsList[i].area].name : ''
      }
    }

    // if logged add also service meta info
    if (Login.userIsLogged() && $scope.servicesList) {
      for (var j = 0; j < $scope.servicesList.length; j++) {
        $scope.servicesList[j]['service'] = servicesMap[$scope.servicesList[j].serviceType].name
        $scope.servicesList[j]['zone'] = zonesMap[$scope.servicesList[j].area] ? zonesMap[$scope.servicesList[j].area].name : ''
      }
    }
  }

  // header 44px, tabs 49px, filters 40px
  $scope.styles = {
    'container': Utils.resizeElement(44 + (Login.userIsLogged() ? 49 : 0) + 40)
  }

  $scope.openFilter = function (type) {
    $scope.filterModals[type].show()
  }

  $scope.closeFilter = function (type) {
    $scope.filterModals[type].hide()
  }

  $scope.selectFilter = function (type, selection) {
    if (type === 'services' && servicesMap) {
      if (selection) {
        $scope.filters.selectedService = servicesMap[selection.id]
      } else {
        $scope.filters.selectedService = null
      }
    }

    if (type === 'zones' && zonesMap) {
      if (selection) {
        $scope.filters.selectedZone = zonesMap[selection.id]
      } else {
        $scope.filters.selectedZone = null
      }
    }

    if (type === 'professions' && professionsMap) {
      if (selection) {
        $scope.filters.selectedProfession = professionsMap[selection.id]
      } else {
        $scope.filters.selectedProfession = null
      }
    }

    if ($scope.activeTab === 'professionals') {
      $scope.professionalsList = null
      $scope.loadMoreProfessional()
    }

    if ($scope.activeTab === 'services') {
      $scope.servicesList = null
      $scope.loadMoreServices()
    }

    $scope.closeFilter(type)

    $ionicScrollDelegate.resize()
  }

  $scope.switchToMap = function () {
    $scope.viewAsList = !$scope.viewAsList
  }

  $scope.initServicesTab = function () {
    $scope.activeTab = 'services'
    $rootScope.searchBar.show = false

    if (!$scope.servicesList) {
      $scope.loadMoreServices()
    }

    if ($ionicTabsDelegate.selectedIndex() === 1) { // 1 is the second
      mapService.initMap('servicesMap').then(function () {
        GeoLocate.locate().then(function (pos) {
          $scope.center = {
            lat: pos[0],
            lng: pos[1],
            zoom: 18
          }
          $scope.servicesMarkers = mapService.getPoints($scope.servicesList, 'app.servicedetails')
          mapService.refresh('servicesMap')
        }, function () {
          // $scope.filterMarkers(false)
        })
      })
    }
  }

  $scope.initProfessionalsTab = function () {
    $scope.activeTab = 'professionals'

    if (!$scope.professionalsList) {
      $scope.loadMoreProfessional()
    }

    if ($ionicTabsDelegate.selectedIndex() === 0) { // 0 is the first
      mapService.initMap('professionalsMap').then(function () {
        GeoLocate.locate().then(function (pos) {
          $scope.center = {
            lat: pos[0],
            lng: pos[1],
            zoom: 18
          }
          $scope.professionalMarkers = mapService.getPoints($scope.professionalsList, 'app.profdetails')
          mapService.refresh('professionalsMap')
        }, function () {
          // $scope.filterMarkers(false)
        })
      })
    }
  }

  // Currently commented because I can't order by alpha or price because they are fixed
  /*
  var orderList = function (orderBy) {
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
  }
  */

  /*
   * This function loads more services using filters
   */
  $scope.loadMoreServices = function () {
    var deferred = $q.defer()

    /* type, area, page, limit, orderBy */
    DataSrv.getServices(
      Login.getUser().objectId,
      $scope.filters.selectedService == null ? null : $scope.filters.selectedService.id,
      $scope.filters.selectedZone == null ? null : $scope.filters.selectedZone.id,
      $scope.servicesList == null ? 1 : Math.floor($scope.servicesList.length / Config.getServicesPageSize()) + 1,
      Config.getServicesPageSize(), 'objectId').then(
      function (services) {
        if (services && services.length) {
          $scope.servicesList = $scope.servicesList ? $scope.servicesList.concat(services) : services
          if (!$scope.servicesList.length) {
            $scope.emptylist = true
          } else {
            addExtraDataToProf()
          }

          $scope.$broadcast('scroll.infiniteScrollComplete')
          $scope.servicesMarkers = mapService.getPoints($scope.servicesList)

          if (services.length < Config.getServicesPageSize()) {
            $scope.endServices_reached = true
          }
        } else {
          $scope.endServices_reached = true
          Utils.toast($filter('translate')('pop_up_error_server_template'), 'short', 'bottom')
        }

        Config.loaded()
        $scope.$broadcast('scroll.infiniteScrollComplete')
        $scope.$broadcast('scroll.refreshComplete')
        deferred.resolve()
      },
      function () {
        Utils.commError
        $scope.$broadcast('scroll.infiniteScrollComplete')
        $scope.$broadcast('scroll.refreshComplete')
        $scope.endServices_reached = true
        Config.loaded()
      }
    )
    return deferred.promise
  }

  /*
   * This function loads more professionals using filters
   */
  $scope.loadMoreProfessional = function () {
    var deferred = $q.defer()

    /* type, area, page, limit, orderBy */
    DataSrv.getProfessionals(
      $scope.filters.selectedProfession == null ? null : $scope.filters.selectedProfession.id,
      $scope.filters.selectedZone == null ? null : $scope.filters.selectedZone.id,
      $scope.professionalsList == null ? 1 : Math.floor($scope.professionalsList.length / Config.getProfessionalsPageSize()) + 1,
      Config.getProfessionalsPageSize(), 'surname').then(
      function (professional) {
        if (professional) {
          $scope.professionalsList = $scope.professionalsList ? $scope.professionalsList.concat(professional) : professional

          if (!$scope.professionalsList.length) {
            $scope.emptylist = true
          } else {
            if (!$scope.filters.allZones.length) {
              loadFilters()
            } else {
              addExtraDataToProf()
            }
          }

          $scope.$broadcast('scroll.infiniteScrollComplete')
          $scope.professionalMarkers = mapService.getPoints($scope.professionalsList)

          if (professional.length < Config.getProfessionalsPageSize()) {
            $scope.endProfessional_reached = true
          }
        } else {
          $scope.endProfessional_reached = true
          Utils.toast($filter('translate')('pop_up_error_server_template'), 'short', 'bottom')
        }

        Config.loaded()
        deferred.resolve()
        $scope.$broadcast('scroll.infiniteScrollComplete')
        $scope.$broadcast('scroll.refreshComplete')
      },
      function () {
        Utils.commError
        $scope.$broadcast('scroll.infiniteScrollComplete')
        $scope.$broadcast('scroll.refreshComplete')
        $scope.endProfessional_reached = true
        Config.loaded()
      })
    return deferred.promise
  }

  /*
   * This function resets the professionals/services list and reloads it using filters
   */
  $scope.reload = function () {
    var reloader = null

    if ($scope.activeTab === 'professionals') {
      $scope.professionalsList = null
      $scope.endProfessional_reached = false
      reloader = $scope.loadMoreProfessional
    }

    if ($scope.activeTab === 'services') {
      $scope.servicesList = null
      $scope.endServices_reached = false
      reloader = $scope.loadMoreServices
    }

    reloader().then(loadFilters, Utils.commError)
  }

  /* Map config */
  angular.extend($scope, {
    center: {
      lat: Config.getMapPosition().lat,
      lng: Config.getMapPosition().lng,
      zoom: 18
    },
    servicesMarkers: $scope.servicesMarkers,
    professionalMarkers: $scope.professionalMarkers,
    events: {}
  })

  $scope.$on('leafletDirectiveMarker.professionalsMap.click', function (e, args) {
    e.stopPropagation()
    // args.model.object is object
    $scope.openProfessionalDetails(args.model.object)
  })

  $scope.$on('leafletDirectiveMarker.servicesMap.click', function (e, args) {
    e.preventDefault()
    // args.model.object is object
    $scope.openServiceDetails(args.model.object)
  })
})
