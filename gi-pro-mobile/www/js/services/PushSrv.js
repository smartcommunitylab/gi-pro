angular.module('toga.services.push', [])

.factory('PushSrv', function ($rootScope, $ionicPlatform, $http, $q, Utils, Config) {
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
