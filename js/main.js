/*

https://www.northrivergeographic.com/qgis-points-along-line
https://threejs.org/examples/webgl_lights_hemisphere.html

http://aip.engadin-airport.ch/eAIP/2017-04-27/html/eAIP/LS-ENR-3.3-en-CH.html#ENR33-RDESIG-UN850
http://aip.engadin-airport.ch/eAIP/2017-05-25/pdf/U-ERC.pdf

*/

//Data by timestamp
data_series = [];

//icao24-Object for reference
data_icao24 = []

//Airways-Lines as points
var airways_lines;

//Loader count
var loaderCounter = 0;

// LatLon-Aufteilung!
const groundAltitude = 500
const timeSerieDeltaMin = 1;
var llNullPoint = new LatLon(45.4, 5.8);
var llNEPoint = new LatLon(49.052, 11.001);
var llMittelpunkt = new LatLon(46.943366, 8.311583);

var llFlughafen = new LatLon(47.454588, 8.555721);
var llLuzern = new LatLon(47.055046, 8.305300);
var llZurich = new LatLon(47.372084, 8.540693);
var llGenf = new LatLon(46.202770, 6.148037);

var llStartpunkt = llMittelpunkt;
var controls;
var lastTrack;

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

var renderer, scene, camera;

$(document).ready( function() {

  $("#render").on("click", function() {
    camera.lookAt(new THREE.Vector3(xzStartpunkt.x, km(100), xzStartpunkt.z));
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
  });

  $(".move_camera").on("click", function(e) {
    console.log(e.target.dataset.x, e.target.dataset.y);
    camera.rotation.x = camera.rotation.x + parseFloat(e.target.dataset.x);
    camera.rotation.y = camera.rotation.y + parseFloat(e.target.dataset.y);
    renderer.render( scene, camera );
  });

  $("#play").on("click", function(e) {
    animateLines();
  });  
  $("#play2").on("click", function(e) {
    createTweensAndStart(lastTrack);
  });

  $("#count").on("click", function() {
    console.log("count");
    var doIt = true;
    while(doIt)
    {
      lastTrack.setMinutes(lastTrack.getMinutes() + 1);
      renderTimeSerie(lastTrack);
      
      if(lastTrack.getHours() == 22)
        doIt = false;
    }
    renderer.render( scene, camera );
    console.log("fertig");
  });

  //Prepare THREEJS
  loaderAddCount();
  prepareTHREEJS();

  //Load LineJSON
  loaderAddCount();
  $.getJSON("data/airways.geojson", loadAirwaysJson);

  //Load Data
  loaderAddCount();
  $.ajax({
    type: "GET",
    url: "data/data.csv",
    success: loadData
  });

  loaderRemoveCount();
});

