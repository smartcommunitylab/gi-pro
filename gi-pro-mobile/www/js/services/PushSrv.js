/* global ionic, localStorage, PushNotification */
angular.module('gi-pro.services.push', [])

  .factory('PushSrv', function ($rootScope, $ionicPlatform, $http, $q, $state, Utils, Config, NotifDB, DataSrv) {
    var pushService = {}
    var push = null

    var fgListener

    var register = function (data) {
      var httpConfWithParams = Config.getHTTPConfig()
      httpConfWithParams.params = {}

      // registrationId is required
      if (!data || !data.registrationId) {
        console.error('Invalid push registrationId')
        return
      }

      localStorage.setItem(Config.getUserRegId(), data.registrationId)

      httpConfWithParams.params['registrationId'] = data.registrationId
      httpConfWithParams.params['platform'] = ionic.Platform.platform()

      $http.post(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/pushregister', {}, httpConfWithParams).then(
        function (response) {
          console.log('push registration ok: ', response)
        },
        function (reason) {
          console.error('push registration failed', reason)
        }
      )
    }

    var notification = function (data) {
      console.log('push data', data)
      var n = toNotification(data.additionalData)

      // in foreground save data to DB and call the UI function if defined in current scope
      if (data.additionalData.foreground) {
        NotifDB.insert(n)
        $rootScope.updateUnreadCount()

        DataSrv.internalCache['app.requests'] = {
          'reload': true
        }

        /*
        if (fgListener) {
          fgListener(n);
        }
        */
      } else {
        NotifDB.getById(n.objectId).then(function (nDB) {
          console.log('found', nDB)
          // first call, do only insertion
          if (!nDB) {
            NotifDB.insert(n)
            $rootScope.updateUnreadCount()
            // second call, open the link
            $state.go('app.notifications')
          } else {
            $rootScope.openNotificationDetails(nDB)
          }
        }, function (err) {
          console.error('Error reading from DB', err)
        })
      }

      push.finish(function () {
        console.log('processing of push data is finished')
      })
    }

    var toNotification = function (notification) {
      var n = {}
      n.objectId = notification['content.messageId']
      n.timestamp = new Date().getTime()
      n.text = notification.description
      n.type = notification['content.type']
      n.serviceOfferId = notification['content.offerId']
      n.serviceRequestId = notification['content.requestId']
      return n
    }

    pushService.init = function () {
      $ionicPlatform.ready(function () {
        try {
          if (PushNotification) {
            console.log('PushNotification exists')
          }
        } catch (error) {
          return
        }

        push = PushNotification.init({
          android: {
            senderID: Config.SENDER_ID,
            icon: 'notification',
            iconColor: '#1f6ca5',
            forceShow: true
          },
          ios: {
            alert: true,
            badge: true,
            sound: true,
            senderID: Config.SENDER_ID,
            forceShow: true
            // gcmSandbox: true
          },
          windows: {}
        })

        push.on('registration', register)
        push.on('notification', notification)
        push.on('error', function (e) {
          console.log(e.message)
        })
      })
    }

    pushService.unreg = function () {
      if (push) {
        push.unregister(function () {
          console.log('unregistered')
          var httpConfWithParams = Config.getHTTPConfig()
          httpConfWithParams.params = {}

          var regId = localStorage.getItem(Config.getUserRegId())

          // registrationId is required
          if (!regId) {
            console.error('Invalid push registrationId')
            return
          }

          httpConfWithParams.params['registrationId'] = regId

          $http.post(Config.SERVER_URL + '/api/' + Config.APPLICATION_ID + '/pushunregister', {}, httpConfWithParams).then(
            function (response) {
              console.log('push unregistration ok')
            },
            function (reason) {
              console.error('push  unregistration failed', reason)
            }
          )
        })
      }
    }


    pushService.fgOn = function (listener) {
      fgListener = listener
    }

    pushService.fgOf = function () {
      fgListener = null
    }


    return pushService
  })
