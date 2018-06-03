// LongLat-Aufteilung!

$(document).ready( function() {
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  var p1 = new LatLon(5.85, 46.2);
  var p2 = new LatLon(7.4, 47);
  //console.log(distance(p1, p2));
  //console.log(bearingTo(p1, p2));
  console.log(LonLat2XY(p1, p2));
});

function LatLon(lat, lon) {
  if (!(this instanceof LatLon)) return new LatLon(lat, lon);

  this.lat = Number(lat);
  this.lon = Number(lon);
}

function xy(x, y)
{
  this.x = Number(x);
  this.y = Number(y);
}

function distance(p1, p2) {
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((p2.lat - p1.lat) * p)/2 + 
          c(p1.lat * p) * c(p2.lat * p) * 
          (1 - c((p2.lon - p1.lon) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function rad2deg(radians) {
  return radians * 180 / Math.PI;
};

//https://www.movable-type.co.uk/scripts/latlong.html

function bearingTo(source, point) {
  if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

  // tanθ = sinΔλ⋅cosφ2 / cosφ1⋅sinφ2 − sinφ1⋅cosφ2⋅cosΔλ
  // see mathforum.org/library/drmath/view/55417.html for derivation

  var φ1 = deg2rad(source.lat), φ2 = deg2rad(point.lat);
  var Δλ = deg2rad(point.lon - source.lon);
  var y = Math.sin(Δλ) * Math.cos(φ2);
  var x = Math.cos(φ1)*Math.sin(φ2) -
          Math.sin(φ1)*Math.cos(φ2)*Math.cos(Δλ);
  var θ = Math.atan2(y, x);

  return (rad2deg(θ) + 360) % 360;
};

/*
https://stackoverflow.com/questions/3932502/calculate-angle-between-two-latitude-longitude-points
vergleichen mit google maps api
*/
function angleFromCoordinate(lat1, long1, lat2, long2) 
{
  dLon = (long2 - long1);

  y = Math.sin(dLon) * Math.cos(lat2);
  x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  brng = Math.atan2(y, x);

  brng = rad2deg(brng);
  brng = (brng + 360) % 360;
  //brng = 360 - brng; // count degrees counter-clockwise - remove to make clockwise

  return brng;
}

function LonLat2XY(p1, p2)
{
  var c = distance(p1, p2)
  //var alpha = bearingTo(p1, p2);
  var alpha = angleFromCoordinate(p1.lat, p1.lon, p2.lat, p2.lon);
  console.log(alpha);

  var beta = 90 - alpha;
  a = c * Math.cos(beta);
  console.log(c, a);
  b = Math.sqrt(Math.pow(c, 2) - Math.pow(a, 2));
  return new xy(a, b);
}