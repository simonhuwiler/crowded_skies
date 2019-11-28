
// Import modules
var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
var THREE = require('three');
const turf = require("@turf/turf")
import TWEEN from '@tweenjs/tween.js';

//Import scripts
require('./docReady.js');
var {latLon2XY, bearingTo, km, pointInShape} = require('./helpers.js');
var {LatLon} = require('./types.js');
var airways_text = require('./texts.js');
var loadTerrain = require('./terrain.js');

//Import Data or Helpers
var airways_lines = require('./data/airways.js')
var cities = require('./data/cities.js')
var {shape_switzerland, airports_features} = require('./data/shapes.js')
const consts = require('./consts.js');

// Import CSS
require('./css/main.css')

/*
###############################

  GLOBAL VARS

###############################
*/

//Data by timestamp
var data_series = [];

//icao24-Object for reference
var data_icao24 = []

//Airways-Lines as points
var nearest_airways;

//Loader count
var loaderCounter = 0;


var llStartpunkt = consts.llMittelpunkt;
var lastTrack;
var trackGroup;
var trackLineMaterial;
var xzStartpunkt;
var xzMittelpunkt;
var skyOverlayPlane;

//Mapbox Variables
var mapstart, mapend;

//HTML-Varbiables
var lastChapter;
var chapterEvents = [];
var calledChapters = []

chapterEvents['#chapter_routesonmapbox'] = chapter_routesonmapbox;
chapterEvents['#chapter_startTHREE'] = chapter_startTHREE;
chapterEvents['#chapter_timelaps_slow'] = chapter_timelaps_slow;
chapterEvents['#chapter_airport_1'] = chapter_airport_1;
chapterEvents['#chapter_airport_2'] = chapter_airport_2;
chapterEvents['#chapter_nearest_airway_0'] = chapter_nearest_airway_0;
chapterEvents['#chapter_nearest_airway_1'] = chapter_nearest_airway_1;
chapterEvents['#chapter_nearest_airway_2'] = chapter_nearest_airway_2;
chapterEvents['#chapter_after_airways'] = chapter_after_airways;
chapterEvents['#chapter_show_lines'] = chapter_show_lines;
chapterEvents['#chapter_load_heatmap'] = chapter_load_heatmap;

var chapterScrolltop = [];
var nearest_airports = [];

/*
###############################

  THREEJS VARS

###############################
*/
var renderer, scene, camera, textureLoader, sky, skyMat, dirLight;
var tweenGroupPoints = new TWEEN.Group();
var tweenGroupCameras = new TWEEN.Group();

