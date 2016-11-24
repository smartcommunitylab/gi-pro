angular.module('gi-pro.services.utils', [])

.factory('Utils', function ($rootScope, $filter, $window, $timeout, $ionicLoading, $ionicPopup, $cordovaToast) {
  var utilsService = {};

  utilsService.roundDecimalPlaces = function (num, decimalPlaces) {
    // default: 1 decimal places
    decimalPlaces = !decimalPlaces ? 1 : decimalPlaces;
    return Math.round(num * 10 * decimalPlaces) / (10 * decimalPlaces);
  };

  utilsService.checkFiscalCode = function (cf) {
    var re = /^[A-Za-z]{6}[0-9]{2}[A-Za-z]{1}[0-9]{2}[A-Za-z]{1}[0-9]{3}[A-Za-z]{1}$/;
    return re.test(cf);
  };

  utilsService.getLang = function () {
    var browserLanguage = '';
    // works for earlier version of Android (2.3.x)
    var androidLang;
    if ($window.navigator && $window.navigator.userAgent && (androidLang = $window.navigator.userAgent.match(/android.*\W(\w\w)-(\w\w)\W/i))) {
      browserLanguage = androidLang[1];
    } else {
      // works for iOS, Android 4.x and other devices
      browserLanguage = $window.navigator.userLanguage || $window.navigator.language;
    }

    var lang = browserLanguage.substring(0, 2);
    if (lang != 'it' && lang != 'en' && lang != 'de') {
      lang = 'en'
    };

    return lang;
  };

  utilsService.getLanguage = function () {
    navigator.globalization.getLocaleName(
      function (locale) {
        alert('locale: ' + locale.value + '\n');
      },
      function () {
        alert('Error getting locale\n');
      }
    );
  };

  utilsService.isOnline = function () {
    if (navigator && navigator.connection) {
      return (navigator.connection.type !== Connection.NONE);
    }
    return true;
  }

  utilsService.commError = function (error) {
    utilsService.loaded();
    if (utilsService.isOnline()) {
      utilsService.toast($filter('translate')('ERR_SERVER'));
    } else {
      utilsService.toast($filter('translate')('ERR_NETWORK'));
    }
  };


  utilsService.toast = function (message, duration, position) {
    message = message || 'There was a problem...';
    duration = duration || 'short';
    position = position || 'bottom';

    if (!!$window.cordova) {
      // Use the Cordova Toast plugin
      $cordovaToast.show(message, duration, position);
    } else {
      if (duration == 'short') {
        duration = 2000;
      } else {
        duration = 5000;
      }

      var myPopup = $ionicPopup.show({
        template: '<div class="toast">' + message + '</div>',
        scope: $rootScope,
        buttons: []
      });

      $timeout(function () {
        myPopup.close();
      }, duration);
    }
  };

  utilsService.compare = function (obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  };

  utilsService.isUrlValid = function (url) {
    var res = url.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    if (res == null) {
      return false;
    } else {
      return true;
    }
  };

  utilsService.loading = function () {
    $ionicLoading.show();
  };

  utilsService.loaded = function () {
    $timeout($ionicLoading.hide);
  };

  utilsService.roundTime = function () {
    var epochs = (((new Date()).getHours() * 60) + ((new Date()).getMinutes()));
    epochs = Math.floor(epochs / 15) * 15 * 60;
    return epochs * 1000;
  }

  utilsService.resizeElement = function (diff) {
    var height = $window.innerHeight - diff
    return {
      'height': height + 'px'
    }
  }

  return utilsService;
})

.factory('Prefs', function ($rootScope, $filter, $window, $timeout, $ionicLoading, $ionicPopup, $cordovaToast, Config) {
  var prefService = {};

  var varPrefix = function (pref) {
    return 'toga-app-' + pref + '-' + Config.APPLICATION_ID;
  };

  prefService.lastPOI = function (poi) {
    if (poi) {
      localStorage.setItem(varPrefix('poi'), JSON.stringify(poi));
    }
    return JSON.parse(localStorage.getItem(varPrefix('poi')) || "null");
  };

  return prefService;
});
