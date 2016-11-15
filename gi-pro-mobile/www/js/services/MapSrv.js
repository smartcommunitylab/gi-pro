angular.module('gi-pro.services.mapservice', [])

.factory('mapService', function ($q, $http, $ionicPlatform, $filter, $timeout, leafletData, GeoLocate) {
  var cachedMap = {};
  var mapService = {};
  var myLocation = {};


  mapService.getMap = function (mapId) {
    var deferred = $q.defer();

    if (cachedMap[mapId] == null) {
      mapService.initMap(mapId).then(function () {
        deferred.resolve(cachedMap[mapId]);
      });
    } else {
      deferred.resolve(cachedMap[mapId]);
    }

    return deferred.promise;
  }

  mapService.setMyLocation = function (myNewLocation) {
    myLocation = myNewLocation
  };
  mapService.getMyLocation = function () {
    return myLocation;
  };

  //init map with tile server provider and show my position
  mapService.initMap = function (mapId) {
    var deferred = $q.defer();
    leafletData.getMap(mapId).then(function (map) {
        cachedMap[mapId] = map;
        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          type: 'map',
          attribution: '',
          maxZoom: 18
        }).addTo(map);
        $ionicPlatform.ready(function () {
          GeoLocate.locate().then(function (e) {
            var myPos = L.marker(L.latLng(e[0], e[1])).addTo(map);
            cachedMap[mapId].myPos = myPos;
          });
        });
        deferred.resolve(map);
      },
      function (error) {
        console.log('error creation');
        deferred.reject(error);
      });
    return deferred.promise;
  }
  mapService.setMyLocationMessage = function (mapId, message) {
    //        var deferred = $q.defer();
    mapService.getMap(mapId).then(function (map) {
      var customPopup = "<b>" + message + "</b>";
      map.myPos.bindPopup(customPopup).openPopup();
      map.myPos.openPopup();


    });


  }
  mapService.centerOnMe = function (mapId, zoom) {
    leafletData.getMap(mapId).then(function (map) {
      GeoLocate.locate().then(function (e) {
        $timeout(function () {
          map.setView(L.latLng(e[0], e[1]), zoom);
        });
      });
    });

  };

  mapService.getProfessionalsPoints = function (listOfProfessional) {
    var returnPoints = [];
    if (listOfProfessional) {
      for (i = 0; i < listOfProfessional.length; i++) {
        if (listOfProfessional[i].coordinates) {
          returnPoints.push({
            lat: listOfProfessional[i].location.lat,
            lng: listOfProfessional[i].location.long,
            message: '<div><button class="button" ui-sref="app.profdetails({objectId: \'' + listOfProfessional[i].objectId + '\'})">' + listOfProfessional[i].name + '</button> </div>',
            icon: {
              //                            iconUrl: url,
              iconSize: [36, 50],
              iconAnchor: [18, 50],
              popupAnchor: [-0, -50]
            },
            //                        focus: true
          })

          var bound = [listOfProfessional[i].location.lat, listOfProfessional[i].location.lon];
        }
      }
    }
    return returnPoints;
  }


  mapService.getServicesPoints = function (listOfServices) {
    var returnPoints = [];
    if (listOfServices) {
      for (i = 0; i < listOfServices.length; i++) {
        if (listOfServices[i].coordinates) {
          returnPoints.push({
            lat: listOfServices[i].coordinates[0],
            lng: listOfServices[i].coordinates[1],
            message: '<div><button class="button" ui-sref="app.servicedetails({objectId: \'' + listOfServices[i].objectId + '\'})">' + listOfServices[i].service + '</button> </div>',
            icon: {
              //                            iconUrl: url,
              iconSize: [36, 50],
              iconAnchor: [18, 50],
              popupAnchor: [-0, -50]
            },
            //                        focus: true
          })

          var bound = [listOfServices[i].coordinates[0], listOfServices[i].coordinates[1]];
        };
      }
    }
    return returnPoints;
  }

  mapService.refresh = function (mapId) {
    this.getMap(mapId).then(function (map) {
      map.invalidateSize();
    })
  };

  return mapService;
})