/*
###############################

  READY VOID()

###############################
*/
docReady(function() {

  window.addEventListener('resize', () => {
    if(camera && renderer)
    {
      calculateScrollTop();
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize( window.innerWidth, window.innerHeight );
      render();
    }
  });

  document.getElementById("adventuremode").addEventListener("click", () => {
    var btn_old = document.getElementById("adventuremode");
    var btn_new = document.getElementById("buttonReload");

    //Set Position
    var bodyRect = document.body.getBoundingClientRect(),
    elemRect = btn_old.getBoundingClientRect(),
    offsetTop = elemRect.top - bodyRect.top,
    offsetLeft = elemRect.left - bodyRect.left;

    btn_new.style.left =`${offsetLeft}px`;
    btn_new.style.top = `${offsetTop - window.scrollTop}px`;
    btn_new.style.display = 'inline';

    //Hide old
    btn_old.style.visibility = "hidden";

    //Hide
    document.getElementById("content").style.display = 'none';

    //Start Animation
    btn_new.classList.add("buttonAnimation")

    setTimeout(function() {
      btn_new.style.transition = "top 1s, left 1s";
      btn_new.style.xtransitionTimingFunction = "ease";
      btn_new.style.left = 0;
      btn_new.style.top = 0;

      mapend.addControl(new mapboxgl.NavigationControl());
    }, 0);

    btn_new.querySelector("span").innerHTML = "Einen anderen Ort wählen";

  });

  document.getElementById("buttonReload").addEventListener("click", () => location.reload());

  //PrepareMapbox Start
  loaderAddCount();
  mapboxgl.accessToken = consts.token;
  mapstart = new mapboxgl.Map({
    container: 'mapstart',
    style: 'mapbox://styles/blick-storytelling/cjg6dbhus2vf32sp53s358gud',
    minZoom: 7,
    maxZoom: 20,
    center: [8.272616, 46.668562],
    zoom: 7
    //maxBounds: [[4.730304, 44.300666], [12.021820, 48.831744]]
  });

  mapstart.on('load', function() {

    //Add Routes
    mapstart.addSource('overlay', {
      "type": "image",
      "url": require("./img/skybox_mapbox.png"),
      "coordinates": [
        [5.601455, 48.730898],
        [10.922784, 48.730898],
        [10.922784, 45.133006],
        [5.601455, 45.133006]
      ]
    });

    mapstart.addLayer({
      "id": "overlay",
      "source": "overlay",
      "type": "raster",
      "paint": {
        'raster-opacity-transition': {duration: 1000},
        "raster-opacity": 0
      }
    });

    //Fit bounds
    mapstart.once('moveend', disableStart);
    mapstart.fitBounds([[5.838007, 45.797035], [10.511905, 47.981684]]);

    loaderRemoveCount(); //Mapbox
  });

  mapstart.on("dragstart", function() {
    document.getElementById('header').style.opacity = 0.2;
    document.getElementById('lead').style.opacity = 0.2;
    disableStart();
  });

  mapstart.on("dragend", function() {
    document.getElementById('header').style.opacity = 1;
    document.getElementById('lead').style.opacity = 1;
    if(pointInShape(mapstart.getCenter()))
      enableStart();
  });
  mapstart.on("zoomstart", function() {
    disableStart()
  });

  mapstart.on("zoomend", function() {
    if(pointInShape(mapstart.getCenter()))
      enableStart();
  });

  //PrepareMapbox End
  loaderAddCount();
  mapend = new mapboxgl.Map({
    container: 'mapend',
    style: 'mapbox://styles/blick-storytelling/cjj8gspfu3ave2slhtb37oemg',
    minZoom: 7,
    maxZoom: 20,
    center: [8.272616, 46.668562],
    zoom: 7
    //maxBounds: [[4.730304, 44.300666], [12.021820, 48.831744]]
  });

  mapend.on('load', function() {
    loaderRemoveCount(); //Mapbox End
  });

  //Prepare THREEJS
  loaderAddCount();
  prepareTHREEJS();

  //Load Data

  loaderAddCount();
  fetch('./data.csv')
    .then(response => response.text())
    .then(loadData);

  loaderRemoveCount();

});

