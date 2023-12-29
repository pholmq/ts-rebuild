import THREE from "three";
// import system from "./system.json";
import defaultSettings from "./systemSettings.json";

import { earthRotations, sDay, sYear, sWeek } from "./timeConstants";

//*************************************************************
//DEFINE PLANETS (Stars, Moons and deferents conunt as planets)
//*************************************************************
var earth = {
  name: "Earth",
  size: 4,
  color: 0x578b7c,
  sphereSegments: 320,
  startPos: 0,
  speed: (-Math.PI * 2) / 25344,
  rotationSpeed: Math.PI * 2 * earthRotations,
  tilt: -23.439062,
  tiltb: 0.26,
  orbitRadius: 37.8453,
  orbitCentera: 0,
  orbitCenterb: 0,
  orbitCenterc: 0,

  orbitTilta: 0,
  orbitTiltb: 0,

  // textureUrl: 'https://raw.githubusercontent.com/pholmq/tsnova-resources/master/EarthDay.jpg',
  textureUrl: "textures/8k_earth_daymap.jpg",
  visible: true,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: <THREE.Object3D>null,
  axisHelper: true,

  traceLength: sYear * 18,
  traceStep: sDay,
  traceOn: false,
  traceLine: false,
  traceStartPos: 0,
  traceCurrPos: 0,
  traceArrIndex: 0,
};
var moonDef = {
  name: "Moon deferent A",
  size: 0.6,
  color: 0x8b8b8b,
  startPos: 227.35,
  speed: 0.71018840177343,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 0.0279352315075,
  orbitCentera: -0.2,
  orbitCenterb: 0.1,
  orbitCenterc: 0,
  orbitTilta: 0.1,
  orbitTiltb: 0.2,

  visible: false,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: <THREE.Object3D>null,
  axisHelper: false,
  isDeferent: true,
};

var moonDefB = {
  name: "Moon deferent B",
  size: 0.6,
  color: 0x8b8b8b,
  startPos: -3,
  speed: 0,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 0,
  orbitCentera: 0.1,
  orbitCenterb: 0.2,
  orbitCenterc: -0.03,
  orbitTilta: 2.3,
  orbitTiltb: 2.6,

  visible: false,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: <THREE.Object3D>null,
  axisHelper: false,
  isDeferent: true,
};

var moon = {
  name: "Moon",
  size: 1,
  color: 0x8b8b8b,
  startPos: 260.8,
  speed: 83.28517,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 10,
  orbitCentera: 0.4,
  orbitCenterb: -0.9,
  orbitCenterc: 0,
  orbitTilta: -1.8,
  orbitTiltb: -2.6,

  textureUrl:
    "https://raw.githubusercontent.com/pholmq/tsnova-resources/master/Moon.jpg",
  visible: true,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: <THREE.Object3D>null,
  axisHelper: true,

  traceLength: sYear * 18,
  traceStep: sDay,
  traceOn: false,
  traceLine: false,
  traceStartPos: 0,
  traceCurrPos: 0,
  traceArrIndex: 0,
};

var sunDef = {
  name: "Sun deferent",
  size: 2,
  color: 0xfeaa0d,
  startPos: 0,
  speed: 0,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 0,
  orbitCentera: 1.4,
  orbitCenterb: 0,
  orbitCenterc: 0,
  orbitTilta: 0,
  orbitTiltb: 0,

  visible: false,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: <THREE.Object3D>null,
  axisHelper: false,
  isDeferent: true,
};

var sun = {
  name: "Sun",
  size: 5,
  //color: 0xFEAA0D,
  color: 0xffff00,
  startPos: 0.1,
  speed: Math.PI * 2,
  rotationSpeed: 83.995,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 100,
  orbitCentera: 1.6,
  orbitCenterb: -0.79,
  orbitCenterc: 0,
  orbitTilta: 0.25,
  orbitTiltb: 0,
  textureUrl:
    "https://raw.githubusercontent.com/pholmq/tsnova-resources/master/Sun.jpg",
  textureTransparency: 9,
  visible: true,
  emissive: true,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: <THREE.Object3D>null,
  axisHelper: true,

  traceLength: sYear * 25000,
  traceStep: sYear * 10,
  traceOn: false,
  traceLine: false,
  traceStartPos: 0,
  traceCurrPos: 0,
  traceArrIndex: 0,
};

