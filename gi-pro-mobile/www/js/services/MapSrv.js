/* global angular, L */
angular.module('gi-pro.services.mapservice', [])
  .factory('mapService', function ($q, $http, $ionicPlatform, $filter, $timeout, leafletData, GeoLocate) {
    var cachedMap = {}
    var mapService = {}
    var myLocation = {}

    /* get a map, init it if not exists */
    mapService.getMap = function (mapId) {
      var deferred = $q.defer()

      if (cachedMap[mapId] == null) {
        mapService.initMap(mapId).then(function () {
          deferred.resolve(cachedMap[mapId])
        })
      } else {
        deferred.resolve(cachedMap[mapId])
      }

      return deferred.promise
    }

    /* set my location on the map */
    mapService.setMyLocation = function (myNewLocation) {
      myLocation = myNewLocation
    }

    /* get my location */
    mapService.getMyLocation = function () {
      return myLocation
    }

    /* init map with tile server provider and show my position */
    mapService.initMap = function (mapId) {
      var deferred = $q.defer()
      leafletData.getMap(mapId).then(
        function (map) {
          cachedMap[mapId] = map
          L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            type: 'map',
            attribution: '',
            maxZoom: 18
          }).addTo(map)

          $ionicPlatform.ready(function () {
            GeoLocate.locate().then(function (e) {
              var myPos = L.marker(L.latLng(e[0], e[1]))
              // .addTo(map)
              cachedMap[mapId].myPos = myPos
            })
          })

          deferred.resolve(map)
        },
        function (error) {
          console.log('error creation')
          deferred.reject(error)
        })
      return deferred.promise
    }

    /*
    mapService.setMyLocationMessage = function (mapId, message) {
      // var deferred = $q.defer()
      mapService.getMap(mapId).then(function (map) {
        var customPopup = '<b>' + message + '</b>'
        p.myPos.bindPopup(customPopup).openPopup()
        map.myPos.openPopup()
      })
    }
    */

    /* center on my position */
    mapService.centerOnMe = function (mapId, zoom) {
      leafletData.getMap(mapId).then(function (map) {
        GeoLocate.locate().then(function (e) {
          $timeout(function () {
            map.setView(L.latLng(e[0], e[1]), zoom)
          })
        })
      })
    }

    /* extract coordinates from list (professionals/services?) and generate points */
    mapService.getPoints = function (list) {
      var points = []
      if (list) {
        for (var i = 0; i < list.length; i++) {
          if (list[i].coordinates) {
            /*
            message: '<div><button class="button" ui-sref="' + state + '({objectId: \'' +
              list[i].objectId + '\'})">' +
              list[i].name + '</button> </div>',
            */
            var point = {
              // message: '',
              lat: list[i].coordinates[0],
              lng: list[i].coordinates[1],
              icon: {
                // iconUrl: url,
                iconSize: [36, 50],
                iconAnchor: [18, 50],
                popupAnchor: [-0, -50]
              },
              object: list[i]
            }
            points.push(point)
            // var bound = [list[i].location.lat, list[i].location.lon]
          }
        }
      }
      return points
    }

    mapService.refresh = function (mapId) {
      this.getMap(mapId).then(function (map) {
        map.invalidateSize()
      })
    }

    return mapService
  })
