/*

https://www.northrivergeographic.com/qgis-points-along-line
https://threejs.org/examples/webgl_lights_hemisphere.html

*/

// LatLon-Aufteilung!
const groundAltitude = 500
var llNullPoint = new LatLon(46.2, 5.85);
var llNullPoint = new LatLon(45.4, 5.8);
var llMittelpunkt = new LatLon(46.943366, 8.311583);
var llFlughafen = new LatLon(47.454588, 8.555721);
var llLuzern = new LatLon(47.055046, 8.305300);

var llStartpunkt = llMittelpunkt;
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
    camera.lookAt(new THREE.Vector3(xzStartpunkt.x, -200, xzStartpunkt.z));
    camera.position.y = km(200);
    renderer.render( scene, camera );
  });

  $("#doitback").on("click", function() {
    console.log("doitback");
    camera.position.set(xzStartpunkt.x, groundAltitude + 2, xzStartpunkt.z);
    camera.lookAt(new THREE.Vector3(xzStartpunkt.x, groundAltitude + 2, xzStartpunkt.z - 200));
    renderer.render( scene, camera );
  });

  $("#kippen").on("click", function() {
    console.log("kippen");
    camera.rotation.x = camera.rotation.x + 0.1;
    renderer.render( scene, camera );
  })

  $("#count").on("click", function() {
    console.log("count");
    var doIt = true;
    while(doIt)
    {
      lastTrack.setMinutes(lastTrack.getMinutes() + 1);
      renderTimeSerie(lastTrack);
      
      if(lastTrack.getHours() == 8)
        doIt = false;
    }
    renderer.render( scene, camera );
    console.log("fertig");

  })

  console.log("== Mittelpunkt");
  xzMittelpunkt = latLon2XY(llNullPoint, llMittelpunkt);

  console.log("== Luzern");
  xzLuzern = latLon2XY(llNullPoint, llLuzern);

  console.log(xzMittelpunkt, xzLuzern);

  //Init Scene
  scene = new THREE.Scene();
  //scene.background = new THREE.Color( 0xccd2ff );
  scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
  scene.fog = new THREE.Fog( scene.background, 1, km(100) );


  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 30000000);
  
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  //renderer.shadowMap.enabled = true;
  document.body.appendChild( renderer.domElement );



  xzStartpunkt = latLon2XY(llNullPoint, llStartpunkt);




				// LIGHTS

				hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
				hemiLight.color.setHSL( 0.6, 1, 0.6 );
				hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
				hemiLight.position.set( 0, km(100), 0 );
				scene.add( hemiLight );

				hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 10 );
				//scene.add( hemiLightHelper );

				//

				dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
				dirLight.color.setHSL( 0.1, 1, 0.55 );
				dirLight.position.set( -1, 550, 1 );
        //dirLight.position.set(xzMittelpunkt.x, groundAltitude + 50, xzMittelpunkt.z);
				dirLight.position.multiplyScalar( 30 );
				//scene.add( dirLight );

				dirLight.castShadow = true;

				dirLight.shadow.mapSize.width = 2048;
				dirLight.shadow.mapSize.height = 2048;

				var d = 50;

				dirLight.shadow.camera.left = -d;
				dirLight.shadow.camera.right = d;
				dirLight.shadow.camera.top = d;
				dirLight.shadow.camera.bottom = -d;

				dirLight.shadow.camera.far = 3500;
				dirLight.shadow.bias = -0.0001;

				dirLightHeper = new THREE.DirectionalLightHelper( dirLight, 10 );
				//scene.add( dirLightHeper );

				// GROUND

				var groundGeo = new THREE.PlaneBufferGeometry( 10000, 10000 );
				var groundMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } );
				groundMat.color.setHSL( 0.095, 1, 0.75 );

				var ground = new THREE.Mesh( groundGeo, groundMat );
        ground.rotation.x = - Math.PI / 2; // rotates X/Y to X/Z
        ground.position.set(xzMittelpunkt.x, groundAltitude, xzMittelpunkt.z);
				scene.add( ground );

        ground.receiveShadow = true;
        






				// SKYDOME

				var vertexShader = document.getElementById( 'vertexShader' ).textContent;
        var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
				var uniforms = {
					topColor:    { value: new THREE.Color( 0x0077ff ) },
					bottomColor: { value: new THREE.Color( 0xffffff ) },
					offset:      { value: 33 },
					exponent:    { value: 0.6 }
				};
				uniforms.topColor.value.copy( hemiLight.color );

				scene.fog.color.copy( uniforms.bottomColor.value );

        var skyGeo = new THREE.SphereBufferGeometry( km(250), 32, 15 );
				var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );

        var sky = new THREE.Mesh( skyGeo, skyMat );
        sky.position.set(xzMittelpunkt.x, groundAltitude, xzMittelpunkt.z);
				scene.add( sky );








  

  var textureLoader = new THREE.TextureLoader();
  //Add Fix Points (Cities)
  cities.forEach(function(e) {
    //Create Geometry
    e.geometry = new THREE.BoxGeometry( km(1), km(1), km(1) );

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
    //scene.add( l_mesh );

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

  
  camera.position.set(xzStartpunkt.x, groundAltitude + 2, xzStartpunkt.z);

  tmpGeometry = new THREE.BoxGeometry( 1000, 1000, 1000 );
  tmpMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000} );
  tmpMesh = new THREE.Mesh( tmpGeometry, tmpMaterial );
  tmpMesh.position.set(xzStartpunkt.x, groundAltitude + 500, xzStartpunkt.z);
  scene.add(tmpMesh);


  //camera.position.set(188959, 2500, -95000);
  
  ctLuzern = getCity("luzern");
  console.log(ctLuzern);

  //controls = new THREE.OrbitControls( camera, renderer.domElement );
  renderer.render( scene, camera );
  //animate();

  //loadData();
  $.ajax({
    type: "GET",
    url: "data/data.csv",
    success: loadData
  });

});

