/*Copyright 2018 Simon Shack, Patrik Holmqvist
The TYCHOSIUM is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.*/

import { saveAs } from "file-saver";
import * as dat from "dat.gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module";
import { LineGeometry } from "three-fatline";

import {
  sDay,
  sYear,
  sMonth,
  sWeek,
  sHour,
  sMinute,
  sSecond,
} from "./timeConstants";
import createSystem from "./createSystem";
import planetsTrace from "./tracePlanets";

//*************************************************************
//GLOBAL and GUI SETTINGS
//*************************************************************
var o = {
  ambientLight: 2,
  sunLight: 2,
  background: 0x000000,
  Run: false,
  traceBtn: false,
  "1 second equals": sWeek,
  speedFact: sWeek,
  speed: 1,
  reverse: false,
  "Step forward": function () {
    if (o.speedFact === sYear) {
      o.pos = dateToDays(addYears(o.Date, 1)) * sDay + timeToPos(o.Time);
    } else if (o.speedFact === sYear * 10) {
      o.pos = dateToDays(addYears(o.Date, 10)) * sDay + timeToPos(o.Time);
    } else if (o.speedFact === sYear * 100) {
      o.pos = dateToDays(addYears(o.Date, 100)) * sDay + timeToPos(o.Time);
    } else if (o.speedFact === sYear * 1000) {
      o.pos = dateToDays(addYears(o.Date, 1000)) * sDay + timeToPos(o.Time);
    } else {
      o.pos += o.speedFact;
    }
  },

  "Step backward": function () {
    if (o.speedFact === sYear) {
      o.pos = dateToDays(addYears(o.Date, -1)) * sDay + timeToPos(o.Time);
    } else if (o.speedFact === sYear * 10) {
      o.pos = dateToDays(addYears(o.Date, -10)) * sDay + timeToPos(o.Time);
    } else if (o.speedFact === sYear * 100) {
      o.pos = dateToDays(addYears(o.Date, -100)) * sDay + timeToPos(o.Time);
    } else if (o.speedFact === sYear * 1000) {
      o.pos = dateToDays(addYears(o.Date, -1000)) * sDay + timeToPos(o.Time);
    } else {
      o.pos -= o.speedFact;
    }
  },
  Reset: function () {
    o.pos = 0;
    controls.reset();
  },
  Today: function () {
    const newPos =
      sDay *
      dateToDays(
        new Intl.DateTimeFormat("sv-SE", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(Date.now())
      );
    o.pos = newPos;
    controls.reset();
  },
  "Save settings": function () {
    let subset,
      fText = "[";
    planets.forEach((obj) => {
      subset = (({
        name,
        size,
        startPos,
        speed,
        rotationSpeed,
        tilt,
        tiltb,
        orbitRadius,
        orbitCentera,
        orbitCenterb,
        orbitCenterc,
        orbitTilta,
        orbitTiltb,
      }) => ({
        name,
        size,
        startPos,
        speed,
        rotationSpeed,
        tilt,
        tiltb,
        orbitRadius,
        orbitCentera,
        orbitCenterb,
        orbitCenterc,
        orbitTilta,
        orbitTiltb,
      }))(obj);
      fText += "\n" + JSON.stringify(subset, null, 2) + ",";
      // obj.ra = "";
      // obj.dec = "";
      // obj.dist = "";
    });
    fText = fText.substring(0, fText.length - 1);
    fText += "]";
    const blob = new Blob([fText], { type: "text/plain;charset=utf-8" });
    const d = new Date().toUTCString();

    const fileName = "TS Settings " + d + ".txt";
    saveAs(blob, fileName);
  },
  "Load settings": function () {
    let input = document.createElement("input");
    input.type = "file";
    input.onchange = (e) => {
      // let file = e.target.files[0];
      let file = (e.target as HTMLInputElement).files[0];
      var reader = new FileReader();
      reader.readAsText(file, "UTF-8");

      // here we tell the reader what to do when it's done reading...
      reader.onload = (readerEvent) => {
        let content = readerEvent.target.result; // this is the content!
        console.log(content);
        let jsonObj = JSON.parse(content as string);
        planets.forEach((obj) => {
          let newVals = jsonObj.find((obj2) => {
            return obj.name === obj2.name;
          });
          Object.assign(obj, newVals);
          updatePlanet(obj);
          initTrace(obj);
        });
        setupGUI();
      };
    };
    input.click();
  },
  pos: 0,
  Position: "", // Dat.GUI var for pos
  Date: "",
  cSphereSize: 1,
  zodiacSize: 1,
  starDistanceScaleFact: 1.5,
  starDistance: 5000,
  starSize: 1,
  starNamesVisible: false,
  "Axis helpers": false,
  Shadows: false,
  Orbits: true,
  Time: "00:00:00",
  Zoom: 0,
  worldCamX: "0",
  worldCamY: "0",
  worldCamZ: "0",
  worldCamDist: "0",
  worldCamDistKm: "0",
  worldCamRa: "0",
  worldCamDec: "0",

  Day: "",
  julianDay: "",
  "Line trace": true,
  "Earth camera": false,
  "Camera Lat": 0,
  "Camera Long": 0,
  "Polar line": false,
  polarLineLength: 1,
  "Camera helper": false,
  Performance: false,
  camX: 0,
  camY: 0,
  camZ: 0,
  Size: 1,
  traceSize: 1,
  //  traceStartPos : 0,
  traceLength: sYear * 18,
  traceStep: sDay,
  traceCurrPos: 0,
  traceArrIndex: 0,
  Lines: true,

  moonElongation: 0.01,
  mercuryElongation: 0.01,
  venusElongation: 0.01,
  marsElongation: 0.01,
  jupiterElongation: 0.01,
  saturnElongation: 0.01,

  infotext: true,
  Target: "",
  lookAtObj: {},
};

const { celestialSphere, planets, scene } = createSystem(o.starDistance);

const csLookAtObj = new THREE.Object3D();
celestialSphere.add(csLookAtObj);

const [
  earth,
  moonDef,
  moonDefB,
  moon,
  sunDef,
  sun,
  mercuryDef,
  mercuryDefB,
  mercury,
  venusDef,
  venusDefB,
  venus,
  marsDef,
  marsSunDef,
  mars,
  phobos,
  deimos,
  jupiterDef,
  jupiter,
  saturnusDef,
  saturnus,
  uranusDef,
  uranus,
  neptuneDef,
  neptune,
  halleysDef,
  halleys,
  erosDef,
  erosDefB,
  eros,
] = planets;

const tracePlanets = [
  moon,
  sun,
  mars,
  venus,
  mercury,
  jupiter,
  saturnus,
  uranus,
  neptune,
  halleys,
  eros,
];

scene.background = new THREE.Color(o.background);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const zodiac = new THREE.PolarGridHelper(250, 24, 1, 64, 0x000000, 0x555555);
const zCanvas = getCircularText(
  "      GEMINI             TAURUS             ARIES             PISCES          AQUARIUS       CAPRICORN     SAGITTARIUS      SCORPIO             LIBRA              VIRGO                LEO               CANCER ",
  800,
  0,
  "right",
  false,
  true,
  "Arial",
  "18pt",
  2
);
const zTexture = new THREE.CanvasTexture(zCanvas);
const zLabelGeometry = new THREE.RingGeometry(235, 250, 32);
//const zLabelGeometry = new THREE.PlaneBufferGeometry(500, 500);
const zLabelMaterial = new THREE.MeshBasicMaterial({
  map: zTexture,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 1,
});
const zLabel = new THREE.Mesh(zLabelGeometry, zLabelMaterial);
zodiac.add(zLabel);
zLabel.rotation.x = -Math.PI / 2;
scene.add(zodiac);
zodiac.position.z = -37.8453;
// earth.pivotObj.add(zodiac);
zodiac.position.y = -3; //Set it slightly below the Barycentre to avoid planet/zodiacring interference

zodiac.rotation.y = Math.PI / 6;
zodiac.visible = false;

const plane = new THREE.GridHelper(o.starDistance * 2, 30, 0x008800, 0x000088);
earth.pivotObj.add(plane);
plane.visible = false;

//*************************************************************
//CREATE MILKYWAY SKYDOME
//*************************************************************
// const skyGeo = new THREE.SphereGeometry(100000, 25, 25);

// const skyTexture = new THREE.TextureLoader().load("https://raw.githubusercontent.com/pholmq/tsnova-resources/master/milkyway.jpg");

// const skyMaterial = new THREE.MeshBasicMaterial({
//         map: skyTexture,
// });
// const sky = new THREE.Mesh(skyGeo, skyMaterial);
// sky.material.side = THREE.BackSide;
// scene.add(sky);
//*************************************************************
//CREATE BACKGOUND STARFIELD AND PLOT NAKED EYE VISIBLE STARS
//*************************************************************
// createStarfield()
scene.updateMatrixWorld();
const starsContainer = new THREE.Object3D();
starsContainer.applyMatrix4(earth.rotationAxis.matrixWorld);
scene.add(starsContainer);
starsContainer.visible = false;
// scene.updateMatrixWorld()

function createLabel(message) {
  const fontSize = 30;
  let canvas = document.createElement("canvas");
  let context = canvas.getContext("2d");
  canvas.width = 256;
  canvas.height = 128;
  context.font = fontSize + "px Arial";
  context.strokeStyle = "black";
  context.lineWidth = 8;
  context.strokeText(message, 0, fontSize);
  context.fillStyle = "LightGrey";
  context.fillText(message, 0, fontSize);
  let texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  let spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    depthTest: false,
  });
  let sprite = new THREE.Sprite(spriteMaterial);
  return sprite;
}

