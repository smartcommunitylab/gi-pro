/* global angular */
angular.module('gi-pro.controllers.serviceandprof', [])
  .controller('ServiceAndProfCtrl', function ($scope, $rootScope, $stateParams, $q, $state, $filter, $timeout, $ionicScrollDelegate, $ionicTabsDelegate, $ionicModal, $ionicPopup, DataSrv, mapService, Utils, Login, GeoLocate, Config) {
    $scope.servicesList = null
    $scope.professionalsList = null
    $scope.viewAsList = true

    // can be 'professionals' or 'services'
    $scope.activeTab = null

    // Search Bar
    $rootScope.searchBar = {
      minLength: 3,
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
      if (!$rootScope.searchBar.show && $rootScope.searchBar.searchString.trim()) {
        // $scope.professionalsList = null
        // $scope.loadMoreProfessional()
        $scope.reload()
      }
    }

    $scope.clearSearchBar = function () {
      $rootScope.searchBar.searchString = ''
      // $scope.professionalsList = null
      // $scope.loadMoreProfessional()
      $scope.reload()
    }

    $scope.searchProfessionals = function (query) {
      // ignore short input
      if (query.trim().length > 0 && query.trim().length < $rootScope.searchBar.minLength) {
        // console.log('query string too short')
        return
      }
      // wait 500ms before making a call
      if ($scope.to != null) {
        $timeout.cancel($scope.to)
        // console.log('previous search canceled')
      }
      $scope.to = $timeout(function () {
        $scope.to = null
        $scope.loadMoreProfessional(query)
      }, 500)
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

            enrichData()
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

    var enrichData = function () {
      if ($scope.professionalsList) {
        for (var i = 0; i < $scope.professionalsList.length; i++) {
          $scope.professionalsList[i]['profession'] = professionsMap[$scope.professionalsList[i].type].name
          $scope.professionalsList[i]['zone'] = zonesMap[$scope.professionalsList[i].area] ? zonesMap[$scope.professionalsList[i].area].name : ''
        }
      }

      // if logged add also service meta info
      if (Login.userIsLogged() && $scope.servicesList) {
        for (var j = 0; j < $scope.servicesList.length; j++) {
          $scope.servicesList[j].professional['profession'] = professionsMap[$scope.servicesList[j].professional.type].name
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

    $scope.$on('$ionicView.afterEnter', function (event, args) {
      if (!$scope.viewAsList) {
        $scope.refreshMap()
      }
    })

    $scope.switchToMap = function () {
      $scope.viewAsList = !$scope.viewAsList
      if (!$scope.viewAsList) {
        $scope.refreshMap()
      }
    }

    $scope.refreshMap = function () {
      $timeout(function () {
        if ($scope.activeTab === 'professionals') {
          mapService.refresh('professionalsMap')
        } else if ($scope.activeTab === 'services') {
          mapService.refresh('servicesMap')
        }
      }, 500)
    }

    $scope.initServicesTab = function () {
      $scope.activeTab = 'services'
      $rootScope.searchBar.show = false

      if (!$scope.servicesList) {
        GeoLocate.locate().finally(function () {
          $scope.loadMoreServices()
        })
      }

      if ($ionicTabsDelegate.selectedIndex() === 1) { // 1 is the second
        mapService.initMap('servicesMap').then(function (map) {
          GeoLocate.locate().then(function (pos) {
            $scope.center = {
              lat: pos[0],
              lng: pos[1],
              zoom: 16
            }

            map.locate({
              setView: false,
              maxZoom: 8,
              watch: false,
              enableHighAccuracy: true
            })

            map.on('locationfound', function (e) {
              $scope.myloc = e
              var radius = e.accuracy / 2

              // Standard marker
              /* L.marker(e.latlng).addTo(map) */

              // accuracy circle
              L.circle(e.latlng, radius, {
                color: '#ea5456'
              }).addTo(map)

              // fixed circle
              /*
              L.circleMarker(e.latlng, {
                 color: '#ea5456'
              }).addTo(map)
              */
            })

            $scope.servicesMarkers = mapService.getPoints($scope.servicesList, 'app.servicedetails')
          }, function () {
            // $scope.filterMarkers(false)
          })

          if (!$scope.viewAsList) {
            $scope.refreshMap()
          }
        }, function () {
          console.log('List view')
        })
      }
    }

    $scope.initProfessionalsTab = function () {
      $scope.activeTab = 'professionals'

      if (!$scope.professionalsList) {
        GeoLocate.locate().finally(function () {
          $scope.loadMoreProfessional()
        })
      }

      // mapService.getMap('professionalsMap').then(function (map) {})

      if ($ionicTabsDelegate.selectedIndex() === 0) { // 0 is the first
        mapService.initMap('professionalsMap').then(function (map) {
          GeoLocate.locate().then(function (pos) {
            $scope.center = {
              lat: pos[0],
              lng: pos[1],
              zoom: 16
            }

            map.locate({
              setView: false,
              maxZoom: 8,
              watch: false,
              enableHighAccuracy: true
            })

            map.on('locationfound', function (e) {
              $scope.myloc = e
              var radius = e.accuracy / 2

              // Standard marker
              /* L.marker(e.latlng).addTo(map) */

              // accuracy circle
              L.circle(e.latlng, radius, {
                color: '#ea5456'
              }).addTo(map)

              // fixed circle
              /*
              L.circleMarker(e.latlng, {
                 color: '#ea5456'
              }).addTo(map)
              */
            })

            $scope.professionalMarkers = mapService.getPoints($scope.professionalsList, 'app.profdetails')
          }, function () {
            // $scope.filterMarkers(false)
          })

          if (!$scope.viewAsList) {
            $scope.refreshMap()
          }
        }, function () {
          console.log('List view')
        })
      }
    }

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
              enrichData()
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
    $scope.loadMoreProfessional = function (query) {
      var deferred = $q.defer()

      var params = {
        type: $scope.filters.selectedProfession == null ? null : $scope.filters.selectedProfession.id,
        area: $scope.filters.selectedZone == null ? null : $scope.filters.selectedZone.id,
        page: $scope.professionalsList == null ? 1 : Math.floor($scope.professionalsList.length / Config.getProfessionalsPageSize()) + 1,
        limit: Config.getProfessionalsPageSize(),
        orderBy: 'surname'
      }

      if (query && query.length >= $rootScope.searchBar.minLength) {
        params.page = 1
        params.query = query
      }

      /* type, area, page, limit, orderBy, query */
      DataSrv.getProfessionals(params.type, params.area, params.page, params.limit, params.orderBy, params.query).then(
        function (professional) {
          if (professional) {
            $scope.professionalsList = params.page === 1 ? professional : $scope.professionalsList.concat(professional)

            if (!$scope.professionalsList.length) {
              $scope.emptylist = true
            } else {
              if (!$scope.filters.allZones.length) {
                loadFilters()
              } else {
                enrichData()
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
        zoom: 16
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
