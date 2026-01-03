import { selectedVectors, drawVector } from "./main.js";
import * as THREE from "three";

export class VectorOperations {
  static distanceBetweenVectors() {
    if (selectedVectors.length < 2) {
      alert("Please select two vectors");
      return null;
    }

    const v1 = selectedVectors[0].userData.originalDirection;
    const v2 = selectedVectors[1].userData.originalDirection;

    return v1.distanceTo(v2);
  }

  static addVectors() {
    if (selectedVectors.length < 2) return null;
    const v1 = selectedVectors[0].userData.originalDirection;
    const v2 = selectedVectors[1].userData.originalDirection;
    return new THREE.Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
  }

  static subtractVectors() {
    if (selectedVectors.length < 2) return null;
    const v1 = selectedVectors[0].userData.originalDirection;
    const v2 = selectedVectors[1].userData.originalDirection;
    return new THREE.Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  }

  static dotProduct() {
    if (selectedVectors.length < 2) return null;
    const v1 = selectedVectors[0].userData.originalDirection;
    const v2 = selectedVectors[1].userData.originalDirection;
    return v1.dot(v2); 
  }

  static crossProduct() {
    if (selectedVectors.length < 2) return null;
    const v1 = selectedVectors[0].userData.originalDirection;
    const v2 = selectedVectors[1].userData.originalDirection;
    const x = v1.y * v2.z - v1.z * v2.y;
    const y = v1.z * v2.x - v1.x * v2.z;
    const z = v1.x * v2.y - v1.y * v2.x;
    console.log(x,y,z);
    return new THREE.Vector3(x, y, z);
  }
}

const calcButton = document.querySelector(".calc");
const operationSelect = document.getElementById("operations");

calcButton.addEventListener("click", () => {
  const op = operationSelect.value;
  let result;

  switch(op) {
    case "dist":
      const dist = VectorOperations.distanceBetweenVectors();
      if (dist !== null) alert("Distance: " + dist.toFixed(2));
      break;

    case "addition":
      result = VectorOperations.addVectors();
      if (result) drawVector(new THREE.Vector3(0,0,0), result, 0x0000ff);
      break;

    case "subtraction":
      result = VectorOperations.subtractVectors();
      if (result) drawVector(new THREE.Vector3(0,0,0), result, 0xffa500);
      break;

      case "dot":
      const n = VectorOperations.dotProduct();
      if (n !== null) alert("Dotproduct: " + n.toFixed(2)); 
      break;

    case "cross":
      result = VectorOperations.crossProduct();
      if (result) drawVector(new THREE.Vector3(0,0,0), result, 0x00ffff);
      break;
  }
});
