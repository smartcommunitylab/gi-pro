angular.module('toga.services.push', [])

.factory('PushSrv', function ($rootScope, $ionicPlatform, $http, $q, Utils, Config, NotifDB) {
  var pushService = {};
  var push = null;

  var register = function(data){
		var httpConfWithParams = Config.getHTTPConfig();
		httpConfWithParams.params = {};

		// registrationId is required
		if (!data || !data.registrationId) {
			console.error('Invalid push registrationId');
            return;
		}
        httpConfWithParams.params['registrationId'] = data.registrationId;


		$http.post(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/pushregister', {}, httpConfWithParams)

		.then(
			function (response) {
			console.log('push registration ok');
			},
			function (reason) {
              console.error('push  registration failed', reason);
			}
		);
  };
  var notification = function(data){
    console.log('push data', data);
    // in foreground save data to DB and call the UI function if defined in current scope
    if (data.additionalData.foreground) {
      NotifDB.insert(data.additionalData);
      if ($rootScope.updateUIWithNotification) {
        $rootScope.updateUIWithNotification(data.additionalData);
      }
    } else {
      NotifDB.getById(data.additionalData['content.objectId']).then(function(n){
        console.log('found', n);
        // first call, do only insertion
        if (n == null) {
          NotifDB.insert(data.additionalData);
        // second call, open the link
        } else {

        }
      }, function(err) {
        console.error('Error reading from DB', err);
      });
    }
  };

  pushService.init = function() {
    $ionicPlatform.ready(function () {
      try {
        var plugin = PushNotification;
      } catch(e) {
        return;
      }
      if (!PushNotification) return;
      push = PushNotification.init({
          android: {
              senderID: Config.SENDER_ID
          },
          ios: {
              alert: true,
              badge: true,
              sound: true,
              senderID: Config.SENDER_ID
          },
          windows: {}
      });

      push.on('registration', register);
      push.on('notification', notification);
    });

  };

  pushService.unreg = function() {
    push.unregister();
  }

  return pushService;
})


.factory('NotifDB', function ($rootScope, $ionicPlatform, $http, $q, Utils, Config) {
  var db = window.openDatabase('togadb', '1.0', 'togadb', 2 * 1024 * 1024);
  db.transaction(function (tx) {
   tx.executeSql('CREATE TABLE IF NOT EXISTS notification (id unique, timestamp, text, type, offerId, requestId, fromUserId, read)');
  });

  var notifDB = {};

  notifDB.getById = function(id) {
    var deferred = $q.defer();
    db.transaction(function (tx) {
       tx.executeSql('SELECT * FROM notification WHERE id = ?', [id], function (tx, results) {
         if (results.rows && results.rows.length >= 1) {
           deferred.resolve({
             objectId: results.rows.item(0).id,
             timestamp: results.rows.item(0).timestamp,
             serviceOfferId: results.rows.item(0).offerId,
             serviceRequestId: results.rows.item(0).requestId,
             text: results.rows.item(0).text,
             type: results.rows.item(0).type,
             fromUserId: results.rows.item(0).fromUserId,
             read: results.rows.item(0).read
           });
         } else {
           deferred.resolve(null);
         }
       }, function() {
         deferred.reject();
       });
    });
    return deferred.promise;
  }

  notifDB.insert = function(notification) {
    db.transaction(function (tx) {
       tx.executeSql('INSERT INTO notification (id, timestamp, text, type, offerId, requestId, fromUserId, read) VALUES (?,?,?,?,?,?,?,?)',
                     [notification['content.messageId'], new Date().getTime(), notification.description, notification['content.type'], notification['content.offerId'], notification['content.requestId'], null, false]);
    });
  }
  notifDB.markAsRead = function(id) {
    db.transaction(function (tx) {
       tx.executeSql('UPDATE notification set read = ? WHERE id = ?', [true, id]);
    });
  }
  notifDB.remove = function(id) {
    db.transaction(function (tx) {
       tx.executeSql('DELETE from notification WHERE id = ?', [id]);
    });
  }

  return notifDB;
})
