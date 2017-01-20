/* global angular */
angular.module('gi-pro.controllers.login', [])
  .controller('LoginCtrl', function ($scope, $state, $ionicHistory, $ionicPopup, $filter, Utils, Config, Login) {
    $scope.user = {}
    $scope.validityPassword = false

    $scope.login = function () {
      Utils.loading()
      /*
      if (!!$scope.user.email) {
        $scope.user.cf = $scope.user.cf.toUpperCase();
      }
      */

      Login.login($scope.user.email, $scope.user.password).then(function () {
        $ionicHistory.nextViewOptions({
          historyRoot: true,
          disableBack: true
        })
        $state.go('app.serviceAndProf')
      }, function () {
        $ionicPopup.alert({
          title: $filter('translate')('error_popup_title'),
          template: $filter('translate')('error_signin')
        })
      }).finally(Utils.loaded)
    }

    $scope.reset = function () {
      window.open(Config.SERVER_URL + '/reset', '_system', 'location=no,toolbar=no')
    }

    $scope.register = function () {
      // window.open(Config.SERVER_URL + '/register', '_system', 'location=no,toolbar=no');
      $scope.goTo('app.registration1')
    }
  })

  .controller('RegistrationFirstCtrl', function ($scope, $rootScope, $state, $ionicHistory, $ionicPopup, $filter, $window, Utils, Config, Login) {
    $scope.registration = {}

    $scope.openPrivacyLink = function () {
      $window.open($rootScope.privacyLink(), '_system', 'location=yes')
      return false
    }

    $scope.cancel = function () {
      $ionicHistory.goBack()
    }

    $scope.goToStep2 = function () {
      if (!$scope.registration.pec) {
        Utils.toast($filter('translate')('register_form_cf_empty'))
        return
      }

      if (!$scope.registration.password) {
        Utils.toast($filter('translate')('register_form_cf_empty'))
        return
      }

      $scope.goTo('app.registration2', {
        'obj': $scope.registration
      })
    }
  })

  .controller('RegistrationSecondCtrl', function ($scope, $rootScope, $state, $stateParams, $http, $q, $ionicHistory, $ionicPopup, $ionicModal, $ionicLoading, $filter, $window, Utils, Config, DataSrv, Login, mapService) {
    $scope.professions = null
    $scope.areas = null
    $scope.registration = {}

    if ($stateParams.obj) {
      $scope.registration = $stateParams.obj
    };

    $ionicModal.fromTemplateUrl('templates/modal_map.html', {
      scope: $scope,
      id: 'map',
      backdropClickToClose: false,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modalMap = modal
    })

    $scope.styles = {
      'modalMap': Utils.resizeElement(44)
    }

    $scope.openMap = function (place) {
      $scope.place = place
      $scope.refresh = false
      if ($scope.modalMap) {
        $scope.modalMap.show()
        mapService.refresh('mapModal')
      }
    }

    $scope.closeMap = function () {
      $scope.refresh = true
      if ($scope.modalMap) {
        $scope.modalMap.hide()
      }
    }

    $scope.$on('modal.shown', function (event, modal) {
      if (modal.id && modal.id === 'map') {
        mapService.refresh('mapModal')
      }
    })

    var selectPlace = function (placeSelected, lat, lng) {
      $scope.registration.address = placeSelected.name ? placeSelected.name : placeSelected.street + ', ' + placeSelected.housenumber + ', ' + placeSelected.city
      $scope.registration.coordinates = [lat, lng]
      console.log(placeSelected)
      $scope.justSelectedFromMap = true
      /* close map */
      $scope.closeMap()
    }

    $scope.initMap = function () {
      mapService.getMap('mapModal').then(function () {
        $scope.$on('leafletDirectiveMap.mapModal.click', function (event, args) {
          $ionicLoading.show()
          // planService.setPosition($scope.place, args.leafletEvent.latlng.lat, args.leafletEvent.latlng.lng)
          // var placedata = $q.defer()
          var url = Config.getGeocoderURL() + '/location?latlng=' + args.leafletEvent.latlng.lat + ',' + args.leafletEvent.latlng.lng
          $http.get(encodeURI(url), Config.getGeocoderConf()).then(function (response) {
            var data = response.data
            $ionicLoading.hide()
            $scope.nameNewAddress = ''
            if (data.response.docs[0]) {
              // planService.setName($scope.place, data.response.docs[0]);
              $scope.clickedPoint = data.response.docs[0]
              $scope.nameNewAddress = $scope.clickedPoint.name ? $scope.clickedPoint.name : $scope.clickedPoint.street + ', ' + $scope.clickedPoint.housenumber + ', ' + $scope.clickedPoint.city
              $ionicPopup.show({
                // templateUrl: 'templates/popup_map.html',
                template: $scope.nameNewAddress,
                scope: $scope,
                title: $filter('translate')('popup_address'),
                cssClass: 'popup-map',
                buttons: [{
                  text: $filter('translate')('btn_close')
                }, {
                  type: 'button-assertive',
                  text: $filter('translate')('btn_conferma'),
                  onTap: function (e) {
                    selectPlace($scope.clickedPoint, args.leafletEvent.latlng.lat, args.leafletEvent.latlng.lng)
                  }
                }]
              })
            } else {
              /* confirm popup */
              $scope.nameNewAddress = $filter('translate')('popup_lat') + args.leafletEvent.latlng.lat.toString().substring(0, 7) + ' ' + $filter('translate')('popup_long') + args.leafletEvent.latlng.lng.toString().substring(0, 7)
              $ionicPopup.show({
                // templateUrl: 'templates/popup_map.html',
                template: $scope.nameNewAddress,
                scope: $scope,
                title: $filter('translate')('popup_address'),
                cssClass: 'popup-map',
                buttons: [{
                  text: $filter('translate')('btn_close')
                }, {
                  type: 'button-assertive',
                  text: '<i class="icon ion-navigate"></i>',
                  onTap: function (e) {
                    selectPlace(args.leafletEvent.latlng)
                  }
                }]
              })
            }
          }, function () {
            $ionicLoading.hide()
            $scope.showNoConnection()
          })
        })
      })
    }

    $scope.typePlace = function (typedthings) {
      if ($scope.justSelectedFromMap) {
        $scope.justSelectedFromMap = !$scope.justSelectedFromMap
      } else {
        $scope.result = typedthings
        $scope.getTypedPlaces(typedthings).then(function (data) {
          // merge with favorites and check no double values
          $scope.places = data
        })
      }
    }

    $scope.getTypedPlaces = function (i) {
      var placedata = $q.defer()
      var names = []
      if (i.length === 0) {
        placedata.resolve(names)
      } else {
        i = i.replace(/ /g, '+')
        var url = Config.getGeocoderURL() + '/address?latlng=' + Config.getMapPosition().lat + ', ' + Config.getMapPosition().lng + '&distance=' + Config.getDistanceForAutocomplete() + '&address=' + i
        $http.get(url, Config.getGeocoderConf()).then(function (response) {
          var docs = response.data.response.docs

          var geoCoderPlaces = []
          // places = data.response.docs;
          // store the data
          // return the labels
          var k = 0
          for (var i = 0; i < docs.length; i++) {
            var temp = ''
            if (docs[i].name) {
              temp = temp + docs[i].name
            }
            if (docs[i].street !== docs[i].name) {
              if (docs[i].street) {
                if (temp) {
                  temp = temp + ', '
                }
                temp = temp + docs[i].street
              }
            }
            if (docs[i].housenumber) {
              if (temp) {
                temp = temp + ', '
              }
              temp = temp + docs[i].housenumber
            }
            if (docs[i].city) {
              if (temp) {
                temp = temp + ', '
              }
              temp = temp + docs[i].city
            }

            // check se presente
            if (!geoCoderPlaces[temp]) {
              // se non presente
              names[k] = temp
              k++
              geoCoderPlaces[temp] = {
                coordinates: [parseFloat(docs[i].coordinate.split(',')[0]), parseFloat(docs[i].coordinate.split(',')[1])]
              }
            }
          }

          $scope.placesandcoordinates = geoCoderPlaces
          placedata.resolve(names)
        }, function (error) {
          console.log(error)
        })
      }
      return placedata.promise
    }

    $scope.selectAddress = function (suggestion) {
      $scope.registration.address = suggestion
      $scope.registration.coordinates = $scope.placesandcoordinates[suggestion].coordinates
    }

    $scope.$watch('registration.address', function (newValue, oldValue) {
      if (!newValue) {
        $scope.registration.coordinates = null
      }
    })

    DataSrv.getProfessionsDefinition().then(function (professions) {
      $scope.professions = professions
      $scope.selectedProfession = null
      /*
      $scope.selectedProfession = $filter('filter')($scope.professions, {
        id: $scope.professions[0].id
      })[0];
      */
    })

    DataSrv.getZonesDefinition().then(function (areas) {
      $scope.areas = areas
      $scope.selectedArea = null
      /*
      $scope.selectedArea = $filter('filter')($scope.areas, {
        id: $scope.areas[0].id
      })[0];
      */
    })

    $scope.openSelectProfessionPopup = function () {
      var selectProfessionPopup = $ionicPopup.alert({
        scope: $scope,
        title: $filter('translate')('profession_popup_placeholder'),
        templateUrl: 'templates/popup_professions.html',
        buttons: [{
          text: $filter('translate')('cancel'),
          type: 'button-default',
          onTap: function (e) {
            // will stop the popup from closing when tapped.
            // e.preventDefault()
          }
        }]
      })

      $scope.selectProfession = function (profession) {
        $scope.selectedProfession = profession
        $scope.registration.type = profession.id
        selectProfessionPopup.close()
      }
    }

    $scope.openSelectAreaPopup = function () {
      var selectAreaPopup = $ionicPopup.alert({
        scope: $scope,
        title: $filter('translate')('area_popup_placeholder'),
        templateUrl: 'templates/popup_areas.html',
        buttons: [{
          text: $filter('translate')('cancel'),
          type: 'button-default',
          onTap: function (e) {
            // will stop the popup from closing when tapped.
            // e.preventDefault()
          }
        }]
      })

      $scope.selectArea = function (area) {
        $scope.selectedArea = area
        $scope.registration.area = area.id
        selectAreaPopup.close()
      }
    }

    $scope.register = function () {
      if (!$scope.registration.name) {
        Utils.toast($filter('translate')('register_form_name_empty'))
        return
      }

      if (!$scope.registration.surname) {
        Utils.toast($filter('translate')('register_form_surname_empty'))
        return
      }

      if (!$scope.registration.address || !$scope.registration.coordinates || $scope.registration.coordinates.length !== 2) {
        Utils.toast($filter('translate')('register_form_address_empty'))
        return
      }

      if (!$scope.selectedProfession || !$scope.registration.type) {
        Utils.toast($filter('translate')('register_form_profession_empty'))
        return
      }

      if (!$scope.selectedArea) {
        Utils.toast($filter('translate')('register_form_area_empty'))
        return
      }

      if (!$scope.registration.cf) {
        Utils.toast($filter('translate')('register_form_cf_empty'))
        return
      }

      $scope.registration.cf = $scope.registration.cf.toUpperCase()

      /*
      else if (!Utils.checkFiscalCode($scope.registration.cf)) {
        Utils.toast($filter('translate')('register_form_cf_invalid'));
        return;
      } else if (!$scope.registration.pwd || !$scope.registration.pwdagain) {
        Utils.toast($filter('translate')('register_form_pwd_empty'));
        return;
      } else if ($scope.registration.pwd != $scope.registration.pwdagain) {
        Utils.toast($filter('translate')('register_form_pwd_different'));
        return;
      }
      */

      // console.log($scope.registration);

      Utils.loading()
      Login.register($scope.registration).then(
        function () {
          // Utils.toast($filter('translate')('register_done_title'))
          Utils.loaded()
          $ionicPopup.alert({
            title: $filter('translate')('register_done_title'),
            template: $filter('translate')('register_done_text')
          }).then(function (res) {
            $scope.goTo('app.login', {}, false, true, true)
          })
        },
        function () {
          Utils.loaded()
          Utils.commError()
        }
      )
    }

    $scope.cancel = function () {
      $ionicHistory.goBack()
    }

    angular.extend($scope, {
      center: {
        lat: Config.getMapPosition().lat,
        lng: Config.getMapPosition().lng,
        zoom: 16
      },
      servicesMarkers: $scope.markers,
      events: {}
    })
  })
