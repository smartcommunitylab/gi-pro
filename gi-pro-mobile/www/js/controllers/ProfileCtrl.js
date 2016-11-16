angular.module('gi-pro.controllers.profile', [])

.controller('ProfileCtrl', function ($scope, $rootScope, $ionicModal, $ionicLoading, $ionicPopup, $filter, $q, $http, Config, Login, Utils, DataSrv, mapService) {

  function init() {
    $scope.editing = false;
    $scope.prof = angular.copy(Login.getUser());
    $scope.isMyProfile = true;
    $scope.isOnProfile = false;
    $scope.imageUrl = $rootScope.generateImageUrl($scope.prof.imageUrl, true);

    $ionicModal.fromTemplateUrl('templates/add_new_service_modal.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.addServiceModal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/mapModal.html', {
      scope: $scope,
      backdropClickToClose: false,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modalMap = modal;
    });

    $scope.professions = DataSrv.getProfessionsMap();
    if (!$scope.professions) {
      DataSrv.getProfessionsDefinition().then(function () {
        $scope.professions = DataSrv.getProfessionsMap();
      });
    }

    $scope.zones = DataSrv.getZonesMap();
    if (!$scope.zones) {
      DataSrv.getZonesDefinition().then(function () {
        $scope.zones = DataSrv.getZonesMap();
      });
    }

    $scope.availableServices = DataSrv.getServicesMap();
    if (!$scope.availableServices) {
      DataSrv.getServicesDefinition().then(function () {
        $scope.availableServices = DataSrv.getServicesMap();
      });
    }

    DataSrv.getMyServicesOffer($scope.prof.objectId).then(function (services) {
      $scope.services = services;
    });
  }

  var selectPlace = function (placeSelected) {
    $scope.fromName = placeSelected;
    $scope.addressParams.name = placeSelected;
    $scope.addressParams.lat = planService.getPosition($scope.place).latitude;
    $scope.addressParams.long = planService.getPosition($scope.place).longitude;

    console.log(placeSelected);
    /*close map*/
    $scope.closeMap();
  };

  $scope.initMap = function () {
    mapService.initMap('mapModal').then(function () {

      $scope.$on("leafletDirectiveMap.mapModal.click", function (event, args) {
        $ionicLoading.show();
        //planService.setPosition($scope.place, args.leafletEvent.latlng.lat, args.leafletEvent.latlng.lng);
        var placedata = $q.defer();
        var url = Config.getGeocoderURL() + '/location?latlng=' + args.leafletEvent.latlng.lat + ',' + args.leafletEvent.latlng.lng;
        $http.get(encodeURI(url), Config.getGeocoderConf())
          .success(function (data, status, headers, config) {
            $ionicLoading.hide();
            $scope.name = '';
            if (data.response.docs[0]) {
              //planService.setName($scope.place, data.response.docs[0]);
              //$scope.name = planService.getName($scope.place);
              $ionicPopup.show({
                templateUrl: 'templates/mapPopup.html',
                cssClass: 'parking-popup',
                scope: $scope,
                buttons: [
                  {
                    text: $filter('translate')('btn_close'),
                    type: 'button-close'
                                },
                  {
                    text: $filter('translate')('btn_conferma'),
                    onTap: function (e) {
                      selectPlace($scope.name);
                    }
                            }

                        ]
              });
            } else {
              /*confirmpopup*/
              $scope.name = $filter('translate')("popup_lat") + args.leafletEvent.latlng.lat.toString().substring(0, 7) + " " + $filter('translate')("popup_long") + args.leafletEvent.latlng.lng.toString().substring(0, 7);
              $ionicPopup.show({
                templateUrl: 'templates/mapPopup.html',
                cssClass: 'parking-popup',
                scope: $scope,
                buttons: [
                  {
                    text: $filter('translate')('btn_close'),
                    type: 'button-close'
                                                },
                  {
                    text: '<i class="icon ion-navigate"></i>',
                    onTap: function (e) {
                      selectPlace(args.leafletEvent.latlng);
                    }
                                    }
                                            ]
              });
            }
          })

        .error(function (data, status, headers, config) {
          $ionicLoading.hide();
          $scope.showNoConnection();
        });
      });
    });
  };

  $scope.getTypedPlaces = function (i) {
    var placedata = $q.defer();
    var names = [];
    if (i.length == 0) {
      placedata.resolve(names);
    } else {
      i = i.replace(/\ /g, "+");
      var url = Config.getGeocoderURL() + "/address?latlng=" + Config.getMapPosition().lat + ", " + Config.getMapPosition().long + "&distance=" + Config.getDistanceForAutocomplete() + "&address=" + i;
      $http.get(url, Config.getGeocoderConf()).
      success(function (data, status, headers, config) {
        geoCoderPlaces = [];
        //            places = data.response.docs;
        //store the data
        //return the labels
        k = 0;
        for (var i = 0; i < data.response.docs.length; i++) {
          temp = '';
          if (data.response.docs[i].name)
            temp = temp + data.response.docs[i].name;
          if (data.response.docs[i].street != data.response.docs[i].name)
            if (data.response.docs[i].street) {
              if (temp)
                temp = temp + ', ';
              temp = temp + data.response.docs[i].street;
            }
          if (data.response.docs[i].housenumber) {
            if (temp)
              temp = temp + ', ';
            temp = temp + data.response.docs[i].housenumber;
          }
          if (data.response.docs[i].city) {
            if (temp)
              temp = temp + ', ';
            temp = temp + data.response.docs[i].city;
          }

          //check se presente
          if (!geoCoderPlaces[temp]) {
            //se non presente
            names[k] = temp;
            k++
            geoCoderPlaces[temp] = {
              latlong: data.response.docs[i].coordinate
            }
          }
        }
        placedata.resolve(names);
      }).
      error(function (data, status, headers, config) {
        //            $scope.error = true;
      });
    }
    return placedata.promise;
  }

  var validate = function () {
    /*
    if (!$scope.profile.customProperties) {
      Utils.toast($filter('translate')('profile_form_phone_empty'));
      return false;
    }
    */

    // check for empty competenze
    var newCompetenze = {};
    for (var key in Object.keys($scope.prof.customProperties.competenze)) {
      if ($scope.prof.customProperties.competenze[key]) {
        newCompetenze[Object.keys(newCompetenze).length] = $scope.prof.customProperties.competenze[key];
      }
    }
    $scope.prof.customProperties.competenze = newCompetenze;

    return true;
  }

  $scope.$on('$ionicView.leave', function (event, args) {
    $scope.editing = false;
    localStorage.setItem(Config.getUserVarProfileCheck(), 'true');
    $scope.prof = angular.copy(Login.getUser());
  });

  $scope.toggleEditing = function () {
    if (!$scope.editing) {
      $scope.editing = true;
      $scope.prof.customProperties.competenze[Object.keys($scope.prof.customProperties.competenze).length] = '';
    } else {
      // TODO validate data; remote save;
      if (validate()) {
        Utils.loading();
        DataSrv.updateProfile($scope.prof).then(function () {
          $scope.prof = angular.copy(Login.getUser());
          $scope.editing = false;
        }, Utils.commError).finally(function () {
          Utils.loaded()
        });
      }
    }
  }
  $scope.changeEditMode = function (value) {
    $scope.editMode = value;
  }

  $scope.addAnotherCompetenza = function () {
    $scope.prof.customProperties.competenze[Object.keys($scope.prof.customProperties.competenze).length] = '';
  }

  /*
   * SERVICES
   */

  $scope.selectServices = function () {
    $scope.isOnProfile = false;
  }

  $scope.selectProfile = function () {
    $scope.isOnProfile = true;
  }

  $scope.addNewService = function () {
    //modal e scegli tipologia di servizio
    $scope.addServiceModal.show();
  }

  $scope.closeNewService = function () {
    $scope.addServiceModal.hide();
  }

  var addNewService = function (TypeOfService) {
    //applicationId, address, area, coordinates, note, serviceType
    //take element from viaggia
    newService = {
      "applicationId": Config.APPLICATION_ID,
      "address": "Via Malpaga 11",
      "area": "idzone_1",
      "coordinates": [
          46.070761,
          11.122831
        ],
      "note": "",
      "serviceType": "idser_1"
    }
    $scope.services.push(newService);
  }
  $scope.openMapPlan = function (place) {
    $scope.place = place;
    $scope.refresh = false;
    if ($scope.modalMap) {
      $scope.modalMap.show();
    }
  };
  $scope.closeMap = function () {
    $scope.refresh = true;
    if ($scope.modalMap) {
      $scope.modalMap.hide();
    }
  };


  var typePlace = function (typedthings) {
    if (($scope.placesandcoordinates && $scope.placesandcoordinates[typedthings] == null) || typedthings == '' || $scope.placesandcoordinates == null) {
      $scope.addressParams = {
        name: '',
        lat: '',
        long: ''
      }
    };

    $scope.result = typedthings;
    $scope.getTypedPlaces(typedthings).then(function (data) {
      //merge with favorites and check no double values
      $scope['places' + fromOrTo] = data;
      if (data.length > 0) {
        $scope['places' + fromOrTo] = addFavoritePlaces(typedthings, $scope['places' + fromOrTo]);
        $scope.placesandcoordinates = planService.getnames();
        $scope.placesandcoordinates = planService.addnames($scope.favoritePlaces);
      } else {
        $scope['places' + fromOrTo] = null;
        $scope.placesandcoordinates = null;
      }
    });
  }

  $scope.typePlace = function (typedthings) {
    typePlace(typedthings);
  };
  $scope.cancel = function () {
    //delete service from the queue
    $scope.services.pop();
  }
  $scope.saveService = function (serviceToSave) {
    //send service and update array
    DataSrv.createOffer(serviceToSave).then(function (result) {
      //save toast;
      $scope.changeEditMode(false);
    })
  }
  $scope.addService = function (typeOfService) {
    $scope.addServiceModal.hide();
    //add an empty Service
    addNewService(typeOfService);
    $scope.changeEditMode(true);

  }

  $scope.toggleService = function (service) {
    if ($scope.isServiceShown(service)) {
      $scope.shownService = null;
    } else {
      $scope.shownService = service;
    }
  }

  $scope.isServiceShown = function (service) {
    return $scope.shownService === service;
  }

  $scope.uploadImage = function () {
    if (navigator && navigator.camera) {
      var error = function (err) {
        console.log('error', err);
      };

      navigator.camera.getPicture(function (fileURL) {
        var win = function (r) {
          Login.updateUser(true).then(function (user) {
            Utils.loaded();
            $scope.prof.imageUrl = user.imageUrl;
            $scope.imageUrl = $rootScope.generateImageUrl($scope.prof.imageUrl, true);
            //            $scope.$apply();
          }, Utils.commError);
        }

        var options = new FileUploadOptions();
        options.fileKey = 'file';
        options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
        options.mimeType = 'image/png';
        options.headers = {
          Authorization: Config.getToken()
        };
        Utils.loading();
        var ft = new FileTransfer();
        ft.upload(fileURL, encodeURI(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/image/upload/png/' + $scope.prof.objectId), win, Utils.commError, options);
      }, error, {
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        destinationType: Camera.DestinationType.FILE_URI,
        encodingType: Camera.EncodingType.PNG,
        allowEdit: true,
        targetWidth: 200,
        targetHeight: 200
      });
    }
  };

  init();
  angular.extend($scope, {
    center: {
      lat: Config.getMapPosition().lat,
      lng: Config.getMapPosition().long,
      zoom: 18
    },
    servicesMarkers: $scope.markers,
    events: {}
  });
});
