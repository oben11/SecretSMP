import * as skinview3d from "skinview3d";
import bubble from "./bubble.js";

class MinecraftMii {
  constructor(canvasId, skinUrl) {
    // parent container
    this.container = document.createElement("div");
    this.container.id = `${canvasId}-container`;
    this.container.className = "miiContainer";

    // starting position (so anime has something to animate from)
    this.container.style.position = "absolute";
    document.body.appendChild(this.container);

    // shadow element
    this.shadow = document.createElement("div");
    this.shadow.className = "miiShadow";
    this.container.appendChild(this.shadow);

    // three.js canvas scene
    this.firstskin = skinUrl;
    //console.log("Skin URL: " + this.firstskin);

    this.canvas = document.createElement("canvas");
    this.canvasId = canvasId;
    this.canvas.id = canvasId;
    this.canvas.className = "miiCanvas";
    this.container.appendChild(this.canvas);

    // Initialize SkinViewer
    this.viewer = new skinview3d.SkinViewer({
      canvas: this.canvas,
      skin: skinUrl,
      zoom: 1,
      fov: 15,
      rotateButton: true,
      panButton: true,
      //nameTag: canvasId,
    });

    // Disable default controls
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
    this.container.addEventListener("click", () => this.onclick());
  }

  createMiiCanvas() {
    console.log("Creating new canvas for " + this.container.id);
    // Initialize SkinViewer

    this.canvas = document.createElement("canvas");
    this.canvas.id = this.canvasId;
    this.canvas.className = "miiCanvas";
    this.container.appendChild(this.canvas);
    this.viewer = new skinview3d.SkinViewer({
      canvas: this.canvas,
      skin: this.firstskin,
      zoom: 1,
      fov: 15,
      rotateButton: true,
      panButton: true,
      //nameTag: canvasId,
    });

    // Disable default controls
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
    this.setZoom(1);
    this.setSize(150, 200);

    // Setup click interaction
    this.canvas.addEventListener("click", () => this.onclick());
  }

  // === EVENT REACTIONS ===
  onclick() {
    console.log("clicked");

    setTimeout(() => {
      this.selected();
    }, 100); // Delay of 100ms
  }

  selected() {
    this.freezeMii(false);
    this.setRotation(0, 100);
    this.cancelAnimation();
    this.stopWander();
    const rect = this.container.getBoundingClientRect();
    const bubbleX = rect.left;
    const bubbleY = rect.top - 60;
    bubble(bubbleX, bubbleY, this);
    this.scaleHead(1.3);
    this.head.rotation.set(-0.5, 0, 0);
    let audio = new Audio(`../media/sounds/Select.wav`);
    audio.play();
  }

  unselect() {
    let audio = new Audio(`../media/sounds/Unselect.wav`);
    audio.play();
    //bubble.remove();

    this.scaleHead(1);
    this.wander(true);
  }



  // === HELPER METHODS ===
  setStartPos(x, y) {
    this.startPosition = { x, y };
  }

  returnToStartPos() {
    this.walk(this.startPosition.x, this.startPosition.y, 2);
  }

  cancelAnimation() {
    this.Walking(false);
    anime.remove(this.container); // Stop current movement
  }

  scaleHead(factor) {
    this.head.scale.set(factor, factor, factor);
  }

  setSkin(skinUrl) {
    const lastSkin = skinUrl;
    this.viewer.loadSkin(skinUrl);
  }

  setCape(capeUrl) {
    this.viewer.loadCape(capeUrl);
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
    this.viewer.renderPaused = true;
    // Destroy WebGL context to avoid hitting the limit
    if (this.viewer.renderer) {
      const gl = this.viewer.renderer.getContext();
      if (gl && typeof gl.getExtension === "function") {
        const ext = gl.getExtension("WEBGL_lose_context");
        if (ext) ext.loseContext();
      }
      this.viewer.renderer.dispose();
    }
    if (this.canvas && this.canvas.parentNode === this.container) {
      this.container.removeChild(this.canvas);
    }
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

    document.addEventListener("mousemove", mouseMoveListener);

    setTimeout(() => {
      document.removeEventListener("mousemove", mouseMoveListener);
      this.head.rotation.set(0, 0, 0); // Reset head rotation
    }, 5000);
  }

  countactiveCanvases() {
    return document.querySelectorAll(".miiCanvas").length;
  }

