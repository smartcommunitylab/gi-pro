angular.module('gi-pro.controllers.details', [])

.controller('RequestDetailsCtrl', function ($scope, $rootScope, $stateParams, $filter, $ionicPopup, Utils, Config, DataSrv, Login, NotifDB) {
  $scope.request = null;
  $scope.matchingOffers = null;

  $scope.isMine = function () {
    return $scope.request != null && $scope.request.requester.objectId == Login.getUser().objectId;
  };

  $scope.isEditable = function () {
    return $scope.isMine() && (!$scope.request.startTime || $scope.request.startTime > moment().startOf('date').valueOf());
  };

  var setRequest = function (req) {
    $scope.request = req;

    if ($scope.isMine()) {
      DataSrv.getMatchingOffers(Login.getUser().objectId, req.objectId).then(
        function (offers) {
          $scope.matchingOffers = offers;
          NotifDB.markAsReadByRequestId($scope.request.objectId);
        },
        Utils.commError
      );
    }
  };

  if (!!$stateParams['request']) {
    setRequest($stateParams['request']);
  } else {
    Utils.loading();
    DataSrv.getRequestById(Login.getUser().objectId, $stateParams.objectId).then(
      function (request) {
        Utils.loaded();
        setRequest(request);
      },
      Utils.commError
    );
  }

  $scope.openOfferDetails = function (offer) {
    $scope.goTo('app.offerdetails', {
      'objectId': offer.objectId,
      'offer': offer
    });
  };

  $scope.deleteRequest = function () {
    var confirmPopup = $ionicPopup.confirm({
      title: $filter('translate')('request_delete_confirm_title'),
      template: $filter('translate')('request_delete_confirm_text'),
      cancelText: $filter('translate')('cancel'),
      cancelType: 'button-light',
      okText: $filter('translate')('delete'),
      okType: 'button-assertive'
    });

    confirmPopup.then(function (yes) {
      if (yes) {
        Utils.loading();
        DataSrv.deleteRequest($scope.request.objectId, Login.getUser().objectId).then(
          function (data) {
            $scope.goTo('app.reqAndOffer', {
              'reload': true,
              'tab': 0
            }, false, true, true, true);
            Utils.toast($filter('translate')('request_delete_done'));
          }, Utils.commError
        );
      }
    });
  };
})