function prepareTHREEJS()
{
  xzMittelpunkt = latLon2XY(llNullPoint, llMittelpunkt);
  xzStartpunkt = latLon2XY(llNullPoint, llStartpunkt);
  xzLuzern = latLon2XY(llNullPoint, llLuzern);

  var textureLoader = new THREE.TextureLoader();

  //Init Scene
  scene = new THREE.Scene();
  //scene.background = new THREE.Color( 0xccd2ff );
  scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
  scene.fog = new THREE.Fog( scene.background, 1, km(100) );

  //Init Render
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  //renderer.shadowMap.enabled = true;
  document.body.appendChild( renderer.domElement );

  //Init Lights

  //Init HemisphereLight (color Fading)
  hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
  hemiLight.color.setHSL( 0.6, 1, 0.6 );
  hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
  hemiLight.position.set( 0, km(100), 0 );
  scene.add( hemiLight );

  //Add Sun
  dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
  dirLight.color.setHSL( 0.1, 1, 0.55 );
  dirLight.position.set(xzMittelpunkt.x, km(1000), xzMittelpunkt.z);
  scene.add( dirLight );

  //Add ground
  var groundGeo = new THREE.PlaneBufferGeometry( km(100), km(100) );
  var groundMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } );
  groundMat.color.setHSL( 0.095, 1, 0.75 );

  var ground = new THREE.Mesh( groundGeo, groundMat );
  ground.rotation.x = - Math.PI / 2;
  ground.position.set(xzMittelpunkt.x, groundAltitude, xzMittelpunkt.z);
  ground.receiveShadow = true;
  scene.add( ground );

  //Add Skydom
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

  var skyGeo = new THREE.SphereBufferGeometry( km(300), 32, 15 );
  var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );

  var sky = new THREE.Mesh( skyGeo, skyMat );
  sky.position.set(xzMittelpunkt.x, groundAltitude, xzMittelpunkt.z);
  //scene.add(sky);

  //Add Skymap
  var skyOverlayTexture = new textureLoader.load( "img/skybox.png" );
  skyOverlayTexture.wrapS = THREE.RepeatWrapping; 
  skyOverlayTexture.wrapT = THREE.RepeatWrapping;
  skyOverlayTexture.repeat.set(1,1); 

  var skyOverlayGeo = new THREE.PlaneBufferGeometry(km(406), km(406));
  skyOverlayMaterial = new THREE.MeshLambertMaterial({ map : skyOverlayTexture });
  skyOverlayPlane = new THREE.Mesh(skyOverlayGeo, skyOverlayMaterial);
  skyOverlayPlane.material.side = THREE.DoubleSide;
  skyOverlayPlane.transparent = true;
  skyOverlayPlane.position.set(xzMittelpunkt.x, km(50), xzMittelpunkt.z);
  skyOverlayPlane.rotation.x = - Math.PI / 2;
  skyOverlayPlane.receiveShadow = false;
  scene.add( skyOverlayPlane );


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

  //Init Camera
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, km(300));
  camera.position.set(xzStartpunkt.x, groundAltitude + 2, xzStartpunkt.z);

  //Add Startpoint-Cube (Remove me!)
  tmpGeometry = new THREE.BoxGeometry( 1000, 1000, 1000 );
  tmpMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000} );
  tmpMesh = new THREE.Mesh( tmpGeometry, tmpMaterial );
  tmpMesh.position.set(xzStartpunkt.x, groundAltitude + 500, xzStartpunkt.z);
  scene.add(tmpMesh);
}

function setCameraPosition(_llStart)
{
  xzStartpunkt = latLon2XY(llNullPoint, _llStart);
  camera.position.set(xzStartpunkt.x, groundAltitude + 2, xzStartpunkt.z);
  tmpMesh.position.set(xzStartpunkt.x, groundAltitude + 500, xzStartpunkt.z);

}

function loadAirwaysJson(data)
{
  airways_lines = data;

  var r = getNearestLines(new LatLon(47.564, 8.735), 3);
  loaderRemoveCount();
}

function getNearestLines(_source, _max)
{
  //Copy Geojson
  var tmpLines = airways_lines;

  //Exclude Lines
  var exclude_lines = [];

  //Create Turf-Point
  var pt = turf.point([_source.lon, _source.lat]);

  //Create Result-List
  var results = [];

  //Run x times
  for(var i = 0; i < _max; i++)
  {
    //Delete all points, which are already found
    for(var n = tmpLines.features.length - 1; n >= 0; n--)
    {
      //Loop each exclude_lines
      var name = tmpLines.features[n].properties.name;
      for(var excl_line = 0; excl_line < exclude_lines.length; excl_line++)
      {
        if(name == exclude_lines[excl_line])
        {
          //Remove
          tmpLines.features.splice(n, 1);
          break;
        }
      }
    }

    //Now find nearest point
    var res = turf.nearestPoint(pt, tmpLines);
    results.push(res);
    exclude_lines.push(res.properties.name);
  }
  return results;
}