const bsc5url =
  "https://raw.githubusercontent.com/pholmq/tsnova-resources/master/bsc5-short.json";
/*
https://github.com/brettonw/YaleBrightStarCatalog
Fields in the Short BSC5 file (empty fields are omitted):
Field	Description
HR	Harvard Revised Number = Bright Star Number
F	Flamsteed number, to be taken with the constellation name
B	Bayer designation as greek letter with superscript sequence (if multi), to be taken with the constellation name
N	The common name of the star (drawn from IAU designations and notes)
C	The traditional 3-letter abbreviation for the constellation name
RA	Right Ascension (00h 00m 00.0s), equinox J2000, epoch 2000.0
Dec	Declination (+/-00° 00′ 00″), equinox J2000, epoch 2000.0
K	An approximate color temperature of the star, computed from B-V or the SpectralCls
V	Visual magnitude
*/
fetch(bsc5url)
  .then((response) => {
    return response.json();
  })
  .then((bscStars) => {
    bscStars.forEach((obj) => {
      if (obj.N !== undefined) {
        const starPos = new THREE.Object3D();
        starPos.rotation.z = decToRad(obj.Dec);
        starPos.rotation.y = raToRad(obj.RA) - Math.PI / 2;
        let starsize;
        if (obj.V < 1) {
          starsize = 12;
        } else if (obj.V > 1 && obj.V < 3) {
          starsize = 6;
        } else if (obj.V > 3 && obj.V < 5) {
          starsize = 3;
        } else {
          starsize = 1;
        }
        const star = new THREE.Mesh(
          new THREE.SphereGeometry(starsize, 20, 20),

          new THREE.MeshBasicMaterial({ color: colorTemperature2rgb(obj.K) })
        );
        star.position.x = o.starDistance;
        const nameTag = createLabel(obj.N);
        nameTag.visible = o.starNamesVisible;
        nameTag.position.copy(star.position);
        starPos.add(star);
        starPos.add(nameTag);
        starsContainer.add(starPos);
      }
    });
  });

const constContainer = new THREE.Object3D();
scene.updateMatrixWorld();
constContainer.applyMatrix4(earth.rotationAxis.matrixWorld);
scene.add(constContainer);
constContainer.visible = false;

const constellationsUrl =
  "https://raw.githubusercontent.com/pholmq/tsnova-resources/master/constellations.json";
//create a blue LineBasicMaterial
const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
fetch(constellationsUrl)
  .then((response) => {
    return response.json();
  })
  .then((constData) => {
    const cRA = constData.rightAscension;
    const cDec = constData.declination;
    const cAst = constData.asterismIndices;

    let points = [];

    for (let i = 0; i < constData.asterismIndices.length; i++) {
      let starIndex = constData.asterismIndices[i];
      if (starIndex != -1) {
        // Compute star position.
        let ra = constData.rightAscension[starIndex];
        let dec = constData.declination[starIndex];

        let x = o.starDistance * Math.cos(dec) * Math.sin(ra);
        let y = o.starDistance * Math.sin(dec);
        let z = o.starDistance * Math.cos(dec) * Math.cos(ra);

        // points.push(new THREE.Vector3(-x, y, z));
        points.push(new THREE.Vector3(x, y, z));
      } else {
        // Create lines.
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        constContainer.add(line);
        // Clear points array.
        points = [];
      }
    }
  });

//*************************************************************
//SETUP CAMERAS and CONTROLS
//*************************************************************
const camera = new THREE.PerspectiveCamera(
  15,
  window.innerWidth / window.innerHeight,
  0.1,
  10000000
);
//earth.pivotObj.add(camera);
camera.position.set(0, 2500, 0);

const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableKeys = false;

//EARTH CAMERA
const camPivotX = new THREE.Object3D();
const camPivotY = new THREE.Object3D();

earth.planetObj.add(camPivotY);
camPivotY.add(camPivotX);

const cameraMount = new THREE.Object3D();
camPivotX.add(cameraMount);

//const planetCamera = new THREE.PerspectiveCamera( 1000, 1600/800, 0.0001, 2000 );
const planetCamera = new THREE.PerspectiveCamera(
  90,
  window.innerWidth / window.innerHeight,
  0.001,
  10000000
);

// const left = -1;
// const right = 1;
// const top2 = 1;
// const bottom = -1;
// const near = 5;
// const far = 50;
//const planetCamera = new THREE.OrthographicCamera(-100, 100, 100, -100, 0.000001, 10000000);
//planetCamera.zoom = 0.2;

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;

const frustumSize = 10;
// cameraPerspective = new THREE.PerspectiveCamera( 50, 0.5 * aspect, 150, 1000 );

// const planetCamera = new THREE.OrthographicCamera( 0.5 * frustumSize * aspect / - 2, 0.5 * frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 2000 );

cameraMount.add(planetCamera);

//Add the fake planet mansPath so we can trace "A mans yearly path"
// cameraMount.add(mansPath.containerObj)

cameraMount.position.z = -earth.size - 0.002;

const cameraHelper = new THREE.CameraHelper(planetCamera);
scene.add(cameraHelper);
const axisHelper = new THREE.AxesHelper(10);
planetCamera.add(axisHelper);
planetCamera.rotateX(-1);

function updatePlanetCamera() {
  planetCamera.updateProjectionMatrix();
  cameraHelper.update();
}

// o['Camera helper'] = true

function trackSun() {
  camPivotX.rotation.x = o["Camera Lat"] + Math.PI / 2;
  camPivotY.rotation.y = o["Camera Long"] + Math.PI / 2;
}

window.addEventListener("keydown", function (event) {
  //event.preventDefault();
  let rotSpeed = 0.1;
  switch (event.key) {
    case "ArrowLeft":
    case "a":
      //planetCamera.rotateY( -rotSpeed );
      cameraMount.rotateZ(-rotSpeed);
      break;
    case "ArrowRight":
    case "d":
      //planetCamera.rotateY( -rotSpeed );
      cameraMount.rotateZ(rotSpeed);
      break;
    case "ArrowUp":
    case "w":
      planetCamera.rotateX(rotSpeed);
      break;
    case "ArrowDown":
    case "s":
      planetCamera.rotateX(-rotSpeed);
      break;
    // case "q" :
    //   planetCamera.rotateZ( rotSpeed );
    //   break;
    // case "e" :
    //   planetCamera.rotateZ( -rotSpeed );
    //  break;
  }
});

function showHideCameraHelper() {
  axisHelper.visible = o["Camera helper"];
  cameraHelper.visible = o["Camera helper"];
}

//*************************************************************
//SETUP LIGHT
//*************************************************************

// const ambientLight = new THREE.AmbientLight( 0xffffff, o.ambientLight ); // soft white light
const ambientLight = new THREE.AmbientLight(0xffffff, 3);
scene.add(ambientLight);

const light = new THREE.PointLight(0xffffff, o.sunLight, 0);
light.castShadow = true;
// light.position.set( 50, 50, 50 );
sun.pivotObj.add(light);

const lightMount = new THREE.Object3D();
sun.pivotObj.add(lightMount);

const lightOnSun = new THREE.SpotLight(0xffffff, 10);
lightMount.add(lightOnSun);
lightOnSun.position.y = 15;
lightOnSun.angle = 0.5;
lightOnSun.distance = 15;
lightOnSun.target = lightMount;
// const helper = new THREE.SpotLightHelper(lightOnSun);
// scene.add(helper);

