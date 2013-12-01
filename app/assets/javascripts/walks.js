// Global Variables
var directionsService = new google.maps.DirectionsService();
var streetView = new google.maps.StreetViewService();
var walkMap;
var markerArray;
var instructionsArray;
var panorama;
var bearings = [];
var markerHandles =[];
var lastSelectedMarker =0;
var currentIndex =0;
var currentMarker =0;
var octopus = 'http://icons.iconarchive.com/icons/charlotte-schmidt/zootetragonoides-4/32/Poulpo-icon.png';
var chicken = 'http://icons.iconarchive.com/icons/charlotte-schmidt/zootetragonoides-2/32/polenta-icon.png';
var starfish = 'http://icons.iconarchive.com/icons/charlotte-schmidt/zootetragonoides-4/48/Pico-icon.png';

// Initialize map and displays, then calls mapRoute function
function initialize(){
  directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true, polylineOptions: {strokeColor: '#464646'}});
  var toronto = new google.maps.LatLng(43.652527, -79.381961);
  var mapOptions={
    zoom: 10,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: toronto
  }
  var walkMapStyles = [
  {
    "featureType": "landscape.natural",
    "elementType": "geometry",
    "stylers": [
      { "color": "#efeee4" }
    ]
  },{
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      { "color": "#f0652f" },
      { "weight": 1.2 }
    ]
  },{
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      { "color": "#f0652f" }
    ]
  },{
    "featureType": "road.local",
    "elementType": "geometry",
    "stylers": [
      { "color": "#689aca" }
    ]
  },{
    "featureType": "water",
    "stylers": [
      { "color": "#464646" }
    ]
  },{
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      { "color": "#b8b4c1" }
    ]
  },{
    "elementType": "labels.text.stroke",
    "stylers": [
      { "weight": 3.7 }
    ]
  }
];
  walkMap = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  walkMap.setOptions({styles: walkMapStyles});
  panorama = new google.maps.StreetViewPanorama(document.getElementById("pano"));
  directionsDisplay.setMap(walkMap);
  directionsDisplay.setPanel(document.getElementById('directions_box'));
  mapRoute();
}; //function initialize

// mapRoute is called by function initialize, makes request for directions, then calls makeMarkerArray function to add markers
function mapRoute(){
  var request ={
    origin: walk_start,
    destination: walk_end,
    travelMode: google.maps.DirectionsTravelMode.WALKING
  };
  directionsService.route(request, function(response, status){
    if (status == google.maps.DirectionsStatus.OK){
      directionsDisplay.setDirections(response);
      $('#walk_show').append('<h3> Start (star): ' + response.routes[0].legs[0].start_address + '</br>End: ' + response.routes[0].legs[0].end_address + '</br>Click on an octopus to see the street view</h3>');
      makeMarkerArray(response);
    }
  }); //directionsService.route
}; //function mapRoute

//For each step, plot markers along polyline.  Push each marker to markerArray after start_location, and then follow all markers by end_location
function makeMarkerArray (directionResult){
  var routeData = directionResult.routes[0].legs[0];
  markerArray = [];
  instructionsArray = []
  markerArray.push(routeData.steps[0].start_location);
  instructionsArray.push(routeData.steps[0].instructions);
  for (i = 0; i< routeData.steps.length-1; i++) {
    var pathw = routeData.steps[i].path;
    var markerSpacing = 200;
    var stepArray = new google.maps.Polyline({
         path: pathw,
         strokeColor: "#464646",
         strokeOpacity: 0.8,
         strokeWeight: 2
    });
    var thisStepMarkerArray = stepArray.GetPointsAtDistance(markerSpacing);
    var thisStepInstructions = routeData.steps[i].instructions;
      if (thisStepMarkerArray.length>0) {
        for (j=0; j<thisStepMarkerArray.length; j++) {
        markerArray.push(thisStepMarkerArray[j]);
        instructionsArray.push(thisStepInstructions);
        }
      }
      else {
        markerArray.push(routeData.steps[i].end_location);
        instructionsArray.push(routeData.steps[i+1].instructions);
      }
  } //for loop

  plotMarkers(markerArray);
}; //function makeMarkerArray

//Plot markers on map and set bearing at each marker using getBearing (which uses convertToRad).  If the last marker, use same bearing as the previous marker
function plotMarkers (markerArray){

  for (var i = 0; i < markerArray.length; i++){
    if (i==0) {
      var marker = new google.maps.Marker({
        position: markerArray[i],
        map: walkMap,
        icon: starfish
      }); //Marker
    }
    else {
      marker = new google.maps.Marker({
        position: markerArray[i],
        map: walkMap,
        icon: octopus
      });
    }
    // set bearing at each marker.  If the last marker, use same bearing as the previous marker.
    marker.myIndex = i;
    markerHandles.push(marker);
    if (i < markerArray.length-2){
      var thisLatLng = markerArray[i];
      var nextLatLng = markerArray[i+1];
      bearings[i] = getBearing(thisLatLng.lat(), thisLatLng.lng(), nextLatLng.lat(), nextLatLng.lng());
    }
    // If last marker, set bearing in same direction as penultimate marker
    else {
      bearings[i] = bearings[i-1];
    }
  }; //for loop
// Show streetview at first marker, and corresponding directions
  streetView.getPanoramaByLocation(markerArray[0], 50, showStreetView);
  panorama.setPov({ heading: bearings[0], pitch: 0});
  panorama.setVisible(true);
  markerHandles[0].setIcon(chicken);
  lastSelectedMarker = markerHandles[0];
  $('#directions_box').empty();
  $('#directions_box').append('<h3>Directions:</h3></br><h3>' + instructionsArray[0] + '</h3>');
}; //function plotMarkers


// showStreetView is called by function plotMarkers, renders streetview in "pano" div
function showStreetView(data, status){
  if (status == google.maps.StreetViewStatus.OK){
    var markerPanoID = data.location.pano;
    panorama.setPano(markerPanoID);
  }

  else {alert('Sorry, no views are currently available for this location.');}
}; //function showStreetView

// getBearing is called by function plotMarkers, calculates direction to next marker, in order to orient streetview point-of-view in direction of the walk
function getBearing(lt1, ln1, lt2, ln2) {
  var lat1 = convertToRad(lt1);
  var lon1 = convertToRad(ln1);
  var lat2 = convertToRad(lt2);
  var lon2 = convertToRad(ln2);
  var angle = - Math.atan2( Math.sin( lon1 - lon2 ) * Math.cos( lat2 ), Math.cos( lat1 ) * Math.sin( lat2 ) - Math.sin( lat1 ) * Math.cos( lat2 ) * Math.cos( lon1 - lon2 ) );
  if ( angle < 0.0 ) angle  += Math.PI * 2.0;
  angle = angle * 180.0 / Math.PI;
  return parseFloat(angle.toFixed(1));
}; //function getBearing

// convertToRad is called by function getBearing, converts degrees to radians, used for bearing calculation
function convertToRad(Value){
  return Value * Math.PI/180;
} //function convertToRad

// Add event listeners for window load and resize
google.maps.event.addDomListener(window, 'load', initialize);
google.maps.event.addDomListener (window, "resize", function(event){
  center = walkMap.getCenter();
  google.maps.event.trigger(walkMap, "resize");
  google.maps.event.trigger(panorama, "resize");
  walkMap.setCenter(center);
  console.log('resized');
});