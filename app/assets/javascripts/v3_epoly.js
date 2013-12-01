
google.maps.LatLng.prototype.distanceFrom = function(newLatLng) {
  var EarthRadiusMeters = 6378137.0; // meters
  var lat1 = this.lat();
  var lon1 = this.lng();
  var lat2 = newLatLng.lat();
  var lon2 = newLatLng.lng();
  var dLat = (lat2-lat1) * Math.PI / 180;
  var dLon = (lon2-lon1) * Math.PI / 180;
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = EarthRadiusMeters * c;
  return d;
}

google.maps.LatLng.prototype.latRadians = function() {
  return this.lat() * Math.PI/180;
}

google.maps.LatLng.prototype.lngRadians = function() {
  return this.lng() * Math.PI/180;
}

// === A method for testing if a point is inside a polygon
// === Returns true if poly contains point
// === Algorithm shamelessly stolen from http://alienryderflex.com/polygon/
google.maps.Polygon.prototype.Contains = function(point) {
  var j=0;
  var oddNodes = false;
  var x = point.lng();
  var y = point.lat();
  for (var i=0; i < this.getPath().getLength(); i++) {
    j++;
    if (j == this.getPath().getLength()) {j = 0;}
    if (((this.getPath().getAt(i).lat() < y) && (this.getPath().getAt(j).lat() >= y))
    || ((this.getPath().getAt(j).lat() < y) && (this.getPath().getAt(i).lat() >= y))) {
      if ( this.getPath().getAt(i).lng() + (y - this.getPath().getAt(i).lat())
      /  (this.getPath().getAt(j).lat()-this.getPath().getAt(i).lat())
      *  (this.getPath().getAt(j).lng() - this.getPath().getAt(i).lng())<x ) {
        oddNodes = !oddNodes
      }
    }
  }
  return oddNodes;
}

// === A method which returns the approximate area of a non-intersecting polygon in square metres ===
// === It doesn't fully account for spherical geometry, so will be inaccurate for large polygons ===
// === The polygon must not intersect itself ===
google.maps.Polygon.prototype.Area = function() {
  var a = 0;
  var j = 0;
  var b = this.Bounds();
  var x0 = b.getSouthWest().lng();
  var y0 = b.getSouthWest().lat();
  for (var i=0; i < this.getPath().getLength(); i++) {
    j++;
    if (j == this.getPath().getLength()) {j = 0;}
    var x1 = this.getPath().getAt(i).distanceFrom(new google.maps.LatLng(this.getPath().getAt(i).lat(),x0));
    var x2 = this.getPath().getAt(j).distanceFrom(new google.maps.LatLng(this.getPath().getAt(j).lat(),x0));
    var y1 = this.getPath().getAt(i).distanceFrom(new google.maps.LatLng(y0,this.getPath().getAt(i).lng()));
    var y2 = this.getPath().getAt(j).distanceFrom(new google.maps.LatLng(y0,this.getPath().getAt(j).lng()));
    a += x1*y2 - x2*y1;
  }
  return Math.abs(a * 0.5);
}

// === A method which returns the length of a path in metres ===
google.maps.Polygon.prototype.Distance = function() {
  var dist = 0;
  for (var i=1; i < this.getPath().getLength(); i++) {
    dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i-1));
  }
  return dist;
}

// === A method which returns the bounds as a GLatLngBounds ===
google.maps.Polygon.prototype.Bounds = function() {
  var bounds = new google.maps.LatLngBounds();
  for (var i=0; i < this.getPath().getLength(); i++) {
    bounds.extend(this.getPath().getAt(i));
  }
  return bounds;
}

// === A method which returns a GLatLng of a point a given distance along the path ===
// === Returns null if the path is shorter than the specified distance ===
google.maps.Polygon.prototype.GetPointAtDistance = function(metres) {
  // some awkward special cases
  if (metres == 0) return this.getPath().getAt(0);
  if (metres < 0) return null;
  if (this.getPath().getLength() < 2) return null;
  var dist=0;
  var olddist=0;
  for (var i=1; (i < this.getPath().getLength() && dist < metres); i++) {
    olddist = dist;
    dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i-1));
  }
  if (dist < metres) {
    return null;
  }
  var p1= this.getPath().getAt(i-2);
  var p2= this.getPath().getAt(i-1);
  var m = (metres-olddist)/(dist-olddist);
  return new google.maps.LatLng( p1.lat() + (p2.lat()-p1.lat())*m, p1.lng() + (p2.lng()-p1.lng())*m);
}