var mercuryDef = {
  name: "Mercury def A",
  size: 0.7,
  color: 0x868485,
  startPos: 0,
  speed: Math.PI * 2,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 100,
  orbitCentera: -9,
  orbitCenterb: 1.1,
  orbitCenterc: -0.1,
  orbitTilta: 0.6,
  orbitTiltb: 0,

  visible: false,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: <THREE.Object3D>null,
  axisHelper: false,
  isDeferent: true,
};

var mercuryDefB = {
  name: "Mercury def B",
  size: 0.7,
  color: 0x868485,
  startPos: 17.3,
  speed: -6.283185307179586,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 0,
  orbitCentera: 0,
  orbitCenterb: 0.4,
  orbitCenterc: 0,
  orbitTilta: -1.5,
  orbitTiltb: 0.6,

  visible: false,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: <THREE.Object3D>null,
  axisHelper: false,
  isDeferent: true,
};

var mercury = {
  name: "Mercury",
  size: 1.4,
  color: 0x868485,
  startPos: -164.7,
  speed: 26.087623,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 38.710225,
  orbitCentera: 1.2,
  orbitCenterb: -1.2,
  orbitCenterc: 0,
  orbitTilta: 4,
  orbitTiltb: 1.3,

  textureUrl:
    "https://raw.githubusercontent.com/pholmq/tsnova-resources/master/Mercury.jpg",
  visible: true,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: "",
  axisHelper: true,

  traceLength: sYear * 14,
  traceStep: sDay,
  traceOn: false,
  traceLine: false,
  traceStartPos: 0,
  traceCurrPos: 0,
  traceArrIndex: 0,
};

var venusDef = {
  name: "Venus deferent A",
  size: 2,
  color: 0xa57c1b,
  startPos: 0,
  speed: Math.PI * 2,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 100,
  orbitCentera: 1.66,
  orbitCenterb: -0.15,
  orbitCenterc: 0,
  orbitTilta: 0,
  orbitTiltb: -0.15,

  visible: false,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: <THREE.Object3D>null,
  axisHelper: true,
  isDeferent: true,
};

var venusDefB = {
  name: "Venus deferent B",
  size: 2,
  color: 0xa57c1b,
  startPos: 13,
  speed: -6.283185307179586,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 0,
  orbitCentera: 0,
  orbitCenterb: -0.15,
  orbitCenterc: 0.2,
  orbitTilta: 0,
  orbitTiltb: 0.3,

  visible: false,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: <THREE.Object3D>null,
  axisHelper: true,
  isDeferent: true,
};

var venus = {
  name: "Venus",
  size: 3.9,
  color: 0xa57c1b,
  startPos: -20.7,
  speed: 10.2133116,
  //10.213454 - twoPI
  // speed: 10.213454,
  //speed: 41197.22326*twoPI/TGY,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 72.327789,
  orbitCentera: 0,
  orbitCenterb: -0.15,
  orbitCenterc: 0.15,
  orbitTilta: 3.4,
  orbitTiltb: 0,
  traceLength: sYear * 16,
  traceStep: sWeek,

  textureUrl:
    "https://raw.githubusercontent.com/pholmq/tsnova-resources/master/VenusAtmosphere.jpg",
  visible: true,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: "",
  axisHelper: true,

  traceOn: false,
  traceLine: false,
  traceStartPos: 0,
  traceCurrPos: 0,
  traceArrIndex: 0,
};

var marsDef = {
  name: "Mars E deferent",
  size: 2,
  color: 0x008000,
  startPos: 0.45,
  speed: 6.283185307179586,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 100,
  orbitCentera: 12,
  orbitCenterb: -20.5,
  orbitCenterc: -0.5,
  orbitTilta: -1.45,
  orbitTiltb: 0.5,

  visible: false,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: <THREE.Object3D>null,
  isDeferent: true,
};

var marsSunDef = {
  name: "Mars S deferent",
  size: 2,
  color: 0xfeaa0d,
  startPos: -99.7,
  speed: 0.398150316,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 7.44385,
  orbitCentera: -0.2,
  orbitCenterb: -0.7,
  orbitCenterc: 0,
  orbitTilta: -0.1,
  orbitTiltb: -0.325,

  visible: false,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: <THREE.Object3D>null,
  isDeferent: true,
};

