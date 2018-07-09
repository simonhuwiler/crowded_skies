/*

  ToDo:
    Resize. Three neu berechnen plus calculateScrollTop();
    Scrollen
    Mobile
    Dunkel werden
    Stoppen nach 12 Uhr. AUCH WENN WIEDER GESTARTET!!

*/
var testobject;
/*

https://www.northrivergeographic.com/qgis-points-along-line
https://threejs.org/examples/webgl_lights_hemisphere.html

http://aip.engadin-airport.ch/eAIP/2017-04-27/html/eAIP/LS-ENR-3.3-en-CH.html#ENR33-RDESIG-UN850
http://aip.engadin-airport.ch/eAIP/2017-05-25/pdf/U-ERC.pdf

*/

/*
###############################

  GLOBAL VARS

###############################
*/

//Data by timestamp
data_series = [];

//icao24-Object for reference
data_icao24 = []

//Airways-Lines as points
var airways_lines;
var nearest_airways;

//Loader count
var loaderCounter = 0;

// LatLon-Aufteilung!
const groundAltitude = 500
const timeSerieDeltaMin = 1;
var llNullPoint = new LatLon(45.4, 5.8);
var llNEPoint = new LatLon(49.052, 11.001);
var llMittelpunkt = new LatLon(46.943366, 8.311583);

//var llFlughafen = new LatLon(47.454588, 8.555721);
//var llLuzern = new LatLon(47.055046, 8.305300);
//var llZurich = new LatLon(47.372084, 8.540693);
//var llGenf = new LatLon(46.202770, 6.148037);

var llStartpunkt = llMittelpunkt;
var controls;
var lastTrack;
var trackGroup;
var trackLineMaterial;

//Mapbox Variables
var mapstart, mapend;
var geocoder;

//HTML-Varbiables
var lastChapter;
var chapterEvents = [];
var calledChapters = []

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

/*
###############################

  CITIES

###############################
*/
var cities = [
  {
    "id": "luzern",
    "img": "luzern.png",
    "latlon": new LatLon(47.055046, 8.305300),
    "style": "label"
  },
  {
    "id": "aarau",
    "img": "aarau.png",
    "latlon": new LatLon(47.390801, 8.046857),
    "style": "label"
  },
  {
    "id": "zurich",
    "img": "zurich.png",
    "latlon": new LatLon(47.372084, 8.540693),
    "style": "icon"
  },
  {
    "id": "winterthur",
    "img": "winterthur.png",
    "latlon": new LatLon(47.500399, 8.724567),
    "style": "label"
  },
  {
    "id": "stgallen",
    "img": "stgallen.png",
    "latlon": new LatLon(47.421097, 9.375037),
    "style": "label"
  },
  {
    "id": "konstanz",
    "img": "konstanz.png",
    "latlon": new LatLon(47.663340, 9.170435),
    "style": "label"
  },
  {
    "id": "schaffhausen",
    "img": "schaffhausen.png",
    "latlon": new LatLon(47.692347, 8.635310),
    "style": "label"
  },
  {
    "id": "bern",
    "img": "bern.png",
    "latlon": new LatLon(46.947311, 7.447716),
    "style": "icon"
  },
  {
    "id": "biel",
    "img": "biel.png",
    "latlon": new LatLon(47.137394, 7.248539),
    "style": "label"
  },
  {
    "id": "neuenburg",
    "img": "neuenburg.png",
    "latlon": new LatLon(46.992260, 6.910098),
    "style": "label"
  },
  {
    "id": "yverdon-les-bains",
    "img": "yverdon-les-bains.png",
    "latlon": new LatLon(46.783100, 6.640909),
    "style": "label"
  },
  {
    "id": "lausanne",
    "img": "lausanne.png",
    "latlon": new LatLon(46.518534, 6.628543),
    "style": "label"
  },
  {
    "id": "genf",
    "img": "genf.png",
    "latlon": new LatLon(46.202770, 6.148037),
    "style": "icon"
  },
  {
    "id": "zermatt",
    "img": "zermatt.png",
    "latlon": new LatLon(46.018972, 7.748883),
    "style": "label"
  },
  {
    "id": "visp",
    "img": "visp.png",
    "latlon": new LatLon(46.296203, 7.881271),
    "style": "label"
  },
  {
    "id": "sion",
    "img": "sion.png",
    "latlon": new LatLon(46.233313, 7.359701),
    "style": "label"
  },
  {
    "id": "chur",
    "img": "chur.png",
    "latlon": new LatLon(46.856793, 9.548603),
    "style": "label"
  },
  {
    "id": "stmoritz",
    "img": "stmoritz.png",
    "latlon": new LatLon(46.488049, 9.834390),
    "style": "label"
  },
  {
    "id": "davos",
    "img": "davos.png",
    "latlon": new LatLon(46.801325, 9.827914),
    "style": "label"
  },
  {
    "id": "zug",
    "img": "zug.png",
    "latlon": new LatLon(47.170165, 8.515096),
    "style": "label"
  }
];


