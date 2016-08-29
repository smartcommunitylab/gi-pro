# tocati.web
----------
## REST API methods
----------
#### Header
  - **Content-Type** = 'application/json;charset=utf-8'
  - **X-ACCESS-TOKEN** = 'token'

### User Profile 
```
  GET /api/users/{ownerId}/{userId}
```

#### Result - UsedData
```
    {
	"ownerId": "DEMO",
	"objectId": "899f1eaf-7d7a-4f62-ac9f-ac99e131da11",
	"creationDate": 1469632767395,
	"lastUpdate": 1469632909029,
	"userId": "mic",
	"name": "michele",
	"surname": "nori",
	"displayName": "micnori",
	"points": 177,
	"checkinList": [
		{
			"timestamp": 1469632874438,
			"poi": {...}
		}
	]
    }
```

### User login 
```
  POST /api/users/{ownerId}/{userId}/login
```
#### Body
    {
        "name": "michele",
    	"surname": "nori",
    	"displayName": "micnori"
    }
    
#### Result - UserData


### ChargingPoint Search
```
  GET /api/chargingPoints/{ownerId}
```

#### Params
  - **position**: string, optional, "lng,lat"
  - **radius**: double, optional, search radius in KM

#### Result - List<ChargingPoint>
```
[
  {
    "ownerId": "DEMO",
    "objectId": "cp1",
    "creationDate": 1469705192874,
    "lastUpdate": 1469705192874,
    "name": "trento",
    "description": "test",
    "imageUrl": "http://...",
    "poiList": [
      "poi1",
      "poi2"
    ],
    "coordinates": [
      11.121940612792967,
      46.061320531569244
    ]
  },...
]
```


### Get Pois by ChargingPoint
```
  GET /api/chargingPoints/{ownerId}/{pointId}/pois
```

#### Result - List<Poi>
```
[
{
    "ownerId": "DEMO",
    "objectId": "poi2",
    "creationDate": 1471941625035,
    "lastUpdate": 1471941625035,
    "name": "Duo Varbondei & Sorelle Brizzi",
    "description": "Ballabili ‘900 – Tra le stelle le musiche da ballo dei vecchi film",
    "address": "Lungadige San Giorgio",
    "imageUrl": "https://tocati.it/2016/app/wp-content/uploads/cinema-22-seppia-480x500.jpeg",
    "category": "AVVENIMENTI",
    "when": [
      {
        "date": 1474063200000,
        "slots": [
          {
            "from": "21:00",
            "to": "22:30"
          }
        ]
      }
    ],
    "points": 54,
    "coordinates": [
      10.9957524,
      45.4487674
    ]
  },...
]
```


### User checkin
```
  GET /api/chargingPoints/{ownerId}/{userId}/{pointId}/pois/{poiId}/checkin
```

#### Result - UserData


### User Ranking
```
  GET /api/classification/{ownerId}/{userId}
```

#### Params
  - **start**: integer, optional, starting page (default = 1)
  - **count**: integer, optional, max items per page (default = 10)

#### Result - MyRanking
```
{
  "position": 1,
  "points": 177,
  "ranking": [
    {
      "data": {
        "ownerId": "DEMO",
        "objectId": "899f1eaf-7d7a-4f62-ac9f-ac99e131da11",
        "creationDate": 1469632767395,
        "lastUpdate": 1469632909029,
        "userId": "mic",
        "name": "michele",
        "surname": "nori",
        "displayName": "micnori",
        "checkinList": [
          {
            "timestamp": 1469632874438,
            "poi": {...}
          },
          {
            "timestamp": 1469632909029,
            "poi": {...}
          }
        ],
        "points": 177
      },
      "position": 1,
      "points": 177
    },...
  ]
}
```
		