const lightOnSun2 = new THREE.SpotLight(0xffffff, 10);
lightMount.add(lightOnSun2);
lightOnSun2.position.y = -15;
lightOnSun2.angle = 0.5;
lightOnSun2.distance = 15;
lightOnSun2.target = lightMount;

const lightOnSun3 = new THREE.SpotLight(0xffffff, 10);
lightMount.add(lightOnSun3);
lightOnSun3.position.z = 15;
lightOnSun3.angle = 0.5;
lightOnSun3.distance = 15;
lightOnSun3.target = lightMount;

const lightOnSun4 = new THREE.SpotLight(0xffffff, 10);
lightMount.add(lightOnSun4);
lightOnSun4.position.z = -15;
lightOnSun4.angle = 0.5;
lightOnSun4.distance = 15;
lightOnSun4.target = lightMount;

const lightOnSun5 = new THREE.SpotLight(0xffffff, 10);
lightMount.add(lightOnSun5);
lightOnSun5.position.x = 16;
lightOnSun5.angle = 0.5;
lightOnSun5.distance = 15;
lightOnSun5.target = lightMount;

const lightOnSun6 = new THREE.SpotLight(0xffffff, 10);
lightMount.add(lightOnSun6);
lightOnSun6.position.x = -15;
lightOnSun6.angle = 0.5;
lightOnSun6.distance = 15;
lightOnSun6.target = lightMount;

// moon.planetObj.castShadow = true;
// earth.planetObj.receiveShadow = true;
light.shadow.camera.far = 50000;
light.shadow.mapSize.width = 2560; // 2560 4096 512 default
light.shadow.mapSize.height = 2560; // 512 default
light.shadow.radius = 2;
// const axesHelper = new THREE.AxesHelper( 20 );
// scene.add(axesHelper);

