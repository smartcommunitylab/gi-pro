angular.module('gi-pro.controllers.serviceandprof', [])

.controller('ServiceAndProfCtrl', function ($scope, $rootScope, $stateParams, DataSrv, Utils, Login) {
    $scope.services = null;
    $scope.professionals = null;
    $scope.zones = null;
    $scope.selectingFilter = false;
    $scope.selectingServices = false;
    $scope.selectingZones = false;
    $scope.selectingProfession = false;

    $scope.filters = {
        selectedService: {
            id: "1",
            name: "a"
        },
        selectedProfession: {
            id: "2",
            name: "b"
        },
        selectedZone: {
            id: "3",
            name: "c"
        }
    };

    var reload = function () {
        if (!Login.userIsLogged()) {
            //show tutorial
        }

        Utils.loading();
        //get Professionist
        DataSrv.getProfessionals().then(
            function (professionals) {
                if (professionals) {
                    $scope.professionals = professionals;
                }
                //                get zones
                DataSrv.getZones().then(function (zones) {
                        $scope.zones = zones;
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
            },
            Utils.commError);
        //if Login.userIsLogged() load services

    };

    if (!$stateParams.reload) {
        // prevent double load (WHY?!?!?)
        reload();
    }
    $scope.openFilters = function (type) {
        $scope.selectingFilter = true;
        if (type === 'service') {
            $scope.selectingServices = true;
        }
        if (type === 'zone') {
            $scope.selectingZones = true;
        }
        if (type === 'profession') {
            $scope.selectingProfession = true;
        }
    }

    $scope.selectFilter = function (type, selection) {
        $scope.selectingFilter = false;
        $scope.selectingServices = false;
        $scope.selectingZones = false;
        $scope.selectingProfession = false;

        if (type === 'service') {
            //            $scope.filters.selectedService =
        }
        if (type === 'zone') {}
        if (type === 'profession') {}
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
