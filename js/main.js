/*

  ToDo:
  * Texture (WMS?)
  * Flugifarbe
  * Metazeugs
  * Minify
  * tracker!


*/
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

  Shape Switzerland

###############################
*/

var shape_switzerland = turf.polygon([[[8.3847,46.4522],[8.3669,46.4519],[8.2989,46.4142],[8.3187,46.3861],[8.25,46.3408],[8.224,46.3344],[8.212,46.3098],[8.1614,46.2959],[8.141,46.3021],[8.0864,46.2665],[8.1102,46.2495],[8.1153,46.2361],[8.1389,46.2261],[8.1533,46.1911],[8.1655,46.1822],[8.1496,46.1615],[8.1441,46.1367],[8.1161,46.1305],[8.1082,46.1116],[8.0348,46.1008],[8.0217,46.0694],[8.0353,46.044],[8.0119,46.0312],[7.9891,45.9959],[7.9771,45.9995],[7.9087,45.9969],[7.8923,45.9775],[7.8774,45.9739],[7.8684,45.9367],[7.8731,45.9205],[7.8218,45.927],[7.7995,45.9171],[7.7693,45.9371],[7.7478,45.941],[7.7351,45.924],[7.7073,45.9349],[7.7099,45.9481],[7.681,45.957],[7.6643,45.9757],[7.6395,45.9701],[7.589,45.9705],[7.575,45.9874],[7.5501,45.9866],[7.539,45.9554],[7.5169,45.9624],[7.4773,45.9521],[7.4749,45.9372],[7.4444,45.9316],[7.4271,45.9155],[7.4018,45.9115],[7.3845,45.8968],[7.3442,45.9152],[7.2853,45.9157],[7.2769,45.9007],[7.2164,45.8888],[7.189,45.8589],[7.1535,45.8793],[7.1185,45.8594],[7.1011,45.8593],[7.0645,45.9093],[7.0437,45.9232],[7.0374,45.9549],[7.0086,45.9692],[7.0226,45.9772],[7.0107,45.9972],[6.985,46.0046],[6.9813,46.0196],[6.9629,46.0304],[6.9514,46.0499],[6.9246,46.0652],[6.8913,46.0427],[6.8717,46.0512],[6.8918,46.0737],[6.8822,46.0952],[6.8999,46.1239],[6.8151,46.1293],[6.798,46.1364],[6.7917,46.1629],[6.8126,46.1815],[6.8035,46.2046],[6.854,46.2539],[6.8649,46.2802],[6.8301,46.3001],[6.8198,46.3156],[6.7751,46.3471],[6.7714,46.361],[6.7927,46.3676],[6.8211,46.4272],[6.6819,46.4543],[6.5191,46.4564],[6.4256,46.4158],[6.3352,46.4037],[6.253,46.3604],[6.2196,46.3119],[6.249,46.302],[6.238,46.2817],[6.2668,46.2477],[6.3098,46.2562],[6.3103,46.244],[6.2913,46.2238],[6.2496,46.205],[6.234,46.2064],[6.1862,46.1783],[6.1888,46.1664],[6.1364,46.1416],[6.0985,46.1438],[6.0917,46.1519],[6.0523,46.1513],[6.0317,46.1393],[5.9642,46.1445],[5.9922,46.1865],[5.9638,46.1972],[5.9792,46.2173],[5.9928,46.2152],[6.0337,46.2386],[6.0461,46.2314],[6.0881,46.2471],[6.1018,46.2379],[6.1236,46.2506],[6.1028,46.2851],[6.1205,46.2974],[6.12,46.3123],[6.1699,46.3661],[6.0976,46.409],[6.0639,46.4164],[6.0864,46.4439],[6.0728,46.4654],[6.0969,46.4813],[6.1126,46.5096],[6.1567,46.5453],[6.1105,46.5764],[6.1396,46.5976],[6.179,46.6158],[6.2673,46.6762],[6.282,46.6907],[6.3521,46.7149],[6.3851,46.7319],[6.3952,46.7485],[6.4382,46.7618],[6.4584,46.7888],[6.4348,46.8015],[6.4432,46.8327],[6.46,46.8513],[6.4646,46.8904],[6.4327,46.9287],[6.4497,46.936],[6.4965,46.9741],[6.5189,46.971],[6.618,46.9916],[6.6404,47.0028],[6.6592,47.0273],[6.6989,47.0388],[6.7196,47.052],[6.6915,47.0667],[6.703,47.0823],[6.7467,47.0976],[6.7647,47.1204],[6.806,47.1307],[6.8584,47.1654],[6.8804,47.2003],[6.939,47.2307],[6.952,47.2699],[6.9408,47.2865],[7.0077,47.3011],[7.01,47.3245],[7.0456,47.3265],[7.0624,47.3441],[7.0499,47.3614],[7.0122,47.3729],[6.9955,47.3634],[6.9241,47.3552],[6.8836,47.3729],[6.9135,47.3881],[6.9206,47.4051],[6.9384,47.4061],[6.9403,47.4333],[6.9703,47.4471],[6.9959,47.4496],[7.0005,47.4672],[6.986,47.4933],[7.0249,47.5043],[7.0721,47.4924],[7.1122,47.4951],[7.128,47.5039],[7.1593,47.4907],[7.1909,47.4885],[7.1702,47.443],[7.2067,47.4348],[7.2334,47.4386],[7.2454,47.421],[7.2819,47.4348],[7.3387,47.4412],[7.3811,47.432],[7.4031,47.4355],[7.43,47.4595],[7.4557,47.4734],[7.4294,47.4829],[7.435,47.4981],[7.4708,47.4807],[7.5111,47.497],[7.5091,47.5092],[7.5309,47.5268],[7.498,47.5362],[7.5547,47.5644],[7.589,47.5899],[7.6191,47.5769],[7.6457,47.597],[7.6752,47.592],[7.6835,47.5713],[7.6483,47.5599],[7.6509,47.5474],[7.6751,47.5337],[7.7553,47.5463],[7.7963,47.5577],[7.8195,47.5873],[7.8465,47.5824],[7.8694,47.5888],[7.8981,47.5841],[7.9173,47.5477],[7.9478,47.5448],[7.9557,47.5568],[8.0214,47.5503],[8.0673,47.5645],[8.0971,47.5608],[8.1069,47.5806],[8.1652,47.5943],[8.2012,47.6203],[8.2289,47.6055],[8.2579,47.6153],[8.2977,47.6054],[8.2975,47.5895],[8.3246,47.5726],[8.383,47.5658],[8.3994,47.5771],[8.4342,47.5667],[8.4768,47.5779],[8.4605,47.5884],[8.4792,47.6152],[8.5083,47.6175],[8.5165,47.632],[8.5579,47.6245],[8.5631,47.5994],[8.5826,47.5961],[8.6034,47.611],[8.5958,47.643],[8.608,47.6524],[8.6066,47.6721],[8.5777,47.6615],[8.5637,47.67],[8.5269,47.6605],[8.5318,47.6457],[8.5,47.6473],[8.4671,47.6415],[8.4064,47.6762],[8.4046,47.698],[8.4453,47.7231],[8.4501,47.739],[8.489,47.7732],[8.5202,47.7705],[8.5529,47.7846],[8.5664,47.7779],[8.5877,47.8027],[8.6139,47.8012],[8.6194,47.7677],[8.6452,47.765],[8.6455,47.7872],[8.681,47.7866],[8.6887,47.7584],[8.7141,47.7654],[8.7236,47.7456],[8.7112,47.7301],[8.7363,47.7163],[8.728,47.6928],[8.757,47.6896],[8.7834,47.6772],[8.8001,47.6918],[8.7698,47.7184],[8.8067,47.7383],[8.8238,47.711],[8.8458,47.7112],[8.8511,47.6856],[8.8734,47.6702],[8.8754,47.6549],[8.8982,47.6482],[8.9412,47.6562],[9.0207,47.6867],[9.0949,47.6793],[9.1176,47.6688],[9.1567,47.6661],[9.1706,47.6548],[9.2566,47.6587],[9.3947,47.6203],[9.4956,47.5515],[9.5587,47.5419],[9.5626,47.4952],[9.5941,47.4644],[9.6563,47.4537],[9.6443,47.4349],[9.6516,47.4046],[9.6731,47.3919],[9.6567,47.3688],[9.6245,47.3661],[9.6002,47.3463],[9.588,47.3172],[9.5556,47.2975],[9.5307,47.2706],[9.5205,47.244],[9.5017,47.2202],[9.486,47.1805],[9.5082,47.1407],[9.5196,47.0983],[9.5128,47.0851],[9.4741,47.0664],[9.4913,47.0562],[9.5398,47.0651],[9.5569,47.0485],[9.6035,47.0618],[9.6365,47.0517],[9.6451,47.0598],[9.6821,47.0588],[9.7182,47.0434],[9.7481,47.0369],[9.7833,47.0384],[9.8308,47.0143],[9.8794,47.0196],[9.8729,47.0065],[9.8922,46.9903],[9.8711,46.9633],[9.8761,46.9346],[9.9461,46.9123],[9.9779,46.9159],[9.9824,46.9062],[10.0185,46.9008],[10.0526,46.8757],[10.0596,46.8608],[10.0874,46.8612],[10.1052,46.8409],[10.1233,46.8483],[10.1574,46.8479],[10.1937,46.8664],[10.2307,46.8664],[10.2257,46.8959],[10.2417,46.9316],[10.2936,46.9219],[10.3061,46.9403],[10.3547,46.9923],[10.3983,46.9971],[10.4266,46.9757],[10.4286,46.9561],[10.4556,46.9528],[10.4893,46.9378],[10.4862,46.9155],[10.4647,46.8843],[10.4718,46.8488],[10.4566,46.8302],[10.4507,46.8041],[10.4266,46.7894],[10.444,46.7581],[10.4003,46.7332],[10.4188,46.7187],[10.3933,46.6892],[10.391,46.6589],[10.4091,46.6351],[10.4434,46.6394],[10.4843,46.6174],[10.4876,46.5895],[10.4751,46.5663],[10.4722,46.5435],[10.4528,46.5307],[10.4183,46.5513],[10.3971,46.5439],[10.3519,46.5559],[10.2961,46.55],[10.2875,46.5703],[10.2461,46.575],[10.2421,46.5922],[10.2589,46.6104],[10.2242,46.6291],[10.1374,46.6107],[10.1024,46.6107],[10.0956,46.5773],[10.0717,46.559],[10.0535,46.5317],[10.0433,46.4817],[10.0525,46.4604],[10.0419,46.4523],[10.0603,46.4284],[10.1007,46.4213],[10.1289,46.4317],[10.1612,46.4154],[10.164,46.3906],[10.129,46.3787],[10.1291,46.3609],[10.108,46.3515],[10.1045,46.3331],[10.1166,46.3141],[10.1387,46.3047],[10.1623,46.2824],[10.1749,46.2546],[10.146,46.2305],[10.1233,46.2238],[10.1035,46.2286],[10.0709,46.2172],[10.044,46.2296],[10.0606,46.2483],[10.0545,46.2666],[9.9959,46.2849],[10.0008,46.3015],[9.98,46.3231],[9.9959,46.3422],[9.9645,46.3638],[9.9528,46.3793],[9.917,46.3703],[9.9074,46.3809],[9.8803,46.3682],[9.832,46.3605],[9.8183,46.3497],[9.7698,46.3358],[9.7436,46.3512],[9.723,46.3407],[9.7262,46.3195],[9.7145,46.2929],[9.6883,46.2936],[9.677,46.3031],[9.6347,46.286],[9.6104,46.2946],[9.5795,46.2951],[9.5375,46.3093],[9.5135,46.3331],[9.4963,46.3644],[9.4612,46.3759],[9.4688,46.3889],[9.4545,46.4214],[9.4656,46.4695],[9.4585,46.5084],[9.4342,46.4979],[9.4117,46.4669],[9.3905,46.4733],[9.3685,46.4957],[9.3734,46.504],[9.3109,46.5041],[9.2834,46.497],[9.2655,46.4511],[9.2497,46.4311],[9.2754,46.4195],[9.2844,46.3852],[9.2751,46.3737],[9.2961,46.355],[9.2993,46.3275],[9.2815,46.3094],[9.2849,46.297],[9.2588,46.2784],[9.2349,46.2334],[9.2023,46.2084],[9.1947,46.1793],[9.1822,46.1695],[9.1345,46.1533],[9.1215,46.1348],[9.0724,46.118],[9.0896,46.087],[9.0783,46.0653],[9.0502,46.0624],[9.0174,46.05],[9.0076,46.0298],[9.0226,46.0169],[9.0285,45.9936],[8.9939,45.9666],[9.0139,45.9606],[9.0223,45.9375],[9.0766,45.9115],[9.0888,45.8969],[9.0664,45.8754],[9.0309,45.8247],[8.9984,45.8229],[8.9467,45.8426],[8.9142,45.8422],[8.9373,45.8671],[8.9248,45.9037],[8.8933,45.9312],[8.8981,45.9494],[8.8782,45.9566],[8.8391,45.9843],[8.7958,45.9921],[8.7931,46.0081],[8.8282,46.0342],[8.8546,46.0616],[8.8521,46.0756],[8.8153,46.0973],[8.783,46.0941],[8.76,46.1017],[8.7424,46.1223],[8.7138,46.0973],[8.6577,46.1126],[8.648,46.1234],[8.6118,46.1217],[8.5699,46.1769],[8.5404,46.1978],[8.5324,46.2183],[8.4688,46.2329],[8.4434,46.2502],[8.4498,46.2743],[8.4277,46.2983],[8.4437,46.3195],[8.4654,46.3339],[8.4702,46.3624],[8.4609,46.3864],[8.4712,46.3959],[8.4569,46.423],[8.4664,46.4427],[8.4385,46.4643],[8.3847,46.4522]]]);

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
  "text": "Lust auf Sonne, Croissant oder Ibérico-Schinken? Gestartet im bayrischen Nürnberg, verläuft die UN869 über Basel quer durch die Schweiz, vorbei an Biel und Neuenburg. In Genf verlässt sie die Schweiz Richtung Frankreich. Über Toulouse geht die Reise weiter nach Spanien. In der Nähe von Madrid vereint sich die UN869 mit der UL27, um im spanischen Málaga ans Ziel zu kommen."
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

  $(window).on("resize", function() {
    if(camera && renderer)
    {
      calculateScrollTop();
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize( window.innerWidth, window.innerHeight );
      render();
    }
  });

  $("#adventuremode").on("click", function() {
    var btn_old = $("#adventuremode");
    var btn_new = $("#buttonReload");

    //Set Position
    btn_new.css("left", btn_old.offset().left);
    btn_new.css("top", btn_old.offset().top - $(window).scrollTop());
    btn_new.show();

    //Hide old
    btn_old.css("visibility", "hidden");

    //Start Fadeout
    $("#content").fadeOut();

    //Start Animation
    btn_new.addClass("buttonAnimation");
    setTimeout(function() {
      btn_new.css("transition", "top 1s, left 1s");
      btn_new.css("xtransition-timing-function", "ease");
      btn_new.css("left",0);
      btn_new.css("top", 0);

      mapend.addControl(new mapboxgl.NavigationControl());
    }, 0);

    $("span", btn_new).text("Einen anderen Ort wählen")

  });

  $("#buttonReload").on("click", function() {
    location.reload();
  });

  //Social Buttons
  $("#share").jsSocials({
    showLabel: false,
    showCount: false,
    url: "https://storytelling.blick.ch/longform/2018/flugrouten/",
    text: "Am Schweizer Himmel: Ein dichtes Netz von Flugrouten. Wie diese Himmels-Autobahnen organisiert sind, erzählen wir Ihnen aus der Perspektive Ihres Wohnortes.",
                               
    shares: [
        { share: "twitter", via: "blick_visual", hashtags: "flugrouten,skyguide,dataviz" },
        "facebook"
    ]
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
    mapstart.once('moveend', disableStart);
    mapstart.fitBounds([[5.838007, 45.797035], [10.511905, 47.981684]]);

    loaderRemoveCount(); //Mapbox
  });

  mapstart.on("dragstart", function() {
    $("#header, #lead").fadeTo(200, 0);
    disableStart();
  });

  mapstart.on("dragend", function() {
    $("#header, #lead").fadeTo(200, 1);
    pointInShape()
  });
  mapstart.on("zoomstart", function() {
    disableStart()
  });

  mapstart.on("zoomend", function() {
    pointInShape();
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

  $("#threejs").append(renderer.domElement);

  //Init Lights

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

  //Map Tile
  /*
  groundTileGeo = new THREE.PlaneBufferGeometry(km(0.25), km(0.25));
  var groundTileMat = new THREE.MeshPhongMaterial( { color: 0xffcc00, specular: 0xffcc00 });

  var url = getTileURL(llStartpunkt.lat, llStartpunkt.lon, 18);
  console.log(url);
  var groundTileMat = new THREE.MeshBasicMaterial({
    map: textureLoader.load( url )
  });
  groundTileMat.side = THREE.DoubleSide;


  groundTile = new THREE.Mesh( groundTileGeo, groundTileMat );
  groundTile.rotation.x = - Math.PI / 2;
  groundTile.position.set(xzMittelpunkt.x, groundAltitude + 0.1, xzMittelpunkt.z);
  groundTile.receiveShadow = true;
  scene.add( groundTile );
  */

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
  /*
  tmpGeometry = new THREE.BoxGeometry( 1000, 1000, 1000 );
  tmpMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000} );
  tmpMesh = new THREE.Mesh( tmpGeometry, tmpMaterial );
  tmpMesh.position.set(xzStartpunkt.x, groundAltitude + 500, xzStartpunkt.z);
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
    $("#target").hide();
    $("#intro").hide();

    $("#wait_after_locate").show();
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
  //$(".chapter_airport").clone().insertAfter(".chapter_airport");

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
  
  //Fill airways
  fillAirwayDiv(0);
  fillAirwayDiv(1);
  fillAirwayDiv(2);
}

function fillAirwayDiv(_nr)
{
  //Set Intro Text
  var intro = $(".airways_intro");
  intro.html(intro.html().replace(new RegExp("{airway_" + _nr + "_name}", 'g'), nearest_airways[_nr].properties.name.toUpperCase()));
  intro.html(intro.html().replace(new RegExp("{airway_" + _nr + "_distance}", 'g'), Math.round(nearest_airways[_nr].properties.distanceToPoint)));
  $(".airways_intro #airway_short_" + _nr).addClass("color_" + nearest_airways[_nr].properties.name);

  aw = airways_text[nearest_airways[_nr].properties.name];
  $(".chapter_airways_" + _nr + " .chapter_content h2 .route_title").text(aw.title);
  $(".chapter_airways_" + _nr + " .chapter_content h2 .label_route").addClass("color_" + nearest_airways[_nr].properties.name);
  $(".chapter_airways_" + _nr + " .chapter_content h2 .label_route").text(nearest_airways[_nr].properties.name.toUpperCase());
  $(".chapter_airways_" + _nr + " .chapter_content .route_text").html(aw.text);
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

    //Show scroller
    $("#scroller").show();
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
  //tmpMesh.position.set(xzStartpunkt.x, groundAltitude + 500, xzStartpunkt.z);
  ground.position.set(xzStartpunkt.x, groundAltitude, xzStartpunkt.z);

  /*
  groundTile.position.set(xzStartpunkt.x, groundAltitude + 0.5, xzStartpunkt.z);
  var url = getTileURL(llStartpunkt.lat, llStartpunkt.lon, 15);
  groundTile.material.map = textureLoader.load( url );
  groundTile.needsUpdate = true;
  */
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

*/

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
    $("#maploader").fadeOut(200);
    $("#target").show();
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
  //console.log(timestampAsString);

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
  else if(_serie.getHours() >= 19 && _serie.getHours() <= 20)
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

  /*
  if(tweenGroupCameras.getAll().length > 0)
  {
    doRender = true;
    tweenGroupCameras.update();
  }
  */

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

function pointInShape()
{
  var pt = turf.point([mapstart.getCenter().lng, mapstart.getCenter().lat]);

  if(turf.booleanPointInPolygon(pt, shape_switzerland))
  {
    enableStart();
  }
}

function enableStart()
{
  $("#setPosition").addClass("btn_n");
  $("#setPosition").removeClass("btn_n_inactive");
  $("#setPosition").on("click", userPositionSelected);
}

function disableStart()
{
  $("#setPosition").addClass("btn_n_inactive");
  $("#setPosition").removeClass("btn_n");
  $("#setPosition").off("click");
}

/*
###############################

  Chapter functions

###############################
*/

function chapter_startTHREE()
{
  $("#scroller").fadeOut();

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
  $("#timeline").fadeOut();

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



/**** LATLONG TO XYZ ****/
/*
Number.prototype.toRad = function() {
  return this * Math.PI / 180;
}

function getTileURL(lat, lon, zoom) {
  var xtile = parseInt(Math.floor( (lon + 180) / 360 * (1<<zoom) ));
  var ytile = parseInt(Math.floor( (1 - Math.log(Math.tan(lat.toRad()) + 1 / Math.cos(lat.toRad())) / Math.PI) / 2 * (1<<zoom) ));
  //return {x: xtile, y: ytile, z: zoom};
  //return "https://api.mapbox.com/styles/v1/blick-storytelling/cjg6dbhus2vf32sp53s358gud/tiles/512/" + zoom + "/" + xtile + "/" + ytile + "?access_token=pk.eyJ1IjoiYmxpY2stc3Rvcnl0ZWxsaW5nIiwiYSI6ImNpcjNiaWFsZjAwMThpM25xMzIxcXM1bzcifQ.XJat3GcYrmg9o-0oAaz3kg"
  //return "https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/" + zoom + "/" + xtile + "/" + ytile + "?access_token=pk.eyJ1IjoiYmxpY2stc3Rvcnl0ZWxsaW5nIiwiYSI6ImNpcjNiaWFsZjAwMThpM25xMzIxcXM1bzcifQ.XJat3GcYrmg9o-0oAaz3kg";
  //return "https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/" + zoom + "/" + xtile + "/" + ytile + "?access_token=pk.eyJ1IjoiYmxpY2stc3Rvcnl0ZWxsaW5nIiwiYSI6ImNpcjNiaWFsZjAwMThpM25xMzIxcXM1bzcifQ.XJat3GcYrmg9o-0oAaz3kg";
  //return "https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/512/" + zoom + "/" + xtile + "/" + ytile + "?access_token=pk.eyJ1IjoiYmxpY2stc3Rvcnl0ZWxsaW5nIiwiYSI6ImNpcjNiaWFsZjAwMThpM25xMzIxcXM1bzcifQ.XJat3GcYrmg9o-0oAaz3kg";
  //return "https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/512/" + zoom + "/" + xtile + "/" + ytile + "?access_token=pk.eyJ1IjoiYmxpY2stc3Rvcnl0ZWxsaW5nIiwiYSI6ImNpcjNiaWFsZjAwMThpM25xMzIxcXM1bzcifQ.XJat3GcYrmg9o-0oAaz3kg";
  return "https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/512/" + zoom + "/" + xtile + "/" + ytile + "?access_token=pk.eyJ1IjoiYmxpY2stc3Rvcnl0ZWxsaW5nIiwiYSI6ImNpcjNiaWFsZjAwMThpM25xMzIxcXM1bzcifQ.XJat3GcYrmg9o-0oAaz3kg";
}
*/