//Data by timestamp
data_series = [];

//icao24-Object for reference
data_icao24 = []

function loadData(_data)
{
  //console.log(_data);
  var allTextLines = _data.split(/\r\n|\n/);
  var headers = allTextLines[0].split(',');
  var lines = [];

  for (var i=1; i<allTextLines.length; i++) {
      var data = allTextLines[i].split(',');
      if (data.length == headers.length) {

          var tarr = [];
          for (var j=0; j<headers.length; j++) {
              tarr.push(data[j]);
          }
          lines.push(tarr);
      }
  }

  //Create Data Serie
  lines.forEach(function(d) {
    var timestamp = d[headers.indexOf('timestamp')];

    //Add Timestamp, if not exists
    if(!(timestamp in data_series))
    {
      data_series[timestamp] = [];
    }

    if(!data_icao24[d[headers.indexOf('icao24')]])
    {
      var icao24 = {
        "icao24": d[headers.indexOf('icao24')],
        "geometry": undefined,
        "mesh": undefined,
        "series": [],
        "color": getRandomColor()
      };
      data_icao24[d[headers.indexOf('icao24')]] = icao24;
    }

    //Add Data to Timestamp
    var record = {
      "icao24": data_icao24[d[headers.indexOf('icao24')]],
      "altitude": d[headers.indexOf('altitude')],
      //"altitude": km(20),
      //"latlon": new LatLon(d[headers.indexOf('latitude')], d[headers.indexOf('longitude')]),
      "xz": latLon2XY(llNullPoint, new LatLon(d[headers.indexOf('latitude')], d[headers.indexOf('longitude')]))
    }
    data_series[timestamp].push(record);

    data_icao24[d[headers.indexOf('icao24')]].series.push(record);

    //console.log(d);
  });
  renderTracks();
}

function getRandomColor() {
  var letters = '0123456789abcdef';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
}


