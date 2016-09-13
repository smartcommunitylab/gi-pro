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
      return JSON.parse(localStorage.getItem(userVarName));
    }

    loginService.logout = function() {
      localStorage.setItem(userVarName, null);
      $rootScope.user = null;
    }

    return loginService;
})
