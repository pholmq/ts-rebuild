import * as THREE from "three";
// import { Vector3 } from "three";

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
    console.log(obj.traceLine.geometry);
    obj.traceLine.geometry.vertices.length = (
      obj.traceLength / obj.traceStep
    ).toFixed();
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

function initTrace(obj, pos) {
  obj.traceStartPos = obj.traceCurrPos = pos;
  obj.traceArrIndex = 0;
}

function tracePlanet(obj, pos: number, traceBtn: any, linesOn, scene) {
  let update = false;
  if (!obj.traceOn || !traceBtn) {
    obj.traceLine = false;
    return;
  }
  if (pos < obj.traceStartPos) {
    initTrace(obj, pos);
    update = true;
  }
  if (pos < obj.traceCurrPos) {
    obj.traceCurrPos = obj.traceStartPos;
    obj.traceArrIndex = 0;
    update = true;
  }
  if (obj.traceCurrPos + obj.traceStep > pos && !update) return;

  let firstRun = false;
  if (obj.traceArrIndex === 0) firstRun = true;

  if (!obj.traceLine) {
    setTraceMaterial(obj, linesOn, scene);
  }
  let nextPos = obj.traceCurrPos;
  let vertArray = obj.traceLine.geometry.vertices;
  while (nextPos < pos) {
    moveModel(nextPos);
    earth.containerObj.updateMatrixWorld();
    let epos = new THREE.Vector3();
    obj.planetObj.getWorldPosition(epos); //NEEDS to be a new vector every time! (declared inside the loop)
    if (obj.traceArrIndex < vertArray.length) {
      vertArray[obj.traceArrIndex] = epos;
      obj.traceArrIndex++;
    } else {
      for (let i = 0; i < vertArray.length - 1; i++) {
        vertArray[i] = vertArray[i + 1];
      }
      vertArray[vertArray.length - 1] = epos;
    }
    nextPos += obj.traceStep;
  }
  if (firstRun) {
    //We need to pad the vertices array
    let index = obj.traceArrIndex;
    while (index < obj.traceLine.geometry.vertices.length) {
      obj.traceLine.geometry.vertices[index++] = 0;
    }
  }
  obj.traceLine.geometry.verticesNeedUpdate = true;
  obj.traceCurrPos = nextPos - obj.traceStep;
  obj.traceLine.visible = true;
}

export default function (
  traceOn: any,
  linesOn: any,
  pos: number,
  tracePlanets: any[],
  scene
) {
  if (traceOn) console.log(pos);

  tracePlanets.forEach((obj) => {
    tracePlanet(obj, pos, traceOn, linesOn, scene);
  });
}