function prepareTHREEJS()
{
  xzMittelpunkt = latLon2XY(consts.llMittelpunkt);
  xzStartpunkt = latLon2XY(llStartpunkt);

  textureLoader = new THREE.TextureLoader();

  //Init Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
  scene.fog = new THREE.Fog( scene.background, km(160), km(180)); //xxx

  //Init Render
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.alpha = true;

  document.getElementById('threejs').appendChild(renderer.domElement);

  //Init Lights

  //Add Sun
  dirLight = new THREE.DirectionalLight( 0xffffff, 0.2 );
  
  dirLight.position.set(xzMittelpunkt.x, km(1000), xzMittelpunkt.z);
  scene.add( dirLight ); //xxx

  //Add Skydom
  var vertexShader = document.getElementById( 'vertexShader' ).textContent;
  var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
  var uniforms = {
    topColor:    { value: new THREE.Color( 0x0077ff ) },
    bottomColor: { value: new THREE.Color( 0x000000 ) },
    //bottomColor: { value: new THREE.Color( 0xffffff ) },
    offset:      { value: 33 },
    exponent:    { value: 0.6 }
  };
  uniforms.topColor.value = new THREE.Color(0x0c4fd7);
  scene.fog.color.copy( uniforms.bottomColor.value );

  var skyGeo = new THREE.SphereGeometry( km(300), 32, 15 );
  skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } ); //xxx

  sky = new THREE.Mesh( skyGeo, skyMat );
  sky.position.set(xzMittelpunkt.x, consts.groundAltitude, xzMittelpunkt.z);
  scene.add(sky);

  //Add Skymap
  var skyOverlayTexture = new textureLoader.load(require("./img/skybox.png"));
  skyOverlayTexture.wrapS = THREE.RepeatWrapping; 
  skyOverlayTexture.wrapT = THREE.RepeatWrapping;
  skyOverlayTexture.repeat.set(1,1); 

  var skyOverlayGeo = new THREE.PlaneBufferGeometry(km(406), km(406));
  var skyOverlayMaterial = new THREE.MeshBasicMaterial({ map : skyOverlayTexture });
  skyOverlayMaterial.transparent = true;
  skyOverlayPlane = new THREE.Mesh(skyOverlayGeo, skyOverlayMaterial);
  skyOverlayPlane.material.depthTest = true;
  skyOverlayPlane.material.side = THREE.DoubleSide;
  skyOverlayPlane.position.set(xzMittelpunkt.x, km(30), xzMittelpunkt.z);
  skyOverlayPlane.rotation.x = - Math.PI / 2;
  skyOverlayPlane.receiveShadow = false;
  scene.add( skyOverlayPlane );

  //Add Fix Points (Cities)
  cities.forEach(function(e) {
    //Calculate XZ
    let xzE = latLon2XY(e.latlon);

    //Create Sprite
    var spriteMap = textureLoader.load( e.img );
    var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, side:THREE.DoubleSide, transparent: false, color: 0xffffff  } );
    e.sprite = new THREE.Sprite( spriteMaterial );
    var e_scale = 1;
    if(e.style == "label")
    {
      var e_scale = 2;
    }

    e.sprite.scale.set(4096 * e_scale, 4096 * e_scale, 1);
    e.sprite.position.set(xzE.x, consts.groundAltitude + 2048 * e_scale, xzE.z);
    //e.sprite.position.normalize();
    //e.sprite.position.multiplyScalar( 20000000 );
    scene.add( e.sprite );
  });

  //Init Camera
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, km(400));
  camera.position.set(xzStartpunkt.x, consts.groundAltitude + 2, xzStartpunkt.z);

  //Add Startpoint-Cube (Remove me!)
  /*
  tmpGeometry = new THREE.BoxGeometry( 1000, 1000, 1000 );
  tmpMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000} );
  tmpMesh = new THREE.Mesh( tmpGeometry, tmpMaterial );
  tmpMesh.position.set(xzStartpunkt.x, consts.groundAltitude + 500, xzStartpunkt.z);
  scene.add(tmpMesh);
  */
}

function rotateCamera(_x, _y, _z, _duration)
{
  new TWEEN.Tween(camera.rotation, tweenGroupCameras)
    .to({x: _x, y: _y, z: _z}, _duration)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();

  animateTween();
}

function rotateCameraPauseTween(_x, _y, _z, _duration, _callback)
{
  stopTweenTracks();

  new TWEEN.Tween(camera.rotation, tweenGroupCameras)
    .to({x: _x, y: _y, z: _z}, _duration)
    .easing(TWEEN.Easing.Cubic.Out)
    .onComplete(function() {
      resumeTweenTracks();
      if(_callback)
        _callback();
    })
    .start();

  animateTween();
}

function animateTween()
{
  if(tweenGroupCameras.getAll().length > 0)
  {
    requestAnimationFrame( animateTween );
    tweenGroupCameras.update();
  }
  else 
  {
    //No more tweens. Calculate next.
    console.log("Ended");
  }

  renderer.render( scene, camera );
}

