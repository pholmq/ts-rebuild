import * as THREE from "three";
import {
  Line2,
  LineGeometry,
  LineMaterial,
  OrbitControls,
} from "three/examples/jsm/Addons.js";

function moveModel(pos, planets) {
  planets.forEach((obj) => {
    obj.orbitObj.rotation.y = obj.speed * pos - obj.startPos * (Math.PI / 180);
    if (obj.rotationSpeed) {
      obj.planetObj.rotation.y = obj.rotationSpeed * pos;
    }
  });
}

function setTraceMaterial(obj, linesOn, scene) {
  let lineMaterial;
  let lineGeometry;
  if (!obj.traceLine) {
    lineMaterial = new THREE.PointsMaterial({
      color: obj.color,
      size: obj.size * 10,
      //sizeAttenuation: false,
      transparent: true,
      opacity: 0.7,
      alphaTest: 0.5,
      map: new THREE.TextureLoader().load(
        "https://raw.githubusercontent.com/pholmq/tsnova-resources/master/disc.png"
      ),
    });

    lineGeometry = new THREE.BufferGeometry();
    obj.traceLine = new THREE.Points(lineGeometry, lineMaterial);
    obj.traceLine.sortParticles = true;
    // console.log(obj.traceLine.geometry);

    // obj.traceLine.geometry.vertices.length = (
    //   obj.traceLength / obj.traceStep
    // ).toFixed();
  } else {
    scene.remove(obj.traceLine);
    lineMaterial = obj.traceLine.material;
    lineGeometry = obj.traceLine.geometry;
  }
  if (linesOn) {
    obj.traceLine = new THREE.Line(lineGeometry, lineMaterial);
  } else {
    obj.traceLine = new THREE.Points(lineGeometry, lineMaterial);
  }
  scene.add(obj.traceLine);
}

function tracePlanet(
  obj,
  pos: number,
  traceBtn: any,
  linesOn,
  planets,
  tracePlanets,
  earth,
  scene
) {
  if (!obj.traceOn || !traceBtn) {
    obj.traceLine = false;
    //We set the length of the trace array and pad it with 0
    // obj.traceArray = new Array(obj.traceLength / obj.traceStep).map(() => 0);
    obj.traceArray = new Array(2000).map(() => 0);
    return;
  }

  if (!obj.traceLine) {
    const material = new LineMaterial();
    material.color = new THREE.Color(obj.color);
    material.linewidth = 2;
    obj.traceLine = new Line2(new LineGeometry(), material);
    obj.traceArray = new Array(2000).map(() => 0);
    // obj.traceLine.geometry.setPositions(obj.traceArray);
    obj.traceLine.material.resolution.set(innerWidth, innerHeight);
    scene.add(obj.traceLine);
  }

  if (pos < obj.traceStartPos) {
    obj.traceStartPos = obj.traceCurrPos = pos;
  }
  if (pos < obj.traceCurrPos) {
    obj.traceCurrPos = obj.traceStartPos;
  }
  let nextPos = obj.traceCurrPos;
  while (nextPos < pos) {
    moveModel(nextPos, planets);
    scene.updateMatrixWorld;
    let epos = new THREE.Vector3();
    obj.planetObj.getWorldPosition(epos); //NEEDS to be a new vector every time! (declared inside the loop)
    // console.log(obj.name, " ", epos.x, " ", epos.y, " ", epos.z, " ");

    obj.traceArray.push(epos.x, epos.y, epos.z);
    // console.log(obj.traceArray);
    // const x = Math.random() * 300;
    // const y = Math.random() * 300;
    // const z = Math.random() * 300;
    // obj.traceArray.push(x, y, z);

    obj.traceLine.geometry.setPositions(obj.traceArray);
    nextPos += obj.traceStep;
  }
}

// function tracePlanet(
//   obj,
//   pos: number,
//   traceBtn: any,
//   linesOn,
//   planets,
//   tracePlanets,
//   earth,
//   scene
// ) {
//   let update = false;
//   if (!obj.traceOn || !traceBtn) {
//     obj.traceLine = false;
//     return;
//   }
//   if (pos < obj.traceStartPos) {
//     obj.traceStartPos = obj.traceCurrPos = pos;
//     obj.traceArrIndex = 0;
//     update = true;
//   }
//   if (pos < obj.traceCurrPos) {
//     obj.traceCurrPos = obj.traceStartPos;
//     obj.traceArrIndex = 0;
//     update = true;
//   }
//   if (obj.traceCurrPos + obj.traceStep > pos && !update) return;

//   let firstRun = false;
//   if (obj.traceArrIndex === 0) firstRun = true;

//   if (!obj.traceLine) {
//     setTraceMaterial(obj, linesOn, scene);
//   }
//   let nextPos = obj.traceCurrPos;
//   // let vertArray = obj.traceLine.geometry.vertices;
//   // console.log(obj.traceLine.geometry.attributes.positions);
//   let vertArray = obj.traceLine.geometry.attributes;
//   console.log(vertArray);
//   while (nextPos < pos) {
//     moveModel(nextPos, planets);
//     earth.containerObj.updateMatrixWorld();
//     let epos = new THREE.Vector3();
//     obj.planetObj.getWorldPosition(epos); //NEEDS to be a new vector every time! (declared inside the loop)
//     if (obj.traceArrIndex < vertArray.length) {
//       vertArray[obj.traceArrIndex] = epos;
//       obj.traceArrIndex++;
//     } else {
//       for (let i = 0; i < vertArray.length - 1; i++) {
//         vertArray[i] = vertArray[i + 1];
//       }
//       vertArray[vertArray.length - 1] = epos;
//     }
//     nextPos += obj.traceStep;
//   }
//   if (firstRun) {
//     //We need to pad the vertices array
//     let index = obj.traceArrIndex;
//     while (index < obj.traceLine.geometry.vertices.length) {
//       obj.traceLine.geometry.vertices[index++] = 0;
//     }
//   }
//   obj.traceLine.geometry.verticesNeedUpdate = true;
//   obj.traceCurrPos = nextPos - obj.traceStep;
//   obj.traceLine.visible = true;
// }

export default function (
  traceOn: any,
  linesOn: any,
  pos: number,
  planets: any[],
  tracePlanets: any[],
  scene,
  earth
) {
  // if (traceOn) console.log(pos);

  tracePlanets.forEach((obj) => {
    tracePlanet(
      obj,
      pos,
      traceOn,
      linesOn,
      planets,
      tracePlanets,
      earth,
      scene
    );
  });
}