/*
###############################

  AIRPORTS

###############################
*/
nearest_airports = [];
var airports_features = {
  "type": "FeatureCollection",
  "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  "features": [
    { "type": "Feature", "properties": { "name": "zurich" }, "geometry": { "type": "Point", "coordinates": [ 8.5546, 47.4608 ] } },
    { "type": "Feature", "properties": { "name": "geneva" }, "geometry": { "type": "Point", "coordinates": [ 6.1081, 46.2373 ] } },
    { "type": "Feature", "properties": { "name": "bale" }, "geometry": { "type": "Point", "coordinates": [ 7.5262, 47.5985 ] } }
  ]
};

/*
###############################

  AIRWAYS

###############################
*/

var airways_text = [];
airways_text['un869'] = {
  "title": "Auf zur Sonne",
  "text": "Lust auf Sonne, Croissant oder Ibérico-Schinken? Gestartet im bayrischen Nürnberg, verläuft die UN869 über Basel quer durch die Schweiz, vorbei an Biel und Neuenburg. In Genf verlässt sie die Schweiz Richtung Frankreich.<br />Über Toulouse geht die Reise weiter nach Spanien. In der Nähe von Madrid vereint sich die UN869 mit der UL27, um im spanischen Málaga ans Ziel zu kommen."
};
airways_text['un871'] = {
  "title": "Fertig Ferien",
  "text": "Nach sonnigen Wochen auf Gran Canaria bringt die UN871 sonnenverwöhnte Touristen zurück in die Heimat. Von der Insel Gran Canaria verläuft die Route nahe am marokkanischen Festland über Lanzarote. Bei der marokkanischen Stadt Essaouira trifft sie auf Festland, um im Norden kurz den Atlantischen Ozean zu streifen. Nächstes Reiseziel: Spanien. Nach einer Tour de España durchquert die UN871 Frankreich. Toulouse und Grenoble heissen nur einige Stationen. Parallel zur UN869 tritt sie über dem Genfersee in den Schweizer Luftraum ein, um in Zürich Passagiere abzuladen. Weiter gehts über München nach Polen, um in Augustow zu enden."
};
airways_text['ul613'] = {
  "title": "Einmal London bitte",
  "text": "Die UL613 ist der schnellste Weg zur Queen. Im italienischen Bozen beginnt die Luftroute. Bei Scuol tritt sie in den Schweizer Luftraum ein, um ihn bei Basel wieder zu verlassen. Im französischen Rolampont dreht die UL613 nördlich, um bei Calais den Ärmelkanal zu überqueren. London wird gestreift. Einmal quer durch Schottland endet die UL613 im Meer zwischen Schottland und den Färöerinseln."
};
airways_text['un850'] = {
  "title": "Touristenexpress auf die Insel",
  "text": "Mallorca ist berüchtigt als deutsche Touristeninsel. Die Flugautobahn nach Mallorca verläuft dabei quer über die Schweiz. Ganz im Norden Deutschlands, in der Hansestadt Lübeck, startet die UN850. Nach Frankfurt und Karlsruhe verläuft die Route über Zürich durch die Innerschweiz quer durch die Schweiz. Im Tessin geht es raus nach Italien. Auf Genua folgt das Ligurische Meer. Korsika blitzt unter den Flügeln auf. Schliesslich endet die UN850 in der Nähe von Mallorca."
};
airways_text['uz670'] = {
  "title": "Kein Stau am Himmel",
  "text": "Wenn der Touristenexpress UN850 nach Mallorca überlastet ist, hat die UZ670 ihren grossen Einsatz. Als «Umfahrungsstrasse» führt sie von Zürich parallel zur UN850 quer durch die Schweiz und endet an der schweizerisch-italienischen Grenze. Von dort ist es nur noch ein Katzensprung nach Mailand. "
};
airways_text['un851'] = {
  "title": "Zurück zur Arbeit",
  "text": "Während die UN850 sonnenhungrige Touristen nach Mallorca führt, bringt die UN851 sonnengebräunte Touristen zurück nach Hause. Gestartet an der spanischen Atlantikküste in der Nähe von Cádiz verläuft sie über Málaga nach Mallorca und Korsika. Nach dem Ligurischen Meer trifft sie bei Genua auf italienisches Festland. Einmal quer durchs Tessin bis nach Zürich heisst es nun. Quer durch Deutschland über Würzburg nach Hannover verläuft die UN851, um bei der Ostsee in Lübeck zu enden."
};
airways_text['ul856'] = {
  "title": "Mozartkugeln mit Senf",
  "text": "Im Geburtsort von Mozart – im österreichischen Salzburg – startet die UL856. Über Deutschland tritt sie beim Bodensee in den Schweizer Luftraum ein. Nach Zürich und Basel endet sie im französischen Dijon."
};
airways_text['y100'] = {
  "title": "Umfahrungsstrasse",
  "text": "Wenn der Touristenexpress UN850 nach Mallorca überlastet ist, hat die UZ670 ihren grossen Einsatz. Als «Umfahrungsstrasse» führt sie von Zürich parallel zur UN850 quer durch die Schweiz und endet an der schweizerisch-italienischen Grenze. Von dort ist es nur noch ein Katzensprung nach Mailand. "
};

