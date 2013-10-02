var app = angular.module("plunker",['$strap.directives']);
app.controller("TypeaheadCtrl", function($scope,$http) {
	$scope.typeahead = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Dakota","North Carolina","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];
	var api = [];
	api[0] = "http://pre.dev.goeuro.de:12345/api/v1/suggest/position/en/name/";
	api[1] = "http://localhost:3000/api/v1/suggest/position/en/name/"
	api[2] = "http://gd.geobytes.com/AutoCompleteCity?callback=JSON_CALLBACK&q=";
	api[3] = "http://api.geonames.org/postalCodeSearchJSON?maxRows=10&username=demo&placename=";
	api[4] = "https://maps.googleapis.com/maps/api/geocode/json?sensor=false&language=en&components=political&address=";
	api[5] = "https://localhost:3000/maps/api/geocode/json?sensor=false&region=de&language=en&components=political&address=";

	if (typeof(Number.prototype.toRad) === "undefined") {
	  Number.prototype.toRad = function() {
	    return this * Math.PI / 180;
	  }
	}

	curPos = navigator.geolocation.getCurrentPosition(function(a,b,c){
		$scope.curPos= a.coords
	},function(a){
		console.log('Only on hosting',a);
		$scope.curPos = {};
		$scope.curPos.latitude = 50;
		$scope.curPos.longitude = 41;
	});
	
	$scope.getGEO = function(query,callback){
		$.getJSON(api[4] + query).
			done(function (response, err) {
				
					var result = $.map(response.results, function(el){
						var dist = distance($scope.curPos.latitude,$scope.curPos.longitude,el.geometry.location.lat,el.geometry.location.lng);
						return {name:el.formatted_address,distance:dist};
					}).sort(function(a,b){
						return a.distance-b.distance;
					}).map(function(el){
						return el.name;	
					});
					
					callback(result);
			});
	}

	$scope.CityCollection=[];
	$scope.CitysByQuery='';

	detailInfo = function(query,cb,condition){
		$.getJSON(api[4] + query).
			done(function (response, err) {
				var result = $.map(response.results, function(el){
						var dist = distance($scope.curPos.latitude,$scope.curPos.longitude,el.geometry.location.lat,el.geometry.location.lng);
						return {name:el.formatted_address, distance:dist, geo: el.geometry.location};
					}).sort(function(a,b){
						return a.distance-b.distance;
					});

				$scope.CityCollection.push(result[0]);			
				if($scope.CityCollection.length == condition){
					cb($scope.CityCollection);
				}
			})
	}

	distance = function(lat1,lon1,lat2,lon2) {
     	var R = 6371; // km
		var dLat = (lat2-lat1).toRad();
		var dLon = (lon2-lon1).toRad();
		var lat1 = lat1.toRad();
		var lat2 = lat2.toRad();

		var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		return Math.floor(R * c);
    }

	$scope.cities = function(cityName,callback) {	   
		var result=["asd","fgH"];
		$http.jsonp(api[2]+cityName).
			success( function(response, status){
				
				var tempCallback = function(tempResponse){
					console.log('Handled',tempResponse.length);
					var onlyCityName =tempResponse.sort(function(a,b){
							return a.distance-b.distance;
						});
					$scope.CitysByQuery = onlyCityName;
					onlyCityName=$.map(onlyCityName,function(el){
							if (el) {
								return el.name+' '+el.distance+'km.'
							}
						});
					callback(onlyCityName);
					
				};

				if(response.length>0){
					$scope.CityCollection=[]; console.log(response.length,response.join("///"))
					$.each(response,function(el){
						detailInfo(response[el], tempCallback, response.length);
					})
										
				}
	    		
    	}).error(function(status, response){
    		console.log(status,response);
    	});
		return	    	result;
	    	
  	};
	
});