angular.module('gi-pro.controllers.new', [])

.controller('NewRequestCtrl', function ($scope, $filter, ionicDatePicker, ionicTimePicker, Config, Utils, Prefs, DataSrv, Login) {
    $scope.newRequest = {
        poi: Prefs.lastPOI(),
        date: moment().startOf('date').valueOf(),
        time: 9 * 60 * 60 * 1000 //Utils.roundTime()
    };

    var getSelectedPoi = function (poi) {
        $scope.newRequest.poi = poi;
    };

    $scope.openPoisModal = function () {
        $scope.$parent.openPoisModal(getSelectedPoi);
    };

    var datePickerCfg = {
        setLabel: $filter('translate')('set'),
        todayLabel: $filter('translate')('today'),
        closeLabel: $filter('translate')('close'),
        callback: function (val) {
            $scope.newRequest.date = val;
        }
    };
    $scope.openDatePicker = function () {
        ionicDatePicker.openDatePicker(datePickerCfg);
    };

    $scope.openTimePicker = function (field) {
        //        var epochs = (((new Date()).getHours() * 60) + ((new Date()).getMinutes()));
        //        epochs = Math.floor(epochs / 15) * 15 * 60;
        var epochs = 9 * 60 * 60;
        var timePickerCfg = {
            setLabel: $filter('translate')('set'),
            closeLabel: $filter('translate')('close'),
            step: 15,
            inputTime: epochs,
            callback: function (val) {
                $scope.newRequest.time = val * 1000;
            }
        };

        ionicTimePicker.openTimePicker(timePickerCfg);
    };

    $scope.createNewRequest = function () {
        if ($scope.submitting) return;

        $scope.submitting = true;
        var serviceRequest = {
            poiId: $scope.newRequest.poi.objectId,
            privateRequest: false,
            requesterId: Login.getUser().objectId,
            serviceType: Config.SERVICE_TYPE,
            startTime: $scope.newRequest.date + $scope.newRequest.time,
            customProperties: {},
        };
        Utils.loading();
        DataSrv.createRequestPublic(serviceRequest).then(
            function (data) {
                Utils.loaded();
                $scope.goTo('app.reqAndOffer', {
                    'reload': true,
                    'tab': 0
                }, false, true, true, true);
                Utils.toast($filter('translate')('newrequest_done'));
            }, Utils.commError
        );
    };
})

.controller('NewOfferCtrl', function ($scope, $filter, ionicDatePicker, ionicTimePicker, Config, Utils, Prefs, DataSrv, Login) {
    $scope.newOffer = {
        poi: Prefs.lastPOI(),
        useDateTime: false,
        date: moment().startOf('date').valueOf(),
        fromTime: Utils.roundTime(),
        toTime: Utils.roundTime() + 60 * 60 * 1000
    };

    var getSelectedPoi = function (poi) {
        $scope.newOffer.poi = poi;
    };

    $scope.openPoisModal = function () {
        $scope.$parent.openPoisModal(getSelectedPoi);
    };

    var datePickerCfg = {
        setLabel: $filter('translate')('set'),
        todayLabel: $filter('translate')('today'),
        closeLabel: $filter('translate')('close'),
        callback: function (val) {
            $scope.newOffer.date = val;
        }
    };
    $scope.openDatePicker = function () {
        ionicDatePicker.openDatePicker(datePickerCfg);
    };

    $scope.openTimePicker = function (field) {
        var epochs = (((new Date()).getHours() * 60) + ((new Date()).getMinutes()));
        epochs = Math.floor(epochs / 15) * 15 * 60;
        var timePickerCfg = {
            setLabel: $filter('translate')('set'),
            closeLabel: $filter('translate')('close'),
            step: 15,
            inputTime: epochs,
            callback: function (val) {
                $scope.newOffer[field + 'Time'] = val * 1000;
            }
        };

        ionicTimePicker.openTimePicker(timePickerCfg);
    };

    var unregisterNewOfferWatch = $scope.$watch('newOffer', function (newOffer, offer) {
        if (!!newOffer.poi) {
            if (newOffer.useDateTime && (!newOffer.date || !newOffer.fromTime || !newOffer.toTime || (newOffer.fromTime > newOffer.toTime))) {
                $scope.isFormValid = false;
            } else {
                $scope.isFormValid = true;
            }
        } else {
            $scope.isFormValid = false;
        }
    }, true);

    $scope.createNewOffer = function () {
        var serviceOffer = {
            serviceType: Config.SERVICE_TYPE,
            poiId: $scope.newOffer.poi.objectId,
            professionalId: Login.getUser().objectId
        };

        if ($scope.newOffer.useDateTime) {
            serviceOffer.startTime = $scope.newOffer.date + $scope.newOffer.fromTime;
            serviceOffer.endTime = $scope.newOffer.date + $scope.newOffer.toTime;
        }

        Utils.loading();
        DataSrv.createOffer(serviceOffer).then(
            function (data) {
                Utils.loaded();
                unregisterNewOfferWatch();
                $scope.goTo('app.reqAndOffer', {
                    'reload': true,
                    'tab': 1
                }, false, true, true, true);
                Utils.toast($filter('translate')('newoffer_done'));
            },
            Utils.commError
        );
    };

});