//*************************************************************
//CREATE SETTINGGS AND SETUP GUI
//*************************************************************
setupGUI();
function setupGUI() {
  if (gui) {
    gui.remove;
  }
  //var gui = new dat.GUI( { autoPlace: false } );
  var gui = new dat.GUI();
  gui.domElement.id = "gui";
  gui
    .add(o, "Date")
    .listen()
    .onFinishChange(() => {
      if (isValidDate(o.Date)) {
        o.pos = sDay * dateToDays(o.Date) + timeToPos(o.Time);
      }
    });

  gui
    .add(o, "Time")
    .name("Time (UTC)")
    .listen()
    .onFinishChange(function () {
      if (isValidTime(o.Time)) {
        o.pos = sDay * dateToDays(o.Date) + timeToPos(o.Time);
      }
    });

  gui
    .add(o, "julianDay")
    .name("Julian day")
    .listen()
    .onFinishChange(() => {
      if (isNumeric(o.julianDay)) {
        o.Day = String(Number(o.julianDay) - 2451717);
        o.pos = sDay * Number(o.Day) + timeToPos(o.Time);
      }
    });

  let ctrlFolder = gui.addFolder("Controls");
  ctrlFolder.add(o, "Run").listen();
  ctrlFolder
    .add(o, "traceBtn")
    .name("Trace")
    .onFinishChange(() => {
      tracePlanets.forEach((obj) => {
        initTrace(obj);
      });
    });

  //  tracePlanets.forEach(obj => {
  //   folderT.add(obj, 'traceOn').name(obj.name).onFinishChange(()=>{initTrace(obj)})
  // });

  ctrlFolder
    .add(o, "1 second equals", {
      "1 second": sSecond,
      "1 minute": sMinute,
      "1 hour": sHour,
      "1 day": sDay,
      "1 week": sWeek,
      "1 month": sMonth,
      "1 year": sYear,
      "10 years": sYear * 10,
      "100 years": sYear * 100,
      "1000 years": sYear * 1000,
    })
    .onFinishChange(function () {
      o.speedFact = Number(o["1 second equals"]);
    });
  ctrlFolder.add(o, "speed", -5, 5).step(0.5).name("Speed multiplier");
  // ctrlFolder.add(o, 'reverse').name('Reverse direction').onFinishChange(() => {
  //   if (o.reverse) {o.speed = -1} else {o.speed = 1}
  // });
  ctrlFolder.add(o, "Step forward");
  ctrlFolder.add(o, "Step backward");
  ctrlFolder.add(o, "Reset");
  ctrlFolder.add(o, "Today");
  let planList = {};
  planets.forEach((obj) => {
    if (!obj.isDeferent) {
      planList[obj.name] = obj.name;
    }
  });

  ctrlFolder
    .add(o, "Target", { Barycenter: "", ...planList })
    .name("Look at")
    .onFinishChange(() => {
      // console.log(o.Target)
      o.lookAtObj = planets.find((obj) => {
        return obj.name === o.Target;
      });
      if (o.Target === "") {
        o.lookAtObj = {};
      }
    });

  ctrlFolder.open();

  let folderCamera = gui.addFolder("Camera");
  // folderCamera.add(o, 'worldCamX').name('X').listen().onFinishChange(function() {
  //   if (isNumeric(o.worldCamX)) { camera.position.x = o.worldCamX }
  // });
  // folderCamera.add(o, 'worldCamY').name('Y').listen().onFinishChange(function() {
  //   if (isNumeric(o.worldCamY)) { camera.position.y = o.worldCamY }
  // });
  // folderCamera.add(o, 'worldCamZ').name('Z').listen().onFinishChange(function() {
  //   if (isNumeric(o.worldCamZ)) { camera.position.z = o.worldCamZ }
  // });

  folderCamera.add(o, "worldCamRa").name("RA").listen();
  folderCamera.add(o, "worldCamDec").name("Dec").listen();
  // folderCamera.add(o, 'worldCamDistKm').name('Kilometers').listen()
  folderCamera.add(o, "worldCamDist").name("AU distance").listen();

  let folderCam = folderCamera.addFolder(
    "Earth cam (experimental) Move w arrows"
  );
  folderCam.add(o, "Earth camera");
  //folderCam.add(planetCamera, 'fov', 1, 180).onChange(updatePlanetCamera);
  o["Camera Lat"] = 0.01;
  o["Camera Long"] = 0.01;
  folderCam.add(o, "Camera Lat", 0.0, Math.PI).listen();
  folderCam.add(o, "Camera Long", 0.0, Math.PI * 2).listen();
  o["Camera Lat"] = 0.67;
  o["Camera Long"] = 0;
  folderCam.add(o, "Camera helper").onFinishChange(() => {
    showHideCameraHelper();
  });

  let folderT = gui.addFolder("Trace");
  folderT
    .add(o, "traceSize", 0.1, 2)
    .name("Line width")
    .onChange(() => {
      changeTraceScale();
    });

  // folderT.add(o, "Lines").onFinishChange(() => {
  //   tracePlanets.forEach((obj) => {
  //     setTraceMaterial(obj);
  //   });
  // });

  tracePlanets.forEach((obj) => {
    folderT
      .add(obj, "traceOn")
      .name(obj.name)
      .onFinishChange(() => {
        initTrace(obj);
      });
  });
  // folderT.open();

  let posFolder = gui.addFolder("Positions");
  let posPlFolder;
  tracePlanets.forEach((obj) => {
    posPlFolder = posFolder.addFolder(obj.name);
    posPlFolder.add(obj, "ra").listen().name("RA");
    posPlFolder.add(obj, "dec").listen().name("Dec");
    posPlFolder.add(obj, "distKm").listen().name("Kilometers");
    posPlFolder.add(obj, "dist").listen().name("AU Distance");
    posPlFolder.open();
  });

  let folderElongations = gui.addFolder("Elongations");
  folderElongations
    .add(o, "moonElongation")
    .min(0.0)
    .max(180.0)
    .listen()
    .name("Moon");
  folderElongations
    .add(o, "mercuryElongation")
    .min(0.0)
    .max(180.0)
    .listen()
    .name("Mercury");
  folderElongations
    .add(o, "venusElongation")
    .min(0.0)
    .max(180.0)
    .listen()
    .name("Venus");
  folderElongations
    .add(o, "marsElongation")
    .min(0.0)
    .max(180.0)
    .listen()
    .name("Mars");
  folderElongations
    .add(o, "jupiterElongation")
    .min(0.0)
    .max(180.0)
    .listen()
    .name("Jupiter");
  folderElongations
    .add(o, "saturnElongation")
    .min(0.0)
    .max(180.0)
    .listen()
    .name("Saturn");

  function changeSphereScale() {
    celestialSphere.scale.set(o.cSphereSize, o.cSphereSize, o.cSphereSize);
  }
  function changeZodiacScale() {
    zodiac.scale.set(o.zodiacSize, o.zodiacSize, o.zodiacSize);
  }

  let folderO = gui.addFolder("Stars & helper objects");
  folderO.add(zodiac, "visible").name("Zodiac");
  //folderO.add(zodiac, 'scale.y', 0.1, 200).step(0.1).name('Zodiac size');
  //folderO.add(zodiac, 'renderOrder', 0, 200);
  folderO
    .add(o, "zodiacSize", 0.1, 10)
    .step(0.1)
    .name("Zodiac size")
    .onChange(() => {
      changeZodiacScale();
    });
  // folderO.add(zodiac.position, 'y', -10, 10).step(0.1).name('Zodiac position');

  folderO.add(o, "Polar line").onFinishChange(() => {
    polarLine.visible = o["Polar line"];
  });
  folderO
    .add(o, "polarLineLength", 0.1, 50)
    .name("Line length")
    .onChange(() => {
      // polarLine.scale.x = o.polarLineLength
      polarLine.scale.y = o.polarLineLength;
    });

  // folderO.add(o, 'Axis helpers' ).onFinishChange(()=>{
  //     showHideAxisHelpers();
  //   });

  folderO.add(starsContainer, "visible").name("Stars");
  folderO
    .add(o, "starNamesVisible")
    .name("Star names")
    .onChange(() => {
      starsContainer.children.forEach(function (starPos) {
        const nameTag = starPos.children[1];
        nameTag.visible = o.starNamesVisible;
      });
    });
  folderO.add(constContainer, "visible").name("Constellations");

  folderO
    .add(o, "starDistanceScaleFact", 0.1, 2)
    .step(0.1)
    .name("Star distance")
    .onChange(() => {
      starsContainer.children.forEach(function (starPos) {
        const star = starPos.children[0];
        star.position.x = o.starDistance * o.starDistanceScaleFact;
        const nameTag = starPos.children[1];
        nameTag.position.x = o.starDistance * o.starDistanceScaleFact;
      });
      celestialSphere.scale.set(
        o.starDistanceScaleFact,
        o.starDistanceScaleFact,
        o.starDistanceScaleFact
      );
      plane.scale.set(
        o.starDistanceScaleFact,
        o.starDistanceScaleFact,
        o.starDistanceScaleFact
      );
      constContainer.scale.set(
        o.starDistanceScaleFact,
        o.starDistanceScaleFact,
        o.starDistanceScaleFact
      );
    });

  folderO
    .add(o, "starSize", 0.1, 5)
    .step(0.1)
    .name("Star sizes")
    .onChange(() => {
      starsContainer.children.forEach(function (starPos) {
        const star = starPos.children[0];
        star.scale.x = o.starSize;
        star.scale.y = o.starSize;
        star.scale.z = o.starSize;
      });
    });

  // const star = starPos.children[0];
  //     const nametag = star.children[0];
  //     const scale = scaleVec.subVectors(star.getWorldPosition(starPosVec), camera.position).length() / scaleFactor;
  //     nametag.scale.set(scale, scale, 1);
  //   });})

  //   folderO.add(o, 'Stars' ).onFinishChange(()=>{
  //     showHideStars();
  //   });

  //   folderO.add(o, 'Star distance', 0.1, 20).onChange(() => {
  //     setStarDistance();
  //   });
  // folderO.add(celestialSphere, "visible").name("Celestial sphere");
  folderO.add(plane, "visible").name("Ecliptic grid");

  // folderO.add(o, 'cSphereSize', 0.1, 50).step(0.1).name('Sphere size').onChange(()=>{changeSphereScale()})
  // folderO.add(barycenter, 'visible').name('Barycenter')

  // folderO.add(o, infotext ).onFinishChange(()=>{
  //   showHideInfoText();
  // });
  // folderO.add(o, 'Performance').onFinishChange(() => {
  //   if (o.Performance) {stats.dom.style.visibility = 'visible'}
  //   else {stats.dom.style.visibility = 'hidden'}
  // });

  function changePlanetScale() {
    planets.forEach((obj) => {
      obj.planetObj.scale.x = o.Size;
      obj.planetObj.scale.y = o.Size;
      obj.planetObj.scale.z = o.Size;
    });
  }

  let folderPlanets = gui.addFolder("Planets");
  // folderPlanets.open();
  folderPlanets.add(o, "Orbits").onFinishChange(() => {
    showHideOrbits();
  });

  folderPlanets.add(o, "Size", 0.4, 1.4).onChange(() => {
    changePlanetScale();
  });
  planets.forEach((obj: any) => {
    if (!obj.isDeferent) {
      folderPlanets
        .add(obj, "visible")
        .name(obj.name)
        .onFinishChange(() => {
          showHideObject(obj);
        });
    }
  });
  function changeTraceScale() {
    tracePlanets.forEach((obj) => {
      if (obj.traceLine) {
        obj.traceLine.material.size = obj.size * 10 * o.traceSize;
      }
    });
  }

  let sFolder = gui.addFolder("Settings");
  const lightFolder = sFolder.addFolder("Light and color");
  //lightFolder.open();
  lightFolder
    .add(o, "ambientLight", 0.1, 4)
    .name("Amb. light")
    .onChange(() => {
      ambientLight.intensity = o.ambientLight;
    });
  lightFolder
    .add(o, "sunLight", 0.1, 4)
    .name("Sunlight")
    .onChange(() => {
      light.intensity = o.sunLight;
    });
  lightFolder.addColor(o, "background").onChange(() => {
    scene.background = new THREE.Color(o.background);
  });

  lightFolder.add(o, "Shadows");
  let folderDef = sFolder.addFolder("Deferents show/hide");
  planets.forEach((obj) => {
    if (obj.isDeferent) {
      folderDef
        .add(obj, "visible")
        .name(obj.name)
        .onFinishChange(() => {
          showHideObject(obj);
        });
    }
  });

  sFolder.add(o, "Save settings");
  sFolder.add(o, "Load settings");

  let oFolder;
  planets.forEach((obj) => {
    oFolder = sFolder.addFolder(obj.name);
    addSetting(obj, "startPos", "Start Position", oFolder);
    addSetting(obj, "speed", "Speed", oFolder);
    addSetting(obj, "orbitCentera", "Orbit center A", oFolder);
    addSetting(obj, "orbitCenterb", "Orbit center B", oFolder);
    addSetting(obj, "orbitCenterc", "Orbit center C", oFolder);
    addSetting(obj, "orbitTilta", "Orbit tilt A", oFolder);
    addSetting(obj, "orbitTiltb", "Orbit tilt B", oFolder);
    if (obj.settingsVisible) {
      oFolder.open();
    }
  });

  function addSetting(obj, attrib, name, folder) {
    obj[name] = obj[attrib].toString();
    folder
      .add(obj, name)
      .listen()
      .onFinishChange(() => {
        if (isNumeric(obj[name])) {
          obj[attrib] = Number(obj[name]);
          obj[name] = obj[attrib].toString();
          updatePlanet(obj);
          initTrace(obj);
        } else {
          obj[name] = obj[attrib].toString();
        }
      });
  }
}

const stats = new Stats();
document.body.appendChild(stats.dom);
if (!o.Perfomance) stats.dom.style.visibility = "hidden";

// stats.dom.container.style.visibility = 'hidden';
const clock = new THREE.Clock();

window.addEventListener("resize", onWindowResize, false);
onWindowResize();

// window.addEventListener('resize', onWindowResize, false);
// onWindowResize();

// var orbit;
var pause = true;

planets.forEach((obj) => {
  showHideObject(obj);
});
showHideAxisHelpers();
// showHideStars();
showHideCameraHelper();
showHideInfoText();

o.pos = 0;
let currPos;
let tlapsed = 0;
renderer.render(scene, camera); //renderer needs to be called otherwise the position are wrong
const centerPosVec = new THREE.Vector3();
const starPosVec = new THREE.Vector3();
const scaleVec = new THREE.Vector3();

/*
🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰
🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰
🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰
🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰🔰
*/