/*
###############################

  THREEJS VARS

###############################
*/
var renderer, scene, camera, textureLoader, sky, skyMat, ground;
var tweenGroupPoints = new TWEEN.Group();
var tweenGroupCameras = new TWEEN.Group();
var rendertarget, bufferScene;

/*
###############################

  READY VOID()

###############################
*/

$(document).ready( function() {

  $("#render").on("click", function() {
    //camera.lookAt(new THREE.Vector3(xzStartpunkt.x, km(100), xzStartpunkt.z));
    renderer.render( scene, camera );
  });

  $("#doit").on("click", function() {
    cameraMovements.push(getNewCameraRotation(new THREE.Vector3(camera.position.x + 4, camera.position.y + 5, camera.position.z - 20)));
    cameraMovements.push(getNewCameraRotation(new THREE.Vector3(camera.position.x - 4, camera.position.y + 5, camera.position.z - 20)));
    cameraMovements.push(getNewCameraRotation(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z - 1)));

    createCameraMovementTween();
    //Tween
    //new TWEEN.Tween(camera.rotation, tweenGroupCameras).to({x: newRotationX, y: newRotationY, z: newRotationZ}, 2000);


    //animateTweenTracks();
    //chapter_show_lines();
    
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

  $("#rendertarget_1").on("click", function(e) {

    console.log("rendertarget1");


    var spriteMap = new THREE.TextureLoader().load( "img/plane.png" );
    var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, side:THREE.DoubleSide, transparent: false, color: 0xffffff  } );
    testobject = new THREE.Sprite( spriteMaterial );
    testobject.scale.set(32, 32, 1);
    testobject.position.set(xzStartpunkt.x, groundAltitude + 10, xzStartpunkt.z - km(1));
    scene.add( testobject );
    bufferScene.add( testobject );

    //Create Bildschirm
    var fadeMaterial = new THREE.MeshBasicMaterial({
      //color: 0xffcc00,
      transparent: true,
      opacity: 1,
      map: rendertarget.texture
    });

    var fadePlane = new THREE.PlaneBufferGeometry(1, 1);
    var fadeMesh = new THREE.Mesh(fadePlane, fadeMaterial);
    fadeMesh.position.set(camera.position.x, camera.position.y, camera.position.z - 0.1);
    fadeMesh.renderOrder = -1;
    scene.add(fadeMesh);
     

    renderer.render(bufferScene, camera, rendertarget);
    renderer.render( scene, camera );
  });


  $("#rendertarget_2").on("click", function(e) {
    console.log("rendertarget2");

    testobject.position.y += 1;

    renderer.render(bufferScene, camera, rendertarget);
    renderer.render( scene, camera );

  });

  $("#play").on("click", function(e) {
    animateLines();
  });  
  $("#play2").on("click", function(e) {
    createTweensAndStart(lastTrack);
  });

  $("#count").on("click", function() {
    renderTracks();
    render();
    return;
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

  $("#cameratest").on("click", function() {

    prepareHTMLGrid();

  });


  $("#setPosition").on("click", function() {
    userPositionSelected();
  });

  //PrepareMapbox Start
  loaderAddCount();
  mapboxgl.accessToken = 'pk.eyJ1IjoiYmxpY2stc3Rvcnl0ZWxsaW5nIiwiYSI6ImNpcjNiaWFsZjAwMThpM25xMzIxcXM1bzcifQ.XJat3GcYrmg9o-0oAaz3kg';
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
    mapstart.fitBounds([[5.838007, 45.797035], [10.511905, 47.981684]]);
    loaderRemoveCount(); //Mapbox
    $("#target").show();
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
  //xzLuzern = latLon2XY(llNullPoint, llLuzern);

  textureLoader = new THREE.TextureLoader();

  //Init Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
  scene.fog = new THREE.Fog( scene.background, km(160), km(180));

  //Init Render
  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.alpha = true;
  //renderer.gammaInput = true;
  //renderer.gammaOutput = true;
  //renderer.shadowMap.enabled = true;
  //document.body.appendChild( renderer.domElement );
  $("#threejs").append(renderer.domElement);

  //TEST RENDERTARGET
  /*
  bufferScene = new THREE.Scene();
  rendertarget = new THREE.WebGLRenderTarget();
  rendertarget.setSize( window.innerWidth, window.innerHeight );
  */

  //Init Lights

  //Init HemisphereLight (color Fading)
  hemiLight = new THREE.HemisphereLight( 0x0c4fd7, 0xa7bdea, 1 );
  //hemiLight.color.setHSL( 0.6, 1, 0.6 );
  //hemiLight.color.setHex(0xffcc00);
  //hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
  //hemiLight.groundColor.setHex(0x000000);
  hemiLight.position.set( 0, km(100), 0 );
  //scene.add( hemiLight );

  //Add Sun
  dirLight = new THREE.DirectionalLight( 0xffffff, 0.2 );
  
  //dirLight.color.setHSL( 0.1, 1, 0.55 );
  dirLight.position.set(xzMittelpunkt.x, km(1000), xzMittelpunkt.z);
  scene.add( dirLight );

  //Add ground
  var groundGeo = new THREE.PlaneBufferGeometry( km(100), km(100) );
  //var groundMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 });
  var groundMat = new THREE.MeshPhongMaterial( { color: 0xf2f2f1, specular: 0xf2f2f1 });

  
  //groundMat.color.setHSL( 0.095, 1, 0.75 );
  groundMat.color.setHex(0xf2f2f1);

  ground = new THREE.Mesh( groundGeo, groundMat );
  ground.rotation.x = - Math.PI / 2;
  ground.position.set(xzMittelpunkt.x, groundAltitude, xzMittelpunkt.z);
  ground.receiveShadow = true;
  scene.add( ground );

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
  uniforms.topColor.value.copy( hemiLight.color );

  //scene.fog.color.copy( uniforms.bottomColor.value );

  var skyGeo = new THREE.SphereBufferGeometry( km(300), 32, 15 );
  skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );

  sky = new THREE.Mesh( skyGeo, skyMat );
  sky.position.set(xzMittelpunkt.x, groundAltitude, xzMittelpunkt.z);
  scene.add(sky);

  //Add Skymap
  var skyOverlayTexture = new textureLoader.load( "img/skybox.png" );
  skyOverlayTexture.wrapS = THREE.RepeatWrapping; 
  skyOverlayTexture.wrapT = THREE.RepeatWrapping;
  skyOverlayTexture.repeat.set(1,1); 

  var skyOverlayGeo = new THREE.PlaneBufferGeometry(km(406), km(406));
  skyOverlayMaterial = new THREE.MeshBasicMaterial({ map : skyOverlayTexture });
  skyOverlayMaterial.transparent = true;
  skyOverlayPlane = new THREE.Mesh(skyOverlayGeo, skyOverlayMaterial);
  skyOverlayPlane.material.depthTest = false;
  skyOverlayPlane.material.side = THREE.DoubleSide;
  skyOverlayPlane.position.set(xzMittelpunkt.x, km(30), xzMittelpunkt.z);
  skyOverlayPlane.rotation.x = - Math.PI / 2;
  skyOverlayPlane.receiveShadow = false;
  scene.add( skyOverlayPlane );


  //Add Fix Points (Cities)
  cities.forEach(function(e) {
    //Calculate XZ
    xzE = latLon2XY(llNullPoint, e.latlon);

    /*
    //Create Geometry
    e.geometry = new THREE.BoxGeometry( km(1), km(1), km(1) );

    //Create Mataerial
    e.material = new THREE.MeshBasicMaterial( { color: 0x00ff00} );

    //Create Mesh
    e.mesh = new THREE.Mesh( e.geometry, e.material );
    e.mesh.position.set(xzE.x, groundAltitude + getHalfHeightOfObject(e.mesh), xzE.z);
    scene.add( e.mesh );
    */

    //Create Sprite
    var spriteMap = textureLoader.load( "labels/" + e.img );
    var spriteMaterial = new THREE.SpriteMaterial( { map: spriteMap, side:THREE.DoubleSide, transparent: false, color: 0xffffff  } );
    e.sprite = new THREE.Sprite( spriteMaterial );
    var e_scale = 1;
    if(e.style == "label")
    {
      var e_scale = 2;
    }

    e.sprite.scale.set(4096 * e_scale, 4096 * e_scale, 1);
    e.sprite.position.set(xzE.x, groundAltitude + 2048 * e_scale, xzE.z);
    //e.sprite.position.normalize();
    //e.sprite.position.multiplyScalar( 20000000 );
    scene.add( e.sprite );
  });

  //Init Camera
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, km(400));
  camera.position.set(xzStartpunkt.x, groundAltitude + 2, xzStartpunkt.z);

  //Add Startpoint-Cube (Remove me!)
  tmpGeometry = new THREE.BoxGeometry( 1000, 1000, 1000 );
  tmpMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000} );
  tmpMesh = new THREE.Mesh( tmpGeometry, tmpMaterial );
  tmpMesh.position.set(xzStartpunkt.x, groundAltitude + 500, xzStartpunkt.z);
  scene.add(tmpMesh);
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
  //Change UI
  $("#target").hide();
  $("#wait_after_locate").show();

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
  //camera.rotation.x = 0.9;
  render();

  //Geocode Position
  var url = "https://api.mapbox.com/geocoding/v5/mapbox.places/" + llStartpunkt.lon + "," + llStartpunkt.lat + ".json?access_token=" + mapboxgl.accessToken;
  $.get(url, {country: 'ch', types: 'place'},function(data){
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
  })
  .fail(function() {
    //Geocoding failed
    console.log("Geocoding failed");
    prepareHTMLGrid();
  });

  //Calculate nearest Airports
  nearest_airports = getNearestAirport(llStartpunkt, 2);

  //Copy Airport-section in HTML
  $(".chapter_airport").clone().insertAfter(".chapter_airport");

  //Prepare Airport 1
  var ap1 = $("#chapter_airport_1 .chapter_content .airport_" + nearest_airports[0].properties.name + " span");
  ap1.each(function(e) {
    $(this).text($(this).text().replace(new RegExp("{airport_1_distance}", 'g'), Math.round(nearest_airports[0].properties.distanceToPoint)));
  });
  $("#chapter_airport_1 .chapter_content .airport_" + nearest_airports[0].properties.name).show();
  $(".airport_destination_1 .chapter_content .airport_" + nearest_airports[0].properties.name).show();
  

  //Prepare Airport 2
  var ap1 = $("#chapter_airport_2 .chapter_content .airport_" + nearest_airports[1].properties.name + " span");
  ap1.each(function(e) {
    $(this).text($(this).text().replace(new RegExp("{airport_2_distance}", 'g'), Math.round(nearest_airports[1].properties.distanceToPoint)));
  });
  $("#chapter_airport_2 .chapter_content .airport_" + nearest_airports[1].properties.name).show();
  $(".airport_destination_2 .chapter_content .airport_" + nearest_airports[1].properties.name).show();

  //Calculate nearest Airways
  nearest_airways = getNearestLines(llStartpunkt, 3);
  
  //Set Intro text
  var intro = $(".airways_intro");
  intro.html(intro.html().replace(new RegExp("{airway_1_name}", 'g'), nearest_airways[0].properties.name.toUpperCase()));
  intro.html(intro.html().replace(new RegExp("{airway_1_distance}", 'g'), Math.round(nearest_airways[0].properties.distanceToPoint)));
  
  intro.html(intro.html().replace(new RegExp("{airway_2_name}", 'g'), nearest_airways[1].properties.name.toUpperCase()));
  intro.html(intro.html().replace(new RegExp("{airway_2_distance}", 'g'), Math.round(nearest_airways[1].properties.distanceToPoint)));

  intro.html(intro.html().replace(new RegExp("{airway_3_name}", 'g'), nearest_airways[2].properties.name.toUpperCase()));
  intro.html(intro.html().replace(new RegExp("{airway_3_distance}", 'g'), Math.round(nearest_airways[2].properties.distanceToPoint)));

  //Fill airways
  fillAirwayDiv(0);
  fillAirwayDiv(1);
  fillAirwayDiv(2);
}

