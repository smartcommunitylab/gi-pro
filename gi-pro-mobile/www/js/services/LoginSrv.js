angular.module('toga.services.login', [])

.factory('Login', function ($rootScope, $http, $q, Utils, Config) {
    var loginService = {};

    var userVarName = 'toga-app-user-'+Config.APPLICATION_ID;

  	/* Login call */
	loginService.login = function (cf, pwd) {
		var deferred = $q.defer();

        var httpConfWithParams = Config.getHTTPConfig();
		httpConfWithParams.params = {cf: cf, password: pwd};

		$http.post(Config.SERVER_URL + '/login/' + Config.APPLICATION_ID, {}, httpConfWithParams)

		.then(
			function (response) {
                var user = response.data;
                if (!user || !user.objectId) {
                  loginService.logout();
                  deferred.reject(reason);
                  return;
                }
                localStorage.setItem(userVarName, JSON.stringify(user));
                $rootScope.user = user;
				deferred.resolve(user);
			},
			function (reason) {
                loginService.logout();
				deferred.reject(reason);
			}
		);

		return deferred.promise;
	};

    loginService.getUser = function() {
      if ($rootScope.user == null) {
        $rootScope.user = JSON.parse(localStorage.getItem(userVarName));
      }
      return $rootScope.user;
    }

    loginService.updateUser = function() {
      var deferred = $q.defer();
      var httpConfWithParams = Config.getHTTPConfig();
      $http.get(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/profile', httpConfWithParams)
      .then(function(response) {
          var user = response.data;
          if (!user || !user.objectId) {
            deferred.reject(loginService.USER_ERRORS.NO_CONNECTION);
            return;
          }
          localStorage.setItem(userVarName, JSON.stringify(user));
          $rootScope.user = user;
          deferred.resolve(user);
      }, function(reason) {
        if (reason.status == 401 || reason.status == 403) {
          deferred.reject(loginService.USER_ERRORS.NO_USER);
        } else {
          deferred.reject(loginService.USER_ERRORS.NO_CONNECTION);
        }
      })
      return deferred.promise;
    }

    loginService.USER_ERRORS = {
      NO_CONNECTION : 1,
      NO_USER: 2
    };

    loginService.logout = function() {
      localStorage.setItem(userVarName, null);
      $rootScope.user = null;
    }

    return loginService;
})