// === A method which returns an array of GLatLngs of points a given interval along the path ===
google.maps.Polygon.prototype.GetPointsAtDistance = function(metres) {
  var next = metres;
  var points = [];
  // some awkward special cases
  if (metres <= 0) return points;
  var dist=0;
  var olddist=0;
  for (var i=1; (i < this.getPath().getLength()); i++) {
    olddist = dist;
    dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i-1));
    while (dist > next) {
      var p1= this.getPath().getAt(i-1);
      var p2= this.getPath().getAt(i);
      var m = (next-olddist)/(dist-olddist);
      points.push(new google.maps.LatLng( p1.lat() + (p2.lat()-p1.lat())*m, p1.lng() + (p2.lng()-p1.lng())*m));
      next += metres;
    }
  }
  return points;
}

// === A method which returns the Vertex number at a given distance along the path ===
// === Returns null if the path is shorter than the specified distance ===
google.maps.Polygon.prototype.GetIndexAtDistance = function(metres) {
  // some awkward special cases
  if (metres == 0) return this.getPath().getAt(0);
  if (metres < 0) return null;
  var dist=0;
  var olddist=0;
  for (var i=1; (i < this.getPath().getLength() && dist < metres); i++) {
    olddist = dist;
    dist += this.getPath().getAt(i).distanceFrom(this.getPath().getAt(i-1));
  }
  if (dist < metres) {return null;}
  return i;
}

// === A function which returns the bearing between two vertices in decgrees from 0 to 360===
// === If v1 is null, it returns the bearing between the first and last vertex ===
// === If v1 is present but v2 is null, returns the bearing from v1 to the next vertex ===
// === If either vertex is out of range, returns void ===
google.maps.Polygon.prototype.Bearing = function(v1,v2) {
  if (v1 == null) {
    v1 = 0;
    v2 = this.getPath().getLength()-1;
  } else if (v2 ==  null) {
    v2 = v1+1;
  }
  if ((v1 < 0) || (v1 >= this.getPath().getLength()) || (v2 < 0) || (v2 >= this.getPath().getLength())) {
    return;
  }
  var from = this.getPath().getAt(v1);
  var to = this.getPath().getAt(v2);
  if (from.equals(to)) {
    return 0;
  }
  var lat1 = from.latRadians();
  var lon1 = from.lngRadians();
  var lat2 = to.latRadians();
  var lon2 = to.lngRadians();
  var angle = - Math.atan2( Math.sin( lon1 - lon2 ) * Math.cos( lat2 ), Math.cos( lat1 ) * Math.sin( lat2 ) - Math.sin( lat1 ) * Math.cos( lat2 ) * Math.cos( lon1 - lon2 ) );
  if ( angle < 0.0 ) angle  += Math.PI * 2.0;
  angle = angle * 180.0 / Math.PI;
  return parseFloat(angle.toFixed(1));
}




// === Copy all the above functions to GPolyline ===
google.maps.Polyline.prototype.Contains             = google.maps.Polygon.prototype.Contains;
google.maps.Polyline.prototype.Area                 = google.maps.Polygon.prototype.Area;
google.maps.Polyline.prototype.Distance             = google.maps.Polygon.prototype.Distance;
google.maps.Polyline.prototype.Bounds               = google.maps.Polygon.prototype.Bounds;
google.maps.Polyline.prototype.GetPointAtDistance   = google.maps.Polygon.prototype.GetPointAtDistance;
google.maps.Polyline.prototype.GetPointsAtDistance  = google.maps.Polygon.prototype.GetPointsAtDistance;
google.maps.Polyline.prototype.GetIndexAtDistance   = google.maps.Polygon.prototype.GetIndexAtDistance;
google.maps.Polyline.prototype.Bearing              = google.maps.Polygon.prototype.Bearing;