//*************************************************************
//THE RENDER LOOP 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
//*************************************************************
function render() {
  requestAnimationFrame(render);
  stats.update();
  //   if (o.Target !== "") {

  //   camera.copy(fakeCamera)

  if (Object.keys(o.lookAtObj).length !== 0) {
    //controls.target = earth.planetObj.getWorldPosition(new THREE.Vector3())

    controls.target = o.lookAtObj.pivotObj.getWorldPosition(centerPosVec);
    // controls.target = o.lookAtObj.planetObj.getWorldPosition(new THREE.Vector3())
    controls.update();
  }
  let delta = clock.getDelta();
  tlapsed += delta;
  if (tlapsed > 0.05) {
    tlapsed = 0;
    o["Position"] = o.pos;
    o.Day = posToDays(o.pos);
    o.julianDay = o.Day + 2451717;
    o.Date = daysToDate(o.Day);
    o.Time = posToTime(o.pos);
    o.worldCamX = Math.round(camera.position.x);
    o.worldCamY = Math.round(camera.position.y);
    o.worldCamZ = Math.round(camera.position.z);
    renderer.shadowMap.enabled = o["Shadows"];
  }
  if (o.Run) {
    o.pos += Number(o.speedFact) * o.speed * delta;
  }
  //tracePlanet(mars, o.pos);
  // lineTrace(o.pos);

  // trace(o.pos);
  planetsTrace(o.traceBtn, o.Lines, o.pos, planets, tracePlanets, scene, earth);

  moveModel(o.pos);
  updateElongations();
  updatePositions();
  trackSun();
  if (o["Earth camera"]) {
    renderer.render(scene, planetCamera);
  } else {
    renderer.render(scene, camera);
  }

  starsContainer.children.forEach(function (starPos) {
    const scaleFactor = 30;
    const star = starPos.children[0];
    const nametag = starPos.children[1];
    // const scale = scaleVec.subVectors(nametag.getWorldPosition(starPosVec), camera.position).length() / scaleFactor;
    const scale =
      scaleVec
        .subVectors(star.getWorldPosition(starPosVec), camera.position)
        .length() / scaleFactor;
    nametag.scale.set(scale, scale, 1);
    // NO EFFECT
    // nametag.position.copy(star.position)
  });
}
render();
//*************************************************************
//END RENDER LOOP
//*************************************************************

function updatePositions() {
  scene.updateMatrixWorld(); //No effect(?)

  const csPos = new THREE.Vector3();
  celestialSphere.getWorldPosition(csPos);

  const sphericalPos = new THREE.Spherical();

  tracePlanets.forEach((obj: any) => {
    const planetPos = new THREE.Vector3();
    const lookAtDir = new THREE.Vector3(0, 0, 1);
    obj.planetObj.getWorldPosition(planetPos);
    csLookAtObj.lookAt(planetPos);
    lookAtDir.applyQuaternion(csLookAtObj.quaternion);
    lookAtDir.setLength(csPos.distanceTo(planetPos));
    sphericalPos.setFromVector3(lookAtDir);
    obj.ra = radToRa(sphericalPos.theta);
    obj.dec = radToDec(sphericalPos.phi);

    if (obj.name === "Moon") {
      obj.distKm = (
        ((sphericalPos.radius / 100) * 149597871) /
        39.2078
      ).toFixed(2);
      obj.dist = (sphericalPos.radius / 100 / 39.2078).toFixed(8);
    } else {
      obj.distKm = ((sphericalPos.radius / 100) * 149597871).toFixed(2);
      obj.dist = (sphericalPos.radius / 100).toFixed(8);
    }
  });
  //Get camera pos
  const cameraPos = new THREE.Vector3();
  const lookAtDir = new THREE.Vector3(0, 0, 1);
  camera.getWorldPosition(cameraPos);
  csLookAtObj.lookAt(cameraPos);
  lookAtDir.applyQuaternion(csLookAtObj.quaternion);
  lookAtDir.setLength(csPos.distanceTo(cameraPos));
  sphericalPos.setFromVector3(lookAtDir);
  o.worldCamRa = radToRa(sphericalPos.theta);
  o.worldCamDec = radToDec(sphericalPos.phi);
  o.worldCamDistKm = (
    ((sphericalPos.radius / 100) * 149597871) /
    39.2078
  ).toFixed(2);
  o.worldCamDist = (sphericalPos.radius / 100).toFixed(8);
}

function drawSunLine() {
  const csPos = new THREE.Vector3();
  celestialSphere.getWorldPosition(csPos);
  const lookAtDir = new THREE.Vector3(0, 0, 1);
  const planetPos = new THREE.Vector3();

  const sphericalPos = new THREE.Spherical();

  sun.planetObj.getWorldPosition(planetPos);
  csLookAtObj.lookAt(planetPos);
  lookAtDir.applyQuaternion(csLookAtObj.quaternion);
  lookAtDir.setLength(csPos.distanceTo(planetPos));

  sphericalPos.setFromVector3(lookAtDir);

  var material = new THREE.LineBasicMaterial({
    color: 0x0000ff,
  });

  var geometry = new THREE.Geometry();
  geometry.vertices.push(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3().setFromSpherical(sphericalPos)
  );

  var line = new THREE.Line(geometry, material);
  celestialSphere.add(line);

  console.log(sphericalPos.theta);

  sphericalPos.theta = sun.ra;
  sphericalPos.phi = sun.dec;
  sphericalPos.radius = sun.dist;

  var material2 = new THREE.LineBasicMaterial({
    color: 0xff0000,
  });

  // var geometry2 = new THREE.Geometry();
  var geometry2 = new THREE.BufferGeometry();
  // var geometry2 = new LineGeometry();
  geometry2.vertices.push(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3().setFromSpherical(sphericalPos)
  );

  var line2 = new THREE.Line(geometry2, material2);
  celestialSphere.add(line2);
}

function trace(pos) {
  tracePlanets.forEach((obj) => {
    tracePlanet(obj, pos);
  });
  // tracePlanet(mars, pos)
}

function initTrace(obj) {
  obj.traceStartPos = obj.traceCurrPos = o.pos;
  obj.traceArrIndex = 0;
}

function setTraceMaterial(obj) {
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
  if (o.Lines) {
    obj.traceLine = new THREE.Line(lineGeometry, lineMaterial);
  } else {
    obj.traceLine = new THREE.Points(lineGeometry, lineMaterial);
  }
  scene.add(obj.traceLine);
}

