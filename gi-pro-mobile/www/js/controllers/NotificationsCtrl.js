angular.module('gi-pro.controllers.notifications', [])

.controller('NotificationsCtrl', function ($scope, $rootScope, $timeout, Utils, Login, Config, DataSrv, PushSrv, NotifDB) {
  var limit = 10;

  $scope.notifications = null;
  $scope.page = 1;
  $scope.hasMore = true;

  $scope.loadMore = function () {
    if (!$scope.hasMore) {
      Utils.loaded();
      $scope.$broadcast('scroll.infiniteScrollComplete');
      return;
    }
    Utils.loading();
    NotifDB.getNotifications(Login.getUser().objectId, null, null, null, null, $scope.page, limit).then(
      function (notifications) {
        if (notifications.length < limit) {
          $scope.hasMore = false;
        } else {
          $scope.page++;
        }
        if ($scope.notifications == null) {
          $scope.notifications = notifications;
        } else {
          $scope.notifications = $scope.notifications.concat(notifications);
        }
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$broadcast('scroll.refreshComplete');
        Utils.loaded();
      },
      function () {
        $scope.hasMore = false;
        $scope.$broadcast('scroll.infiniteScrollComplete');
        $scope.$broadcast('scroll.refreshComplete');
        Utils.commError();
      }
    );
  };

  $scope.refresh = function () {
    $scope.page = 1;
    $scope.notifications = null;
    $scope.hasMore = true;
    $scope.loadMore();
  }

  PushSrv.fgOn(function (notification) {
    $scope.page = 1;
    $scope.notifications = null;
    $timeout(function () {
      $scope.hasMore = true;
      $scope.loadMore();
    }, 200);
  });

  $scope.deleteNotification = function (notif, pos) {
    NotifDB.remove(notif.objectId);
    $scope.notifications.splice(pos, 1);
  };
})
