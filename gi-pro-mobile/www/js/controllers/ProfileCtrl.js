angular.module('gi-pro.controllers.profile', [])

.controller('ProfileCtrl', function ($scope, $rootScope, $ionicModal, $filter, Config, Login, Utils, DataSrv) {

  function init() {
    $scope.editing = false;
    $scope.prof = angular.copy(Login.getUser())
    $scope.isMyProfile = true;
    $scope.isOnProfile = false;
    $scope.imageUrl = $rootScope.generateImageUrl($scope.prof.imageUrl, true)
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
  }
  var validate = function () {
    /*
    if (!$scope.profile.customProperties) {
      Utils.toast($filter('translate')('profile_form_phone_empty'));
      return false;
    }
    */
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
    } else {
      // TODO validate data; remote save;
      if (validate()) {
        Utils.loading();
        DataSrv.updateProfile($scope.prof).then(function () {
          $scope.prof = angular.copy(Login.getUser());
          $scope.editing = false;
          Utils.loaded();
        }, Utils.commError);
      }
    }
  }
  $scope.selectServices = function () {
    $scope.isOnProfile = false;
  }

  $scope.selectProfile = function () {
    $scope.isOnProfile = true;
  }

  $scope.addNewService = function () {
    //modal e scegli tipologia di servizio
    $scope.availableServices = DataSrv.getServicesMap();
    $scope.addServiceModal.show();
  }
  $scope.closeNewService = function () {
    $scope.addServiceModal.hide();
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
