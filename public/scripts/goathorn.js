// ES Module Imports for Three.js and its components
import * as THREE from "three"; // Import from installed 'three' package
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"; // Import from jsm folder
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"; // Import from jsm folder
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import {returnToStartPosition} from "./miiController.js"; // Import your custom miiController module

// VARIABLES
let scene, camera, renderer, object;
let mouse = new THREE.Vector2();
let Scale = 10; // Scale based on container width
let targetScale = new THREE.Vector3(Scale, Scale, Scale);
let originalRotation = new THREE.Euler();
let targetRotation = new THREE.Euler();
let isHovering = false;
let isClicking = false;
const maxTiltAngle = 0.05;
let hoverScaleFactor = Scale * 1.2;
let clickScaleFactor = Scale * 0.8;
const scaleSpeed = 0.1; // Speed of scaling animation
const rotationSpeed = 0.05; // Speed of rotation interpolation


// init Three.js scene
function init() {
  // Get the container for the scene
  const container = document.getElementById("scene-container");

  scene = new THREE.Scene();

  // 2. Camera: How we view the scene
  camera = new THREE.PerspectiveCamera(
    30, // Field of view
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 30;
  camera.position.y = 2;


  // 3. Renderer: Displays the scene on the canvas
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // alpha: true for transparent background
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement); // Add canvas to the container

  // Lights: Essential for seeing objects with MeshStandardMaterial
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Directional light
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);

// MTL and OBJ Loader
const mtlLoader = new MTLLoader();
mtlLoader.load(
    '../media/goathorn.mtl', // Path to your MTL file
    function (materials) {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(
            '../media/goathorn.obj', // Path to your OBJ model
            function (obj) {
                object = obj;

                    object.traverse((child) => {
                    if (child.isMesh && child.material && child.material.map) {
                        child.material.map.minFilter = THREE.NearestFilter;
                        child.material.map.magFilter = THREE.NearestFilter;
                        child.material.map.needsUpdate = true;
                    }
                });

                object.scale.set(Scale, Scale, Scale);
                //object.rotation.set(Math.PI / 8, Math.PI / 4, 0);
                originalRotation.copy(object.rotation);
                targetRotation.copy(object.rotation);
                scene.add(object);

                // Event Listeners
                window.addEventListener('resize', onWindowResize, false);
                window.addEventListener('mousemove', onMouseMove, false);
                window.addEventListener('click', onClick, false);
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.error('An error occurred loading the OBJ model', error);
            }
        );
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded (MTL)');
    },
    function (error) {
        console.error('An error occurred loading the MTL file', error);
    }
  );
  // End of mtlLoader.load
} // <-- Add this closing brace to properly close the init() function

// Handle window resizing for responsiveness
function onWindowResize() {
  const container = document.getElementById("scene-container");
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

// Handle mouse movement for tilt/sway and hover detection
function onMouseMove(event) {
  const container = document.getElementById("scene-container");
  const rect = container.getBoundingClientRect();
  // Calculate mouse position relative to the container
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  mouse.x = (mouseX / container.clientWidth) * 2 - 1;
  mouse.y = -(mouseY / container.clientHeight) * 2 + 1;

  // Update target rotation based on mouse position (tilt/sway)
  targetRotation.x = originalRotation.x + -mouse.y * maxTiltAngle;
  targetRotation.y = originalRotation.y + mouse.x * maxTiltAngle;

  // Check if mouse is inside the canvas area for hover effect
  const isInside =
    mouseX >= 0 &&
    mouseX <= container.clientWidth &&
    mouseY >= 0 &&
    mouseY <= container.clientHeight;

  if (isInside) {
    if (!isHovering) {
      isHovering = true;
      // Scale up the object when hovering
      targetScale.set(hoverScaleFactor, hoverScaleFactor, hoverScaleFactor);
    }
  } else {
    if (isHovering) {
      isHovering = false;
      if (!isClicking) {
        // return to original scale when not hovering
        targetScale.set(Scale, Scale, Scale);
      }
    }
  }
}

//
// INTERACTION
//

// Handle click event for shrink/expand and custom action
function onClick(event) {
  const container = document.getElementById("scene-container");
  const rect = container.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  // Only trigger click if mouse is inside the canvas
  const isInside =
    mouseX >= 0 &&
    mouseX <= container.clientWidth &&
    mouseY >= 0 &&
    mouseY <= container.clientHeight;

  if (isInside) {
    console.log("Object clicked!");

    // play goat horn effect
    
    var audio = new Audio('../media/goathorn.mp3');
    returnToStartPosition(); // Call the function to return all Miis to their starting positions
    audio.play();

    // Shrink and expand on hover
    isClicking = true;
    targetScale.set(clickScaleFactor, clickScaleFactor, clickScaleFactor); // Shrink
    setTimeout(() => {
      targetScale.set(hoverScaleFactor, hoverScaleFactor, hoverScaleFactor); // Expand to hover size
      setTimeout(() => {
        if (!isHovering) {
          targetScale.set(Scale, Scale, Scale);
        }
        isClicking = false;
      }, 200);
    }, 200);
  }
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Smoothly interpolate object's rotation towards target rotation
  object.rotation.x += (targetRotation.x - object.rotation.x) * rotationSpeed;
  object.rotation.y += (targetRotation.y - object.rotation.y) * rotationSpeed;
  // object.rotation.z += (targetRotation.z - object.rotation.z) * rotationSpeed; // If you want Z-axis sway

  // Smoothly interpolate object's scale towards target scale
  object.scale.lerp(targetScale, scaleSpeed);

  // If using OrbitControls, update them here
  // controls.update();

  renderer.render(scene, camera);
}

// Start the application when the window loads
window.onload = function () {
  init();
  animate();
};
