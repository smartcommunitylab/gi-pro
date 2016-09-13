angular.module('toga.services.config', [])

.factory('Config', function () {
	var configService = {};

	configService.SERVER_URL = CONF.SERVER_URL;
	configService.APPLICATION_ID = CONF.APPLICATION_ID;

	var HTTP_CONFIG = {
		timeout: 5000,
		headers: {
			'Content-Type': 'application/json;charset=utf-8'
		}
	};

    configService.getHTTPConfig = function() {
      return angular.copy(HTTP_CONFIG);
    }

	configService.SERVICE_TYPE = 'sostituzione';

	// FIXME dev purpose only
	configService.PROFESSIONAL_ID_1 = 'AVV_01';
	configService.PROFESSIONAL_ID_2 = 'AVV_02';

	return configService;
});
