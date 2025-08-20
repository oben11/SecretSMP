import * as skinview3d from 'skinview3d';

class MinecraftMii {
  constructor(canvasId) {
    // parent container (use a real element)
    this.container = document.createElement('div');
    this.container.id = `${canvasId}-container`;
    this.container.className = 'miiContainer';
    

    // starting position (so anime has something to animate from)
    this.container.style.position = 'absolute';


    document.body.appendChild(this.container);

    // shadow element
    this.shadow = document.createElement('div');
    this.shadow.className = 'miiShadow';
    this.container.appendChild(this.shadow);

    // three.js canvas scene
    this.canvas = document.createElement('canvas');
    this.canvas.id = canvasId;
    this.canvas.className = 'miiCanvas';
    this.container.appendChild(this.canvas);



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
      //nameTag: canvasId,
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


  setStartPos(x, y) {
    this.startPosition = { x, y };
  }

  returnToStartPos() {
    this.walk(this.startPosition.x, this.startPosition.y, 2).then(() => {
    this.setRotation(0, 500); // Reset rotation to face forward
    });
    
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
    const lockedY = this.player.rotation.y;
    this.viewer.animation = active
      ? new skinview3d.RunningAnimation()
      : new skinview3d.IdleAnimation();
    this.player.rotation.y = lockedY; // Lock Y rotation

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

walk(x, y, speed = 5) {
  return new Promise((resolve) => {
    
    anime.remove(this.container); // Stop current movement
    const rect = this.container.getBoundingClientRect();
    const currentX = rect.left;
    const currentY = rect.top;

    console.log(`Walking from (${currentX}, ${currentY}) to (${x}, ${y})`);

    if (currentX !== x || currentY !== y) {
      this.Walking(true);
      const newRotation = this.calculateRotation(x, y);
      const duration = Math.hypot(currentX - x, currentY - y)  * speed;
      console.log(`Walking duration: ${duration}ms`);
      this.setRotation(newRotation, duration);

      // Walking Noises      
      if (this.soundTimer) {
        clearInterval(this.soundTimer);
        console.log("Clearing previous sound timer");
        this.soundTimer = null;
      }
      const interval = 100+Math.floor(Math.random() * 200) + 1; // ms
      this.soundTimer = setInterval(() => {
        const randSound = Math.floor(Math.random() * 5) + 1;
        const audio = new Audio(`../media/sounds/step${randSound}.mp3`);
        audio.volume = 0.5;
        audio.play();
      }, interval);

      // Walking movement
      anime({
        targets: this.container,
        left: x,
        top: y,
        duration: duration,
        easing: 'linear',
        complete: () => {
          clearInterval(this.soundTimer); // 🔇 Stop sounds
          this.soundTimer = null; // Clear the timer reference
          this.Walking(false);
          this.player.rotation.y = newRotation;
          resolve(); // ✅ Tell the caller it's done
        },
      });
    } else {
      resolve(); // ✅ Still resolve if already at destination
    }
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
  if (this.rotationAnimationId) {
    cancelAnimationFrame(this.rotationAnimationId);
    this.rotationAnimationId = null;
  }

  const startTime = performance.now();
  const startRotationY = this.player.rotation.y;

  let deltaRotation = ((((targetRadians - startRotationY) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;

  if (Math.abs(deltaRotation) < 0.0001) {
    console.log("Already at target rotation, no animation needed.");
    return;
  }
  console.log('deltarotation: ' + deltaRotation);
  
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    if (elapsed >= duration) {
      this.player.rotation.y = targetRadians;
    } else {
      const progress = elapsed / duration;
      this.player.rotation.y = startRotationY + deltaRotation * progress;
      this.rotationAnimationId = requestAnimationFrame(animate);
    }
  };
  
  this.rotationAnimationId = requestAnimationFrame(animate);
}


}

// Export the class for use in other modules
export { MinecraftMii };
export default MinecraftMii;