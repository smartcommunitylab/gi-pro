/* global FileUploadOptions, FileTransfer, Camera */

angular.module('gi-pro.controllers.profile', [])

  .controller('ProfileCtrl', function ($scope, $rootScope, $stateParams, $ionicModal, $ionicLoading, $ionicPopup, $filter, $q, $http, Config, Login, Utils, DataSrv, mapService) {
    const SEPARATOR = ';'

    var init = function () {
      $scope.isMyProfile = false
      $scope.profile = null

      if ($stateParams['professional']) {
        $scope.profile = $stateParams['professional']
        if ($rootScope.logged) {
          DataSrv.getServicesOfferByProfessional($scope.profile.objectId).then(function (services) {
            $scope.services = services
          })
        }
      } else if ($stateParams['objectId']) {
        DataSrv.getProfessionistByID($stateParams['objectId']).then(function (professional) {
          $scope.profile = professional
          if ($rootScope.logged) {
            DataSrv.getServicesOfferByProfessional($scope.profile.objectId).then(function (services) {
              $scope.services = services
            })
          }
        })
      } else {
        $scope.profile = angular.copy(Login.getUser())
        $scope.isMyProfile = true
        if ($rootScope.logged) {
          DataSrv.getServicesOfferByProfessional($scope.profile.objectId).then(function (services) {
            $scope.services = services
          })
        }
      }

      $scope.isOnProfile = false
      $scope.imageUrl = $rootScope.generateImageUrl($scope.profile.imageUrl, true)
      $scope.places = []
      $scope.newService = {}

      $ionicModal.fromTemplateUrl('templates/modal_newservice.html', {
        scope: $scope
      }).then(function (modal) {
        $scope.newServiceModal = modal
      })

      $ionicModal.fromTemplateUrl('templates/modal_map.html', {
        scope: $scope,
        backdropClickToClose: false,
        animation: 'slide-in-up'
      }).then(function (modal) {
        $scope.modalMap = modal
      })

      $scope.professions = DataSrv.getProfessionsMap()
      if (!$scope.professions) {
        DataSrv.getProfessionsDefinition().then(function () {
          $scope.professions = DataSrv.getProfessionsMap()
        })
      }

      $scope.zones = DataSrv.getZonesMap()
      if (!$scope.zones) {
        DataSrv.getZonesDefinition().then(function () {
          $scope.zones = DataSrv.getZonesMap()
        })
      }

      $scope.availableServices = DataSrv.getServicesMap()
      if (!$scope.availableServices) {
        DataSrv.getServicesDefinition().then(function () {
          $scope.availableServices = DataSrv.getServicesMap()
        })
      }
    }

    $scope.selectedTab = 'profile'
    $scope.selectTab = function (tabName) {
      $scope.selectedTab = tabName
    }

    var selectPlaceField = null
    var selectPlace = function (placeSelected, lat, lng) {
      if (selectPlaceField === 'profile') {
        $scope.edit.address = placeSelected.name ? placeSelected.name : placeSelected.street + ', ' + placeSelected.housenumber + ', ' + placeSelected.city
        $scope.edit.coordinates = [lat, lng]
        $scope.justSelectedFromMap = true
      } else if (selectPlaceField === 'service') {
        $scope.newService.address = placeSelected.name ? placeSelected.name : placeSelected.street + ', ' + placeSelected.housenumber + ', ' + placeSelected.city
        $scope.newService.coordinates = [lat, lng]
        $scope.justSelectedFromMap = true
      }

      console.log(placeSelected)
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
        if (($scope.placesandcoordinates && $scope.placesandcoordinates[typedthings] == null) || typedthings === '' || $scope.placesandcoordinates == null) {
          $scope.addressParams = {
            name: '',
            lat: '',
            long: ''
          }
        };
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
        var url = Config.getGeocoderURL() + '/address?latlng=' + Config.getMapPosition().lat + ', ' + Config.getMapPosition().long + '&distance=' + Config.getDistanceForAutocomplete() + '&address=' + i
        $http.get(url, Config.getGeocoderConf()).then(function (response) {
          var docs = response.data.response.docs
          var geoCoderPlaces = []
          // places = data.response.docs
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
        }, function () {
          // $scope.error = true;
        })
      }
      return placedata.promise
    }

    $scope.$watch('edit.address', function (newValue, oldValue) {
      if (!newValue) {
        $scope.edit.coordinates = null
      }
    })

    $scope.$watch('newService.address', function (newValue, oldValue) {
      if (!newValue) {
        $scope.newService.coordinates = null
      }
    })

    /* PROFILE */

    $scope.editingProfile = false

    var profile2edit = function (profile, edit) {
      if (profile.address) {
        edit.address = profile.address
        edit.coordinates = profile.coordinates
      }

      if (profile.phone) {
        edit.phone = profile.phone.split(SEPARATOR)
      }

      if (profile.cellPhone) {
        edit.cellPhone = profile.cellPhone.split(SEPARATOR)
      }

      if (profile.mail) {
        edit.mail = profile.mail.split(SEPARATOR)
      }

      if (profile.fax) {
        edit.fax = profile.fax.split(SEPARATOR)
      }
    }

    $scope.$on('$ionicView.leave', function (event, args) {
      $scope.editingProfile = false
      profile2edit($scope.profile, $scope.edit)
      // localStorage.setItem(Config.getUserVarProfileCheck(), 'true')
    })

    $scope.edit = {
      newItems: {
        phone: '',
        cellPhone: '',
        mail: '',
        fax: '',
        competence: ''
      },
      address: '',
      coordinates: [],
      phone: [],
      cellPhone: [],
      mail: [],
      fax: []
    }

    $scope.$watch('profile', function (profile, oldProfile) {
      profile2edit(profile, $scope.edit)
    })

    var validate = function () {
      var cleanArray = function (arr) {
        var newArr = []
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].trim()) {
            newArr.push(arr[i])
          }
        }
        return newArr
      }

      $scope.profile.address = $scope.edit.address
      $scope.profile.coordinates = $scope.edit.coordinates
      $scope.profile.phone = cleanArray($scope.edit.phone).join(SEPARATOR)
      $scope.profile.cellPhone = cleanArray($scope.edit.cellPhone).join(SEPARATOR)
      $scope.profile.mail = cleanArray($scope.edit.mail).join(SEPARATOR)
      $scope.profile.fax = cleanArray($scope.edit.fax).join(SEPARATOR)
      return true
    }

    $scope.toggleEditingProfile = function () {
      if (!$scope.editingProfile) {
        $scope.editingProfile = true
        $scope.initMap
        if (!$scope.profile.customProperties.competences) {
          $scope.profile.customProperties.competences = []
        }
      } else {
        if (validate()) {
          Utils.loading()
          DataSrv.updateProfile($scope.profile).then(function () {
            $scope.profile = angular.copy(Login.getUser())
            $scope.editingProfile = false
          }, Utils.commError).finally(function () {
            Utils.loaded()
          })
        }
      }
    }

    $scope.addItem = function (type) {
      $scope.edit[type].push($scope.edit.newItems[type])
      $scope.edit.newItems[type] = ''
    }

    $scope.removeItem = function (type, index) {
      $scope.edit[type].splice(index, 1)
    }

    $scope.addCompetence = function () {
      if ($scope.edit.newItems.competence) {
        if (!$scope.profile.customProperties.competences) {
          $scope.profile.customProperties.competences = []
        }
        $scope.profile.customProperties.competences.push($scope.edit.newItems.competence)
        $scope.edit.newItems.competence = ''
      }
    }

    $scope.deleteCompetence = function (index) {
      $scope.profile.customProperties.competences.splice(index, 1)
    }

    /*
     * SERVICES
     */

    $scope.editingServices = false
    $scope.toggleEditingServices = function (value) {
      $scope.editingServices = value
    }

    $scope.toggleAddingNewService = function (value) {
      $scope.addingNewService = value
    }

    var expandedServices = []

    $scope.toggleService = function (serviceId) {
      if ($scope.editingServices || $scope.addingNewService) {
        // Toast error, save first
        Utils.toast($filter('translate')('save_first_toggle'))
        return
      }

      if (!$scope.isExpandedService(serviceId)) {
        expandedServices.push(serviceId)
      } else {
        expandedServices.splice(expandedServices.indexOf(serviceId), 1)
      }
    }

    $scope.isExpandedService = function (serviceId) {
      return expandedServices.indexOf(serviceId) !== -1
    }

    $scope.openNewServiceModal = function () {
      if ($scope.editingServices || $scope.addingNewService) {
        // Toast
        Utils.toast($filter('translate')('save_first_toggle'))
        return
      }
      // modal e scegli tipologia di servizio
      $scope.shownService = null
      $scope.newServiceModal.show()
    }

    $scope.closeNewServiceModal = function () {
      $scope.newServiceModal.hide()
    }

    $scope.selectZone = function (index) {
      $scope.data.selectedZoneID = index
    }

    $scope.selectProfessionalAddress = function (suggestion) {
      $scope.edit.address = suggestion
      $scope.edit.coordinates = $scope.placesandcoordinates[suggestion].coordinates
    }

    $scope.addNewService = function (serviceType) {
      // applicationId, address, area, coordinates, note, serviceType
      // take element from viaggia
      $scope.newServiceName = serviceType.name
      $scope.data = {
        selectedZoneID: $scope.zones[Object.keys($scope.zones)[0]].id
      }

      $scope.newService = {
        'applicationId': Config.APPLICATION_ID,
        'address': '',
        'area': '',
        'coordinates': null,
        'note': '',
        'serviceType': serviceType.id
      }

      $scope.addingNewService = true
      $scope.closeNewServiceModal()
    }

    $scope.selectedOffice = null
    $scope.openSelectOfficePopup = function () {
      $scope.offices = $scope.availableServices['sostituzioneudienza'].customOptions.offices

      var selectOfficePopup = $ionicPopup.alert({
        scope: $scope,
        title: $filter('translate')('profession_popup_placeholder'),
        templateUrl: 'templates/popup_office.html',
        buttons: [{
          text: $filter('translate')('cancel'),
          type: 'button-default',
          onTap: function (e) {
            // will stop the popup from closing when tapped.
            // e.preventDefault()
          }
        }]
      })

      $scope.selectOffice = function (office) {
        if (office) {
          $scope.selectedOffice = office
          $scope.newService.address = office.name
          $scope.newService.coordinates = office.coordinates
        }
        selectOfficePopup.close()
      }
    }

    $scope.selectServiceAddress = function (suggestion) {
      $scope.newService.address = suggestion
      $scope.newService.coordinates = $scope.placesandcoordinates[suggestion].coordinates
    }

    $scope.styles = {
      'modalMap': Utils.resizeElement(44)
    }

    $scope.openMap = function (field) {
      if (field) {
        selectPlaceField = field
        $scope.refresh = false
        if ($scope.modalMap) {
          $scope.modalMap.show()
        }
      }
    }

    $scope.closeMap = function () {
      $scope.refresh = true
      if ($scope.modalMap) {
        $scope.modalMap.hide()
      }
    }

    $scope.openAreaSelection = function (mode) {
      if (mode === 'edit' && !$scope.editMode) {
        return
      }
      if (mode === 'new' && !$scope.addingNewService) {
        return
      }
      $ionicPopup.show({
        templateUrl: 'templates/areaSelectionPopup.html',
        cssClass: 'parking-popup',
        scope: $scope,
        buttons: [{
          text: $filter('translate')('btn_close'),
          type: 'button-close'
        }, {
          text: $filter('translate')('btn_conferma'),
          onTap: function (e) {
            $scope.newService.area = $scope.data.selectedZoneID
          }
        }]
      })
    }

    $scope.cancelModify = function (newOrEdit) {
      // delete service from the queue
      if (newOrEdit === 'edit') {
        return $scope.toggleEditingServices(false)
      } else {
        $scope.toggleAddingNewService(false)
      }
    }

    $scope.saveService = function (serviceToSave) {
      // send service and update array
      DataSrv.createOffer(serviceToSave).then(function (result) {
        // save toast;
        Utils.toast($filter('translate')('saved_new_service_toast'))
        DataSrv.getServicesOfferByProfessional($scope.profile.objectId).then(function (services) {
          $scope.services = services
        })
        $scope.toggleEditingServices(false)
        $scope.toggleAddingNewService(false)
      })
    }

    $scope.addService = function (serviceType) {
      $scope.newServiceModal.hide()
      // add an empty Service
      $scope.addNewService(serviceType)
      $scope.toggleAddingNewService(true)
    }

    $scope.deleteService = function (service) {
      // delete this service and update list
      DataSrv.deleteMyService(service.objectId, $scope.profile.objectId).then(function (result) {
        // save toast;
        Utils.toast($filter('translate')('service_deleted_toast'))
        DataSrv.getServicesOfferByProfessional($scope.profile.objectId).then(function (services) {
          $scope.services = services
        })
        $scope.toggleEditingServices(false)
        $scope.toggleAddingNewService(false)
      })
    }

    $scope.modifyService = function (service) {
      $scope.data = {
        selectedZoneID: $scope.zones[service.area].id
      }

      $scope.newService = {
        'applicationId': Config.APPLICATION_ID,
        'address': service.address,
        'area': service.area,
        'coordinates': service.coordinates,
        'note': service.note,
        'serviceType': service.serviceType
      }
      $scope.toggleEditingServices(true)
    }

    $scope.getServiceNameByID = function (serviceID) {
      if ($scope.availableServices[serviceID]) {
        return $scope.availableServices[serviceID].name
      } else return ''
    }

    $scope.getAreaNamebyID = function (areaID) {
      if ($scope.zones[areaID]) {
        return $scope.zones[areaID].name
      } else return ''
    }

    $scope.uploadImage = function () {
      if (navigator && navigator.camera) {
        var error = function (err) {
          console.log('error', err)
        }

        navigator.camera.getPicture(function (fileURL) {
          var win = function (r) {
            Login.updateUser(true).then(function (user) {
              Utils.loaded()
              $scope.profile.imageUrl = user.imageUrl
              $scope.imageUrl = $rootScope.generateImageUrl($scope.profile.imageUrl, true)
              //            $scope.$apply();
            }, Utils.commError)
          }

          var options = new FileUploadOptions()
          options.fileKey = 'file'
          options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1)
          options.mimeType = 'image/png'
          options.headers = {
            Authorization: Config.getToken()
          }
          Utils.loading()
          var ft = new FileTransfer()
          ft.upload(fileURL, encodeURI(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/image/upload/png/' + $scope.profile.objectId), win, Utils.commError, options)
        }, error, {
          sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
          destinationType: Camera.DestinationType.FILE_URI,
          encodingType: Camera.EncodingType.PNG,
          allowEdit: true,
          targetWidth: 200,
          targetHeight: 200
        })
      }
    }

    init()

    angular.extend($scope, {
      center: {
        lat: Config.getMapPosition().lat,
        lng: Config.getMapPosition().long,
        zoom: 18
      },
      servicesMarkers: $scope.markers,
      events: {}
    })
  })
