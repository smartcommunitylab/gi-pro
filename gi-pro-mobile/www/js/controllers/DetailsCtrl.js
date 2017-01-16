/* global moment */
angular.module('gi-pro.controllers.details', [])

  .controller('RequestDetailsCtrl', function ($scope, $rootScope, $stateParams, $filter, $ionicPopup, Utils, Config, DataSrv, Login, NotifDB) {
    $scope.request = null
    $scope.matchingOffers = null

    $scope.isToMe = function () {
      // return !!$scope.request && $scope.request.requester.objectId !== Login.getUser().objectId
      return $scope.request && $scope.request.requester && ($scope.request.requester.objectId !== Login.getUser().objectId)
    }

    $scope.isFuture = function () {
      if ($scope.request) {
        return (!$scope.request.startTime || $scope.request.startTime > moment().startOf('date').valueOf())
      }
      return null
    }

    var setRequest = function (req) {
      $scope.request = req
      $scope.professional = $scope.isToMe() ? $scope.request.requester : $scope.request.professional

      /*
      if ($scope.request.offerId) {
        DataSrv.getOfferById($scope.professional.objectId, $scope.request.offerId).then(
          function (offer) {
            $scope.offer = offer;
          },
          Utils.commError
        );
      }
      */
    }

    if ($stateParams['request']) {
      setRequest($stateParams['request'])
    } else if ($stateParams['objectId']) {
      Utils.loading()
      DataSrv.getRequestById(Login.getUser().objectId, $stateParams.objectId).then(
        function (request) {
          Utils.loaded()
          setRequest(request)
        },
        Utils.commError
      )
    }

    $scope.openOfferDetails = function (offer) {
      $scope.goTo('app.offerdetails', {
        'objectId': offer.objectId,
        'offer': offer
      })
    }

    $scope.deleteRequest = function () {
      var confirmPopup = $ionicPopup.confirm({
        title: $filter('translate')('request_delete_confirm_title'),
        template: $filter('translate')('request_delete_confirm_text'),
        cancelText: $filter('translate')('cancel'),
        cancelType: 'button-light',
        okText: $filter('translate')('delete'),
        okType: 'button-assertive'
      })

      confirmPopup.then(function (yes) {
        if (yes) {
          Utils.loading()
          DataSrv.deleteRequest($scope.request.objectId, Login.getUser().objectId).then(
            function (data) {
              $scope.goTo('app.requests', {
                'reload': true
              }, false, true, true, true)
              Utils.toast($filter('translate')('request_delete_done'))
            }, Utils.commError
          )
        }
      })
    }

    $scope.acceptRequest = function () {
      Utils.loading()
      DataSrv.acceptRequest($scope.request.objectId, Login.getUser().objectId).then(
        function (data) {
          Utils.loaded()
          $scope.goTo('app.requests', {
            'reload': true
          }, false, true, true, true)
          Utils.toast($filter('translate')('request_accept_done'))
        }, Utils.commError
      )
    }

    $scope.rejectRequest = function () {
      var confirmPopup = $ionicPopup.confirm({
        title: $filter('translate')('request_reject_confirm_title'),
        template: $filter('translate')('request_reject_confirm_text'),
        cancelText: $filter('translate')('cancel'),
        cancelType: 'button-light',
        okText: $filter('translate')('delete'),
        okType: 'button-assertive'
      })

      confirmPopup.then(function (yes) {
        if (yes) {
          Utils.loading()
          DataSrv.rejectRequest($scope.request.objectId, Login.getUser().objectId).then(
            function (data) {
              Utils.loaded()
              $scope.goTo('app.requests', {
                'reload': true
              }, false, true, true, true)
              Utils.toast($filter('translate')('request_reject_done'))
            }, Utils.commError
          )
        }
      })
    }
  })

  .controller('OfferDetailsCtrl', function ($scope, $stateParams, $filter, $ionicPopup, Utils, Config, DataSrv, Login, NotifDB) {
    $scope.offer = null
    $scope.matchingRequests = null

    $scope.isToMe = function () {
      return $scope.offer != null && $scope.offer.professional.objectId === Login.getUser().objectId
    }

    $scope.isEditable = function () {
      return $scope.isToMe() && (!$scope.offer.startTime || $scope.offer.startTime > moment().startOf('date').valueOf())
    }

    var setOffer = function (off) {
      $scope.offer = off
      if ($scope.isToMe()) {
        DataSrv.getMatchingRequests(Login.getUser().objectId, off.objectId).then(
          function (requests) {
            $scope.matchingRequests = requests
            NotifDB.markAsReadByOfferId($scope.offer.objectId)
          },
          Utils.commError
        )
      }
    }

    if ($stateParams['offer']) {
      setOffer($stateParams['offer'])
    } else {
      Utils.loading()
      DataSrv.getOfferById(Login.getUser().objectId, $stateParams.objectId).then(
        function (offer) {
          Utils.loaded()
          setOffer(offer)
        },
        Utils.commError
      )
    }

    $scope.openRequestDetails = function (request) {
      $scope.goTo('app.requestdetails', {
        'objectId': request.objectId,
        'request': request
      })
    }

    $scope.deleteOffer = function () {
      var confirmPopup = $ionicPopup.confirm({
        title: $filter('translate')('offer_delete_confirm_title'),
        template: $filter('translate')('offer_delete_confirm_text'),
        cancelText: $filter('translate')('cancel'),
        cancelType: 'button-light',
        okText: $filter('translate')('delete'),
        okType: 'button-assertive'
      })

      confirmPopup.then(function (yes) {
        if (yes) {
          Utils.loading()
          DataSrv.deleteOffer($scope.offer.objectId, Login.getUser().objectId).then(
            function (data) {
              Utils.loaded()
              $scope.goTo('app.requests', {
                'reload': true,
                'tab': 1
              }, false, true, true, true)
              Utils.toast($filter('translate')('offer_delete_done'))
            }, Utils.commError
          )
        }
      })
    }
  })

  .controller('ServiceDetailsCtrl', function ($scope, $state, $stateParams, $filter, $ionicModal, Utils, ionicDatePicker, ionicTimePicker, Login, DataSrv) {
    $scope.title = ''
    $scope.imageUrl = ''

    if ($stateParams['service']) {
      $scope.service = $stateParams['service']
      $scope.serviceType = DataSrv.getServicesMap()[$scope.service.serviceType]
      $scope.isMine = Login.getUser().objectId === $scope.service.professional.objectId
      $scope.title = $scope.serviceType.name
      $scope.cost = $scope.serviceType.cost
      $scope.imageUrl = $scope.service.picture
    } else if ($stateParams['objectId']) {
      /* $
      scope.service = DataSrv.getServicesMap()[$stateParams['objectId']];
      $scope.title = $scope.service.name;
      $scope.imageUrl = $scope.service.imageUrl;
      */
    }

    /* new request */
    $scope.myBalance = Login.getUser().balance

    $scope.newRequest = {
      offerId: $scope.service.objectId,
      serviceType: $scope.service ? $scope.service.serviceType : null,
      startTime: new Date()
    }

    $scope.newRequestForm = {
      // keep formTime in millis
      startTime: Math.floor((($scope.newRequest.startTime.getHours() * 60) + $scope.newRequest.startTime.getMinutes()) / 15) * 15 * 60 * 1000,
      subtype: null
    }

    if (!$scope.subtypes) {
      $scope.subtypes = $scope.serviceType.subtypes
    }

    if ($scope.subtypes && !$scope.newRequestForm.subtype) {
      $scope.newRequestForm.subtype = $scope.subtypes[0]
    }

    $ionicModal.fromTemplateUrl('templates/modal_newrequest.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.newRequestModal = modal
    }, function (error) {
      console.log(error)
    })

    $scope.openNewRequestModal = function () {
      $scope.newRequestModal.show()
    }

    $scope.closeNewRequestModal = function () {
      $scope.newRequestModal.hide()
    }

    $scope.openDatePicker = function () {
      ionicDatePicker.openDatePicker({
        setLabel: $filter('translate')('set'),
        todayLabel: $filter('translate')('today'),
        closeLabel: $filter('translate')('close'),
        callback: function (val) {
          $scope.newRequest.startTime = new Date(val)
        }
      })
    }

    $scope.openTimePicker = function (field) {
      // var epochs = (((new Date()).getHours() * 60) + ((new Date()).getMinutes()))
      // epochs = Math.floor(epochs / 15) * 15 * 60;
      ionicTimePicker.openTimePicker({
        setLabel: $filter('translate')('set'),
        closeLabel: $filter('translate')('close'),
        step: 15,
        inputTime: $scope.newRequestForm.startTime / 1000,
        callback: function (val) {
          $scope.newRequestForm.startTime = val * 1000
        }
      })
    }

    $scope.sendNewRequest = function () {
      $scope.newRequest.startTime.setTime($scope.newRequest.startTime.getTime() + $scope.newRequestForm.startTime)
      if ($scope.newRequestForm.subtype) {
        $scope.newRequest.serviceSubtype = $scope.newRequestForm.subtype.subtype
        $scope.newRequest.cost = $scope.newRequestForm.subtype.cost
      }
      console.log($scope.newRequest)

      DataSrv.createRequest($scope.newRequest).then(
        function (request) {
          $scope.closeNewRequestModal()
          Utils.toast($filter('translate')('request_create_done'))
        },
        function (reason) {
          console.log(reason)
          // Utils.commError(reason)
          Utils.toast($filter('translate')('error_' + reason.data.errorType))
        }
      )
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
  })
