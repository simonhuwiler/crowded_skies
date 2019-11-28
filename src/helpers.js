const turf = require("@turf/turf")
const consts = require('./consts.js');
var {LatLon} = require('./types.js');
var {shape_switzerland} = require('./data/shapes.js');

module.exports.latLon2XY = (_point) => 
{
  let distanceX = distance(consts.llNullPoint, new LatLon(consts.llNullPoint.lat, _point.lon));
  let distanceZ = distance(consts.llNullPoint, new LatLon(_point.lat, consts.llNullPoint.lon));

  return new xz(Math.trunc(distanceX), Math.trunc(distanceZ) * -1); //z umkehren, weil ThreeJS verkehrt rechnet...
}

function distance(p1, p2) {
  //var p = 0.017453292519943295;    // Math.PI / 180
  var p = Math.PI / 180;
  var c = Math.cos;
  var a = 0.5 - c((p2.lat - p1.lat) * p)/2 + 
          c(p1.lat * p) * c(p2.lat * p) * 
          (1 - c((p2.lon - p1.lon) * p))/2;

  var km = 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  return km * 1000;
}

function xz(x, z)
{
  this.x = Number(x);
  this.z = Number(z);
}

//https://www.movable-type.co.uk/scripts/latlong.html

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function rad2deg(radians) {
  return radians * 180 / Math.PI;
};

module.exports.bearingTo = (source, point) => {
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

module.exports.km = (_km) => _km * 1000

module.exports.pointInShape = point =>
{
  var pt = turf.point([point.lng, point.lat]);

  if(turf.booleanPointInPolygon(pt, shape_switzerland))
  {
    return true;
  }
  return false;
}