function fillAirwayDiv(_nr)
{
  aw = airways_text[nearest_airways[_nr].properties.name];
  $(".chapter_airways_" + _nr + " .chapter_content h2 .route_title").text(aw.title);
  $(".chapter_airways_" + _nr + " .chapter_content h2 .label_route").addClass("color_" + nearest_airways[_nr].properties.name);
  $(".chapter_airways_" + _nr + " .chapter_content h2 .label_route").text(nearest_airways[_nr].properties.name.toUpperCase());
  $(".chapter_airways_" + _nr + " .chapter_content .route_text").text(aw.text);
}

function prepareHTMLGrid(_placeName)
{
  if(_placeName != "" && _placeName != undefined)
  {
    //Show labels
    $(".has_place").show();
    $(".has_no_place").hide();

    //Replace by placeName
    $(".has_place").each(function(e) {
      $(this).text($(this).text().replace(new RegExp("{place_name}", 'g'), _placeName));
    });
  }
  else
  {
    $(".has_place").hide();
    $(".has_no_place").show();
  }
  $("#wait_after_locate").hide();
  $("#content").fadeIn(400, function() {
    //Register Scrollevents after FadeIn

    //Calculate all scrolltops. Bether than calculate each time
    calculateScrollTop();

    //Register Event
    $(document).scroll(function() {
      scrollTop = $(document).scrollTop();
      for(k in chapterScrolltop)
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
  });
}

function calculateScrollTop()
{
  //Calculate Scrolloffset
  var scrollOffset = $(window).height() - 200;

  //Put keys in an extra array and reverse it
  var keys = [];
  for (var k in chapterEvents) {
      keys.unshift(k);
  }
  
  chapterScrolltop = [];
  for (var k in keys)
  {
    var keyname = keys[k];
    var offset = $(keyname).offset().top - scrollOffset;
    chapterScrolltop[keyname] = offset;
  }
}

function addFixChart(_url)
{
  var fixchart = $("#fixchart");
  fixchart.empty();
  fixchart.append($("<img src='" + _url + "'>"));
  fixchart.fadeIn(1000);
}

function setCameraPosition(_llStart)
{
  xzStartpunkt = latLon2XY(llNullPoint, _llStart);
  camera.position.set(xzStartpunkt.x, groundAltitude + 2, xzStartpunkt.z);
  tmpMesh.position.set(xzStartpunkt.x, groundAltitude + 500, xzStartpunkt.z);
  ground.position.set(xzStartpunkt.x, groundAltitude, xzStartpunkt.z);
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

/*
var cameraMovements = [];
var lastCameraMovement = -1;

function createCameraMovementTween()
{
  if(lastCameraMovement >= cameraMovements.length - 1)
    lastCameraMovement = 0
  else
    lastCameraMovement++;

  new TWEEN.Tween(camera.rotation, tweenGroupCameras)
  .to({x: cameraMovements[lastCameraMovement].x, y: cameraMovements[lastCameraMovement].y, z: cameraMovements[lastCameraMovement].z}, 10000)
  .easing(TWEEN.Easing.Quadratic.InOut)
  .onComplete(function() {
    setTimeout(createCameraMovementTween, 10);

  })
  .start();
}
*/


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
  trackGroup = new THREE.Group();
  trackGroup.visible = false;
  trackLineMaterial = new THREE.LineBasicMaterial( { color: 0xffffff } );

  //Loop all icao24
  for(icao24 in data_icao24)
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

/*
//Original. Objekte erzeugen, aber noch nicht zeichnen.
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
*/

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

  /*Set Position of Timeline
  00:00 = 2%
  24:00 = 98%
  */
  var minAbsolute = _serie.getHours() * 60 + _serie.getMinutes();
  $("#timeline_point").css("left", ((98 - 2) / (24 * 60) * minAbsolute ) + 2 + "%"); 

  //Sunrise/Sunset
  var colorRatio = 1 / 120;
  if(_serie.getHours() >= 6 && _serie.getHours() <= 7)
  {
    //Change Background
    skyMat.uniforms.bottomColor.value.setRGB(skyMat.uniforms.bottomColor.value.r + colorRatio, skyMat.uniforms.bottomColor.value.g + colorRatio, skyMat.uniforms.bottomColor.value.b + colorRatio);

    //Change Light Color (0.2 -> 0.6)
    dirLight.intensity += 0.4 * colorRatio;
  }
  else if(_serie.getHours() >= 21 && _serie.getHours() <= 22)
  {
    skyMat.uniforms.bottomColor.value.setRGB(skyMat.uniforms.bottomColor.value.r - colorRatio, skyMat.uniforms.bottomColor.value.g - colorRatio, skyMat.uniforms.bottomColor.value.b - colorRatio);
    
    //Change Light Color (0.6 -> 0.2)
    dirLight.intensity -= 0.4 * colorRatio;
  }

  
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
  lastTrack.setMinutes(lastTrack.getMinutes() + timeSerieDeltaMin);

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

  /*
  if(tweenGroupCameras.getAll().length > 0)
  {
    doRender = true;
    tweenGroupCameras.update();
  }
  */

  if(doRender)
    requestAnimationFrame( animateTweenTracks );

  renderer.render( scene, camera );
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

/*
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
*/

function render()
{
  renderer.render( scene, camera );
}

/*
###############################

  Chapter functions

###############################
*/

function chapter_startTHREE()
{
  //Register event after flying
  mapstart.once('moveend', function() {
    //Animation ended
    $("#mapstart").fadeOut();
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
    camera.lookAt(new THREE.Vector3(xzMittelpunkt.x, groundAltitude + 2, xzMittelpunkt.z));
    bearing = bearingTo(llStartpunkt, llMittelpunkt);
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
  $("#timeline").fadeIn();
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
  xzAirport = latLon2XY(llNullPoint, llAirport);

  var newRotation = getNewCameraRotation(new THREE.Vector3(xzAirport.x, groundAltitude + 2, xzAirport.z));

  rotateCameraPauseTween(camera.rotation.x, newRotation.y, camera.rotation.z, 2000);
  /*
  new TWEEN.Tween(camera.rotation, tweenGroupCameras)
    .to({y: newRotation.y}, 2000)
    .easing(TWEEN.Easing.Cubic.Out)
    .onComplete(function() {
      console.log("Resume Tween");
      resumeTweenTracks();
    })
    .start();

  animateTween();
  */
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
  xzAirwayPoint = latLon2XY(llNullPoint, new LatLon(nearest_airways[_nr].geometry.coordinates[1], nearest_airways[_nr].geometry.coordinates[0]));
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
  var newRotation = getNewCameraRotation(new THREE.Vector3(camera.position.x, camera.position.y, camera.position.z - 20));
  //rotateCameraPauseTween(newRotation.x, newRotation.y, newRotation.z, 2000);

}

function chapter_load_heatmap()
{
  stopTweenTracks();

  var newRotation = getNewCameraRotation(new THREE.Vector3(camera.position.x, groundAltitude - 50, camera.position.z - 10));
  new TWEEN.Tween(camera.rotation, tweenGroupCameras)
    .to({x: newRotation.x, y: newRotation.y, z: newRotation.z}, 1500)
    .easing(TWEEN.Easing.Cubic.Out)
    .onComplete(function() {
      //Enable Camera     

      $("#threejs").fadeOut();
      $("#mapend").css("visibility", "visible");
    
      //Enable Interactivity from Mapbox
      mapend.boxZoom.enable();
      mapend.scrollZoom.enable();
      mapend.dragPan.enable();
      mapend.dragRotate.enable();
      mapend.keyboard.enable();
      mapend.doubleClickZoom.enable();
      mapend.touchZoomRotate.enable();
    
      mapend.flyTo({
        center: [llMittelpunkt.lon, llMittelpunkt.lat],
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

/*
###############################

  Different Calculations

###############################
*/
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


