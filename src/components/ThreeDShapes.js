import * as THREE from "three";
import { useEffect } from "react";

export default function ThreeDShapes({ type }) {
  useEffect(() => {
    const container = document.getElementById("three-container");
    if (!container) return;

    // Clear previous renderer
    container.innerHTML = "";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    let mesh;

    // Create shape based on `type`
    switch (type) {
      case "cube":
        mesh = new THREE.Mesh(
          new THREE.BoxGeometry(2, 2, 2),
          new THREE.MeshStandardMaterial({ color: "blue" })
        );
        break;
      case "sphere":
        mesh = new THREE.Mesh(
          new THREE.SphereGeometry(1.5, 32, 32),
          new THREE.MeshStandardMaterial({ color: "green" })
        );
        break;
      case "pyramid":
        mesh = new THREE.Mesh(
          new THREE.ConeGeometry(1.5, 3, 4),
          new THREE.MeshStandardMaterial({ color: "orange" })
        );
        break;
      default:
        mesh = null;
    }

    if (mesh) scene.add(mesh);

    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    camera.position.z = 5;

    function animate() {
      requestAnimationFrame(animate);
      if (mesh) {
        mesh.rotation.x += 0.01;
        mesh.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
    }

    animate();

    return () => {
      renderer.dispose();
    };
  }, [type]);

  return null;
}