function tracePlanet(obj, pos) {
  let update = false;
  if (!obj.traceOn || !o.traceBtn) {
    obj.traceLine = false;
    return;
  }
  if (pos < obj.traceStartPos) {
    initTrace(obj);
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
    setTraceMaterial(obj);
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

//To get the Zodiac ring to not rotate while following Earth,
//set its rotation to the negative speed of Earths PVP orbit
//2310 Not needed anymore since the zodiac has a fixed position now
// var zodiacRotationSpeed = 0.0002479160869310127
function moveModel(pos) {
  planets.forEach((obj) => {
    obj.orbitObj.rotation.y = obj.speed * pos - obj.startPos * (Math.PI / 180);
    if (obj.rotationSpeed) {
      obj.planetObj.rotation.y = obj.rotationSpeed * pos;
    }
  });
  // zodiac.rotation.y = -Math.PI/3 + zodiacRotationSpeed * pos
}
// Math.PI/6 +
function onWindowResize() {
  if (o["Earth camera"]) {
    planetCamera.aspect = window.innerWidth / window.innerHeight;
    planetCamera.updateProjectionMatrix();
  } else {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function addPolarGridHelper(inplanet) {
  var polarGridHelper = new THREE.PolarGridHelper(
    10,
    16,
    8,
    64,
    0x0000ff,
    0x808080
  );
  inplanet.add(polarGridHelper);
}

function posToDays(pos) {
  pos += sHour * 12; //Set the clock to tweleve for pos 0
  return Math.floor(pos / sDay);
}

function posToTime(pos) {
  pos += sHour * 12; //Set the clock to tweleve for pos 0
  let days = pos / sDay - Math.floor(pos / sDay);
  let hours = Math.floor(days * 24);
  let minutes = Math.floor((days * 24 - hours) * 60);
  let seconds = Math.round(((days * 24 - hours) * 60 - minutes) * 60);

  if (seconds === 60) {
    seconds = 0;
    minutes += 1;
  }

  if (minutes === 60) {
    minutes = 0;
    hours += 1;
  }

  let hh = ("0" + hours).slice(-2);
  let mm = ("0" + minutes).slice(-2);
  let ss = ("0" + seconds).slice(-2);

  return hh + ":" + mm + ":" + ss;
}

function timeToPos(value) {
  let aTime = value.split(":");
  let pos = aTime[0] * sHour + aTime[1] * sMinute + aTime[2] * sSecond;
  return (pos -= sHour * 12); //Set the clock to tweleve for pos 0
}

//console.log(raToRadians("00:00:60"))
function raToRadians(rightAscension) {
  const time = rightAscension.split(":");
  const deg = (Number(time[0]) + time[1] / 60 + time[2] / 3600) * 15;
  //console.log(deg)
  return deg * (Math.PI / 180);
}

function radiansToRa(radians) {
  const raDec = (radians * 12) / Math.PI;
  const hours = Math.floor(raDec);
  const minutes = raDec % 1;
}

//console.log(decToRadians("360:00:00"))
function decToRadians(declination) {
  const time = declination.split(":");
  const deg = Number(time[0]) + time[1] / 60 + time[2] / 3600;
  //console.log(deg)
  return deg * (Math.PI / 180);
}

function raToRadOld(ra) {
  const hours = ra.split("h")[0];
  const minutes = ra.split("h")[1].split("m")[0];
  const seconds = ra.split("h")[1].split("m")[1].split("s")[0];
  return (
    (hours * Math.PI) / 12 +
    minutes * (Math.PI / (12 * 60)) +
    seconds * (Math.PI / (12 * 3600))
  );
}

// ra: "02h31m49.09s", //02h 31m 49.09s "02h 31m 48.7s"
//  dec: "89d15m50.8s", //89° 15′ 50.8 "+89° 15′ 51″"

function raToRad(ra) {
  ra.replace(/\s+/g, "");
  const hours = ra.split("h")[0];
  const minutes = ra.split("h")[1].split("m")[0];
  const seconds = ra.split("h")[1].split("m")[1].split("s")[0];
  return (
    (hours * Math.PI) / 12 +
    minutes * (Math.PI / (12 * 60)) +
    seconds * (Math.PI / (12 * 3600))
  );
}

function decToRadOld(dec) {
  const degrees = dec.split("d")[0];
  const minutes = dec.split("d")[1].split("m")[0];
  const seconds = dec.split("d")[1].split("m")[1].split("s")[0];
  return (
    (degrees * Math.PI) / 180 +
    minutes * (Math.PI / (180 * 60)) +
    seconds * (Math.PI / (180 * 3600))
  );
}

function decToRad(dec) {
  dec.replace(/\s+/g, "");
  const degrees = dec.split("°")[0];
  const minutes = dec.split("°")[1].split("′")[0];
  const seconds = dec.split("°")[1].split("′")[1].split("″")[0];
  return (
    (degrees * Math.PI) / 180 +
    minutes * (Math.PI / (180 * 60)) +
    seconds * (Math.PI / (180 * 3600))
  );
}

function radToRa(rad) {
  if (rad < 0) {
    rad = rad + Math.PI * 2;
  }
  const raDec = (rad * 12) / Math.PI;
  const hours = Math.floor(raDec);
  const minutesSeconds = (raDec - hours) * 60;
  const minutes = Math.floor((raDec - hours) * 60);
  const seconds = (minutesSeconds - minutes) * 60;
  return (
    leadZero(hours) +
    "h" +
    leadZero(minutes) +
    "m" +
    leadZero(seconds.toFixed(0)) +
    "s"
  );
}

function radToDec(rad) {
  if (rad <= 0) {
    rad = rad + Math.PI / 2;
  } else {
    rad = Math.PI / 2 - rad;
  }
  var degDec = (rad * 180) / Math.PI;
  var degreesSign = "";

  if (degDec < 0) {
    degDec *= -1.0;
    degreesSign = "-";
  }

  const degrees = Math.floor(degDec);
  const minutesSeconds = (degDec - degrees) * 60;
  const minutes = Math.floor((degDec - degrees) * 60);
  const seconds = (minutesSeconds - minutes) * 60;
  return (
    leadZero(degreesSign + degrees, true) +
    "\xB0" +
    leadZero(minutes) +
    "'" +
    leadZero(seconds.toFixed(0)) +
    '"'
  );
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function leadZero(n, plus) {
  let sign;
  n < 0 ? (sign = "-") : (sign = "");
  if (sign === "" && plus) {
    sign = "+";
  }
  n = Math.abs(n);
  return n > 9 ? sign + n : sign + "0" + n;
}

function isValidTime(value) {
  //check input
  let aTime = value.split(":");
  if (aTime.length > 3) {
    //Only hh:mm:ss
    return false;
  }
  //Check with regex that we only have numbers and a valid time
  if (!/^\d+$/.test(aTime[0]) || aTime[0].length != 2) return false;
  if (aTime[0] > 24) return false;
  if (!/^\d+$/.test(aTime[1]) || aTime[1].length != 2) return false;
  if (aTime[1] > 59) return false;
  if (!/^\d+$/.test(aTime[2]) || aTime[2].length != 2) return false;
  if (aTime[2] > 59) return false;

  return true;
}

function isValidDate(value) {
  //check input
  let aDate = value.split("-");
  if (aDate.length > 3) {
    //Assume we have a minus sign first
    aDate.shift();
  }
  if (aDate.length > 3) {
    //Only year-month-day allowed
    return false;
  }
  //Check with regex that we only have numbers and a (probably) valid date
  if (!/^\d+$/.test(aDate[0]) || aDate[0].length > 20) {
    return false;
  }
  if (!/^\d+$/.test(aDate[1]) || aDate[1].length != 2) {
    return false;
  }
  if (aDate[1] > 12 || aDate[1] < 1) {
    return false;
  }
  if (!/^\d+$/.test(aDate[2]) || aDate[2].length != 2) {
    return false;
  }
  if (aDate[2] > 31 || aDate[2] < 1) {
    return false;
  }
  // if (Number(aDate[0]) === 0) return false; //Year 0 is not allowed
  if (Number(aDate[0]) === 1582 && Number(aDate[1]) === 10) {
    if (aDate[2] > 4 && aDate[2] < 15) return false; //Day 5-14, oct 1582 are not dates
  }

  return true;
}

//console.log(dateToDays("2000-06-20"))

function dateToDays(sDate) {
  //Calculates the number of days passed since 2000-06-21 for a date. Positive or negative
  //Taken from https://alcor.concordia.ca/~gpkatch/gdate-algorithm.html
  let aDate = sDate.split("-");
  let y, m, d;
  if (aDate.length > 3) {
    //We had a minus sign first (a BC date)
    y = -Number(aDate[1]);
    m = Number(aDate[2]);
    d = Number(aDate[3]);
  } else {
    y = Number(aDate[0]);
    m = Number(aDate[1]);
    d = Number(aDate[2]);
  }

  if (y < 1582) return julianDateToDays(sDate);
  if (y === 1582 && m < 10) return julianDateToDays(sDate);
  if (y === 1582 && m === 10 && d < 15) return julianDateToDays(sDate);

  m = (m + 9) % 12;
  y = y - Math.floor(m / 10);
  return (
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) +
    Math.floor((m * 306 + 5) / 10) +
    (d - 1) -
    730597
  );
}

function julianDateToDays(sDate) {
  //Calculates the number of days passed since 2000-06-21 for a date. Positive or negative
  //Taken from https://alcor.concordia.ca/~gpkatch/gdate-algorithm.html
  let aDate = sDate.split("-");
  let y, m, d, jd;
  if (aDate.length > 3) {
    //We had a minus sign first (a BC date)
    y = -Number(aDate[1]);
    m = Number(aDate[2]);
    d = Number(aDate[3]);
  } else {
    y = Number(aDate[0]);
    m = Number(aDate[1]);
    d = Number(aDate[2]);
  }

  // if (y < 0 ) y += 1;
  //if (y === -1) y -= 1;

  if (m < 3) {
    m += 12;
    y -= 1;
  }
  //Math.trunc(x)
  jd =
    Math.trunc(365.25 * (y + 4716)) + Math.trunc(30.6001 * (m + 1)) + d - 1524;

  return jd - 2451717;
}

function addYears(sDate, year) {
  let aDate = sDate.split("-");
  let y, date;
  if (aDate.length > 3) {
    //We had a minus sign first = a BC date
    y = -Number(aDate[1]);
    date = y + year + "-" + aDate[2] + "-" + aDate[3];
  } else {
    y = Number(aDate[0]);
    date = y + year + "-" + aDate[1] + "-" + aDate[2];
  }
  return date;
}

//console.log(daysToDate(0))

function daysToDate(g) {
  if (g < -152556) return julianCalDayToDate(g); //Julian dates earlier than 1582-10-15
  g += 730597;
  let y = Math.floor((10000 * g + 14780) / 3652425);
  let ddd =
    g -
    (365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400));
  if (ddd < 0) {
    y = y - 1;
    ddd =
      g -
      (365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400));
  }
  let mi = Math.floor((100 * ddd + 52) / 3060);
  let mm = ((mi + 2) % 12) + 1;
  y = y + Math.floor((mi + 2) / 12);
  let dd = ddd - Math.floor((mi * 306 + 5) / 10) + 1;

  mm = ("0" + mm).slice(-2);
  dd = ("0" + dd).slice(-2);

  return y + "-" + mm + "-" + dd;
}

function julianCalDayToDate(g) {
  var jDay = g + 2451717; //+ 10;
  var z = Math.floor(jDay - 1721116.5);
  var r = jDay - 1721116.5 - z;
  var year = Math.floor((z - 0.25) / 365.25);
  var c = z - Math.floor(365.25 * year);
  var month = Math.trunc((5 * c + 456) / 153);
  var day = c - Math.trunc((153 * month - 457) / 5) + r - 0.5;
  if (month > 12) {
    year = year + 1;
    month = month - 12;
  }
  month = ("0" + month).slice(-2);
  day = ("0" + day).slice(-2);
  // if (year <= 0) year -= 1;
  return year + "-" + month + "-" + day;
}

//Returns the angle from the sun to targetPlanet as viewed from earth using the cosine rule.
function getElongationFromSun(targetPlanet) {
  var sunPosition = new THREE.Vector3();
  var earthPosition = new THREE.Vector3();
  var targetPlanetPosition = new THREE.Vector3();
  sun.planetObj.getWorldPosition(sunPosition);
  earth.planetObj.getWorldPosition(earthPosition);
  targetPlanet.planetObj.getWorldPosition(targetPlanetPosition);

  var earthSunDistance = earthPosition.distanceTo(sunPosition);
  var earthTargetPlanetDistance =
    earthPosition.distanceTo(targetPlanetPosition);
  var sunTargetPlanetDistance = sunPosition.distanceTo(targetPlanetPosition);

  var numerator =
    Math.pow(earthSunDistance, 2) +
    Math.pow(earthTargetPlanetDistance, 2) -
    Math.pow(sunTargetPlanetDistance, 2);
  var denominator = 2.0 * earthSunDistance * earthTargetPlanetDistance;
  const elongationRadians = Math.acos(numerator / denominator);
  return (180.0 * elongationRadians) / Math.PI;
}

function updateElongations() {
  o["moonElongation"] = getElongationFromSun(moon);
  o["mercuryElongation"] = getElongationFromSun(mercury);
  o["venusElongation"] = getElongationFromSun(venus);
  o["marsElongation"] = getElongationFromSun(mars);
  o["jupiterElongation"] = getElongationFromSun(jupiter);
  o["saturnElongation"] = getElongationFromSun(saturnus);
}

function updatePlanet(pd) {
  pd.containerObj.rotation.x = pd.orbitTilta * (Math.PI / 180);
  pd.containerObj.rotation.z = pd.orbitTiltb * (Math.PI / 180);
  pd.containerObj.position.x = pd.orbitCentera;
  pd.containerObj.position.z = pd.orbitCenterb;
  pd.containerObj.position.y = pd.orbitCenterc;
  pd.rotationAxis.rotation.z = pd.tilt * (Math.PI / 180);
  if (pd.hasOwnProperty("tiltb")) {
    pd.rotationAxis.rotation.x = pd.tiltb * (Math.PI / 180);
  }
}

function showHideObject(obj) {
  obj.orbitLineObj.visible = obj.visible;
  obj.planetMesh.visible = obj.visible;
  if (obj.axisHelper) {
    if (obj.visible) {
      obj.axisHelper.visible = o["Axis helpers"];
    } else {
      obj.axisHelper.visible = obj.visible;
    }
  }
  if (obj.ringObj) {
    obj.ringObj.visible = obj.visible;
  }
}

function showHideAxisHelpers() {
  planets.forEach((obj) => {
    if (obj.axisHelper) {
      obj.axisHelper.visible = o["Axis helpers"];
    }
  });
}

function showHideOrbits() {
  planets.forEach((obj) => {
    if (obj.orbitLineObj && !obj.isDeferent) {
      if (obj.visible) {
        obj.orbitLineObj.visible = o["Orbits"];
      }
    }
  });
}

// function showHideStars() {
//   stars.forEach(obj => {
//     obj.starObj.visible = o.Stars
//   })
// };

function showHideInfoText() {
  var x = document.getElementById("info");
  if (o.infotext) {
    x.style.display = "block";
  } else {
    x.style.display = "none";
  }
  // if (x.style.display === "none") {
  //   x.style.display = "block";
  // } else {
  //   x.style.display = "none";
  // }
}

function randomPointInSphere(radius) {
  const v = new THREE.Vector3();

  const x = THREE.Math.randFloat(-1, 1);
  const y = THREE.Math.randFloat(-1, 1);
  const z = THREE.Math.randFloat(-1, 1);
  const normalizationFactor = 1 / Math.sqrt(x * x + y * y + z * z);

  v.x = x * normalizationFactor * radius;
  v.y = y * normalizationFactor * radius;
  v.z = z * normalizationFactor * radius;

  return v;
}

function createStarfield() {
  const geometry = new THREE.BufferGeometry();
  var positions = [];

  for (var i = 0; i < 100000; i++) {
    var vertex = randomPointInSphere(1000000);
    positions.push(vertex.x, vertex.y, vertex.z);
  }

  geometry.addAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0x888888,
    size: 0.05,
    sizeAttenuation: false,
  });
  //material = new THREE.PointsMaterial( { color: 0xffffff, size: 0.01 } );
  particles = new THREE.Points(geometry, material);
  scene.add(particles);
}

