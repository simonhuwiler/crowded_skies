function LatLon(lat, lon)
{
  if (!(this instanceof LatLon)) return new LatLon(lat, lon);

  this.lat = Number(lat);
  this.lon = Number(lon);
}
module.exports.LatLon = LatLon;