function userPositionSelected()
{
  //Eigener Thread, damit es angezeigt wird
  setTimeout(function() {
    //Change UI
    document.getElementById('target').style.display = 'none';
    document.getElementById('intro').style.display = 'none';

    document.getElementById('wait_after_locate').style.display = 'block';
  }, 0);

  //Remove Interactivity from Mapbox
  mapstart.boxZoom.disable();
  mapstart.scrollZoom.disable();
  mapstart.dragPan.disable();
  mapstart.dragRotate.disable();
  mapstart.keyboard.disable();
  mapstart.doubleClickZoom.disable();
  mapstart.touchZoomRotate.disable();

  //Set Startpoint and make a first Render
  llStartpunkt = new LatLon(mapstart.getCenter().lat, mapstart.getCenter().lng);

  setCameraPosition(llStartpunkt);

  //Check if remove any city label
  const point_from = turf.point([llStartpunkt.lon, llStartpunkt.lat]);
  for(var i = 0; i < cities.length; i++)
  {
    var dist = turf.distance(point_from, turf.point([cities[i].latlon.lon, cities[i].latlon.lat]), {units: 'kilometers'})
    if(dist < 15)
    {
      cities[i].sprite.visible = false;
    }
  }

  render();

  //Get Elevation Map
  loadTerrain(scene, camera, llStartpunkt);

  //Geocode Position
  var url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${llStartpunkt.lon},${llStartpunkt.lat}.json?access_token=${mapboxgl.accessToken}&country=ch&types=place`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if(data.features.length > 0)
      {
        //Data retrieved
        prepareHTMLGrid(data.features[0].text);
      }
      else
      {
        //Ups, no data. Take a neutral name
        prepareHTMLGrid();
      }
    });
  // .fail(function() {
  //   //Geocoding failed
  //   console.log("Geocoding failed");
  //   prepareHTMLGrid();
  // });
  
  //Calculate nearest Airports
  nearest_airports = getNearestAirport(llStartpunkt, 2);

  //Prepare Airport 1
  var ap1 = document.querySelectorAll(`#chapter_airport_1 .chapter_content .airport_${nearest_airports[0].properties.name} span`);
  ap1.forEach(e => e.innerHTML = e.innerHTML.replace(new RegExp("{airport_1_distance}", 'g'), Math.round(nearest_airports[0].properties.distanceToPoint)));

  document.querySelectorAll(`#chapter_airport_1 .chapter_content .airport_${nearest_airports[0].properties.name}`).forEach(e => e.style.display = 'inline');
  document.querySelectorAll(`.airport_destination_1 .chapter_content .airport_${nearest_airports[0].properties.name}`).forEach(e => e.style.display = 'inline');
  

  //Prepare Airport 2
  var ap1 = document.querySelectorAll(`#chapter_airport_2 .chapter_content .airport_${nearest_airports[1].properties.name} span`);
  ap1.forEach(e => e.innerHTML = e.innerHTML.replace(new RegExp("{airport_2_distance}", 'g'), Math.round(nearest_airports[1].properties.distanceToPoint)));
  
  document.querySelectorAll(`#chapter_airport_2 .chapter_content .airport_${nearest_airports[1].properties.name}`).forEach(e => e.style.display = 'inline');
  document.querySelectorAll(`.airport_destination_2 .chapter_content .airport_${nearest_airports[1].properties.name}`).forEach(e => e.style.display = 'inline');

  //Calculate nearest Airways
  nearest_airways = getNearestLines(llStartpunkt, 3);
  
  //Fill airways
  fillAirwayDiv(0);
  fillAirwayDiv(1);
  fillAirwayDiv(2);
}