function renderTracks()
{
  for(icao24 in data_icao24)
  {
    icao24 = data_icao24[icao24];
    
    //Add Mesh
    icao24.geometry = new THREE.Geometry();
    icao24.geometry.vertices.needsUpdate = true;
    icao24.geometry.needsUpdate = true;

    var l_material = new THREE.LineBasicMaterial( { color: icao24.color } );
    icao24.mesh = new THREE.Line( icao24.geometry, l_material );

    //icao24.geometry.vertices.push(new THREE.Vector3(icao24.series[0].xz.x, icao24.series[0].altitude, icao24.series[0].xz.z));

    //Add vertices for each point. But add always the first point!
    for(var i = 0; i <= icao24.series.length - 1; i++)
    {
      var vector = new THREE.Vector3(icao24.series[0].xz.x, km(10), icao24.series[0].xz.z)
      icao24.series[i].vertice = vector;
      icao24.geometry.vertices.push(vector);
    }

    scene.add(icao24.mesh);
  }

  renderer.render( scene, camera );
  console.log(data_series);
  lastTrack = new Date();
  lastTrack.setHours(0);
  lastTrack.setMinutes(0);
  lastTrack.setSeconds(0);
  console.log(lastTrack);
}

var lastTrack;
function renderTimeSerie(_timestamp)
{
  lastTrack = _timestamp;
  timestampAsString = ('0' + _timestamp.getHours()).substr(-2) + ":" + ('0' + _timestamp.getMinutes()).substr(-2)  + ":00";
  timestamp = data_series[timestampAsString];
  for(serie in timestamp)
  {
    serie = timestamp[serie];

    //Update Vertice-Reference and pray. Attention: All "invisible" vertices must be updated with the current one. Or you get a triangle. Really, do it.
    var updateIt = false;
    serie.icao24.series.forEach(function(uSerie) {
      if(uSerie.xz.x == serie.xz.x && uSerie.xz.z == serie.xz.z)
      {
        updateIt = true;
      }

      if(updateIt)
      {
        uSerie.vertice.x = serie.xz.x;
        uSerie.vertice.y = serie.altitude;
        uSerie.vertice.z = serie.xz.z;
      }
    });

    serie.icao24.geometry.verticesNeedUpdate = true;
    //serie.icao24.geometry.attributes.position.needsUpdate = true;
  }
}


function renderTracksOLD()
{
  for(timestamp in data_series)
  {
    timestamp = data_series[timestamp];
    for(d in timestamp)
    {
      d = timestamp[d];

      //Line not yet created. Go for it!
      if(d.icao24.mesh == undefined)
      {
        //Create Line-Geometry
        d.icao24.geometry = new THREE.Geometry();
        d.icao24.geometry.vertices.needsUpdate = true;
        d.icao24.geometry.needsUpdate = true;

        var l_material = new THREE.LineBasicMaterial( { color: 0xffffff } );
        d.icao24.mesh = new THREE.Line( d.icao24.geometry, l_material );

        scene.add(d.icao24.mesh);
      }

      //Add Coordinate
      d.icao24.geometry.vertices.push(new THREE.Vector3(d.xz.x, d.altitude, d.xz.z));
      d.icao24.geometry.verticesNeedUpdate = true;
      d.icao24.geometry.attributes.position.needsUpdate = true;
    }
  }

  for(d in data_icao24)
  {
    d = data_icao24[d];
    //console.log(d);
    //var l_line = new MeshLine();

    var l_material = new THREE.LineBasicMaterial( { color: 0xffff00 } );

    var l_line = new THREE.Line( d.geometry, l_material );

    //scene.add(l_line);
    /*
    var l_material = new MeshLineMaterial({
      color: new THREE.Color(0xffff00),
      sizeAttenuation: true,
      near: 0.1,
      far: km(200),
      lineWidth: km(10)
    });
    */

  }
  //scene.add( d.icao24.mesh );

  renderer.render( scene, camera );
}

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


