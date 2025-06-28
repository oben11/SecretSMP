class MinecraftMii {
  constructor(canvasId) {
    // Create and attach canvas
    this.canvas = document.createElement('canvas');
    this.canvas.id = canvasId;
    document.body.appendChild(this.canvas);

    // Initialize SkinViewer
    this.viewer = new skinview3d.SkinViewer({
      canvas: this.canvas,
      width: 300,
      height: 400,
      model: "slim",
      zoom: 1,
      fov: 15,
      rotateButton: true,
      panButton: true,
    });

    this.viewer.controls.enableZoom = false;
    this.viewer.controls.enableRotate = false;
    this.viewer.controls.enablePan = false;
    // Aliases for easier access
    this.player = this.viewer.playerObject;
    this.head = this.player.skin.head;
    this.animations = this.viewer.animations;
    this.camera = this.viewer.camera;

    // Setup camera
    this.camera.position.set(0, 15, 15);
    this.camera.rotation.set(-2, 0, 0);
 
    // Setup click interaction
    this.canvas.addEventListener('click', () => this.reactToClick());
  }
  

  // === EVENT REACTIONS ===
  reactToClick() {
    console.log("hello!");

    //this.setRotation((2 * Math.PI), 500);

    setTimeout(() => {
      //this.returnHome();
      this.stareAtCursor();

    }, 100); // Delay of 100ms





    //this.rotateArmsSineWave(0.15, 1.5, 5000); // Rotate arms in a sine wave pattern
    //this.viewer.animation = null;
    
    //this.faceForward();
    //this.scaleHead(1.3); 
    //this.viewer.render();
  }

  // === HELPER METHODS ===
  faceForward() {
  }

  startPosition(x, y) {
    this.home = { x, y };
    this.canvas.style.left = `${x}px`;
    this.canvas.style.top = `${y}px`;
  }
  returnHome() {
    this.walk(this.home.x, this.home.y);
  }

  cancelAnimation() {
    this.Walking(false);
    anime.remove(this.canvas); // Stop current movement
  }

  scaleHead(factor) {
    this.head.scale.set(factor, factor, factor);
  }

  setSkin(skinUrl) {
    this.viewer.loadSkin(skinUrl);
  }

  setCape(capeUrl) {
    this.viewer.loadCape(capeUrl);
  }

  setModel(modelType) {
    this.viewer.loadModel(modelType);
  }

  setSize(width, height) {
    this.viewer.width = width;
    this.viewer.height = height;
    this.viewer.render();
  }

  setZoom(zoomLevel) {
    this.viewer.zoom = zoomLevel;
    this.viewer.render();
  }

  setRotation(degrees, duration) {
    this.animateCharacterRotation(degrees, duration);
  }

  Walking(active) {
    this.viewer.animation = active
      ? new skinview3d.RunningAnimation()
      : new skinview3d.IdleAnimation();
  }

  dispose() {
    this.viewer.dispose();
    this.canvas.remove();
  }

  stareAtCursor() {
    const updateHeadRotation = (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const canvasCenterX = rect.left + rect.width / 2;
      const canvasCenterY = rect.top + rect.height / 2;

      const deltaX = event.clientX - canvasCenterX;
      const deltaY = canvasCenterY - event.clientY;

      const angleX = -Math.atan2(deltaY, Math.abs(deltaX)) * 0.5;
      const angleY = Math.atan2(deltaX, Math.abs(deltaY)) * 0.5;

      //this.head.rotation.x = angleX;

      this.head.rotation.y = angleY;
    };

    const mouseMoveListener = (event) => updateHeadRotation(event);

    document.addEventListener('mousemove', mouseMoveListener);

    setTimeout(() => {
      document.removeEventListener('mousemove', mouseMoveListener);
      this.head.rotation.set(0, 0, 0); // Reset head rotation
    }, 5000);
  }

  walk(x, y) {
    anime.remove(this.canvas); // Stop current movement
    this.Walking(true);

    const newRotation = this.calculateRotation(x, y);
    this.setRotation(newRotation, 400);

    const rect = this.canvas.getBoundingClientRect();
    const currentX = rect.left + rect.width / 2;
    const currentY = rect.top + rect.height / 2;

    anime({
      targets: this.canvas,
      left: x,
      top: y,
      duration: Math.abs((currentX - x + (currentY - y)) * 5),
      easing: 'linear',
      complete: () => {
        this.Walking(false);
        this.player.rotation.y = newRotation;
      },
    });
  }

  rotateArmsSineWave(amplitude, frequency, duration) {
    const startTime = performance.now();
    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      if (elapsed >= duration) {
        this.player.skin.leftArm.rotation.z = 0;
        this.player.skin.rightArm.rotation.z = 0;
      } else {
        const progress = elapsed / 1000; // Convert to seconds
        const angle = amplitude * Math.sin(2 * Math.PI * frequency * progress);
        this.player.skin.leftArm.rotation.y = angle;
        this.player.skin.leftArm.rotation.x = angle;
        this.player.skin.leftArm.rotation.z = (Math.PI * 0.05) + angle/4;


        this.player.skin.rightArm.rotation.y = -angle;



        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }

  calculateRotation(targetX, targetY) {
    const rect = this.canvas.getBoundingClientRect();
    const currentX = rect.left + rect.width / 2;
    const currentY = rect.top + rect.height / 2;

    const deltaX = targetX - currentX;
    const deltaY = -(targetY - currentY);

    let radians = Math.atan2(deltaY, deltaX) + Math.PI / 2;
    return radians;
  }

  animateCharacterRotation(targetRadians, duration) {
    const startTime = performance.now();
    const startRotationY = this.player.rotation.y; 
    let deltaRotation = targetRadians - startRotationY;
    
    
    deltaRotation = (deltaRotation + Math.PI) % (2 * Math.PI) - Math.PI;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      if (elapsed >= duration) {
        this.player.rotation.y = targetRadians;
      } else {
        const progress = elapsed / duration;
        this.player.rotation.y = startRotationY + deltaRotation * progress;
        requestAnimationFrame(animate);
      }
    };


    requestAnimationFrame(animate);
  }

}
