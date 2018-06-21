/*

https://www.northrivergeographic.com/qgis-points-along-line

*/

// LatLon-Aufteilung!
const groundAltitude = 500
var llNullPoint = new LatLon(46.2, 5.85);
var llNullPoint = new LatLon(45.4, 5.8);
var llMittelpunkt = new LatLon(46.943366, 8.311583);
var llLuzern = new LatLon(47.055046, 8.305300);
var controls;

var cities = [
  {
    "id": "luzern",
    "img": "luzern.png",
    "latlon": new LatLon(47.055046, 8.305300),
  },
  {
    "id": "zurich",
    "img": "zurich.png",
    "latlon": new LatLon(47.372084, 8.540693),
  },
  {
    "id": "winterthur",
    "img": "winterthur.png",
    "latlon": new LatLon(47.500399, 8.724567)
  },
  {
    "id": "stgallen",
    "img": "stgallen.png",
    "latlon": new LatLon(47.421097, 9.375037)
  },
  {
    "id": "konstanz",
    "img": "konstanz.png",
    "latlon": new LatLon(47.663340, 9.170435)
  },
  {
    "id": "schaffhausen",
    "img": "schaffhausen.png",
    "latlon": new LatLon(47.692347, 8.635310)
  },
  {
    "id": "bern",
    "img": "bern.png",
    "latlon": new LatLon(46.947311, 7.447716)
  },
  {
    "id": "biel",
    "img": "Biel",
    "latlon": new LatLon(47.137394, 7.248539)
  },
  {
    "id": "neuenburg",
    "img": "neuenburg.png",
    "latlon": new LatLon(46.992260, 6.910098)
  },
  {
    "id": "yverdon-les-bains",
    "img": "yverdon-les-bains.png",
    "latlon": new LatLon(46.783100, 6.640909)
  },
  {
    "id": "lausanne",
    "img": "lausanne.png",
    "latlon": new LatLon(46.518534, 6.628543)
  },
  {
    "id": "genf",
    "img": "genf.png",
    "latlon": new LatLon(46.202770, 6.148037)
  },
  {
    "id": "zermatt",
    "img": "zermatt.png",
    "latlon": new LatLon(46.018972, 7.748883)
  },
  {
    "id": "visp",
    "img": "visp.png",
    "latlon": new LatLon(46.296203, 7.881271)
  },
  {
    "id": "sion",
    "img": "sion.png",
    "latlon": new LatLon(46.233313, 7.359701)
  },
  {
    "id": "chur",
    "img": "chur.png",
    "latlon": new LatLon(46.856793, 9.548603)
  },
  {
    "id": "stmoritz",
    "img": "stmoritz.png",
    "latlon": new LatLon(46.488049, 9.834390)
  },
  {
    "id": "davos",
    "img": "davos.png",
    "latlon": new LatLon(46.801325, 9.827914)
  }
];

var airways = [
  {
    "id": "UN850",
    "lonlat": [[8.808021360795664,45.449507770139959],[8.706851087157958,45.895490546539691],[8.757280538595097,46.131789824494128],[8.557143404345615,46.330800363284773],[8.728559520865343,46.461621666371045],[8.513619277734481,46.646655893622416],[8.64464937497466,46.842779372346612],[8.456255332947643,47.008130841118536],[8.676223656990755,47.257787527581741],[8.483785365755898,47.305997329032429],[8.414600189317715,47.70213335233813],[8.198102148208548,48.118755734460102]]
  }
];



var renderer, scene, camera;

$(document).ready( function() {

  $("#render").on("click", function() {
    renderer.render( scene, camera );
  });

  $("#doit").on("click", function() {
    console.log("doit");
    camera.lookAt(new THREE.Vector3(xzMittelpunkt.x, -200, xzMittelpunkt.z));
    camera.position.y = km(200);
    renderer.render( scene, camera );
  
  });

  $("#kippen").on("click", function() {
    console.log("kippen");
    camera.rotation.x = camera.rotation.x + 0.1;
    renderer.render( scene, camera );
  })

  console.log("== Mittelpunkt");
  xzMittelpunkt = latLon2XY(llNullPoint, llMittelpunkt);

  console.log("== Luzern");
  xzLuzern = latLon2XY(llNullPoint, llLuzern);

  console.log(xzMittelpunkt, xzLuzern);

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xccd2ff );
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 300000);
  
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );



  /*
  var spriteMap = new THREE.TextureLoader().load( "mesh/blau.jpg" );
  var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffcc00} );
  var sprite = new THREE.Sprite( spriteMaterial );
  sprite.scale.set(256, 256, 1);
  sprite.visible = true;
  */