var mars = {
  name: "Mars",
  size: 2.12,
  color: 0xff0000,
  startPos: 104,
  //speed: 3.34,
  speed: -3.3406209,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 152.677,
  orbitCentera: 0.2,
  orbitCenterb: -1.5,
  orbitCenterc: 0,
  orbitTilta: -0.4,
  orbitTiltb: -2.2,
  traceLength: sYear * 44,
  traceStep: sWeek,

  textureUrl:
    "https://raw.githubusercontent.com/pholmq/tsnova-resources/master/Mars.jpg",
  visible: true,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: <THREE.Object3D>null,
  axisHelper: true,

  traceOn: true,
  traceLine: false,
  traceStartPos: 0,
  traceCurrPos: 0,
  traceArrIndex: 0,
};

var phobos = {
  name: "Phobos",
  size: 0.5,
  color: 0x8b8b8b,
  startPos: 122,
  speed: 6986.5,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 5,
  orbitCentera: 0,
  orbitCenterb: 0,
  orbitCenterc: 0,
  orbitTilta: 0,
  orbitTiltb: 0,

  visible: false,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: "",
};

var deimos = {
  name: "Deimos",
  size: 0.5,
  color: 0x8b8b8b,
  startPos: 0,
  speed: 1802,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 10,
  orbitCentera: 0,
  orbitCenterb: 0,
  orbitCenterc: 0,
  orbitTilta: 0,
  orbitTiltb: 0,

  visible: false,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: "",
};

var jupiterDef = {
  name: "Jupiter deferent",
  size: 1,
  color: 0xcdc2b2,
  startPos: 5,
  speed: -6.283185307179586,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 15,
  orbitCentera: 2,
  orbitCenterb: 0,
  orbitCenterc: 0,
  orbitTilta: -0.25,
  orbitTiltb: 0.4,

  visible: false,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: <THREE.Object3D>null,
  isDeferent: true,
};

var jupiter = {
  name: "Jupiter",
  size: 7.5,
  color: 0xcdc2b2,
  startPos: 36.5,
  speed: 0.529908,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 520.4,
  orbitCentera: -25,
  orbitCenterb: -45,
  orbitCenterc: 0,
  orbitTilta: 0.9,
  orbitTiltb: -0.7,
  traceLength: sYear * 18,
  traceStep: sWeek,

  textureUrl:
    "https://raw.githubusercontent.com/pholmq/tsnova-resources/master/Jupiter.jpg",
  visible: true,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: "",
  axisHelper: true,

  traceOn: false,
  traceLine: false,
  traceStartPos: 0,
  traceCurrPos: 0,
  traceArrIndex: 0,
};
var saturnusDef = {
  name: "Saturn deferent",
  size: 1,
  color: 0xa79662,
  startPos: 160.5,
  speed: -6.283185307179586,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 20,
  orbitCentera: 17,
  orbitCenterb: 15,
  orbitCenterc: 0,
  orbitTilta: 0.45,
  orbitTiltb: -0.4,

  visible: false,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: <THREE.Object3D>null,
  isDeferent: true,
};

var saturnus = {
  name: "Saturn",
  size: 6.5,
  color: 0xa79662,
  startPos: 232.85,
  speed: 0.213524,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 958.2,
  orbitCentera: 50,
  orbitCenterb: 35,
  orbitCenterc: 0,
  orbitTilta: -1.8,
  orbitTiltb: 0.3,
  traceLength: sYear * 45,
  traceStep: sWeek,

  textureUrl:
    "https://raw.githubusercontent.com/pholmq/tsnova-resources/master/Saturn.jpg",
  ringUrl:
    "https://raw.githubusercontent.com/pholmq/tsnova-resources/master/saturn-rings.png",
  ringSize: 10,
  visible: true,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: "",
  axisHelper: true,

  traceOn: false,
  traceLine: false,
  traceStartPos: 0,
  traceCurrPos: 0,
  traceArrIndex: 0,
};

var uranusDef = {
  name: "Uranus deferent",
  size: 1,
  color: 0xd2f9fa,
  startPos: 108.5,
  speed: -6.283185307179586,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 20,
  orbitCentera: -11,
  orbitCenterb: 11,
  orbitCenterc: 0,
  orbitTilta: 0.7,
  orbitTiltb: 0,

  visible: false,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: <THREE.Object3D>null,
  isDeferent: true,
};

var uranus = {
  name: "Uranus",
  size: 7.5,
  //color: 0xCDC2B2,
  color: 0xd2f9fa,
  //2B383A
  startPos: 384.6,
  speed: 0.0747998,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 1920.13568,
  orbitCentera: 60,
  orbitCenterb: -22,
  orbitCenterc: 0,
  orbitTilta: -0.5,
  orbitTiltb: -0.45,
  traceLength: sYear * 18,
  traceStep: sWeek,

  textureUrl:
    "https://raw.githubusercontent.com/pholmq/tsnova-resources/master/Uranus.jpg",
  visible: true,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: "",
  axisHelper: true,
  traceOn: false,
  traceLine: false,
  traceStartPos: 0,
  traceCurrPos: 0,
  traceArrIndex: 0,
};