function fillAirwayDiv(_nr)
{
  //Set Intro Text
  var intro = document.querySelector(".airways_intro");
  intro.innerHTML = intro.innerHTML.replace(new RegExp(`{airway_${_nr}_name}`, 'g'), nearest_airways[_nr].properties.name.toUpperCase());
  intro.innerHTML = intro.innerHTML.replace(new RegExp(`{airway_${_nr}_distance}`, 'g'), Math.round(nearest_airways[_nr].properties.distanceToPoint));

  document.querySelector(`.airways_intro #airway_short_${_nr}`).classList.add(`color_${nearest_airways[_nr].properties.name}`);

  var aw = airways_text[nearest_airways[_nr].properties.name];
  document.querySelector(".chapter_airways_" + _nr + " .chapter_content h2 .route_title").innerHTML = aw.title;
  document.querySelector(".chapter_airways_" + _nr + " .chapter_content h2 .label_route").classList.add("color_" + nearest_airways[_nr].properties.name);
  document.querySelector(".chapter_airways_" + _nr + " .chapter_content h2 .label_route").innerHTML = nearest_airways[_nr].properties.name.toUpperCase();
  document.querySelector(".chapter_airways_" + _nr + " .chapter_content .route_text").innerHTML = aw.text;
}

function prepareHTMLGrid(_placeName)
{
  if(_placeName != "" && _placeName != undefined)
  {
    //Show labels
    document.querySelectorAll('.has_place').forEach(e => e.style.display = 'block');
    document.querySelectorAll('.has_no_place').forEach(e => e.style.display = 'none');

    //Replace by placeName
    document.querySelectorAll(".has_place").forEach(e => e.innerHTML = e.innerHTML.replace(new RegExp("{place_name}", 'g'), _placeName));
  }
  else
  {

    document.querySelectorAll('.has_place').forEach(e => e.style.display = 'none');
    document.querySelectorAll('.has_no_place').forEach(e => e.style.display = 'block');
  }

  document.getElementById('wait_after_locate').style.display = 'none';
  document.getElementById('content').style.display = 'block';
  //Register Scrollevents

  //Calculate all scrolltops. Bether than calculate each time
  calculateScrollTop();

  //Register Event
  window.addEventListener("scroll", function() {
    var scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    for(var k in chapterScrolltop)
    {
      if(scrollTop >= chapterScrolltop[k])
      {
        if(lastChapter != k)
        {
          //Run event
          lastChapter = k;

          //Check, if not already fired
          if(calledChapters.indexOf(k) == -1)
          {
            chapterEvents[k]();
            calledChapters.push(k);
          }
        }
        break;
      }
    }
  });

  //Show scroller
  document.getElementById('scroller').style.display = 'inline';
}

function calculateScrollTop()
{
  //Calculate Scrolloffset
  var scrollOffset = window.innerHeight + 200;

  //Put keys in an extra array and reverse it
  var keys = [];
  for (var k in chapterEvents) {
      keys.unshift(k);
  }
  
  chapterScrolltop = [];
  for (var k in keys)
  {
    var keyname = keys[k];
    //Check
    var offset = document.querySelector(keyname).offsetTop - scrollOffset;
    chapterScrolltop[keyname] = offset;
  }
}

function setCameraPosition(_llStart)
{
  xzStartpunkt = latLon2XY(_llStart);
  camera.position.set(xzStartpunkt.x, consts.groundAltitude + 2, xzStartpunkt.z);
  //Not needed anymore because of terrain
  //ground.position.set(xzStartpunkt.x, consts.groundAltitude, xzStartpunkt.z);
  //groundTile.position.set(xzStartpunkt.x, consts.groundAltitude + 0.5, xzStartpunkt.z);
}


