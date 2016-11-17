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
  })
  .directive('placeautocomplete', function ($timeout) {
    var index = -1;

    return {
      restrict: 'E',
      scope: {
        searchParam: '=ngModel',
        suggestions: '=data',
        onType: '=onType',
        onSelect: '=onSelect',
        placeautocompleteRequired: '='
      },
      controller: [
            '$scope',
            function ($scope) {
          // the index of the suggestions that's currently selected
          $scope.selectedIndex = -1;

          $scope.initLock = true;

          // set new index
          $scope.setIndex = function (i) {
            $scope.selectedIndex = parseInt(i);
          };

          this.setIndex = function (i) {
            $scope.setIndex(i);
            $scope.$apply();
          };

          $scope.getIndex = function (i) {
            return $scope.selectedIndex;
          };

          $scope.clear = function () {
            $scope.searchParam = '';
          };

          // watches if the parameter filter should be changed
          var watching = true;

          // autocompleting drop down on/off
          $scope.completing = false;

          // starts autocompleting on typing in something
          $scope.$watch('searchParam', function (newValue, oldValue) {
            if (oldValue === newValue || (!oldValue && $scope.initLock)) {
              return;
            }

            if (watching && typeof $scope.searchParam !== 'undefined' && $scope.searchParam !== null) {
              $scope.completing = true;
              $scope.searchFilter = $scope.searchParam;
              $scope.selectedIndex = -1;
            }

            // function thats passed to on-type attribute gets executed
            if ($scope.onType) {
              // ignore short input
              if (newValue.length < 4) {
                return;
              }
              // wait 500ms before making a call
              if ($scope.to != null) {
                $timeout.cancel($scope.to);
              }
              $scope.to = $timeout(function () {
                $scope.to = null;
                $scope.onType(newValue);
              }, 500);
            }
          });

          // for hovering over suggestions
          this.preSelect = function (suggestion) {
            watching = false;

            // this line determines if it is shown
            // in the input field before it's selected:
            //$scope.searchParam = suggestion;

            $scope.$apply();
            watching = true;
          };

          $scope.preSelect = this.preSelect;

          this.preSelectOff = function () {
            watching = true;
          };

          $scope.preSelectOff = this.preSelectOff;

          // selecting a suggestion with RIGHT ARROW or ENTER
          $scope.select = function (suggestion) {
            if (suggestion) {
              $scope.searchParam = suggestion;
              $scope.searchFilter = suggestion;
              if ($scope.onSelect)
                $scope.onSelect(suggestion);
            }
            watching = false;
            $scope.completing = false;
            setTimeout(function () {
              watching = true;
            }, 1000);
            $scope.setIndex(-1);
          };
            }
        ],
      link: function (scope, element, attrs) {
        setTimeout(function () {
          scope.initLock = false;
          scope.$apply();
        }, 250);

        var attr = '';

        // Default atts
        scope.attrs = {
          "placeholder": "start typing...",
          "class": "",
          "id": "",
          "inputclass": "",
          "inputid": ""
        };

        for (var a in attrs) {
          attr = a.replace('attr', '').toLowerCase();
          // add attribute overriding defaults
          // and preventing duplication
          if (a.indexOf('attr') === 0) {
            scope.attrs[attr] = attrs[a];
          }
        }

        if (attrs.clickActivation) {
          element[0].onclick = function (e) {
            if (!scope.searchParam) {
              setTimeout(function () {
                scope.completing = true;
                scope.$apply();
              }, 200);
            }
          };
        }

        var key = {
          left: 37,
          up: 38,
          right: 39,
          down: 40,
          enter: 13,
          esc: 27,
          tab: 9
        };

        document.addEventListener("keydown", function (e) {
          var keycode = e.keyCode || e.which;

          switch (keycode) {
          case key.esc:
            // disable suggestions on escape
            scope.select();
            scope.setIndex(-1);
            scope.$apply();
            e.preventDefault();
          }
        }, true);

        document.addEventListener("blur", function (e) {
          // disable suggestions on blur
          // we do a timeout to prevent hiding it before a click event is registered
          setTimeout(function () {
            scope.select();
            scope.setIndex(-1);
            scope.$apply();
          }, 150);
        }, true);

        element[0].addEventListener("keydown", function (e) {
          var keycode = e.keyCode || e.which;

          var l = angular.element(this).find('li').length;

          // this allows submitting forms by pressing Enter in the autocompleted field
          if (!scope.completing || l == 0) return;

          // implementation of the up and down movement in the list of suggestions
          switch (keycode) {
          case key.up:
            index = scope.getIndex() - 1;
            if (index < -1) {
              index = l - 1;
            } else if (index >= l) {
              index = -1;
              scope.setIndex(index);
              scope.preSelectOff();
              break;
            }
            scope.setIndex(index);

            if (index !== -1)
              scope.preSelect(angular.element(angular.element(this).find('li')[index]).text());

            scope.$apply();

            break;
          case key.down:
            index = scope.getIndex() + 1;
            if (index < -1) {
              index = l - 1;
            } else if (index >= l) {
              index = -1;
              scope.setIndex(index);
              scope.preSelectOff();
              scope.$apply();
              break;
            }
            scope.setIndex(index);

            if (index !== -1) {
              scope.preSelect(angular.element(angular.element(this).find('li')[index]).text());
            }

            break;
          case key.left:
            break;
          case key.right:
          case key.enter:
          case key.tab:
            index = scope.getIndex();
            // scope.preSelectOff();
            if (index !== -1) {
              scope.select(angular.element(angular.element(this).find('li')[index]).text());
              if (keycode == key.enter) {
                e.preventDefault();
              }
            } else {
              if (keycode == key.enter) {
                scope.select();
              }
            }
            scope.setIndex(-1);
            scope.$apply();

            break;
          case key.esc:
            // disable suggestions on escape
            scope.select();
            scope.setIndex(-1);
            scope.$apply();
            e.preventDefault();
            break;
          default:
            return;
          }
        });
      },
      template: '\
        <div class="placeautocomplete {{ attrs.class }}" ng-class="{ notempty: (searchParam.length > 0) }" id="{{ attrs.id }}">\
          <input\
            type="text" ng-trim="false"\
            ng-model="searchParam"\
            placeholder="{{ attrs.placeholder }}"\
            class="placeautocomplete-input {{ attrs.inputclass }}"\
            id="{{ attrs.inputid }}"\
            ng-required="{{ placeautocompleteRequired }}" />\
            <a ng-if="searchParam.length > 0" class="placeautocomplete-input-clear" ng-click="clear()"><i class="icon ion-android-cancel"></i></a>\
          <ul ng-show="completing && (suggestions).length > 0">\
            <li\
              suggestion\
              ng-repeat="suggestion in suggestions track by $index"\
              index="{{ $index }}"\
              val="{{ suggestion }}"\
              class="suggestion"\
              ng-class="{ active: ($index === selectedIndex) }"\
              ng-click="select(suggestion)"\
              ng-bind-html="suggestion | highlight:searchParam"></li>\
          </ul>\
        </div>'
    };
  })
  .filter('highlight', ['$sce', function ($sce) {
    return function (input, searchParam) {
      if (typeof input === 'function') return '';
      if (searchParam) {
        var words = '(' +
          searchParam.split(/\ /).join(' |') + '|' +
          searchParam.split(/\ /).join('|') +
          ')',
          exp = new RegExp(words, 'gi');
        if (words.length) {
          input = input.replace(exp, "<span class=\"highlight\">$1</span>");
        }
      }
      return $sce.trustAsHtml(input);
    };
}]);
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
