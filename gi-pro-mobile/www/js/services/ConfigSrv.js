angular.module('toga.services.config', [])

.factory('Config', function () {
	var configService = {};

	configService.SERVER_URL = CONF.SERVER_URL;
	configService.APPLICATION_ID = CONF.APPLICATION_ID;

	var HTTP_CONFIG = {
		timeout: 50000,
		headers: {
			'Content-Type': 'application/json;charset=utf-8'
		}
	};

    configService.getHTTPConfig = function() {
      return angular.copy(HTTP_CONFIG);
    }

	configService.SERVICE_TYPE = 'sostituzione';

	return configService;
});
