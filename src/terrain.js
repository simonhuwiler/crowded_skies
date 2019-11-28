var ThreeGeo = require('three-geo/dist/three-geo.min.js')
var {latLon2XY} = require('./helpers.js')
const consts = require('./consts.js');
var THREE = require('three');

module.exports = (scene, camera, llPos) => {
  var xzPos = latLon2XY(llPos);

  const tgeo = new ThreeGeo({
    tokenMapbox: consts.token
  });

  const radius = 5;
  //https://github.com/w3reality/three-geo

  tgeo.getTerrain([llPos.lat, llPos.lon], radius, 10, {
    onRgbDem: meshes => {
        meshes.forEach(mesh => {
          //Calc Scale Factor
          var box = new THREE.Box3().setFromObject( mesh )
          var target = new THREE.Vector3();
          box.getSize(target)
          const scaleFactor = Math.round(radius * 1000 / target.x);
          mesh.scale.set(scaleFactor, scaleFactor, scaleFactor)
          
          //Rotate Mesh
          mesh.rotation.x = Math.PI / -2;
          
          //Set Position
          mesh.position.set(xzPos.x, consts.groundAltitude - 2, xzPos.z);

          //Add Mesh
          scene.add(mesh)
          
        });

    },
    onSatelliteMat: mesh => {
      //Set Camera by Raycaster
      var raycaster = new THREE.Raycaster();
      mesh.updateMatrixWorld();
      raycaster.set(new THREE.Vector3(xzPos.x, 5000, xzPos.z), new THREE.Vector3(0, -1, 0));
      var intersects = raycaster.intersectObjects(scene.children, true);

      if(intersects.length > 0)
      {
        camera.position.y = intersects[0].point.y + 5;
      }
      else
      {
        console.log("Could not calculate camera y position. No intersecting objects!")
        camera.position.y = 800;
      }

    }
  });

}