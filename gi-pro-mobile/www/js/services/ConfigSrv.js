angular.module('toga.services.config', [])

.factory('Config', function ($rootScope) {
	var configService = {};

	configService.SERVER_URL = CONF.SERVER_URL;
	configService.APPLICATION_ID = CONF.APPLICATION_ID;
	configService.SENDER_ID = CONF.SENDER_ID;

	var HTTP_CONFIG = {
		timeout: 50000,
		headers: {
			'Content-Type': 'application/json;charset=utf-8'
		}
	};

	configService.getHTTPConfig = function () {
		var conf = angular.copy(HTTP_CONFIG);
		var token = localStorage.getItem(configService.getUserVarToken());
		if (token != null && token != '' && token != 'null') {
			conf.headers.Authorization = 'Token ' + token;
		}
		return conf;
	}

	configService.getUserVarToken = function () {
		return 'toga-app-usertoken-' + configService.APPLICATION_ID;
	}
	configService.getUserVar = function () {
		return 'toga-app-user-' + configService.APPLICATION_ID;
	}
	configService.getUserNotificationsDownloaded = function () {
		return 'toga-app-notifications-downloaded-' + configService.APPLICATION_ID;
	}

	configService.SERVICE_TYPE = 'sostituzione';

	$rootScope.generateImageUrl = function (relUrl) {
		return configService.SERVER_URL + '/image/' + configService.APPLICATION_ID + relUrl + '?token=' + localStorage.getItem(configService.getUserVarToken());
		//+ '&ts=' + new Date().getTime()
	};

	return configService;
});