var neptuneDef = {
  name: "Neptune deferent",
  size: 1,
  color: 0x5e93f1,
  startPos: 175.2,
  speed: -6.283185307179586,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 20,
  orbitCentera: 0,
  orbitCenterb: 0,
  orbitCenterc: 0,
  orbitTilta: 0,
  orbitTiltb: 0,

  visible: false,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: <THREE.Object3D>null,
  isDeferent: true,
};

var neptune = {
  name: "Neptune",
  size: 7.5,
  color: 0x5e93f1,
  startPos: 329.3,
  speed: 0.0380799,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 3004.72,
  orbitCentera: 0,
  orbitCenterb: 20,
  orbitCenterc: 0,
  orbitTilta: -1.5,
  orbitTiltb: 1.15,
  traceLength: sYear * 18,
  traceStep: sWeek,

  textureUrl:
    "https://raw.githubusercontent.com/pholmq/tsnova-resources/master/Neptune.jpg",
  visible: true,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: "",
  axisHelper: true,

  traceOn: false,
  traceLine: false,
  traceStartPos: 0,
  traceCurrPos: 0,
  traceArrIndex: 0,
};

var halleysDef = {
  name: "Halleys deferent",
  size: 1,
  color: 0xa57c1b,
  startPos: 192,
  speed: -6.283185307179586,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 20,
  orbitCentera: -7,
  orbitCenterb: 3,
  orbitCenterc: 12,
  orbitTilta: 0,
  orbitTiltb: 0,

  visible: false,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: <THREE.Object3D>null,
  isDeferent: true,
};

var halleys = {
  name: "Halleys",
  size: 2,
  color: 0x00ff00,
  planetColor: 0xffffff,
  startPos: 75.25,
  speed: -0.08301,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 1674.5,
  orbitCentera: -1524,
  orbitCenterb: -230,
  orbitCenterc: -509,
  orbitTilta: 7,
  orbitTiltb: 18.41,
  traceLength: sYear * 90,
  traceStep: sWeek,

  visible: false,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: "",
  axisHelper: true,

  traceOn: false,
  traceLine: false,
  traceStartPos: 0,
  traceCurrPos: 0,
  traceArrIndex: 0,
};

var erosDef = {
  name: "Eros deferent A",
  size: 2,
  color: 0xa57c1b,
  startPos: 0,
  speed: Math.PI * 2,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 100,
  orbitCentera: 1.66,
  orbitCenterb: -0.15,
  orbitCenterc: 0,
  orbitTilta: 0,
  orbitTiltb: -0.15,

  visible: false,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: <THREE.Object3D>null,
  axisHelper: true,
  isDeferent: true,
};

var erosDefB = {
  name: "Eros deferent B",
  size: 2,
  color: 0xa57c1b,
  startPos: 13,
  speed: -6.283185307179586,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 0,
  orbitCentera: 0,
  orbitCenterb: -0.15,
  orbitCenterc: 0.2,
  orbitTilta: 0,
  orbitTiltb: 0.3,

  visible: false,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: <THREE.Object3D>null,
  axisHelper: true,
  isDeferent: true,
};

var eros = {
  name: "Eros",
  size: 3.9,
  color: 0xa57c1b,
  startPos: -20.7,
  speed: 10.2133116,
  //10.213454 - twoPI
  // speed: 10.213454,
  //speed: 41197.22326*twoPI/TGY,
  rotationSpeed: 0,
  tilt: 0,
  tiltb: 0,
  orbitRadius: 72.327789,
  orbitCentera: 0,
  orbitCenterb: -0.15,
  orbitCenterc: 0.15,
  orbitTilta: 3.4,
  orbitTiltb: 0,
  traceLength: sYear * 16,
  traceStep: sWeek,

  visible: false,
  containerObj: <THREE.Object3D>null,
  orbitObj: "",
  planetObj: "",
  pivotObj: "",
  axisHelper: true,

  traceOn: false,
  traceLine: false,
  traceStartPos: 0,
  traceCurrPos: 0,
  traceArrIndex: 0,
};

