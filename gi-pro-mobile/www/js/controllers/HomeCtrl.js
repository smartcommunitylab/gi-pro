angular.module('toga.controllers.home', [])

.controller('HomeCtrl', function ($scope, $stateParams, $ionicTabsDelegate, Utils, Config, DataSrv, Login, PushSrv, NotifDB) {
	$scope.requests = null;
	$scope.offers = null;
	$scope.requestsNotifications = {};
	$scope.offersNotifications = {};

	var reload = function () {
		Utils.loading();
		var from = moment().startOf('date').valueOf();
		DataSrv.getRequests(Login.getUser().objectId, Config.SERVICE_TYPE, from, null, 1, 100).then(
			function (requests) {
				$scope.requests = requests;
				DataSrv.getOffers(Login.getUser().objectId, Config.SERVICE_TYPE, from, null, null, 1, 100).then(
					function (offers) {
						$scope.offers = offers;
						Utils.loaded();
					},
					Utils.commError
				);
			},
			Utils.commError
		);
	};

	if (!$stateParams.reload) {
		// prevent double load (WHY?!?!?)
		reload();
		console.log('LOAD');
	}

	$scope.$on('$ionicView.beforeEnter', function (event, args) {
		if (!!args.stateParams.reload) {
			reload();
			console.log('RELOAD');
		}

		if (!!args.stateParams.tab) {
			$ionicTabsDelegate.select(args.stateParams.tab);
		}
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

	$scope.openOfferDetails = function (offer) {
		$scope.goTo('app.offerdetails', {
			'objectId': offer.objectId,
			'offer': offer
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

				if (notifications.length > 0) {
					$scope.requestsNotifications = newNotificationsMap;
				}
			}
		);

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

				if (notifications.length > 0) {
					$scope.offersNotifications = newNotificationsMap;
				}
			}
		);
	};

	$scope.$on('$ionicView.enter', function (event, args) {
		updateNotificationsCounts();
	});

	PushSrv.fgOn(function (notification) {
		// TODO implement
		console.log('Show event in home', notification);
		updateNotificationsCounts();
	});
})

.controller('NotificationsCtrl', function ($scope, Utils, Login, Config, DataSrv, PushSrv, NotifDB) {
	var limit = 10;

	$scope.notifications = null;
	$scope.page = 1;
	$scope.hasMore = true;

	$scope.loadMore = function () {
		if (!$scope.hasMore) {
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
	};

	PushSrv.fgOn(function (notification) {
		$scope.refresh();
	});

    $scope.openNotificationDetails = function(notification) {
      if (notification.type == 'NEW_SERVICE_OFFER') {
          $scope.goTo('app.requestdetails', {'objectId': notification.serviceRequestId});
      }
      else if (notification.type == 'NEW_SERVICE_REQUEST') {
          $scope.goTo('app.offerdetails', {'objectId': notification.serviceOfferId});
      }
    }

})

.controller('HistoryCtrl', function ($scope, $stateParams, $ionicTabsDelegate, Utils, Config, DataSrv, Login) {
	var limit = 10;

	$scope.requests = null;
	$scope.requestsPage = 1;
	$scope.hasMoreRequests = true;

	$scope.offers = null;
	$scope.offersPage = 1;
	$scope.hasMoreOffers = true;

	$scope.loadMoreRequests = function () {
		if (!$scope.hasMoreRequests) {
			$scope.$broadcast('scroll.infiniteScrollComplete');
			return;
		}
		Utils.loading();
		var to = moment().startOf('date').valueOf();
		DataSrv.getRequests(Login.getUser().objectId, Config.SERVICE_TYPE, 0, to, $scope.requestsPage, limit).then(
			function (requests) {
				if (requests.length < limit) {
					$scope.hasMoreRequests = false;
				} else {
					$scope.requestsPage++;
				}
				if ($scope.requests == null) {
					$scope.requests = requests;
				} else {
					$scope.requests = $scope.requests.concat(requests);
				}
				$scope.$broadcast('scroll.infiniteScrollComplete');
				$scope.$broadcast('scroll.refreshComplete');
				Utils.loaded();
			},
			function () {
				$scope.hasMoreRequests = false;
				$scope.$broadcast('scroll.infiniteScrollComplete');
				$scope.$broadcast('scroll.refreshComplete');
				Utils.commError();
			}
		);

	}

	$scope.loadMoreOffers = function () {
		if (!$scope.hasMoreOffers) {
			$scope.$broadcast('scroll.infiniteScrollComplete');
			return;
		}
		Utils.loading();
		var to = moment().startOf('date').valueOf();
		DataSrv.getOffers(Login.getUser().objectId, Config.SERVICE_TYPE, 0, to, true, $scope.offersPage, limit).then(
			function (offers) {
				if (offers.length < limit) {
					$scope.hasMoreOffers = false;
				} else {
					$scope.offersPage++;
				}
				if ($scope.offers == null) {
					$scope.offers = offers;
				} else {
					$scope.offers = $scope.offers.concat(offers);
				}
				$scope.$broadcast('scroll.refreshComplete');
				$scope.$broadcast('scroll.infiniteScrollComplete');
				Utils.loaded();
			},
			function () {
				$scope.hasMoreOffers = false;
				$scope.$broadcast('scroll.refreshComplete');
				$scope.$broadcast('scroll.infiniteScrollComplete');
				Utils.commError();
			}
		);

	}

	$scope.refreshRequests = function () {
		$scope.requestsPage = 1;
		$scope.requests = null;
		$scope.hasMoreRequests = true;
		$scope.loadMoreRequests();
	};
	$scope.refreshOffers = function () {
		$scope.offersPage = 1;
		$scope.offers = null;
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
})

.controller('ProfileCtrl', function ($scope, Config, Login, Utils) {
	$scope.profile = Login.getUser();

	$scope.imageUrlPrefix = Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/image/download';

	$scope.uploadImage = function () {
		if (navigator && navigator.camera) {

			var error = function (err) {
				console.log('error', err);
			};
			navigator.camera.getPicture(function (fileURL) {
				var win = function (r) {
					Login.updateUser().then(function (user) {
						Utils.loaded();
						$scope.profile.imageUrl = user.imageUrl;
						//            $scope.$apply();
					}, Utils.commError);
				}

				var options = new FileUploadOptions();
				options.fileKey = "file";
				options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
				options.mimeType = "image/png";

				Utils.loading();
				var ft = new FileTransfer();
				ft.upload(fileURL, encodeURI(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/image/upload/png/' + $scope.profile.objectId), win, Utils.commError, options);

			}, error, {
				sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
				destinationType: Camera.DestinationType.FILE_URI,
				encodingType: Camera.EncodingType.PNG,
				allowEdit: true,
				targetWidth: 200,
				targetHeight: 200
			});
		}
	}

});