  walk(x, y, speed = 5) {
    return new Promise((resolve) => {
      const tryWalk = () => {
        if (this.countactiveCanvases() > 12) {
          console.log("Too many active canvases, delaying walk...");
          //setTimeout(tryWalk, 500);
          return;
        }
        this.freezeMii(false);
        //if (this.Walking !== true) {
        //}
        anime.remove(this.container); // Stop current movement
        const rect = this.container.getBoundingClientRect();
        const currentX = rect.left;
        const currentY = rect.top;

        //console.log(`Walking from (${currentX}, ${currentY}) to (${x}, ${y})`);

        if (currentX !== x || currentY !== y) {
          this.Walking(true);
          const newRotation = this.calculateRotation(x, y);
          const duration = Math.hypot(currentX - x, currentY - y) * speed;
          this.setRotation(newRotation, duration);

          // Walking Noises
          if (this.soundTimer) {
            clearInterval(this.soundTimer);
            this.soundTimer = null;
          }
          const interval = 300 + Math.floor(Math.random() * 200) + 1; // ms
          this.soundTimer = setInterval(() => {
            const randSound = Math.floor(Math.random() * 5) + 1;
            const audio = new Audio(`../media/sounds/step${randSound}.mp3`);
            audio.volume = 0.1;
            audio.play();
          }, interval);

          // Walking movement
          anime({
            targets: this.container,
            left: x,
            top: y,
            duration: duration,
            easing: "linear",
            complete: () => {
              clearInterval(this.soundTimer); // 🔇 Stop sounds
              this.soundTimer = null; // Clear the timer reference
              this.Walking(false);
              this.player.rotation.y = newRotation;

              this.animateCharacterRotation(0, 100);
              setTimeout(() => {
                this.freezeMii(true);
              }, 100);
              // Freeze at destination
              resolve(); // ✅ Tell the caller it's done
            },
          });
        } else {
          resolve(); // ✅ Still resolve if already at destination
        }
      };
      tryWalk();
    });
  }

  getrandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  wander(active) {
    console.log("wander: " + active);
    this.stopWander();
    if (!active) return;
    this._wandering = true;
    const step = () => {
      if (!this._wandering) return;
      let bounding = document.body.getBoundingClientRect();
      const x = this.getrandomInt(100, bounding.width - 100);
      const y = this.getrandomInt(100, bounding.height - 100);
      this.walk(x, y).then(() => {
        if (!this._wandering) return;
        this._wanderTimeout = setTimeout(step, this.getrandomInt(2000, 10000));
      });
    };
    step();
  }

  stopWander() {
    this._wandering = false;
    clearTimeout(this._wanderTimeout);
    this._wanderTimeout = null;
  }

  freezeMii(active) {
    // If the requested state matches the current state, do nothing.
    if (active === this._frozen) return;

    if (active) {
      console.log("Freezing Mii and removing canvas for " + this.container.id);
      this.viewer.render();
      requestAnimationFrame(() => {
        this.viewer.render();
        const image = this.canvas.toDataURL("image/png");
        const img = document.createElement("img");
        img.src = image;
        img.style.position = "absolute";
        img.style.width = this.canvas.width / 2 + "px";
        img.style.height = this.canvas.height / 2 + "px";
        //img.style.left = this.container.style.left;
        //img.style.top = this.container.style.top;
        img.className = "miiFrozenImg";
        this.container.appendChild(img);
        this.img = img; // Store reference for later removal

        this.dispose();
        this._frozen = true;
      });
    } else {
      // Remove the frozen image if it exists
      this.dispose();
      this.createMiiCanvas();
      this.disposeImage();
      this._frozen = false;
    }
  }

  disposeImage() {
    setTimeout(() => {
      if (this.img && this.img.parentNode === this.container) {
        this.container.removeChild(this.img);
        this.img = null;
      }
    }, 20);
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
        this.player.skin.leftArm.rotation.z = Math.PI * 0.05 + angle / 4;

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

    let deltaRotation =
      ((((targetRadians - startRotationY) % (2 * Math.PI)) + 3 * Math.PI) %
        (2 * Math.PI)) -
      Math.PI;

    if (Math.abs(deltaRotation) < 0.0001) {
      console.log("Already at target rotation, no animation needed.");
      return;
    }
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