/*
  var crateTexture = new THREE.TextureLoader().load( "mesh/blau.jpg", function(e) {
    var crateMaterial = new THREE.SpriteMaterial( { map: e, side:THREE.DoubleSide, transparent: true, color: 0xffffff } );
    var sprite2 = new THREE.Sprite( crateMaterial );
    //sprite2.position.set( 0, 0, 0 );
    sprite2.scale.set( 1, 1, 1.0 ); // imageWidth, imageHeight
    scene.add( sprite2 );
    renderer.render( scene, camera );

  } );
  */
/*
  var crateTexture = new THREE.TextureLoader().load( "mesh/blau.jpg");
  console.log(crateTexture);
  var crateMaterial = new THREE.SpriteMaterial( { map: crateTexture, side:THREE.DoubleSide, transparent: true, color: 0xffffff } );
  var sprite2 = new THREE.Sprite( crateMaterial );
  //sprite2.position.set( 0, 0, 0 );
  sprite2.scale.set( 1, 1, 1.0 ); // imageWidth, imageHeight
  scene.add( sprite2 );
  renderer.render( scene, camera );
*/


  //camera.position.z = 5;
  //camera.lookAt(sprite2.position);

 // scene.add( sprite );



  //Add Ground
  var ground = new THREE.Mesh(
    new THREE.PlaneBufferGeometry( km(500), km(500), 1, 1 ),
    new THREE.MeshPhongMaterial( { color: 0xffffff } )
  );
  ground.rotation.x = - Math.PI / 2; // rotates X/Y to X/Z
  ground.receiveShadow = true;
  ground.position.set(xzMittelpunkt.x, groundAltitude, xzMittelpunkt.z);
  scene.add( ground );

  //Add Light
  var light = new THREE.AmbientLight( 0x404040 ); // soft white light
  scene.add( light );

  var textureLoader = new THREE.TextureLoader();
  //Add Fix Points (Cities)
  cities.forEach(function(e) {
    //Create Geometry
    e.geometry = new THREE.BoxGeometry( 1000, 1000, 1000 );

    //Create Mataerial
    e.material = new THREE.MeshBasicMaterial( { color: 0x00ff00} );

    //Calculate XZ
    xzE = latLon2XY(llNullPoint, e.latlon);

    //Create Mesh
    e.mesh = new THREE.Mesh( e.geometry, e.material );
    e.mesh.position.set(xzE.x, groundAltitude + getHalfHeightOfObject(e.mesh), xzE.z);
    scene.add( e.mesh );
    

    //Create Sprite
    var spriteMap = textureLoader.load( "mesh/stadt.png" );
    var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, side:THREE.DoubleSide, transparent: false, color: 0xffffff  } );
    e.sprite = new THREE.Sprite( spriteMaterial );
    e.sprite.scale.set(4096, 4096, 1);
    e.sprite.position.set(xzE.x, groundAltitude + 2048, xzE.z);
    //e.sprite.position.normalize();
    //e.sprite.position.multiplyScalar( 20000000 );
    scene.add( e.sprite );
  });

  //Add Airways

  airways.forEach(function(e) {
    //Create Line-Geometry
    var l_geometry = new THREE.Geometry();

    //Loop each point
    e.lonlat.forEach(function(lonlat) {
      //Calculate XY
      xzE = latLon2XY(llNullPoint, new LatLon(lonlat[1], lonlat[0]));

      //Add Linepoint
      l_geometry.vertices.push(new THREE.Vector3(xzE.x, km(20), xzE.z));
    });
    
  
    var l_line = new MeshLine();
    l_line.setGeometry(l_geometry);
  
    var l_material = new MeshLineMaterial({
      color: new THREE.Color(0xffff00),
      sizeAttenuation: true,
      near: 0.1,
      far: km(200),
      lineWidth: km(10)
    });
    var l_mesh = new THREE.Mesh( l_line.geometry, l_material ); // this syntax could definitely be improved!
    scene.add( l_mesh );

    /*
    var material = new THREE.LineMaterial({
      color: 0x0000ff,
      linewidth: 100000,
      linejoin:  'round'
    });
    
    var geometry = new THREE.Geometry();


    e.lonlat.forEach(function(lonlat) {
      //Calculate XY
      console.log(new LatLon(lonlat[1], lonlat[0]));
      xzE = latLon2XY(llNullPoint, new LatLon(lonlat[1], lonlat[0]));

      //Add Linepoint
      geometry.vertices.push(new THREE.Vector3( xzE.x, km(50), xzE.z ));
    });
    
    var line = new THREE.Line( geometry, material );
    scene.add( line );
    */
  });

  //cube.position.set(60, 0, 60);

  camera.position.set(xzMittelpunkt.x, groundAltitude + 2, xzMittelpunkt.z);
  //camera.position.set(188959, 2500, -95000);
  
  ctLuzern = getCity("luzern");
  console.log(ctLuzern);

  //controls = new THREE.OrbitControls( camera, renderer.domElement );
  renderer.render( scene, camera );
  //animate();

});

