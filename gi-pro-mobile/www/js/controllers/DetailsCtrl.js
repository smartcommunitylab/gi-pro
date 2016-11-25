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

.controller('ServiceDetailsCtrl', function ($scope, $state, $stateParams, $ionicModal, Login, DataSrv) {
  $scope.title = '';
  $scope.imageUrl = '';

  if (!!$stateParams['service']) {
    $scope.service = $stateParams['service'];
    $scope.title = DataSrv.getServicesMap()[$scope.service.serviceType].name;
    $scope.imageUrl = $scope.service.picture;
  } else if (!!$stateParams['objectId']) {
    /*$
    scope.service = DataSrv.getServicesMap()[$stateParams['objectId']];
    $scope.title = $scope.service.name;
    $scope.imageUrl = $scope.service.imageUrl;
    */
  }

  $scope.openProfessionalDetails = function (professional) {
    if (Login.userIsLogged()) {
      $state.go("app.professionalWithServices", {
        'objectId': professional.objectId,
        'professional': professional
      });
    } else {
      $state.go("app.professionalDetails", {
        'objectId': professional.objectId,
        'professional': professional
      });
    }
  }

  $ionicModal.fromTemplateUrl('templates/modal_newrequest.html', {
    scope: $scope
  }).then(function (modal) {
    $scope.newRequestModal = modal;
  }, function (error) {
    console.log(error);
  });

  $scope.openNewRequestModal = function () {
    $scope.newRequestModal.show()
  }

  $scope.closeNewRequestModal = function () {
    $scope.newRequestModal.hide()
  }

  /*
  else {
    Utils.loading();
    DataSrv.getOfferById(Login.getUser().objectId, $stateParams.objectId).then(
      function (offer) {
        Utils.loaded();
        setOffer(offer);
      },
      Utils.commError
    );
  }
  $scope.imageUrl = $rootScope.generateImageUrl($scope.profile.imageUrl, true);
  */
});
