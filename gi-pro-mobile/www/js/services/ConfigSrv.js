angular.module('toga.services.config', [])

.factory('Config', function ($rootScope) {
	var configService = {};

	configService.SERVER_URL = CONF.SERVER_URL;
	configService.APPLICATION_ID = CONF.APPLICATION_ID;
    configService.SENDER_ID = CONF.SENDER_ID;

    var userVarToken = 'toga-app-usertoken-'+configService.APPLICATION_ID;

    var HTTP_CONFIG = {
		timeout: 50000,
		headers: {
			'Content-Type': 'application/json;charset=utf-8'
		}
	};

    configService.getHTTPConfig = function() {
      var conf = angular.copy(HTTP_CONFIG);
      var token = localStorage.getItem(userVarToken);
      if (token != null && token != '' && token != 'null') {
        conf.headers.Authorization = 'Token '+token;
      }
      return conf;
    }

	configService.SERVICE_TYPE = 'sostituzione';

	return configService;
});
