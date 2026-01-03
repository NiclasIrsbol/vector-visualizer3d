import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export const vectors = [];

const container = document.querySelector(".visualizer");

export const scene = new THREE.Scene();

scene.background = new THREE.Color(0xf4f6fb);

const camera = new THREE.PerspectiveCamera(
  75,
  container.clientWidth / container.clientHeight,
  0.1,
  100
);
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;


const ambient = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
scene.add(dirLight);

const planeGeo = new THREE.PlaneGeometry(20, 20);
const planeMat = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.9,
  metalness: 0,
  opacity: 0.9,
  transparent: true,
});
const plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

const grid = new THREE.GridHelper(20, 20, 0x808080, 0xcccccc);
grid.position.y = 0.001; 
scene.add(grid);


function createColoredAxes(size = 4) {
  const axes = new THREE.Group();

  const materialX = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const materialY = new THREE.LineBasicMaterial({ color: 0x00ff00 });
  const materialZ = new THREE.LineBasicMaterial({ color: 0x0000ff });

  function line(mat, start, end) {
    const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
    return new THREE.Line(geo, mat);
  }

  axes.add(line(materialX, new THREE.Vector3(0, 0, 0), new THREE.Vector3(size, 0, 0)));
  axes.add(line(materialY, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, size, 0)));
  axes.add(line(materialZ, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, size)));

  return axes;
}

scene.add(createColoredAxes(4));

function makeLabel(text, position) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 256;
  canvas.height = 128;

  ctx.fillStyle = "#222";
  ctx.font = "28px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(0.8, 0.4, 1);
  sprite.position.copy(position);
  return sprite;
}

scene.add(makeLabel("X", new THREE.Vector3(4.4, 0.1, 0)));
scene.add(makeLabel("Y", new THREE.Vector3(0, 4.6, 0)));
scene.add(makeLabel("Z", new THREE.Vector3(0, 0.1, 4.4)));


function resize() {
  const w = container.clientWidth;
  const h = container.clientHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

export function drawVector(origin, direction, color = 0xff0000) {
  const dir = direction.clone().normalize();
  const length = direction.length();

  const arrow = new THREE.ArrowHelper(dir, origin, 0.0001, color);
  arrow.userData.originalDirection = direction.clone();
  arrow.castShadow = true;

  arrow.line.material.linewidth = 3;

  scene.add(arrow);
  vectors.push(arrow);

  let current = 0;
  const speed = 0.08 * length;

  function grow() {
    current += speed;
    arrow.setLength(Math.min(current, length));

    if (current < length) requestAnimationFrame(grow);
  }

  grow();

  return arrow;
}

renderer.domElement.addEventListener("click", onClick, false);

export let selectedVectors = [];

function highlightArrow(arrow, color) {
  arrow.line.material.color.set(color);
  arrow.cone.material.color.set(color);

  arrow.cone.material.emissive?.set?.(color);
  arrow.line.material.needsUpdate = true;
  arrow.cone.material.needsUpdate = true;
}


function updateSelectedVectorInfo() {
  const v1Div = document.getElementById("vector1");
  const v2Div = document.getElementById("vector2");

  v1Div.textContent = selectedVectors[0]
    ? `Vector 1: (${selectedVectors[0].userData.originalDirection.x.toFixed(
        2
      )}i, ${selectedVectors[0].userData.originalDirection.y.toFixed(
        2
      )}j, ${selectedVectors[0].userData.originalDirection.z.toFixed(
        2
      )}k), length: ${selectedVectors[0].userData.originalDirection
        .length()
        .toFixed(2)}`
    : "Vector 1: ()";

  v2Div.textContent = selectedVectors[1]
    ? `Vector 2: (${selectedVectors[1].userData.originalDirection.x.toFixed(
        2
      )}i, ${selectedVectors[1].userData.originalDirection.y.toFixed(
        2
      )}j, ${selectedVectors[1].userData.originalDirection.z.toFixed(
        2
      )}k), length: ${selectedVectors[1].userData.originalDirection
        .length()
        .toFixed(2)}`
    : "Vector 2: ()";
}

function onClick(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(vectors, true);

  if (intersects.length > 0) {
    let pickedArrow = intersects[0].object;
    while (pickedArrow && !vectors.includes(pickedArrow)) {
      pickedArrow = pickedArrow.parent;
    }
    if (!pickedArrow) return;

    if (selectedVectors.includes(pickedArrow)) {
      selectedVectors = selectedVectors.filter(v => v !== pickedArrow);
      highlightArrow(pickedArrow, 0xff0000);
    } else {
      if (selectedVectors.length >= 2) {
        const removed = selectedVectors.shift();
        highlightArrow(removed, 0xff0000);
      }
      selectedVectors.push(pickedArrow);
      highlightArrow(pickedArrow, 0x369259);
    }

    updateSelectedVectorInfo();
  }
}