function loadData(_data)
{
  //Parse CSV
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

  //Load planetexture
  var spriteMap = new THREE.TextureLoader().load( "img/plane.png" ); //TODO

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
      //Prepare Sprite
      
      var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, color: 0xffffff } );
      var sprite = new THREE.Sprite( spriteMaterial );
      sprite.position.set(xzStartpunkt.x, km(1), xzStartpunkt.z);
      sprite.scale.set(512, 512, 1);
      scene.add( sprite );

      var icao24 = {
        "icao24": d[headers.indexOf('icao24')],
        "geometry": undefined,
        "meshline": undefined,
        "meshplane": sprite,
        "series": [],
        "color": 0x887e82//getRandomColor()
      };
      data_icao24[d[headers.indexOf('icao24')]] = icao24;
    }

    //Add Data to Timestamp
    var record = {
      "icao24": data_icao24[d[headers.indexOf('icao24')]],
      "altitude": parseFloat(d[headers.indexOf('altitude')]),
      //"altitude": km(20),
      //"latlon": new LatLon(d[headers.indexOf('latitude')], d[headers.indexOf('longitude')]),
      "xz": latLon2XY(llNullPoint, new LatLon(d[headers.indexOf('latitude')], d[headers.indexOf('longitude')])),
      "tween": undefined
    }
    data_series[timestamp].push(record);
    data_icao24[d[headers.indexOf('icao24')]].series.push(record);
  });

  //Create Three-Objects
  renderTracks();
  loaderRemoveCount();
}

function renderTracks()
{
  //Loop all icao24
  for(icao24 in data_icao24)
  {
    icao24 = data_icao24[icao24];
    
    //Add Mesh
    icao24.geometry = new THREE.Geometry();
    icao24.geometry.vertices.needsUpdate = true;
    icao24.geometry.needsUpdate = true;

    var l_material = new THREE.LineBasicMaterial( { color: icao24.color } );
    icao24.meshline = new THREE.Line( icao24.geometry, l_material );

    //Add vertices for each point. But add always the first point! Its not possible, to add vertices after creation!
    for(var i = 0; i <= icao24.series.length - 1; i++)
    {
      var vector = new THREE.Vector3(icao24.series[0].xz.x, km(10), icao24.series[0].xz.z)
      icao24.series[i].vertice = vector;
      icao24.geometry.vertices.push(vector);
    }
    scene.add(icao24.meshline);
  }

  //Set lastTrack-Date
  lastTrack = new Date();
  lastTrack.setHours(0);
  lastTrack.setMinutes(0);
  lastTrack.setSeconds(0);
}

function renderTimeSerie(_timestamp)
{
  lastTrack = _timestamp;

  //Format Timestring
  timestampAsString = ('0' + _timestamp.getHours()).substr(-2) + ":" + ('0' + _timestamp.getMinutes()).substr(-2)  + ":00";

  //Load timestamp with all points in it
  timestamp = data_series[timestampAsString];
  for(serie in timestamp)
  {
    serie = timestamp[serie];

    //Update Vertice-Reference and pray. Attention: All "invisible" vertices must be updated with the current one. Or you get a triangle. Really, do it. Dont ask!
    var updateIt = false;
    serie.icao24.series.forEach(function(uSerie) {
      if(uSerie.xz.x == serie.xz.x && uSerie.xz.z == serie.xz.z)
        updateIt = true;

      if(updateIt)
      {
        uSerie.vertice.x = serie.xz.x;
        uSerie.vertice.y = serie.altitude;
        uSerie.vertice.z = serie.xz.z;
      }
    });

    serie.icao24.geometry.verticesNeedUpdate = true;
  }
}

/*
function getRandomColor() {
  var letters = '0123456789abcdef';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
}
*/

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

//These both are loader functions. When an asynchron task is startet, loadercount is increased.
function loaderAddCount()
{
  loaderCounter++;
}

function loaderRemoveCount()
{
  loaderCounter--;
  if(loaderCounter < 0)
  {
    throw "To many loadercount removes"
  }
  else if(loaderCounter == 0)
  {
    console.log("Everything loaded. Remove loader")
    
    //Do something

  }
}

var clock;
var tweenArray = [];

function animateLines()
{
  lastTrack.setHours(6);
  lastTrack.setMinutes(0);
  lastTrack.setSeconds(0);
  createTweensAndStart(lastTrack);
}