.controller('OfferDetailsCtrl', function ($scope, $stateParams, $filter, $ionicPopup, Utils, Config, DataSrv, Login, NotifDB) {
    $scope.offer = null;
    $scope.matchingRequests = null;

    $scope.isMine = function () {
      return $scope.offer != null && $scope.offer.professional.objectId == Login.getUser().objectId;
    };

    $scope.isEditable = function () {
      return $scope.isMine() && (!$scope.offer.startTime || $scope.offer.startTime > moment().startOf('date').valueOf());
    };

    var setOffer = function (off) {
      $scope.offer = off;

      if ($scope.isMine()) {
        DataSrv.getMatchingRequests(Login.getUser().objectId, off.objectId).then(
          function (requests) {
            $scope.matchingRequests = requests;
            NotifDB.markAsReadByOfferId($scope.offer.objectId);
          },
          Utils.commError
        );
      }
    };

    if (!!$stateParams['offer']) {
      setOffer($stateParams['offer']);
    } else {
      Utils.loading();
      DataSrv.getOfferById(Login.getUser().objectId, $stateParams.objectId).then(
        function (offer) {
          Utils.loaded();
          setOffer(offer);
        },
        Utils.commError
      );
    }

    $scope.openRequestDetails = function (request) {
      $scope.goTo('app.requestdetails', {
        'objectId': request.objectId,
        'request': request
      });
    };

    $scope.deleteOffer = function () {
      var confirmPopup = $ionicPopup.confirm({
        title: $filter('translate')('offer_delete_confirm_title'),
        template: $filter('translate')('offer_delete_confirm_text'),
        cancelText: $filter('translate')('cancel'),
        cancelType: 'button-light',
        okText: $filter('translate')('delete'),
        okType: 'button-assertive'
      });

      confirmPopup.then(function (yes) {
        if (yes) {
          Utils.loading();
          DataSrv.deleteOffer($scope.offer.objectId, Login.getUser().objectId).then(
            function (data) {
              $scope.goTo('app.reqAndOffer', {
                'reload': true,
                'tab': 1
              }, false, true, true, true);
              Utils.toast($filter('translate')('offer_delete_done'));
            }, Utils.commError
          );
        }
      });
    };
  })
  .controller('ProfessionistDetailsCtrl', function ($scope, $stateParams, DataSrv) {
    $scope.state = 'view';
    $scope.title = "";
    $scope.imageUrl = "";
    var setProfessionist = function (prof) {
      $scope.prof = prof;
    };

    if (!!$stateParams['professionist']) {
      setProfessionist($stateParams['professionist']);
      $scope.title = $scope.prof.name;
      $scope.imageUrl = $scope.prof.picture;


    }
    if (!!$stateParams['objectId']) {

      DataSrv.getProfessionistByID($stateParams['objectId']).then(function (professionist) {
        setProfessionist(professionist);
        $scope.title = $scope.prof.name;
        $scope.imageUrl = $scope.prof.imageUrl;

      });
    }
    //    else {
    //            Utils.loading();
    //            DataSrv.getOfferById(Login.getUser().objectId, $stateParams.objectId).then(
    //                function (offer) {
    //                    Utils.loaded();
    //                    setOffer(offer);
    //                },
    //                Utils.commError
    //            );
    //        }
    //        $scope.imageUrl = $rootScope.generateImageUrl($scope.profile.imageUrl, true);
  }).controller('ServiceDetailsCtrl', function ($scope, $stateParams, DataSrv) {
    $scope.title = "";
    $scope.imageUrl = "";
    var setService = function (service) {
      $scope.service = service;
    };

    if (!!$stateParams['service']) {
      setService($stateParams['service']);
      $scope.title = $scope.service.name;
      $scope.imageUrl = $scope.service.picture;


    }
    if (!!$stateParams['objectId']) {

      DataSrv.getServiceByID($stateParams['objectId']).then(function (service) {
        setService(service);
        $scope.title = $scope.service.name;
        $scope.imageUrl = $scope.service.imageUrl;

      });
    }
    //    else {
    //            Utils.loading();
    //            DataSrv.getOfferById(Login.getUser().objectId, $stateParams.objectId).then(
    //                function (offer) {
    //                    Utils.loaded();
    //                    setOffer(offer);
    //                },
    //                Utils.commError
    //            );
    //        }
    //        $scope.imageUrl = $rootScope.generateImageUrl($scope.profile.imageUrl, true);
  })
  .controller('ProfileCtrl', function ($scope, $rootScope, $stateParams, $filter, $timeout, Config, Login, Utils, DataSrv) {
    $scope.prof = angular.copy(Login.getUser());
    $scope.myProfile = true;
    $scope.imageUrl = $rootScope.generateImageUrl($scope.prof.imageUrl, true);
    var validate = function () {
      //		if (!$scope.profile.customProperties) {
      //			Utils.toast($filter('translate')('profile_form_phone_empty'));
      //			return false;
      //		}
      return true;
    }

    $scope.state = 'view';

    $scope.$on('$ionicView.leave', function (event, args) {
      $scope.state = 'view';
      localStorage.setItem(Config.getUserVarProfileCheck(), 'true');
      $scope.prof = angular.copy(Login.getUser());
    });

    $scope.saveEdit = function () {
      if ($scope.state == 'view') {
        $scope.state = 'edit';
      } else {
        // TODO validate data; remote save;
        if (validate()) {
          Utils.loading();
          DataSrv.updateProfile($scope.prof).then(function () {
            $scope.prof = angular.copy(Login.getUser());
            $scope.state = 'view';
            Utils.loaded();
          }, Utils.commError);
        }
      }
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
          options.fileKey = "file";
          options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
          options.mimeType = "image/png";
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
  });
