var fs = require('fs');

module.exports = function(geojsonFilename){

	var contents = fs.readFileSync(geojsonFilename, 'utf8');
	var geojsonObject = JSON.parse(contents);
	var coordinates  = geojsonObject.features[0].geometry.coordinates[0];

	this.coordinates = coordinates;
	this.segments = [];
	this.totalDistanceInM = 0;

	//Fill the segments
	for(let i = 0; i < this.coordinates.length -1; i++){
		var startPoint = new Point(this.coordinates[i][0],this.coordinates[i][1]);
		var endPoint = new Point(this.coordinates[i+1][0],this.coordinates[i+1][1]); //No problem, index controlled in loop
		var segment = new Segment(startPoint, endPoint);
		this.totalDistanceInM+=segment.getDistanceInM();
		this.segments.push(segment);
	}



	for(let i = 0; i < 20; i++){
		console.log("[" + i + "] " + this.segments[i].toString());
	}


	this.getPointFromDistanceInM = function(distanceInM){
		var previousDistance = 0;
		for(let i =0; i < this.segments.length; i++){
			var segment = this.segments[i];
			var segmentDistanceInM = segment.getDistanceInM();
			if( (distanceInM >= previousDistance) && (distanceInM <= previousDistance + segmentDistanceInM)){
				//We are in the segment this.segment[i]
				//Return the point, would be the start point plus the remainign distane
				//Yes, I know that I am supossing that earth is flat here, but not in the segment calculation,
				//so at least the result is approximate.
				let distanceInSegment = distanceInM - previousDistance;
				let unitaryLat = (segment.end.lat - segment.start.lat)/segmentDistanceInM;
				let unitaryLong = (segment.end.long - segment.start.long)/segmentDistanceInM;

				return new Point(segment.start.lat + unitaryLat*distanceInSegment, segment.start.long + unitaryLong*distanceInSegment);

			}

			previousDistance+= segmentDistanceInM;

		}
		return undefined; //In case no segment
	}

	


}


function Segment(startPoint,endPoint){
	this.start = startPoint;
	this.end = endPoint;

	this.getDistanceInM = function(){


		return getDistanceFromLatLonInM(this.start.lat,this.start.long,this.end.lat,this.end.long);
	}

	this.toString = function(){
		return "START: (" + startPoint.lat + "," + startPoint.long + "), END: ("  + endPoint.lat + "," + endPoint.long + "), DISTANCE: " + this.getDistanceInM() + " m.";
	}
}

function Point(lat,long){
	this.lat = lat;
	this.long = long;
}


function getDistanceFromLatLonInM(lat1,lon1,lat2,lon2) {


  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d*1000;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}