function setStarDistance() {
  stars.forEach((obj) => {
    obj.starObj.position.x = obj.dist * o["Star distance"];
  });
}

// function createRings(radius, segments, texture) {
//   return new THREE.Mesh(new THREE.XRingGeometry(1.2 * radius, 2 * radius, 2 * segments, 5, 0, Math.PI * 2), new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true, opacity: 0.6 }));
// }

// function initXRingGeometry() {
//   /**
//  * @author Kaleb Murphy
//  * Modified uvs.push on line no. 42.
//  */

//  //This allows textures to be added to a disc in a way that makes planetary ring look nice
//   THREE.XRingGeometry = function ( innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength ) {

//     THREE.Geometry.call( this );

//     this.type = 'XRingGeometry';

//     this.parameters = {
//       innerRadius: innerRadius,
//       outerRadius: outerRadius,
//       thetaSegments: thetaSegments,
//       phiSegments: phiSegments,
//       thetaStart: thetaStart,
//       thetaLength: thetaLength
//     };

//     innerRadius = innerRadius || 0;
//     outerRadius = outerRadius || 50;

//     thetaStart = thetaStart !== undefined ? thetaStart : 0;
//     thetaLength = thetaLength !== undefined ? thetaLength : Math.PI * 2;

//     thetaSegments = thetaSegments !== undefined ? Math.max( 3, thetaSegments ) : 8;
//     phiSegments = phiSegments !== undefined ? Math.max( 1, phiSegments ) : 8;

//     var i, o, uvs = [], radius = innerRadius, radiusStep = ( ( outerRadius - innerRadius ) / phiSegments );

//     for ( i = 0; i < phiSegments + 1; i ++ ) { // concentric circles inside ring

//       for ( o = 0; o < thetaSegments + 1; o ++ ) { // number of segments per circle

//         var vertex = new THREE.Vector3();
//         var segment = thetaStart + o / thetaSegments * thetaLength;
//         vertex.x = radius * Math.cos( segment );
//         vertex.z = radius * Math.sin( segment );

//         this.vertices.push( vertex );
//         // uvs.push( new THREE.Vector2( ( vertex.x / outerRadius + 1 ) / 2, ( vertex.y / outerRadius + 1 ) / 2 ) );
//         uvs.push( new THREE.Vector2( o / thetaSegments, i / phiSegments ) );
//       }

//       radius += radiusStep;

//     }

//     var n = new THREE.Vector3( 1, 0, 0 );

//     for ( i = 0; i < phiSegments; i ++ ) { // concentric circles inside ring

//       var thetaSegment = i * (thetaSegments + 1);

//       for ( o = 0; o < thetaSegments ; o ++ ) { // number of segments per circle

