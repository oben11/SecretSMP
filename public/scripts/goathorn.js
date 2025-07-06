
    let scene, camera, renderer;
    let objectToSway;
    const mouse = new THREE.Vector2();
    const targetRotation = new THREE.Quaternion();
    // Specific initial orientation for the object
    const initialRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 8, Math.PI / 4, 0)); 

    function init() {
        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x111111);

        // Camera
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // --- FBX LOADER ---
        const loader = new THREE.FBXLoader();
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('./media/goat_horn.png');

        loader.load('./media/goat_horn.fbx', function (fbx) {
            // Traverse and apply texture to all meshes
            fbx.traverse(function (child) {
                if (child.isMesh) {
                    child.material.map = texture;
                    child.material.needsUpdate = true;
                }
            });

            // The loaded FBX model is now the object that will sway
            objectToSway = fbx;

            // Optional: scale the model if needed
            // objectToSway.scale.set(0.01, 0.01, 0.01);

            // Set the initial rotation for the loaded model
            objectToSway.quaternion.copy(initialRotation);

            scene.add(objectToSway);

        }, undefined, function (error) {
            console.error('An error happened while loading the FBX model:', error);
            document.querySelector('.info').textContent = 'Error loading FBX model. See console for details.';
        });

        // --- LIGHTING ---
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(5, 5, 5);
        scene.add(pointLight);

        // --- EVENT LISTENERS ---
        document.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('resize', onWindowResize, false);
    }

    // --- EVENT HANDLERS ---
    function onMouseMove(event) {
        // Normalize mouse position from -1 to 1
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // --- ANIMATION LOOP ---
    function animate() {
        requestAnimationFrame(animate);

        // --- SWAY LOGIC ---
        if (objectToSway) {
            // Define the maximum tilt angle in radians
            const maxTiltAngle = Math.PI / 12; // 15 degrees

            // Calculate the target rotation based on mouse position
            const euler = new THREE.Euler(
                mouse.y * maxTiltAngle, // Tilt on X-axis
                mouse.x * maxTiltAngle, // Tilt on Y-axis
                0,
                'XYZ'
            );
            
            // The target rotation is the initial rotation combined with the mouse-driven tilt
            targetRotation.setFromEuler(euler).premultiply(initialRotation);

            // Slowly and smoothly interpolate to the target rotation using Slerp
            objectToSway.quaternion.slerp(targetRotation, 0.05);
        }

        renderer.render(scene, camera);
    }

    // --- START ---
    init();
    animate();
