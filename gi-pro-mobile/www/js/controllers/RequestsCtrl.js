angular.module('gi-pro.controllers.requests', [])

.controller('RequestsCtrl', function ($scope, $stateParams, $ionicTabsDelegate, Utils, Config, DataSrv, Login, PushSrv, NotifDB) {
  $scope.myRequests = null
  $scope.requestsToMe = null
  $scope.myRequestsNotifications = {}
  $scope.requestsToMeNotifications = {}

  // state: OPEN, CLOSED, ACCEPTED, REJECTED, (DELETED)

  $scope.availableServices = DataSrv.getServicesMap()
  if (!$scope.availableServices) {
    DataSrv.getServicesDefinition().then(function () {
      $scope.availableServices = DataSrv.getServicesMap()
    })
  }

  var reload = function () {
    if (!Login.getUser()) {
      //$scope.goTo('app.tutorial', {forceReload:true}, true, true, true);
      // not logged
      return;
    }

    Utils.loading();
    var from = moment().startOf('date').valueOf();
    DataSrv.getMyRequests(Login.getUser().objectId, from, null, 1, 100).then(
      function (requests) {
        $scope.myRequests = requests;
        DataSrv.getRequestsToMe(Login.getUser().objectId, from, null, 1, 100).then(
          function (offers) {
            $scope.requestsToMe = offers;
            Utils.loaded();
          },
          Utils.commError
        );
      },
      Utils.commError
    );
  }

  if (!$stateParams.reload) {
    // prevent double load (WHY?!?!?)
    reload();
  }

  $scope.$on('$ionicView.enter', function (event, args) {
    var params = DataSrv.internalCache['app.requests'] || {};
    if (params.reload) {
      reload();
    }

    if (params.tab) {
      $ionicTabsDelegate.select(params.tab);
    }
    DataSrv.internalCache['app.requests'] = null;
  });

  $scope.selectedTab = function () {
    return $ionicTabsDelegate.selectedIndex();
  };

  $scope.openRequestDetails = function (request) {
    $scope.goTo('app.requestdetails', {
      'objectId': request.objectId,
      'request': request
    });
  };

  var updateNotificationsCounts = function () {
    // Applications for user requests
    NotifDB.getNotifications(Login.getUser().objectId, DataSrv.notificationTypes.NEW_SERVICE_OFFER, false).then(
      function (notifications) {
        var newNotificationsMap = {}
        angular.forEach(notifications, function (notif) {
          if (!newNotificationsMap[notif.serviceRequestId]) {
            newNotificationsMap[notif.serviceRequestId] = [notif];
          } else {
            newNotificationsMap[notif.serviceRequestId].push(notif);
          }
        });

        $scope.myRequestsNotifications = newNotificationsMap;

        // Requests for user offers
        NotifDB.getNotifications(Login.getUser().objectId, DataSrv.notificationTypes.NEW_SERVICE_REQUEST, false).then(
          function (notifications) {
            var newNotificationsMap = {}
            angular.forEach(notifications, function (notif) {
              if (!newNotificationsMap[notif.serviceOfferId]) {
                newNotificationsMap[notif.serviceOfferId] = [notif];
              } else {
                newNotificationsMap[notif.serviceOfferId].push(notif);
              }
            });

            $scope.requestsToMeNotifications = newNotificationsMap;
          }
        );
      }
    );
  };

  var subscribeFgListener = function () {
    PushSrv.fgOn(function (notification) {
      // TODO implement
      console.log('Show event in home', notification);
      updateNotificationsCounts();
    });
  };

  $scope.$on('$ionicView.enter', function () {
    subscribeFgListener();
    if (Login.userIsLogged()) {
      updateNotificationsCounts();
    }
  });
})

/* History */
.controller('HistoryCtrl', function ($scope, $stateParams, $ionicTabsDelegate, Utils, Config, DataSrv, Login) {
  var limit = 10;

  $scope.myRequests = null;
  $scope.myRequestsPage = 1;
  $scope.hasMoreRequests = true;

  $scope.requestsToMe = null;
  $scope.requestsToMePage = 1;
  $scope.hasMoreOffers = true;

  $scope.loadMoreRequests = function () {
    if (!$scope.hasMoreRequests) {
      Utils.loaded();
      $scope.$broadcast('scroll.infiniteScrollComplete');
      return;
    }

    Utils.loading();
    var to = moment().startOf('date').valueOf();
    DataSrv.getRequests(Login.getUser().objectId, 0, to, $scope.myRequestsPage, limit).then(
      function (requests) {
        if (requests.length < limit) {
          $scope.hasMoreRequests = false;
        } else {
          $scope.myRequestsPage++;
        }
        if ($scope.myRequests == null) {
          $scope.myRequests = requests;
        } else {
          $scope.myRequests = $scope.myRequests.concat(requests);
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$broadcast('scroll.refreshComplete');
      },
      function () {
        $scope.hasMoreRequests = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$broadcast('scroll.refreshComplete');
        Utils.commError();
      }
    ).finally(Utils.loaded);
  };

  $scope.loadMoreOffers = function () {
    if (!$scope.hasMoreOffers) {
      Utils.loaded();
      $scope.$broadcast('scroll.infiniteScrollComplete');
      return;
    }

    Utils.loading();
    var to = moment().startOf('date').valueOf();
    DataSrv.getOffers(Login.getUser().objectId, 0, to, true, $scope.requestsToMePage, limit).then(
      function (offers) {
        if (offers.length < limit) {
          $scope.hasMoreOffers = false;
        } else {
          $scope.requestsToMePage++;
        }
        if ($scope.requestsToMe == null) {
          $scope.requestsToMe = offers;
        } else {
          $scope.requestsToMe = $scope.requestsToMe.concat(offers);
        }
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$broadcast('scroll.infiniteScrollComplete');
      },
      function () {
        $scope.hasMoreOffers = false;
        $scope.$broadcast('scroll.refreshComplete');
        $scope.$broadcast('scroll.infiniteScrollComplete');
        Utils.commError();
      }
    ).finally(Utils.loaded);
  };

  $scope.refreshRequests = function () {
    $scope.myRequestsPage = 1;
    $scope.myRequests = null;
    $scope.hasMoreRequests = true;
    $scope.loadMoreRequests();
  };

  $scope.refreshOffers = function () {
    $scope.requestsToMePage = 1;
    $scope.requestsToMe = null;
    $scope.hasMoreOffers = true;
    $scope.loadMoreOffers();
  };

  $scope.selectedTab = function () {
    return $ionicTabsDelegate.selectedIndex();
  };

  $scope.openRequestDetails = function (request) {
    $scope.goTo('app.requestdetails', {
      'objectId': request.objectId,
      'request': request
    });
  };

  $scope.openOfferDetails = function (offer) {
    $scope.goTo('app.offerdetails', {
      'objectId': offer.objectId,
      'offer': offer
    });
  };
});
