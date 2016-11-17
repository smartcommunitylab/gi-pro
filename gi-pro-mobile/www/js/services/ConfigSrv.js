angular.module('gi-pro.services.config', [])

.factory('Config', function ($rootScope, $ionicLoading) {
  var configService = {};

  configService.SERVER_URL = CONF.SERVER_URL;
  configService.APPLICATION_ID = CONF.APPLICATION_ID;
  configService.SENDER_ID = CONF.SENDER_ID;
  configService.MAP_POSITION = CONF.MAP_POSITION;
  configService.PAGE_PROFESSIONAL = 10;
  configService.PAGE_SERVICES = 10;
  configService.DISTANCE_AUTOCOMPLETE = '25';
  configService.PROBLEMLINK = "mailto:tecnotoga@smartcommunitylab.it?subject=TECNOTOGA:%20segnalazione%20problema";
  configService.HELPLINK = "http://www.consiglionazionaleforense.it/web/cnf/tecnotoga/";
  configService.PRIVACYLINK = "http://www.consiglionazionaleforense.it/web/cnf/tecnotoga/";
  configService.GEOCODER_URL = 'https://os.smartcommunitylab.it/core.geocoder/spring';
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

  configService.getToken = function () {
    var token = localStorage.getItem(configService.getUserVarToken());
    if (token != null && token != '' && token != 'null') {
      return 'Token ' + token;
    }
    return null;
  }

  $rootScope.generateImageUrl = function (relUrl, update) {
    if (!relUrl) {
      return 'img/userph.png';
    }

    var res = configService.SERVER_URL + '/image/' + configService.APPLICATION_ID + relUrl + '?token=' + localStorage.getItem(configService.getUserVarToken());
    if (update) res += '&ts=' + new Date().getTime();
    return res;
  };
  configService.getMapPosition = function () {
    return configService.MAP_POSITION;
  }
  configService.getUserVarToken = function () {
    return 'gi-pro-app-usertoken-' + configService.APPLICATION_ID;
  }
  configService.getUserVar = function () {
    return 'gi-pro-app-user-' + configService.APPLICATION_ID;
  }
  configService.getUserVarProfileCheck = function () {
    return 'gi-pro-app-profilecheck-' + configService.APPLICATION_ID;
  }
  configService.getUserNotificationsDownloaded = function () {
    return 'gi-pro-app-notifications-downloaded-' + configService.APPLICATION_ID;
  }
  configService.getUserRegId = function () {
    return 'gi-pro-app-regid-' + configService.APPLICATION_ID;
  }
  configService.loaded = function () {
    $ionicLoading.hide();
  }
  configService.getGeocoderURL = function () {
      return configService.GEOCODER_URL;
    },
    configService.getGeocoderConf = function () {
      return {
        timeout: 5000,
        headers: {
          appId: undefined
        }
      };
    };
  configService.SERVICE_TYPE = 'sostituzione';
  configService.getDistanceForAutocomplete = function () {
    return configService.DISTANCE_AUTOCOMPLETE;
  }
  $rootScope.problemLink = function () {
    return configService.PROBLEMLINK;
  };
  $rootScope.privacyLink = function () {
    return configService.PRIVACYLINK;
  };
  $rootScope.helpLink = function () {
    window.open(configService.HELPLINK, '_system', 'location=yes');
  };
  configService.getPageProfessional = function () {
    return configService.PAGE_PROFESSIONAL;
  }
  configService.getPageServices = function () {
    return configService.PAGE_SERVICES;
  }
  return configService;
});
