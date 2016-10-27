angular.module('gi-pro.controllers.serviceandprof', [])

.controller('ServiceAndProfCtrl', function ($scope, $rootScope, $stateParams, DataSrv, Utils, Login) {
    $scope.services = null;
    $scope.professionists = null;

    var reload = function () {
        if (!Login.userIsLogged()) {
            //show tutorial
        }

        Utils.loading();
        //get Professionist
        DataSrv.getProfessionists().then(
            function (professtionists) {
                $scope.professionists = professtionists;
                if (Login.userIsLogged()) {
                    DataSrv.getServices().then(
                        function (services) {
                            $scope.services = services;
                            Utils.loaded();
                        },
                        Utils.commError);
                } else {
                    Utils.loaded();
                }
            },
            Utils.commError);
        //if Login.userIsLogged() load services

    };

    if (!$stateParams.reload) {
        // prevent double load (WHY?!?!?)
        reload();
    }

    $scope.$on('$ionicView.enter', function (event, args) {
        var params = DataSrv.internalCache['app.serviceAndProf'] || {};
        if (!!params.reload) {
            reload();
        }

        if (!!params.tab) {
            $ionicTabsDelegate.select(params.tab);
        }
        DataSrv.internalCache['app.serviceAndProf'] = null;
    });

});