/*
###############################

  Calculate repeating Camera Movement
  Removed, because of performance reasons

###############################
*/
function getNewCameraRotation(_vector3)
{
    //Save Cameraposition
    var oldRotationX = camera.rotation.x;
    var oldRotationY = camera.rotation.y;
    var oldRotationZ = camera.rotation.z;

    //Create Vector3 as Target
    var target = _vector3;

    //Look at Point and store rotation
    camera.lookAt(target);
    var newRotationX = camera.rotation.x;
    var newRotationY = camera.rotation.y;
    var newRotationZ = camera.rotation.z;

    //Set old Rotation
    camera.rotation.set(oldRotationX, oldRotationY, oldRotationZ);

    return {x: newRotationX, y: newRotationY, z: newRotationZ};
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

function getNearestAirport(_source, _max)
{
  //Copy Geojson
  var tmpLines = airports_features;

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
  var spriteMap = new THREE.TextureLoader().load(require("./img/plane.png")); //TODO

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
      var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap } );
      var sprite = new THREE.Sprite( spriteMaterial );
      sprite.position.set(xzStartpunkt.x, km(1), xzStartpunkt.z);
      sprite.scale.set(512, 512, 1);
      sprite.visible = false;
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
      "xz": latLon2XY(new LatLon(d[headers.indexOf('latitude')], d[headers.indexOf('longitude')])),
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
  trackGroup = new THREE.Group();
  trackGroup.visible = false;
  trackLineMaterial = new THREE.LineBasicMaterial( { color: 0xffffff } );

  //Loop all icao24
  for(var icao24 in data_icao24)
  {
    icao24 = data_icao24[icao24];
    
    //Add Mesh
    icao24.geometry = new THREE.Geometry();
    icao24.geometry.vertices.needsUpdate = true;
    icao24.geometry.needsUpdate = true;

    icao24.meshline = new THREE.Line( icao24.geometry, trackLineMaterial );

    for(var i = 0; i <= icao24.series.length - 1; i++)
    {
      var vector = new THREE.Vector3(icao24.series[i].xz.x, km(15)/*icao24.series[i].altitude*/, icao24.series[i].xz.z)
      icao24.series[i].vertice = vector;
      icao24.geometry.vertices.push(vector);
    }
    trackGroup.add(icao24.meshline);
  }

  scene.add(trackGroup);
  lastTrack = new Date();
  lastTrack.setHours(0);
  lastTrack.setMinutes(0);
  lastTrack.setSeconds(0);
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
    //Todo
    //$("#maploader").fadeOut(200);
    document.getElementById('maploader').style.display = 'none'
    document.getElementById('target').style.display = 'block';
  }
}

var tweenArray = [];

