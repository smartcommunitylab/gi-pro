angular.module('gi-pro.directives', [])
  .directive('searchBar', [function () {
    return {
      scope: {
        ngModel: '='
      },
      require: ['^ionNavBar', '?ngModel'],
      restrict: 'E',
      replace: true,
      template: '<div class="searchBar">' +
        '<div class="searchTxt" ng-show="ngModel.show">' +
        '<div class="bgdiv"></div>' +
        '<div class="bgtxt">' +
        '<input type="text" placeholder="Nome..." ng-model="ngModel.txt">' +
        '</div>' +
        '</div>' +
        '<i class="icon placeholder-icon" ng-click="ngModel.txt=\'\';ngModel.show=!ngModel.show"></i>' +
        '</div>',

      compile: function (element, attrs) {
        var icon = attrs.icon || (ionic.Platform.isAndroid() && 'ion-android-search') || (ionic.Platform.isIOS() && 'ion-ios7-search') || 'ion-search';
        angular.element(element[0].querySelector('.icon')).addClass(icon);

        return function ($scope, $element, $attrs, ctrls) {
          var navBarCtrl = ctrls[0];
          $scope.navElement = $attrs.side === 'right' ? navBarCtrl.rightButtonsElement : navBarCtrl.leftButtonsElement;

        };
      },
      controller: ['$scope', '$ionicNavBarDelegate', function ($scope, $ionicNavBarDelegate) {
        var title, definedClass;
        $scope.$watch('ngModel.show', function (showing, oldVal, scope) {
          if (showing !== oldVal) {
            if (showing) {
              if (!definedClass) {
                var numicons = $scope.navElement.children().length;
                angular.element($scope.navElement[0].querySelector('.searchBar')).addClass('numicons' + numicons);
              }

              title = $ionicNavBarDelegate.getTitle();
              $ionicNavBarDelegate.setTitle('');
            } else {
              $ionicNavBarDelegate.setTitle(title);
            }
          } else if (!title) {
            title = $ionicNavBarDelegate.getTitle();
          }
        });
		}]
    };
}])
  .directive('pwCheck', function () {
    return {
      require: 'ngModel',
      link: function (scope, elem, attrs, ctrl) {
        var me = attrs.ngModel;
        var matchTo = attrs.pwCheck;
        //console.log(ctrl.constructor.prototype)
        scope.$watchGroup([me, matchTo], function (value) {
          ctrl.$setValidity('pwmatch', value[0] === value[1]);
        });
      }
    }
  });
//  .directive('pwCheck', [function () {
//    return {
//      require: 'ngModel',
//      link: function (scope, elem, attrs, ctrl) {
//
//        var me = attrs.ngModel;
//        var matchTo = attrs.pwCheck;
//        //console.log(ctrl.constructor.prototype)
//        scope.$watchGroup([me, matchTo], function (value) {
//          ctrl.$setValidity('validityPassword', value[0] === value[1]);
//        });
//
//      }
//    }
//  }]);