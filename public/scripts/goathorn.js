// ES Module Imports for Three.js and its components
import * as THREE from 'three'; // Import from installed 'three' package
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; // Import from jsm folder
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'; // Import from jsm folder
       let scene, camera, renderer, object;
        let raycaster;
        let mouse = new THREE.Vector2();
        let currentScale = new THREE.Vector3(1, 1, 1);
        let targetScale = new THREE.Vector3(10, 10, 10);
        let originalRotation = new THREE.Euler();
        let targetRotation = new THREE.Euler();
        let isHovering = false;
        let isClicking = false;
        const maxTiltAngle = Math.PI / 16; // Limit tilt to ~11.25 degrees
        const hoverScaleFactor = 1.2;
        const clickScaleFactor = 0.8;
        const scaleSpeed = 0.1; // Speed of scaling animation
        const rotationSpeed = 0.05; // Speed of rotation interpolation

        // Function to display a message in the message box
        function showMessage(message, duration = 2000) {
            const messageBox = document.getElementById('message-box');
            messageBox.textContent = message;
            messageBox.style.display = 'block';
            setTimeout(() => {
                messageBox.style.display = 'none';
            }, duration);
        }

        // Initialize the Three.js scene
        function init() {
            // Get the container for the scene
            const container = document.getElementById('scene-container');

            // 1. Scene: Where objects are placed
            scene = new THREE.Scene();

            // 2. Camera: How we view the scene
            camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
            camera.position.z = 5;

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

            // Create a placeholder 3D object (e.g., a BoxGeometry)
            // If you have an OBJ model, you would use OBJLoader here:
            const loader = new OBJLoader();
             loader.load(
                 '../media/goathorn.obj', // Path to your OBJ model
                 function (obj) {
                     object = obj;
                     // Often OBJ models are large or small, scale them appropriately
                     object.scale.set(1, 1, 1);
                     // Set initial orientation
                    object.rotation.set(Math.PI / 8, Math.PI / 4, 0); // Example initial rotation
                     originalRotation.copy(object.rotation);
                     targetRotation.copy(object.rotation);
                     scene.add(object);

            // Set initial orientation for the placeholder object
            object.rotation.set(Math.PI / 8, Math.PI / 4, 0); // Rotate slightly on X and Y for better view
            originalRotation.copy(object.rotation); // Store initial rotation
            targetRotation.copy(object.rotation); // Initialize target rotation

            // Raycaster for mouse interaction (hover and click detection)
            raycaster = new THREE.Raycaster();

            // OrbitControls for debugging camera movement (comment out if not needed)
            // const controls = new THREE.OrbitControls(camera, renderer.domElement);
            // controls.enableDamping = true; // Animate damping for smoother controls
            // controls.dampingFactor = 0.25;
            // controls.screenSpacePanning = false;
            // controls.maxPolarAngle = Math.PI / 2;

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

        }

        // Handle window resizing for responsiveness
        
        function onWindowResize() {
            const container = document.getElementById('scene-container');
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }
        
        // Handle mouse movement for tilt/sway and hover detection
        function onMouseMove(event) {
            const container = document.getElementById('scene-container');
            const rect = container.getBoundingClientRect();
            // Calculate mouse position relative to the container
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            mouse.x = (mouseX / container.clientWidth) * 2 - 1;
            mouse.y = -(mouseY / container.clientHeight) * 2 + 1;

            // Update target rotation based on mouse position (tilt/sway)
            targetRotation.x = originalRotation.x + (-mouse.y * maxTiltAngle);
            targetRotation.y = originalRotation.y + (mouse.x * maxTiltAngle);

            // Check if mouse is inside the canvas area for hover effect
            const isInside =
                mouseX >= 0 && mouseX <= container.clientWidth &&
                mouseY >= 0 && mouseY <= container.clientHeight;

            if (isInside) {
                if (!isHovering) {
                    isHovering = true;
                    targetScale.set(hoverScaleFactor, hoverScaleFactor, hoverScaleFactor);
                }
            } else {
                if (isHovering) {
                    isHovering = false;
                    if (!isClicking) {
                        targetScale.set(1, 1, 1);
                    }
                }
            }
        }

        // Handle click event for shrink/expand and custom action
        function onClick(event) {
            const container = document.getElementById('scene-container');
            const rect = container.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // Only trigger click if mouse is inside the canvas
            const isInside =
                mouseX >= 0 && mouseX <= container.clientWidth &&
                mouseY >= 0 && mouseY <= container.clientHeight;

            if (isInside) {
                console.log('Object clicked!');
                showMessage('Object Clicked!');

                // Change color on click (assumes object has a material)
                if (object && object.traverse) {
                    object.traverse(child => {
                        if (child.isMesh && child.material && child.material.color) {
                            child.material.color.set(Math.random() * 0xffffff);
                        }
                    });
                }

                // Shrink and expand animation
                isClicking = true;
                targetScale.set(clickScaleFactor, clickScaleFactor, clickScaleFactor); // Shrink
                setTimeout(() => {
                    targetScale.set(hoverScaleFactor, hoverScaleFactor, hoverScaleFactor); // Expand to hover size
                    setTimeout(() => {
                        if (!isHovering) {
                            targetScale.set(1, 1, 1);
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