//         var segment = o + thetaSegment;

//         var v1 = segment;
//         var v2 = segment + thetaSegments + 1;
//         var v3 = segment + thetaSegments + 2;

//         this.faces.push( new THREE.Face3( v1, v2, v3, [ n.clone(), n.clone(), n.clone() ] ) );
//         this.faceVertexUvs[ 0 ].push( [ uvs[ v1 ].clone(), uvs[ v2 ].clone(), uvs[ v3 ].clone() ]);

//         v1 = segment;
//         v2 = segment + thetaSegments + 2;
//         v3 = segment + 1;

//         this.faces.push( new THREE.Face3( v1, v2, v3, [ n.clone(), n.clone(), n.clone() ] ) );
//         this.faceVertexUvs[ 0 ].push( [ uvs[ v1 ].clone(), uvs[ v2 ].clone(), uvs[ v3 ].clone() ]);

//       }
//     }

//     this.computeFaceNormals();

//     this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius );

//   };

//   THREE.XRingGeometry.prototype = Object.create( THREE.Geometry.prototype );
//   THREE.XRingGeometry.prototype.constructor = THREE.XRingGeometry;

// }

// function makeTextSprite( message, parameters )
//     {
//         if ( parameters === undefined ) parameters = {};
//         var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Courier New";
//         var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;
//         var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
//         var borderColor = parameters.hasOwnProperty("borderColor") ?parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
//         var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?parameters["backgroundColor"] : { r:0, g:0, b:255, a:1.0 };
//         var textColor = parameters.hasOwnProperty("textColor") ?parameters["textColor"] : { r:0, g:0, b:0, a:1.0 };

//         var canvas = document.createElement('canvas');
//         var context = canvas.getContext('2d');
//         context.font = "Bold " + fontsize + "px " + fontface;
//         var metrics = context.measureText( message );
//         var textWidth = metrics.width;

//         context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
//         context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";
//         context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";
//         context.fillText( message, borderThickness, fontsize + borderThickness);

//         var texture = new THREE.Texture(canvas)
//         texture.needsUpdate = true;
//         var spriteMaterial = new THREE.SpriteMaterial( { map: texture} );
//         var sprite = new THREE.Sprite( spriteMaterial );
//         sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
//         return sprite;
//     }

function getCircularText(
  text,
  diameter,
  startAngle,
  align,
  textInside,
  inwardFacing,
  fName,
  fSize,
  kerning
) {
  // text:         The text to be displayed in circular fashion
  // diameter:     The diameter of the circle around which the text will
  //               be displayed (inside or outside)
  // startAngle:   In degrees, Where the text will be shown. 0 degrees
  //               if the top of the circle
  // align:        Positions text to left right or center of startAngle
  // textInside:   true to show inside the diameter. False to show outside
  // inwardFacing: true for base of text facing inward. false for outward
  // fName:        name of font family. Make sure it is loaded
  // fSize:        size of font family. Don't forget to include units
  // kearning:     0 for normal gap between letters. positive or
  //               negative number to expand/compact gap in pixels
  //------------------------------------------------------------------------

  // declare and intialize canvas, reference, and useful variables
  align = align.toLowerCase();
  var mainCanvas = document.createElement("canvas");
  var ctxRef = mainCanvas.getContext("2d");
  var clockwise = align == "right" ? 1 : -1; // draw clockwise for aligned right. Else Anticlockwise
  startAngle = startAngle * (Math.PI / 180); // convert to radians

  // calculate height of the font. Many ways to do this
  // you can replace with your own!
  var div = document.createElement("div");
  div.innerHTML = text;
  div.style.position = "absolute";
  div.style.top = "-10000px";
  div.style.left = "-10000px";
  div.style.fontFamily = fName;
  div.style.fontSize = fSize;
  document.body.appendChild(div);
  var textHeight = div.offsetHeight;
  document.body.removeChild(div);

  // in cases where we are drawing outside diameter,
  // expand diameter to handle it
  if (!textInside) diameter += textHeight * 2;

  mainCanvas.width = diameter;
  mainCanvas.height = diameter;
  // omit next line for transparent background
  //mainCanvas.style.backgroundColor = 'lightgray';
  ctxRef.fillStyle = "grey";
  ctxRef.font = fSize + " " + fName;

  // Reverse letters for align Left inward, align right outward
  // and align center inward.
  if (
    (["left", "center"].indexOf(align) > -1 && inwardFacing) ||
    (align == "right" && !inwardFacing)
  )
    text = text.split("").reverse().join("");

  // Setup letters and positioning
  ctxRef.translate(diameter / 2, diameter / 2); // Move to center
  startAngle += Math.PI * !inwardFacing; // Rotate 180 if outward
  ctxRef.textBaseline = "middle"; // Ensure we draw in exact center
  ctxRef.textAlign = "center"; // Ensure we draw in exact center

  // rotate 50% of total angle for center alignment
  if (align == "center") {
    for (var j = 0; j < text.length; j++) {
      var charWid = ctxRef.measureText(text[j]).width;
      startAngle +=
        ((charWid + (j == text.length - 1 ? 0 : kerning)) /
          (diameter / 2 - textHeight) /
          2) *
        -clockwise;
    }
  }

  // Phew... now rotate into final start position
  ctxRef.rotate(startAngle);

  // Now for the fun bit: draw, rotate, and repeat
  for (var j = 0; j < text.length; j++) {
    var charWid = ctxRef.measureText(text[j]).width; // half letter
    // rotate half letter
    ctxRef.rotate((charWid / 2 / (diameter / 2 - textHeight)) * clockwise);
    // draw the character at "top" or "bottom"
    // depending on inward or outward facing
    ctxRef.fillText(
      text[j],
      0,
      (inwardFacing ? 1 : -1) * (0 - diameter / 2 + textHeight / 2)
    );

    ctxRef.rotate(
      ((charWid / 2 + kerning) / (diameter / 2 - textHeight)) * clockwise
    ); // rotate half letter
  }

  // Return it
  return mainCanvas;
}

function colorTemperature2rgb(kelvin) {
  var temperature = kelvin / 100.0;
  var red, green, blue;

  if (temperature < 66.0) {
    red = 255;
  } else {
    // a + b x + c Log[x] /.
    // {a -> 351.97690566805693`,
    // b -> 0.114206453784165`,
    // c -> -40.25366309332127
    //x -> (kelvin/100) - 55}
    red = temperature - 55.0;
    red =
      351.97690566805693 +
      0.114206453784165 * red -
      40.25366309332127 * Math.log(red);
    if (red < 0) red = 0;
    if (red > 255) red = 255;
  }

  /* Calculate green */

  if (temperature < 66.0) {
    // a + b x + c Log[x] /.
    // {a -> -155.25485562709179`,
    // b -> -0.44596950469579133`,
    // c -> 104.49216199393888`,
    // x -> (kelvin/100) - 2}
    green = temperature - 2;
    green =
      -155.25485562709179 -
      0.44596950469579133 * green +
      104.49216199393888 * Math.log(green);
    if (green < 0) green = 0;
    if (green > 255) green = 255;
  } else {
    // a + b x + c Log[x] /.
    // {a -> 325.4494125711974`,
    // b -> 0.07943456536662342`,
    // c -> -28.0852963507957`,
    // x -> (kelvin/100) - 50}
    green = temperature - 50.0;
    green =
      325.4494125711974 +
      0.07943456536662342 * green -
      28.0852963507957 * Math.log(green);
    if (green < 0) green = 0;
    if (green > 255) green = 255;
  }

  /* Calculate blue */

  if (temperature >= 66.0) {
    blue = 255;
  } else {
    if (temperature <= 20.0) {
      blue = 0;
    } else {
      // a + b x + c Log[x] /.
      // {a -> -254.76935184120902`,
      // b -> 0.8274096064007395`,
      // c -> 115.67994401066147`,
      // x -> kelvin/100 - 10}
      blue = temperature - 10;
      blue =
        -254.76935184120902 +
        0.8274096064007395 * blue +
        115.67994401066147 * Math.log(blue);
      if (blue < 0) blue = 0;
      if (blue > 255) blue = 255;
    }
  }
  //  return {red: Math.round(red), blue: Math.round(blue), green: Math.round(green)};

  //const white = new THREE.Color('rgb(255,255,255)');
  return (
    "rgb(" +
    Math.round(red) +
    "," +
    Math.round(green) +
    "," +
    Math.round(blue) +
    ")"
  );
}
