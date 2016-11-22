angular.module('gi-pro.controllers.login', [])

.controller('LoginCtrl', function ($scope, $state, $ionicHistory, $ionicPopup, $filter, Utils, Config, Login) {
  $scope.user = {};
  $scope.validityPassword = false;

  $scope.login = function () {
    Utils.loading();
    /*
    if (!!$scope.user.email) {
      $scope.user.cf = $scope.user.cf.toUpperCase();
    }
    */

    Login.login($scope.user.email, $scope.user.password).then(function () {
      $ionicHistory.nextViewOptions({
        historyRoot: true,
        disableBack: true
      });
      $state.go('app.serviceAndProf');
    }, function () {
      $ionicPopup.alert({
        title: $filter('translate')('error_popup_title'),
        template: $filter('translate')('error_signin')
      });
    }).finally(Utils.loaded);
  }

  $scope.reset = function () {
    window.open(Config.SERVER_URL + '/reset', '_system', 'location=no,toolbar=no');
  };

  $scope.register = function () {
    //window.open(Config.SERVER_URL + '/register', '_system', 'location=no,toolbar=no');
    $scope.goTo('app.registration1');
  };
})

.controller('RegistrationFirstCtrl', function ($scope, $rootScope, $state, $ionicHistory, $ionicPopup, $filter, $window, Utils, Config, Login) {
  $scope.registration = {};

  $scope.openPrivacyLink = function () {
    $window.open($rootScope.privacyLink(), '_system', 'location=yes');
    return false;
  };

  $scope.cancel = function () {
    $ionicHistory.goBack();
  };

  $scope.goToStep2 = function () {
    if (!$scope.registration.pec) {
      Utils.toast($filter('translate')('register_form_cf_empty'));
      return;
    }

    if (!$scope.registration.password) {
      Utils.toast($filter('translate')('register_form_cf_empty'));
      return;
    }

    $scope.goTo('app.registration2', {
      'obj': $scope.registration
    });
  };
})

.controller('RegistrationSecondCtrl', function ($scope, $rootScope, $state, $stateParams, $ionicHistory, $ionicPopup, $filter, $window, Utils, Config, DataSrv, Login) {
  $scope.professions = null;
  $scope.areas = null;
  $scope.registration = {};

  if ($stateParams.obj) {
    $scope.registration = $stateParams.obj;
  };

  DataSrv.getProfessionsDefinition().then(function (professions) {
    $scope.professions = professions;
    $scope.selectedProfession = null;
    /*
    $scope.selectedProfession = $filter('filter')($scope.professions, {
      id: $scope.professions[0].id
    })[0];
    */
  });

  DataSrv.getZonesDefinition().then(function (areas) {
    $scope.areas = areas;
    $scope.selectedArea = null;
    /*
    $scope.selectedArea = $filter('filter')($scope.areas, {
      id: $scope.areas[0].id
    })[0];
    */
  });

  $scope.openSelectProfessionPopup = function () {
    var selectProfessionPopup = $ionicPopup.alert({
      scope: $scope,
      title: $filter('translate')('profession_popup_placeholder'),
      templateUrl: 'templates/popup_professions.html',
      buttons: [{
        text: $filter('translate')('cancel'),
        type: 'button-default',
        onTap: function (e) {
          // will stop the popup from closing when tapped.
          //e.preventDefault()
        }
      }]
    });

    $scope.selectProfession = function (profession) {
      $scope.selectedProfession = profession;
      $scope.registration.type = profession.id;
      selectProfessionPopup.close();
    }
  }

  $scope.openSelectAreaPopup = function () {
    var selectAreaPopup = $ionicPopup.alert({
      scope: $scope,
      title: $filter('translate')('area_popup_placeholder'),
      templateUrl: 'templates/popup_areas.html',
      buttons: [{
        text: $filter('translate')('cancel'),
        type: 'button-default',
        onTap: function (e) {
          // will stop the popup from closing when tapped.
          //e.preventDefault()
        }
      }]
    });

    $scope.selectArea = function (area) {
      $scope.selectedArea = area;
      $scope.registration.area = area.id;
      selectAreaPopup.close();
    }
  }

  $scope.register = function () {
    if (!$scope.registration.name) {
      Utils.toast($filter('translate')('register_form_name_empty'));
      return;
    }

    if (!$scope.registration.surname) {
      Utils.toast($filter('translate')('register_form_surname_empty'));
      return;
    }

    if (!$scope.registration.address) {
      Utils.toast($filter('translate')('register_form_address_empty'));
      return;
    }

    if (!$scope.selectedProfession || !$scope.registration.type) {
      Utils.toast($filter('translate')('register_form_profession_empty'));
      return;
    }

    if (!$scope.selectedArea) {
      Utils.toast($filter('translate')('register_form_area_empty'));
      return;
    }

    if (!$scope.registration.cf && !$scope.registration.piva) {
      Utils.toast($filter('translate')('register_form_cf_empty'));
      return;
    }
    /*
    else if (!Utils.checkFiscalCode($scope.registration.cf)) {
      Utils.toast($filter('translate')('register_form_cf_invalid'));
      return;
    } else if (!$scope.registration.pwd || !$scope.registration.pwdagain) {
      Utils.toast($filter('translate')('register_form_pwd_empty'));
      return;
    } else if ($scope.registration.pwd != $scope.registration.pwdagain) {
      Utils.toast($filter('translate')('register_form_pwd_different'));
      return;
    }
    */

    if ($scope.registration.cf) {
      $scope.registration.cf = $scope.registration.cf.toUpperCase();
    }

    //console.log($scope.registration);

    Utils.loading();

    Login.register($scope.registration).then(
      function () {
        Utils.toast($filter('translate')('register_done'));
        $scope.goTo('app.login', {}, false, true, true);
      },
      Utils.commError
    ).finally(Utils.loaded);
  }

  $scope.cancel = function () {
    $ionicHistory.goBack();
  };
});