function createTweensAndStart(_serie)
{
  tweenArray = [];

  //###Set Startpoint of each Sprite

  var timestampAsString = ('0' + _serie.getHours()).substr(-2) + ":" + ('0' + _serie.getMinutes()).substr(-2)  + ":00";

  //calculate next Timestamp
  var dateNext = new Date(_serie.getTime());
  dateNext.setMinutes(dateNext.getMinutes() + consts.timeSerieDeltaMin);
  var timestampNextAsString = ('0' + dateNext.getHours()).substr(-2) + ":" + ('0' + dateNext.getMinutes()).substr(-2)  + ":00";

  //Load timestamp with all points in it
  var timestamp = data_series[timestampAsString];
  var timestampNext = data_series[timestampNextAsString];

  /*Set Position of Timeline
  00:00 = 2%
  24:00 = 98%
  */
  var minAbsolute = _serie.getHours() * 60 + _serie.getMinutes();
  document.getElementById('timeline_point').style.left = ((98 - 2) / (24 * 60) * minAbsolute ) + 2 + "%";
  document.getElementById("timeline_mobile_point").style.left = ((98 - 2) / (24 * 60) * minAbsolute ) + 2 + "%";

  //Sunrise/Sunset
  var colorRatio = 1 / 120;
  if(_serie.getHours() >= 6 && _serie.getHours() <= 7)
  {
    //Change Background
    skyMat.uniforms.bottomColor.value.setRGB(skyMat.uniforms.bottomColor.value.r + colorRatio, skyMat.uniforms.bottomColor.value.g + colorRatio, skyMat.uniforms.bottomColor.value.b + colorRatio);

    //Change Light Color (0.2 -> 0.6)
    dirLight.intensity += 0.1 * colorRatio;
  }
  else if(_serie.getHours() >= 19 && _serie.getHours() <= 20)
  {
    skyMat.uniforms.bottomColor.value.setRGB(skyMat.uniforms.bottomColor.value.r - colorRatio, skyMat.uniforms.bottomColor.value.g - colorRatio, skyMat.uniforms.bottomColor.value.b - colorRatio);
    
    //Change Light Color (0.6 -> 0.2)
    dirLight.intensity -= 0.1 * colorRatio;
  }
  
  //First check, if timestampNext available. If not, we reached the end and are still alive
  if(timestampNext)
  {
    //There are more Timestamps!
    for(var serie in timestamp)
    {
      serie = timestamp[serie];
      //Look in nextserie. If icao24 not available, hide
      var foundNext = false;
      for(var serieNext in timestampNext)
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
        serie.icao24.tween = new TWEEN.Tween(serie.icao24.meshplane.position, tweenGroupPoints)
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
  lastTrack.setMinutes(lastTrack.getMinutes() + consts.timeSerieDeltaMin);

  //Now activate all Tweens and run
  if(tweenArray.length > 0)
  {
    tweenArray.forEach(function(tween) {
      //console.log("start", tween);
      tween.start();
    });
    
    animateTweenTracks();
  }
}

var animationCanRun = true;
function animateTweenTracks()
{
  if(lastTrack.getHours() >= 23 && lastTrack.getMinutes() >= 50)
  {
    render();
    return;
  }

  var doRender = false;
  if(tweenGroupPoints.getAll().length > 0)
  {
    doRender = true;
    tweenGroupPoints.update();
  }
  else 
  {
    //No more tweens. Calculate next.
    if(animationCanRun)
      createTweensAndStart(lastTrack);
  }

  if(doRender)
    requestAnimationFrame( animateTweenTracks );

  render();
}

function stopTweenTracks()
{
  animationCanRun = false;
}

function resumeTweenTracks()
{
  animationCanRun = true;
  createTweensAndStart(lastTrack);
}

function render()
{
  renderer.render( scene, camera );
}

function enableStart()
{
  var setPosition = document.getElementById('setPosition');
  setPosition.classList.add("btn_n");
  setPosition.classList.remove("btn_n_inactive");
  setPosition.addEventListener("click", userPositionSelected);
}

function disableStart()
{
  var setPosition = document.getElementById('setPosition');
  setPosition.classList.add("btn_n_inactive");
  setPosition.classList.remove("btn_n");
  setPosition.removeEventListener("click", userPositionSelected);
}

/*
###############################

  Chapter functions

###############################
*/

function chapter_routesonmapbox()
{
  mapstart.setPaintProperty("overlay", "raster-opacity", 0.8);
}

function chapter_startTHREE()
{
  document.getElementById('scroller').style.display = 'none';

  //Register event after flying
  mapstart.once('moveend', function() {
    //Animation ended
    document.getElementById('mapstart').style.display = 'none';
    render();
    if(bearing == 0)
    {
      //Workaround: Nur animation, wenn nicht zum Mittelpunkt schauen
      camera.rotation.x = 0.9;
      rotateCamera(0, camera.rotation.y, camera.rotation.z, 4000);
    }


  }); 

  /*
    Zum Mittelpunkt schauen, wenn:
      Lat > 47.4838
      Lng < 7.3563 oder < 9.1893
  */

  var bearing = 0;

  if(llStartpunkt.lat > 47.4838 || llStartpunkt.lon < 7.3563 || llStartpunkt.lon > 9.1893)
  {
    //Look at Mittelpunkt
    camera.lookAt(new THREE.Vector3(xzMittelpunkt.x, consts.groundAltitude + 2, xzMittelpunkt.z));
    bearing = bearingTo(llStartpunkt, consts.llMittelpunkt);
  }

  //Lets Fly!
  mapstart.flyTo({
    center: [llStartpunkt.lon, llStartpunkt.lat],
    pitch: 60,
    zoom: 16,
    duration: 3000,
    bearing: bearing
  });

  //Position aswell the end map
  mapend.jumpTo({
    center: [llStartpunkt.lon, llStartpunkt.lat],
    zoom: 16,
  });
}

function chapter_timelaps_slow()
{
  lastTrack.setHours(6);
  lastTrack.setMinutes(0);
  lastTrack.setSeconds(0);
  createTweensAndStart(lastTrack);
  document.getElementById('timeline').style.display = 'block';
  document.getElementById('timeline_mobile').style.display = 'block';
  //ToDo
  // $("#timeline").fadeIn();
  // $("#timeline_mobile").fadeIn();
}

function chapter_show_lines_animate_opacity()
{
  if(tweenGroupCameras.getAll().length > 0)
  {
    tweenGroupCameras.update();
    requestAnimationFrame( chapter_show_lines_animate_opacity );
  }
  renderer.render( scene, camera );
}

function chapter_show_lines()
{
  console.log("lines");
  stopTweenTracks();
  trackGroup.visible = true;
  trackLineMaterial.transparent = true;
  trackLineMaterial.opacity = 0;

  new TWEEN.Tween(trackLineMaterial, tweenGroupCameras)
    .to({opacity: 0.5}, 2000)
    //.easing(TWEEN.Easing.Cubic.Out)
    .onComplete(function() {
      setTimeout(resumeTweenTracks, 0);
    })
    .start();

  chapter_show_lines_animate_opacity();

}

function chapter_airport_internal(_nr)
{
  //stopTweenTracks();
  var llAirport = new LatLon(nearest_airports[_nr].geometry.coordinates[1], nearest_airports[_nr].geometry.coordinates[0]);
  var xzAirport = latLon2XY(llAirport);

  var newRotation = getNewCameraRotation(new THREE.Vector3(xzAirport.x, consts.groundAltitude + 2, xzAirport.z));

  rotateCameraPauseTween(camera.rotation.x, newRotation.y, camera.rotation.z, 2000);
}

function chapter_airport_1()
{
  chapter_airport_internal(0);
}

function chapter_airport_2()
{
  chapter_airport_internal(1);
}

function moveCameraToAirway(_nr)
{
  var xzAirwayPoint = latLon2XY(new LatLon(nearest_airways[_nr].geometry.coordinates[1], nearest_airways[_nr].geometry.coordinates[0]));
  var newRotation = getNewCameraRotation(new THREE.Vector3(xzAirwayPoint.x, skyOverlayPlane.position.y, xzAirwayPoint.z));
  rotateCameraPauseTween(newRotation.x, newRotation.y, newRotation.z, 2000);
}

function chapter_nearest_airway_0()
{
  moveCameraToAirway(0);
}

function chapter_nearest_airway_1()
{
  moveCameraToAirway(1);
}

function chapter_nearest_airway_2()
{
  moveCameraToAirway(2);
}

function chapter_after_airways()
{
  //var newRotation = getNewCameraRotation(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z - 20));
  //rotateCameraPauseTween(newRotation.x, newRotation.y, newRotation.z, 2000);

}

function chapter_load_heatmap()
{
  stopTweenTracks();
  document.getElementById('timeline').style.display = 'none';
  document.getElementById('timeline_mobile').style.display = 'none';

  var newRotation = getNewCameraRotation(new THREE.Vector3(camera.position.x, consts.groundAltitude - 50, camera.position.z - 10));
  new TWEEN.Tween(camera.rotation, tweenGroupCameras)
    .to({x: newRotation.x, y: newRotation.y, z: newRotation.z}, 1500)
    .easing(TWEEN.Easing.Cubic.Out)
    .onComplete(function() {
      //Enable Camera     

      document.getElementById('threejs').style.display = 'none';
      //ToDo
      // $("#threejs").fadeOut();
      document.getElementById('mapend').style.visibility = 'visible';
    
      //Enable Interactivity from Mapbox
      mapend.boxZoom.enable();
      mapend.scrollZoom.enable();
      mapend.dragPan.enable();
      mapend.dragRotate.enable();
      mapend.keyboard.enable();
      mapend.doubleClickZoom.enable();
      mapend.touchZoomRotate.enable();
    
      mapend.flyTo({
        center: [consts.llMittelpunkt.lon, consts.llMittelpunkt.lat],
        pitch: 0,
        zoom: 8,
        duration: 3000,
        bearing: 0
      });

    })
    .start();
  animateTween();

  //map.fitBounds([[5.838007, 45.797035], [10.511905, 47.981684]]);
}
