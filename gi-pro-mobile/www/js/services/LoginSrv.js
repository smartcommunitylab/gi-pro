angular.module('gi-pro.services.login', [])

.factory('Login', function ($rootScope, $http, $q, Utils, Config, PushSrv) {
  var loginService = {};

  var userVarName = Config.getUserVar();
  var userVarToken = Config.getUserVarToken();
  $rootScope.logged = (localStorage.getItem(userVarToken) == null) ? false : true;

  /* Login call */
  loginService.login = function (pec, password) {
    var deferred = $q.defer();

    var httpConfWithParams = Config.getHTTPConfig();
    httpConfWithParams.params = {
      pec: pec,
      password: password
    };

    $http.post(Config.SERVER_URL + '/login/' + Config.APPLICATION_ID, {}, httpConfWithParams).then(
      function (response) {
        var user = response.data;
        if (!user || !user.objectId) {
          loginService.logout();
          deferred.reject(loginService.USER_ERRORS.NO_CONNECTION);
          return;
        }
        localStorage.setItem(userVarName, JSON.stringify(user));
        localStorage.setItem(userVarToken, user.passwordHash);
        $rootScope.user = user;
        $rootScope.logged = true;
        PushSrv.init();
        deferred.resolve(user);
      },
      function (reason) {
        loginService.logout();
        if (reason.data && reason.data.errorType == 'NotRegisteredException') {
          deferred.reject(loginService.USER_ERRORS.NO_USER);
        } else if (reason.data && reason.data.errorType == 'NotVerifiedException') {
          deferred.reject(loginService.USER_ERRORS.NOT_VERIFIED);
        } else if (reason.data && reason.data.errorType == 'UnauthorizedException') {
          deferred.reject(loginService.USER_ERRORS.INVALID_CREDENTIALS);
        } else {
          $rootScope.logged = false;
          deferred.reject(loginService.USER_ERRORS.NO_CONNECTION);
        }
      }
    );

    return deferred.promise;
  };

  loginService.getUser = function () {
    if ($rootScope.user == null) {
      var user = JSON.parse(localStorage.getItem(userVarName));
      if (user != null && user.objectId != null) {
        $rootScope.user = user;
        $rootScope.logged = true;
      } else {
        $rootScope.logged = false;
      }
    }
    return $rootScope.user;
  }

  loginService.updateUser = function (skipRegistration) {
    var deferred = $q.defer();
    var httpConfWithParams = Config.getHTTPConfig();
    $http.get(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/profile', httpConfWithParams)
      .then(function (response) {
        var user = response.data;
        if (!user || !user.objectId) {
          deferred.reject(loginService.USER_ERRORS.NO_CONNECTION);
          return;
        }
        localStorage.setItem(userVarName, JSON.stringify(user));
        $rootScope.user = user;
        if (!skipRegistration) PushSrv.init();
        deferred.resolve(user);
      }, function (reason) {
        if (reason.status == 401 || reason.status == 403) {
          deferred.reject(loginService.USER_ERRORS.NO_USER);
        } else {
          deferred.reject(loginService.USER_ERRORS.NO_CONNECTION);
        }
      })
    return deferred.promise;
  }

  loginService.USER_ERRORS = {
    NO_CONNECTION: 1,
    NO_USER: 2,
    NOT_VERIFIED: 3,
    INVALID_CREDENTIALS: 4
  };

  loginService.logout = function () {
    localStorage.clear();
    $rootScope.user = null;
    PushSrv.unreg();
  }

  loginService.updateUser = function (skipRegistration) {
    var deferred = $q.defer();
    var httpConfWithParams = Config.getHTTPConfig();
    $http.get(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/profile', httpConfWithParams)
      .then(function (response) {
        var user = response.data;
        if (!user || !user.objectId) {
          deferred.reject(loginService.USER_ERRORS.NO_CONNECTION);
          return;
        }
        localStorage.setItem(userVarName, JSON.stringify(user));
        $rootScope.user = user;
        $rootScope.logged = true;
        if (!skipRegistration) PushSrv.init();
        deferred.resolve(user);
      }, function (reason) {
        if (reason.status == 401 || reason.status == 403) {
          deferred.reject(loginService.USER_ERRORS.NO_USER);
        } else {
          deferred.reject(loginService.USER_ERRORS.NO_CONNECTION);
        }
      })
    return deferred.promise;
  }

  loginService.USER_ERRORS = {
    NO_CONNECTION: 1,
    NO_USER: 2
  };

  loginService.logout = function () {
    localStorage.setItem(userVarName, null);
    localStorage.setItem(userVarToken, null);
    localStorage.setItem(Config.getUserNotificationsDownloaded(), null);
    $rootScope.user = null;
    $rootScope.logged = false;
    PushSrv.unreg();
  }
  loginService.userIsLogged = function () {
    return $rootScope.logged;
  }
  loginService.checkUser = function (user) {
    return !!user.phone;
  }

  loginService.register = function (profile) {
    var deferred = $q.defer();

    $http({
      method: 'POST',
      url: Config.SERVER_URL + '/register/' + Config.APPLICATION_ID + '/rest',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      /*
      transformRequest: function (obj) {
        var str = [];
        for (var p in obj) {
          str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
        }
        return str.join('&');
      },
      */
      data: {
        "pec": profile.pec,
        "password": profile.password,
        "name": profile.name,
        "surname": profile.surname,
        "address": profile.address,
        "type": profile.type,
        "area": profile.area,
        "cf": profile.cf,
        "piva": profile.piva,
        //cellPhone: cell || "",
        lang: Utils.getLang()
      }
    }).then(
      function (response) {
        deferred.resolve(response.data);
      },
      function (reason) {
        if (reason.data && reason.data.errorType == 'UnauthorizedException') {
          deferred.reject(loginService.USER_ERRORS.INVALID_CREDENTIALS);
        } else {
          deferred.reject(loginService.USER_ERRORS.NO_CONNECTION);
        }
      }
    );

    return deferred.promise;
  };

  return loginService;
})