// var mansPath = {
//   name: "Mans path",
//   size: 0.1,
//   color: 0x00FF00,
//   planetColor: 0xFFFFFF,
//   startPos: 0,
//   speed: 0,
//   rotationSpeed: 0,
//   tilt: 0,
//   orbitRadius: 0,
//   orbitCentera: 0,
//   orbitCenterb: 0,
//   orbitCenterc: 0,
//   orbitTilta: 0,
//   orbitTiltb: 0,
//   traceLength : sYear * 90,
//   traceStep : sMonth,

//   visible: false,
//   containerObj:"",
//   orbitObj:"",
//   planetObj:"",
//   pivotObj:"",
//   axisHelper: true,

//   traceOn: false,
//   traceLine: false,
//   traceStartPos : 0,
//   traceCurrPos : 0,
//   traceArrIndex : 0,
//   isDeferent: true,
// };

const scene = new THREE.Scene();

//CREATE PLANETS

function createPlanet(pd) {
  //pd = Planet Data
  const orbitContainer = new THREE.Object3D();
  orbitContainer.rotation.x = pd.orbitTilta * (Math.PI / 180);
  orbitContainer.rotation.z = pd.orbitTiltb * (Math.PI / 180);
  orbitContainer.position.x = pd.orbitCentera;
  orbitContainer.position.z = pd.orbitCenterb;
  orbitContainer.position.y = pd.orbitCenterc;

  const orbit = new THREE.Object3D();
  const geometry = new THREE.CircleGeometry(pd.orbitRadius, 100);
  // geometry.vertices.shift();

  const line = new THREE.LineLoop(
    geometry,
    new THREE.LineBasicMaterial({
      color: pd.color,
      transparent: true,
      opacity: 0.4,
    })
  );
  line.rotation.x = Math.PI / 2;
  orbit.add(line);

  let planetMesh;
  if (pd.emissive) {
    planetMesh = new THREE.MeshPhongMaterial({
      color: pd.color,
      emissive: pd.color,
      emissiveIntensity: 2,
    });
  } else {
    if (pd.planetColor) {
      //Halleys
      planetMesh = new THREE.MeshPhongMaterial({
        color: pd.planetColor,
        emissive: pd.planetColor,
        emissiveIntensity: 2,
      });
    } else {
      // planetMesh = new THREE.MeshPhongMaterial({color: pd.color});
      // planetMesh = new THREE.MeshPhongMaterial();
      planetMesh = new THREE.MeshNormalMaterial();
    }
  }

  if (pd.textureUrl) {
    const texture = new THREE.TextureLoader().load(pd.textureUrl);
    texture.colorSpace = THREE.SRGBColorSpace;
    if (pd.textureTransparency) {
      planetMesh = new THREE.MeshPhongMaterial({
        map: texture,
        bumpScale: 0.05,
        specular: new THREE.Color("#190909"),
        transparent: true,
        opacity: pd.textureTransparency,
      });
    } else {
      planetMesh = new THREE.MeshPhongMaterial({
        map: texture,
        bumpScale: 0.05,
        specular: new THREE.Color("#190909"),
      });
      // planetMesh = new THREE.MeshPhongMaterial({ map: texture});
    }
  }
  if (pd.sphereSegments) {
    var planet = new THREE.Mesh(
      new THREE.SphereGeometry(pd.size, pd.sphereSegments, pd.sphereSegments),
      planetMesh
    );
  } else {
    var planet = new THREE.Mesh(
      new THREE.SphereGeometry(pd.size, 32, 32),
      planetMesh
    );
  }

  var pivot = new THREE.Object3D();
  pivot.position.set(pd.orbitRadius, 0.0, 0.0);
  orbit.add(pivot);

  var rotationAxis = new THREE.Object3D();
  rotationAxis.position.set(pd.orbitRadius, 0.0, 0.0);
  rotationAxis.rotation.z = pd.tilt * (Math.PI / 180);
  if (pd.tiltb) {
    rotationAxis.rotation.x = pd.tiltb * (Math.PI / 180);
  }

  // if (pd.ringUrl) {
  //   var texloader = new THREE.TextureLoader();
  //   texloader.load(pd.ringUrl, function(tex) {
  //     const ring = createRings(pd.ringSize, 32, tex)
  //     rotationAxis.add(ring);
  //     pd.ringObj = ring;
  //   });
  // };
  rotationAxis.add(planet);

  // const nameTag = createLabel(pd.name);
  // nameTag.position.copy(rotationAxis.position)
  // nameTag.scale.set(10,10,10)
  // rotationAxis.add(nameTag);

  orbit.add(rotationAxis);
  orbitContainer.add(orbit);

  if (pd.axisHelper) {
    pd.axisHelper = new THREE.AxesHelper(pd.size * 3);
    planet.add(pd.axisHelper);
  }
  pd.containerObj = orbitContainer;
  pd.orbitObj = orbit;
  pd.orbitLineObj = line;
  pd.planetObj = planet;
  pd.planetMesh = planetMesh;
  pd.pivotObj = pivot;
  pd.rotationAxis = rotationAxis;
  scene.add(orbitContainer);
}