function createTweensAndStart(_serie)
{
  tweenArray = [];

  //###Set Startpoint of each Sprite

  timestampAsString = ('0' + _serie.getHours()).substr(-2) + ":" + ('0' + _serie.getMinutes()).substr(-2)  + ":00";
  console.log(timestampAsString);

  //calculate next Timestamp
  var dateNext = new Date(_serie.getTime());
  dateNext.setMinutes(dateNext.getMinutes() + timeSerieDeltaMin);
  timestampNextAsString = ('0' + dateNext.getHours()).substr(-2) + ":" + ('0' + dateNext.getMinutes()).substr(-2)  + ":00";

  //Load timestamp with all points in it
  timestamp = data_series[timestampAsString];
  timestampNext = data_series[timestampNextAsString];
  
  //First check, if timestampNext available. If not, we reached the end and are still alive
  if(timestampNext)
  {
    //There are more Timestamps!
    for(serie in timestamp)
    {
      serie = timestamp[serie];
      //Look in nextserie. If icao24 not available, hide
      var foundNext = false;
      for(serieNext in timestampNext)
      {
        serieNext = timestampNext[serieNext];
        if(serie.icao24.icao24 == serieNext.icao24.icao24)
        {
          foundNext = true;
          break;
        }
      }
  
      if(foundNext)
      {
        //Found next Timestamp. Lets do this!
        serie.icao24.meshplane.position.x = serie.xz.x;
        serie.icao24.meshplane.position.y = serie.altitude;
        serie.icao24.meshplane.position.z = serie.xz.z;
        serie.icao24.meshplane.visible = true;

        //Make Tween
        serie.icao24.tween = new TWEEN.Tween(serie.icao24.meshplane.position)
          .to({x: serieNext.xz.x, y: serieNext.altitude, z: serieNext.xz.z}, 100);

        tweenArray.push(serie.icao24.tween);
      }
      else
      {
        //No next timestamp found. Hide
        serie.icao24.meshplane.visible = false;
      }
    }
  }
  else
  {
    console.log("Reached end");
  }

  //Update last position
  lastTrack.setMinutes(lastTrack.getMinutes() + timeSerieDeltaMin);

  //Now activate all Tweens and run
  if(tweenArray.length > 0)
  {
    tweenArray.forEach(function(tween) {
      //console.log("start", tween);
      tween.start();
    });
    
    animateTween();
  }
}

function animateTween()
{
  if(TWEEN.getAll().length > 0)
  {
    requestAnimationFrame( animateTween );
    TWEEN.update();
  }
  else 
  {
    //No more tweens. Calculate next.
    createTweensAndStart(lastTrack);
  }

  renderer.render( scene, camera );
}

function animateIntern()
{

  if(lastTrack.getHours() <= 22)
  {
    requestAnimationFrame( animateIntern );
    //Go for animation!

  }
  else
  {
    console.log("Zeit abgelaufen");
  }

  while(doIt)
  {
    lastTrack.setMinutes(lastTrack.getMinutes() + 1);
    renderTimeSerie(lastTrack);
    
    if(lastTrack.getHours() == 22)
      doIt = false;
  }
  renderer.render( scene, camera );
  console.log("fertig");



  delta = clock.getDelta();
  renderer.render( scene, camera );
  console.log(delta);
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


function latLon2XY(_nullPoint, _point)
{
  //vGoogle
  /*
  var point1 = new google.maps.LatLng(_nullPoint.lat, _nullPoint.lon);
  var point2 = new google.maps.LatLng(_point.lat, _point.lon);
  var heading = google.maps.geometry.spherical.computeHeading(point1,point2);
  //console.log("google maps heading", heading);

  var gDistance = google.maps.geometry.spherical.computeDistanceBetween(point1,point2);
  //console.log("google maps distance", gDistance);
  //Needs: <script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDnNRaRyTgYY5rP_RIvtz8W09p46Qx-Dzw&libraries=geometry"></script>
  */

  distanceX = distance(_nullPoint, new LatLon(_nullPoint.lat, _point.lon));
  distanceZ = distance(_nullPoint, new LatLon(_point.lat, _nullPoint.lon));

  return new xz(Math.trunc(distanceX), Math.trunc(distanceZ) * -1); //z umkehren, weil ThreeJS verkehrt rechnet...
}


