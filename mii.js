/*
TODO
When Click on Mii it stops everything looks at you and head gets twice the size
*/

class MinecraftMii {
  constructor(canvasId) {
    this.canvas = document.createElement('canvas');
    this.canvas.id = canvasId;
    document.body.appendChild(this.canvas);

    this.viewer = new skinview3d.SkinViewer({
      canvas: this.canvas,
      width: 300,
      height: 400,
      skin: null,
      cape: null,
      model: "slim",
      zoom: 0.5,
      fov: 15,
      rotateButton: true,
      panButton: true,
    });

    this.viewer.camera.position.x = 0;
    this.viewer.camera.position.y = 15;
    this.viewer.camera.position.z = 15;

    this.viewer.camera.rotation.x = -2;
    this.viewer.camera.rotation.y = 0;
    this.viewer.camera.rotation.z = 0;

    // Add the event listener inside the constructor
    this.canvas.addEventListener('click', () => {
      console.log("hello!");

      // Reset orientation/rotation
      this.viewer.playerObject.rotation.y = 0;
      this.viewer.playerObject.rotation.x = -Math.PI / 6;

      // Increase head scale
      this.viewer.playerObject.head.position.x = 2;
      this.viewer.playerObject.head.scale.y = 2;
      this.viewer.playerObject.head.scale.z = 2;

      this.viewer.render(); // Important: Render the changes!
    });
  }

  // ... (rest of your methods: walk, setSkin, etc.) ...
  walk(x, y) {
    anime.remove(this.canvas);
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
        this.viewer.playerObject.rotation.y = newRotation;
      },
    });
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

  startAnimation(animationName) {
    this.viewer.animations.play(animationName);
  }

  stopAnimation() {
    this.viewer.animations.reset();
  }

  setRotation(degrees, duration) {
    this.animateCharacterRotation(degrees, duration);
  }

  Walking(boolean) {
    if (boolean) {
      this.viewer.animation = new skinview3d.RunningAnimation();
    } else {
      this.viewer.animation = new skinview3d.IdleAnimation();
    }
  }

  calculateRotation(targetX, targetY) {
    const canvas = this.canvas;

    if (!canvas) {
      console.error("Canvas element is not available.");
      return 0;
    }

    const rect = canvas.getBoundingClientRect();
    const currentX = rect.left + rect.width / 2;
    const currentY = rect.top + rect.height / 2;
    console.log("CurrentX: " + currentX + "\nCurrentY: " + currentY);

    const deltaX = targetX - currentX;
    const deltaY = - (targetY - currentY);

    let radians = Math.atan2(deltaY, deltaX);

    const rotationOffset = Math.PI / 2;
    radians += rotationOffset;

    console.log("current direction: " + this.viewer.playerObject.rotation.y);
    console.log("new direction: " + radians);
    return radians;
  }

  animateCharacterRotation(targetRadians, duration) {
    const startTime = performance.now();
    const startRotationY = this.viewer.playerObject.rotation.y;
    const object = this.viewer.playerObject;

    let deltaRotation = targetRadians - startRotationY;

    deltaRotation = (deltaRotation + Math.PI) % (2 * Math.PI) - Math.PI;

    function animate(currentTime) {
      const elapsedTime = currentTime - startTime;
      if (elapsedTime >= duration) {
        object.rotation.y = targetRadians;
      } else {
        const progress = elapsedTime / duration;
        object.rotation.y = startRotationY + deltaRotation * progress;
        requestAnimationFrame(animate);
      }
    }
    requestAnimationFrame(animate);
  }
}