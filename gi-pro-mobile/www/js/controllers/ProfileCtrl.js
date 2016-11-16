angular.module('gi-pro.controllers.profile', [])

.controller('ProfileCtrl', function ($scope, $rootScope, $ionicModal, $filter, Config, Login, Utils, DataSrv) {

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

  $scope.addService = function (service) {
    $scope.addServiceModal.hide();
    //add an empty Service
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
});