function getCity(_id)
{
  var found = false;
  cities.forEach(function(e) {
    if(e.id == _id)
    {
      r = e;
      found = true;
      return false;
    }
  });

  if(found)
    return r;

  if(!found)
  {
    throw _id + " nicht gefunden";
  }
}


function animate() {

  requestAnimationFrame( animate );
  controls.update();

  renderer.render( scene, camera );
}

function km(_km)
{
  return _km * 1000;
}

function getBoundingBoxOfObject(_object)
{
  var size3 = new THREE.Vector3();
  var box = new THREE.Box3().setFromObject( _object );
  box.getSize(size3);
  return size3;
}

function getHalfHeightOfObject(_object)
{
  var size3 = getBoundingBoxOfObject(_object);
  return size3.y / 2;
}

function LatLon(lat, lon) {
  if (!(this instanceof LatLon)) return new LatLon(lat, lon);

  this.lat = Number(lat);
  this.lon = Number(lon);
}

function xz(x, z)
{
  this.x = Number(x);
  this.z = Number(z);
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
/*
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
*/

/*
function angleFromCoordinate2(p1, p2)
{
  return Math.atan2(Math.sin(p2.lon - p1.lon)*Math.cos(p2.lat), Math.cos(p1.lat)*Math.sin(p2.lat) - Math.sin(p1.lat)*Math.cos(p2.lat)*Math.cos(p2.lon - p1.lon))
}
*/

function latLon2XY(_nullPoint, _point)
{
  var c = distance(_nullPoint, _point)
  //console.log("distance", c);
  
  //v0
  var alpha0 = bearingTo(_nullPoint, _point);
  //console.log("alpha0", alpha0);
/*
  //v1
  var alpha = angleFromCoordinate(p1.lat, p1.lon, p2.lat, p2.lon);
  console.log("Alpha", alpha);

  //v2
  var alpha2 = angleFromCoordinate2(p1, p2);
  console.log("alpha2", rad2deg(alpha2));
*/
  //vGoogle
  var point1 = new google.maps.LatLng(_nullPoint.lat, _nullPoint.lon);
  var point2 = new google.maps.LatLng(_point.lat, _point.lon);
  var heading = google.maps.geometry.spherical.computeHeading(point1,point2);
  //console.log("google maps heading", heading);

  var gDistance = google.maps.geometry.spherical.computeDistanceBetween(point1,point2);
  //console.log("google maps distance", gDistance);

  /*
  var beta = 90 - alpha0;
  console.log("beta", beta);
  a = c * Math.cos(beta);
  console.log(c, a);
  b = Math.sqrt(Math.pow(c, 2) - Math.pow(a, 2));
  */

  //Versuch über Koordinaten-Manipulation und Distanz
  distanceX = distance(_nullPoint, new LatLon(_nullPoint.lat, _point.lon));
  distanceZ = distance(_nullPoint, new LatLon(_point.lat, _nullPoint.lon));

  //return new xz(Math.trunc(a), Math.trunc(b) * -1); //z umkehren, weil ThreeJS verkehrt rechnet...
  return new xz(Math.trunc(distanceX), Math.trunc(distanceZ) * -1); //z umkehren, weil ThreeJS verkehrt rechnet...
}