export default function createSystem() {
  // console.log(system, defaultSettings)
  const planets = [
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
  ];

  //LOAD DEFAULT SETTINGS
  //*************************************************************
  planets.forEach((obj) => {
    let newVals = defaultSettings.find((obj2) => {
      return obj.name === obj2.name;
    });
    Object.assign(obj, newVals);
  });

  //*************************************************************
  //CREATE AND CONFIGURE PLANETS AND ADD TO THE THREEJS SCENE
  //*************************************************************
  createPlanet(earth);
  createPlanet(moonDef);
  createPlanet(moonDefB);
  createPlanet(moon);
  // moon.planetObj.rotation.y = Math.PI //quick fix so that the Moon texture is turned towards Earth
  createPlanet(sunDef);
  createPlanet(sun);
  createPlanet(venusDef);
  createPlanet(venusDefB);
  createPlanet(venus);
  createPlanet(mercuryDef);
  createPlanet(mercuryDefB);
  createPlanet(mercury);
  createPlanet(marsDef);
  createPlanet(marsSunDef);
  createPlanet(mars);
  createPlanet(phobos);
  createPlanet(deimos);
  createPlanet(jupiterDef);
  createPlanet(jupiter);
  createPlanet(saturnusDef);
  createPlanet(saturnus);
  createPlanet(uranusDef);
  createPlanet(uranus);
  createPlanet(neptuneDef);
  createPlanet(neptune);
  createPlanet(halleysDef);
  createPlanet(halleys);
  createPlanet(erosDef);
  createPlanet(erosDefB);
  createPlanet(eros);
  // createPlanet(mansPath);

  earth.pivotObj.add(sunDef.containerObj);
  sunDef.pivotObj.add(sun.containerObj);

  earth.pivotObj.add(moonDef.containerObj);
  moonDef.pivotObj.add(moonDefB.containerObj);
  moonDefB.pivotObj.add(moon.containerObj);

  earth.pivotObj.add(venusDef.containerObj);
  venusDef.pivotObj.add(venusDefB.containerObj);
  venusDefB.pivotObj.add(venus.containerObj);

  earth.pivotObj.add(mercuryDef.containerObj);
  mercuryDef.pivotObj.add(mercuryDefB.containerObj);
  mercuryDefB.pivotObj.add(mercury.containerObj);

  earth.pivotObj.add(marsDef.containerObj);
  marsDef.pivotObj.add(marsSunDef.containerObj);
  marsSunDef.pivotObj.add(mars.containerObj);

  mars.pivotObj.add(phobos.containerObj);
  mars.pivotObj.add(deimos.containerObj);

  sun.pivotObj.add(jupiter.containerObj);
  sun.pivotObj.add(saturnus.containerObj);

  sun.pivotObj.add(jupiterDef.containerObj);
  jupiterDef.pivotObj.add(jupiter.containerObj);
  sun.pivotObj.add(saturnusDef.containerObj);
  saturnusDef.pivotObj.add(saturnus.containerObj);

  sun.pivotObj.add(uranusDef.containerObj);
  uranusDef.pivotObj.add(uranus.containerObj);

  sun.pivotObj.add(neptuneDef.containerObj);
  neptuneDef.pivotObj.add(neptune.containerObj);

  sun.pivotObj.add(halleysDef.containerObj);
  halleysDef.pivotObj.add(halleys.containerObj);

  earth.pivotObj.add(erosDef.containerObj);
  erosDef.pivotObj.add(erosDefB.containerObj);
  erosDefB.pivotObj.add(eros.containerObj);

  earth.containerObj.rotation.y = Math.PI / 2;
  //END CREATE AND CONFIGURE PLANETS

  //*************************************************************
  //CREATE VALUE HOLDERS FOR Right Ascension, Declination and Distance
  //*************************************************************
  planets.forEach((obj: any) => {
    obj.ra = "";
    obj.dec = "";
    obj.dist = "";
    obj.distKm = "";
  });

  return { planets, scene };
}
