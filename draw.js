import * as THREE from "three";
import { drawVector } from "./main.js";

document.querySelector(".draw").onclick = function(e) {
  e.preventDefault();

  const x = Number(document.querySelector(".x-component").value);
  const y = Number(document.querySelector(".y-component").value);
  const z = Number(document.querySelector(".z-component").value);
  console.log(x,y,z);

  if (isNaN(x) || isNaN(y) || isNaN(z)) return alert("Enter valid numbers");

  drawVector(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(x, y, z),
    0xff0000
  );

document.querySelector(".draw-form").reset();
};

 