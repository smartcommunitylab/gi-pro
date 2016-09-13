angular.module('toga.controllers.login', [])

.controller('LoginCtrl', function ($scope, $state, $ionicHistory, $ionicPopup, $filter, Utils, Config, Login) {
  $scope.user = {};

  $scope.login = function() {
    Utils.loading();
    Login.login($scope.user.cf, $scope.user.pwd).then(function(){
      $ionicHistory.nextViewOptions({
        historyRoot: true,
        disableBack: true
      });
      $state.go('app.home');
    }, function(){
      $ionicPopup.alert({
        title: $filter('translate')('error_popup_title'),
        template: $filter('translate')('error_signin')
      });
    }).finally(Utils.loaded);
  }

  $scope.reset = function() {
    window.open(Config.SERVER_URL + '/reset', '_system', 'location=no,toolbar=no')
  }
  $scope.register = function() {
    window.open(Config.SERVER_URL + '/register', '_system', 'location=no,toolbar=no')
  }
});
