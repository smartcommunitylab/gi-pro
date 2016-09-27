angular.module('toga.services.notifications', [])

  .factory('NotifDB', function ($rootScope, $state, $ionicPlatform, $filter, $http, $q, Utils, Config, DataSrv) {
	var db = window.openDatabase('togadb', '1.0', 'togadb', 2 * 1024 * 1024);
	db.transaction(function (tx) {
		tx.executeSql('CREATE TABLE IF NOT EXISTS notification (id unique, timestamp, text, type, offerId, requestId, fromUserId, read)');
	});

	var notifDB = {};

  	var getUserId = function () {
        var user = $rootScope.user;
		if (user == null) {
		  user = JSON.parse(localStorage.getItem(Config.getUserVar()));
		}
		return user.objectId;
	}

	notifDB.openDetails = function (notification) {
		if (notification.type == 'NEW_SERVICE_OFFER') {
            Utils.loading();
            DataSrv.getRequestById(getUserId(), notification.serviceRequestId).then(
                function (request) {
                    Utils.loaded();
                    if (!request) {
                      Utils.toast($filter('translate')('request_not_exist'));
                    } else {
                      $state.go('app.requestdetails', {
                          'request': request
                      });
                    }
                },
                Utils.commError
            );
		} else if (notification.type == 'NEW_SERVICE_REQUEST') {
            Utils.loading();
            DataSrv.getOfferById(getUserId(), notification.serviceOfferId).then(
                function (offer) {
                    Utils.loaded();
                    if (!offer) {
                      Utils.toast($filter('translate')('offer_not_exist'));
                    } else {
                      $state.go('app.offerdetails', {
                          'offer': offer
                      });
                    }
                },
                Utils.commError
            );
		}
	};

	var remoteRead = function (professionalId, type, read, timeFrom, timeTo, page, limit) {
		// TODO use DB, except for initialization
		var deferred = $q.defer();

		var httpConfWithParams = Config.getHTTPConfig();
		httpConfWithParams.params = {};

		// professionalId is required
		if (!professionalId || !angular.isString(professionalId)) {
			deferred.reject('Invalid professionalId');
		}

		if (!!type) {
			httpConfWithParams.params['type'] = type;
		}
		if (!!timeFrom) {
			httpConfWithParams.params['timeFrom'] = timeFrom;
		}
		if (!!timeTo) {
			httpConfWithParams.params['timeTo'] = timeTo;
		}
		if (!!page) {
			httpConfWithParams.params['page'] = page;
		}
		if (!!limit) {
			httpConfWithParams.params['limit'] = limit;
		}
		if (read != 0) {
			httpConfWithParams.params['read'] = read > 0 ? true : false;
		}


		$http.get(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/notification/' + professionalId, httpConfWithParams)

		.then(
			function (response) {
				// offers
				deferred.resolve(response.data);
			},
			function (reason) {
				deferred.reject(reason.data ? reason.data.errorMessage : reason);
			}
		);

		return deferred.promise;
	};

	/* get notifications */
	notifDB.getNotifications = function (professionalId, type, read, timeFrom, timeTo, page, limit) {
		/*if (!ionic.Platform.isWebView()) {*/
		if (false) {
			return remoteRead(professionalId, type, read, timeFrom, timeTo, page, limit);
		}

		var deferred = $q.defer();

		// check if already requested data from the server.
		var downloaded = localStorage.getItem(Config.getUserNotificationsDownloaded());
		// already downloaded
		if (!!downloaded && downloaded != 'null') {
			db.transaction(function (tx) {
				var sql = 'SELECT * FROM notification';
				var cond = '';
				var params = [];
				if (type != null) {
					cond += 'type = ?';
					params.push(type);
				}
				if (read != null) {
					if (params.length > 0) cond += ' AND ';
					cond += 'read = ?';
					params.push(read);
				}
				if (timeFrom != null) {
					if (params.length > 0) cond += ' AND ';
					cond += 'timestamp > ?';
					params.push(timeFrom);
				}
				if (timeTo != null) {
					if (params.length > 0) cond += ' AND ';
					cond += 'timestamp < ?';
					params.push(timeTo);
				}
				if (params.length > 0) sql += ' WHERE ' + cond;
				//          if (page != null && limit != null) {
				//            sql += ' OFFSET ? LIMIT ?';
				//            params.push((page - 1) * limit);
				//            params.push(limit);
				//          }
				sql += ' ORDER BY timestamp DESC';

				tx.executeSql(sql, params, function (tx, results) {
					if (results.rows && results.rows.length >= 1) {
						var array = [];
						var i = page != null && limit != null ? (page - 1) * limit : 0;
						var N = limit != null ? limit : 50;
						N = Math.min(results.rows.length, N);
						for (; i < N; i++) {
							array.push(convertRow(results.rows.item(i)));
						}
						deferred.resolve(array);
					} else {
						deferred.resolve([]);
					}
				}, function (e) {
					deferred.reject(e);
				});
			});
		} else {
			db.transaction(function (tx) {
				tx.executeSql('DELETE FROM notification', null, function () {
					remoteRead(professionalId, null, null, null, null, 0, 50).then(function (data) {
						if (data.length > 0) {
							var count = data.length;
							db.transaction(function (tx) {
								data.forEach(function (n) {
									tx.executeSql('INSERT INTO notification (id, timestamp, text, type, offerId, requestId, fromUserId, read) VALUES (?,?,?,?,?,?,?,?)', [n.objectId, n.timestamp, n.text, n.type, n.serviceOfferId, n.serviceRequestId, null, n.read],
										function () {
											count--;
											if (count == 0) {
												localStorage.setItem(Config.getUserNotificationsDownloaded(), true);
												notifDB.getNotifications(professionalId, type, read, timeFrom, timeTo, page, limit).then(function (data) {
													deferred.resolve(data);
												}, function (e) {
													deferred.reject(e);
												});
											}
										},
										function (e) {
											deferred.reject(e);
										}
									);
								});
							});
						} else {
							localStorage.setItem(Config.getUserNotificationsDownloaded(), true);
							deferred.resolve([]);
						}
					}, function (e) {
						deferred.reject(e);
					});
				});
			});
		}

		return deferred.promise;
	};

	notifDB.getById = function (id) {
		var deferred = $q.defer();
		db.transaction(function (tx) {
			tx.executeSql('SELECT * FROM notification WHERE id = ?', [id], function (tx, results) {
				if (results.rows && results.rows.length >= 1) {
					deferred.resolve(convertRow(results.rows.item(0)));
				} else {
					deferred.resolve(null);
				}
			}, function () {
				deferred.reject();
			});
		});
		return deferred.promise;
	};

	var convertRow = function (item) {
		return {
			objectId: item.id,
			timestamp: item.timestamp,
			serviceOfferId: item.offerId,
			serviceRequestId: item.requestId,
			text: item.text,
			type: item.type,
			fromUserId: item.fromUserId,
			read: item.read === 'true'
		}
	}

	notifDB.insert = function (notification) {
		// TODO delete very old notifications
		db.transaction(function (tx) {
			tx.executeSql('INSERT INTO notification (id, timestamp, text, type, offerId, requestId, fromUserId, read) VALUES (?,?,?,?,?,?,?,?)', [notification.objectId, new Date().getTime(), notification.text, notification.type, notification.serviceOfferId, notification.serviceRequestId, null, false]);
		});
	};

	notifDB.markAsRead = function (id) {
		db.transaction(function (tx) {
			tx.executeSql('UPDATE notification set read = ? WHERE id = ?', [true, id], function () {
				doRemotely('/notification/' + id + '/read/' + $rootScope.user.objectId);
			});
		});
	};

	notifDB.markAsReadByRequestId = function (requestId) {
		db.transaction(function (tx) {
			tx.executeSql('UPDATE notification set read = ? WHERE requestId = ?', [true, requestId], function () {
				doRemotely('/notification/request/' + requestId + '/read/' + $rootScope.user.objectId);
			});
		});
	};

	notifDB.markAsReadByOfferId = function (offerId) {
		db.transaction(function (tx) {
			tx.executeSql('UPDATE notification set read = ? WHERE offerId = ?', [true, offerId], function () {
				doRemotely('/notification/offer/' + offerId + '/read/' + $rootScope.user.objectId);
			});
		});
	};

	notifDB.remove = function (id) {
		db.transaction(function (tx) {
			tx.executeSql('DELETE from notification WHERE id = ?', [id], function () {
				doRemotely('/notification/' + id + '/hidden/' + $rootScope.user.objectId);
			});
		});
	};

	var doRemotely = function (path) {
		var httpConfWithParams = Config.getHTTPConfig();
		httpConfWithParams.params = {};
		$http.put(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + path, {}, httpConfWithParams);
	}

	return notifDB;
})
