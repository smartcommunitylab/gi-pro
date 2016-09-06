angular.module('toga.services.config', [])

.factory('Config', function () {
	var configService = {};

	configService.SERVER_URL = CONF.SERVER_URL;
	configService.APPLICATION_ID = CONF.APPLICATION_ID;

	configService.HTTP_CONFIG = {
		timeout: 5000,
		headers: {
			'Content-Type': 'application/json;charset=utf-8'
		}
	};

	return configService;
});
