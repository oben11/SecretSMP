// --- IMPORTS ---
        
        import * as THREE from 'three';
        import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

        // --- CONFIGURATION ---
        // This is where you can easily change the model and its behavior.
        const CONFIG = {
            // IMPORTANT: Replace this with the path to your own .obj file.
            modelUrl: '../media/goathorn.obj',

            // Canvas size configuration
            canvasWidth: 100, // Set your desired width here
            canvasHeight: 100, // Set your desired height here

            // Initial orientation of the model (in radians).
            initialRotation: {
                x: 0,
                y: 0,
                z: 0
            },

            // How far the model can tilt in either direction based on mouse position.
            // Smaller values mean less sway.
            swayLimits: {
                x: 0.2, // Max tilt up/down
                y: 0.3  // Max tilt left/right
            },

            // Scale factors for different interaction states.
            scale: {
                default: 20.0, // Adjusted scale for the teapot model
                hover: 25,
                click: 20
            },
            
            // The "springiness" of the animations. Lower is slower/smoother.
            easing: 0.08
        };

        // --- GLOBAL VARIABLES ---
        let scene, camera, renderer, model;
        let mouse = new THREE.Vector2();
        let targetRotation = new THREE.Vector2();
        let targetScale = new THREE.Vector3(CONFIG.scale.default, CONFIG.scale.default, CONFIG.scale.default);
        let isHovering = false;
        let isMouseDown = false;
        
        const raycaster = new THREE.Raycaster();

        // --- INITIALIZATION ---
        function init() {
            // Scene setup
            scene = new THREE.Scene();

            // Camera setup
            const fov = 45;
            const aspect = CONFIG.canvasWidth / CONFIG.canvasHeight;
            const near = 0.1;
            const far = 1000;
            camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
            camera.position.z = 120; // Pushed camera back for the larger model

            // Renderer setup
            const canvas = document.querySelector('#c');
            renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
            renderer.setSize(CONFIG.canvasWidth, CONFIG.canvasHeight);
            renderer.setPixelRatio(window.devicePixelRatio);

            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);

            const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
            directionalLight.position.set(5, 10, 7.5);
            scene.add(directionalLight);

            // Load the 3D model
            loadModel();

            // Add event listeners
            addEventListeners();
            
            // Start the animation loop
            animate();
        }

        // --- MODEL LOADING ---
        function loadModel() {
            const loader = new OBJLoader();
            
            // Create a material for the object
            const material = new THREE.MeshStandardMaterial({
                color: 0xcccccc, // A light gray, like ceramic
                metalness: 0.2,
                roughness: 0.6,
                emissive: 0x111111
            });

            loader.load(
                CONFIG.modelUrl,
                // onSuccess callback
                function (object) {
                    model = object;
                    
                    // Apply the material to all meshes in the loaded object
                    model.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            child.material = material;
                        }
                    });

                    // Set initial state
                    model.rotation.set(CONFIG.initialRotation.x, CONFIG.initialRotation.y, CONFIG.initialRotation.z);
                    model.scale.set(CONFIG.scale.default, CONFIG.scale.default, CONFIG.scale.default);
                    
                    // Center the model
                    new THREE.Box3().setFromObject(model).getCenter(model.position).multiplyScalar(-1);

                    scene.add(model);
                },
                // onProgress callback (optional)
                function (xhr) {
                    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
                },
                // onError callback
                function (error) {
                    console.error('An error happened while loading the model:', error);
                    // Display an error message to the user
                    const info = document.getElementById('info');
                    info.innerHTML = '<h1>Error</h1><p>Could not load the 3D model. Please check the console.</p>';
                }
            );
        }

        // --- EVENT LISTENERS ---
        function addEventListeners() {
            window.addEventListener('resize', onWindowResize);
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mousedown', onMouseDown);
            window.addEventListener('mouseup', onMouseUp);
        }

        function onWindowResize() {
            camera.aspect = CONFIG.canvasWidth / CONFIG.canvasHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(CONFIG.canvasWidth, CONFIG.canvasHeight);
        }

        function onMouseMove(event) {
            // Normalize mouse position to range from -1 to 1
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            // Calculate the target rotation based on mouse position
            // The further the mouse is from the center, the more it tilts
            targetRotation.y = mouse.x * CONFIG.swayLimits.y;
            targetRotation.x = mouse.y * CONFIG.swayLimits.x;
        }

        function onMouseDown() {
            isMouseDown = true;
            // If hovering, set the scale to the "click" size
            if (isHovering) {
                targetScale.set(CONFIG.scale.click, CONFIG.scale.click, CONFIG.scale.click);
            }
        }

        function onMouseUp() {
            isMouseDown = false;
            // If hovering, return to "hover" size, otherwise return to default
            if (isHovering) {
                targetScale.set(CONFIG.scale.hover, CONFIG.scale.hover, CONFIG.scale.hover);
            } else {
                targetScale.set(CONFIG.scale.default, CONFIG.scale.default, CONFIG.scale.default);
            }
        }
        
        // --- RAYCASTING (for hover detection) ---
        function checkIntersection() {
            if (!model) return; // Don't do anything if model isn't loaded yet

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(model.children, true);

            if (intersects.length > 0) {
                if (!isHovering) { // Mouse just entered the object
                    isHovering = true;
                    // Only scale up if the mouse isn't currently held down
                    if (!isMouseDown) {
                        targetScale.set(CONFIG.scale.hover, CONFIG.scale.hover, CONFIG.scale.hover);
                    }
                }
            } else {
                if (isHovering) { // Mouse just left the object
                    isHovering = false;
                    // If not holding mouse down, scale back to default
                     if (!isMouseDown) {
                        targetScale.set(CONFIG.scale.default, CONFIG.scale.default, CONFIG.scale.default);
                    }
                }
            }
        }

        // --- ANIMATION LOOP ---
        function animate() {
            requestAnimationFrame(animate);

            if (model) {
                // Check for hover state
                checkIntersection();
                
                // --- Easing / Interpolation ---
                // This creates the smooth "swaying" and "scaling" effects.
                // The model's rotation and scale gradually move towards their target values.
                
                // Sway animation
                const finalRotationX = CONFIG.initialRotation.x + targetRotation.x;
                const finalRotationY = CONFIG.initialRotation.y + targetRotation.y;
                model.rotation.x += (finalRotationX - model.rotation.x) * CONFIG.easing;
                model.rotation.y += (finalRotationY - model.rotation.y) * CONFIG.easing;
                
                // Scale animation
                model.scale.x += (targetScale.x - model.scale.x) * CONFIG.easing;
                model.scale.y += (targetScale.y - model.scale.y) * CONFIG.easing;
                model.scale.z += (targetScale.z - model.scale.z) * CONFIG.easing;
            }

            renderer.render(scene, camera);
        }

        // --- START ---
        init();