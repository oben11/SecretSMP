// FancyButton.js (ES module)
import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";

export class FancyButton {
  /**
   * @param {Object} opts
   * @param {string} opts.objPath - Path to the .obj
   * @param {string} opts.mtlPath - Path to the .mtl
   * @param {string} [opts.id] - Optional ID for the container
   * @param {HTMLElement|string} [opts.container] - Element or selector to mount into
   * @param {number} [opts.scale=100] - Base scale for the model
   * @param {number} [opts.maxTiltAngle=0.05] - Radians
   * @param {number} [opts.scaleLerp=0.1] - 0..1
   * @param {number} [opts.rotationLerp=0.05] - 0..1
   * @param {string} [opts.audioSrc='../media/goathorn.mp3'] - Click sound
   * @param {boolean} [opts.appendIfMissing=true] - If true, create & append a container when not provided
   */
  constructor(opts) {
    const {
      objPath,
      mtlPath,
      container,
      id,
      scale = 5,
      maxTiltAngle = 0.5,
      scaleLerp = 0.1,
      rotationLerp = 0.5,
      audioSrc = "../media/goathorn.mp3",
      appendIfMissing = true,
    } = opts || {};

    if (!objPath || !mtlPath) {
      throw new Error("FancyButton: objPath and mtlPath are required.");
    }

    this.objPath = objPath;
    this.mtlPath = mtlPath;
    this.audioSrc = audioSrc;
    this.id = id || 'FancyButton';

    // Scene bits
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.object = null;

    // Interaction state
    this.mouse = new THREE.Vector2();
    this.baseScale = scale;
    this.targetScale = new THREE.Vector3(scale, scale, scale);
    this.originalRotation = new THREE.Euler();
    this.targetRotation = new THREE.Euler();
    this.isHovering = false;
    this.isClicking = false;

    // Tunables
    this.maxTiltAngle = maxTiltAngle;
    this.hoverScale = this.baseScale * 1.2;
    this.clickScale = this.baseScale * 0.8;
    this.scaleLerp = scaleLerp;
    this.rotationLerp = rotationLerp;

    // DOM container
    this.container = this._resolveContainer(container, appendIfMissing);

    // Bind handlers to instance once
    this._onResize = this._onResize.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onPointerEnter = this._onPointerEnter.bind(this);
    this._onPointerLeave = this._onPointerLeave.bind(this);
    this._onClick = this._onClick.bind(this);
    this._animate = this._animate.bind(this);

    this._init();
    this._animate();
  }

  // --- Public API -----------------------------------------------------------

  setOnClick(fn) {
    this._onClickCallback = typeof fn === "function" ? fn : null;
  }

  destroy() {
    // Stop observing & remove listeners
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    this.container.removeEventListener("mousemove", this._onMouseMove);
    this.container.removeEventListener("pointerenter", this._onPointerEnter);
    this.container.removeEventListener("pointerleave", this._onPointerLeave);
    this.container.removeEventListener("click", this._onClick);

    // Dispose three things
    if (this.object) {
      this.object.traverse((child) => {
        if (child.isMesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m?.map?.dispose());
            child.material.forEach((m) => m?.dispose?.());
          } else {
            child.material?.map?.dispose();
            child.material?.dispose?.();
          }
        }
      });
    }
    this.renderer?.dispose();

    // Remove canvas
    if (this.renderer?.domElement?.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    // Optionally remove container if we created it
    if (this._createdContainer && this.container?.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    // Null out refs
    this.scene = this.camera = this.renderer = this.object = null;
  }

  // --- Private helpers ------------------------------------------------------

  _resolveContainer(container, appendIfMissing) {
    if (container instanceof HTMLElement) return container;
    if (typeof container === "string") {
      const el = document.querySelector(container);
      if (el) return el;
    }
    if (!appendIfMissing) {
      throw new Error("FancyButton: container not found and appendIfMissing=false.");
    }
    const el = document.createElement("div");
    el.style.width = "150px";
    el.style.height = "150px";
    el.style.position = "relative";
    el.style.display = "inline-block";
    el.style.touchAction = "none";
    el.id = `${this.id}-container`;
    document.body.appendChild(el);
    this._createdContainer = true;
    return el;
  }

  _init() {
    // Scene
    this.scene = new THREE.Scene();

    // Camera
    const { width, height } = this._containerSize();
    this.camera = new THREE.PerspectiveCamera(15, width / height, 0.1, 1000);
    this.camera.position.z = 30;
    this.camera.position.y = 2;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.max(1, window.devicePixelRatio || 1));
    this.renderer.setSize(width, height);
    this.container.appendChild(this.renderer.domElement);

    // Lights
    this.scene.add(new THREE.AmbientLight(0xffffff, 3.2));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(1, 1, 1).normalize();
    this.scene.add(dir);

    // Load materials & mesh
    const mtlLoader = new MTLLoader();
    mtlLoader.load(
      this.mtlPath,
      (materials) => {
        materials.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.load(
          this.objPath,
          (obj) => {
            this.object = obj;
            this.object.traverse((child) => {
              if (child.isMesh && child.material && child.material.map) {
                // Crisp textures (pixelated style)
                child.material.map.minFilter = THREE.NearestFilter;
                child.material.map.magFilter = THREE.NearestFilter;
                child.material.map.needsUpdate = true;
              }
            });
            this.object.scale.set(this.baseScale, this.baseScale, this.baseScale);
            this.originalRotation.copy(this.object.rotation);
            this.targetRotation.copy(this.object.rotation);
            this.scene.add(this.object);

            // Listeners after mesh is ready
            this._attachListeners();
          },
          undefined,
          (err) => console.error("FancyButton: OBJ load error:", err)
        );
      },
      undefined,
      (err) => console.error("FancyButton: MTL load error:", err)
    );
  }

  _attachListeners() {
    // Use container-scoped events so multiple buttons can coexist
    this.container.addEventListener("mousemove", this._onMouseMove, { passive: true });
    this.container.addEventListener("pointerenter", this._onPointerEnter);
    this.container.addEventListener("pointerleave", this._onPointerLeave);
    this.container.addEventListener("click", this._onClick);

    // Observe container size (works even if CSS/layout changes)
    this.resizeObserver = new ResizeObserver(this._onResize);
    this.resizeObserver.observe(this.container);
  }

  _onResize() {
    const { width, height } = this._containerSize();
    if (width === 0 || height === 0) return; // hidden or collapsed
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  _onMouseMove(e) {
    const rect = this.container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    this.mouse.x = (mouseX / rect.width) * 2 - 1;
    this.mouse.y = -(mouseY / rect.height) * 2 + 1;

    // Smooth tilt towards pointer
    this.targetRotation.x = this.originalRotation.x + -this.mouse.y * this.maxTiltAngle;
    this.targetRotation.y = this.originalRotation.y + this.mouse.x * this.maxTiltAngle;
  }

  _onPointerEnter() {
    this.isHovering = true;
    this.targetScale.set(this.hoverScale, this.hoverScale, this.hoverScale);
  }

  _onPointerLeave() {
    this.isHovering = false;
    if (!this.isClicking) {
      this.targetScale.set(this.baseScale, this.baseScale, this.baseScale);
    }
    // Ease rotation back towards original when leaving
    this.targetRotation.copy(this.originalRotation);
  }

  _onClick() {
    if (!this.object) return;

    // Optional user callback
    if (typeof this._onClickCallback === "function") {
      try {
        this._onClickCallback();
      } catch (e) {
        console.error("FancyButton onClick callback error:", e);
      }
    }


    // Click animation: shrink then pop to hover/base
    this.isClicking = true;
    this.targetScale.set(this.clickScale, this.clickScale, this.clickScale);
    setTimeout(() => {
      this.targetScale.set(
        this.isHovering ? this.hoverScale : this.baseScale,
        this.isHovering ? this.hoverScale : this.baseScale,
        this.isHovering ? this.hoverScale : this.baseScale
      );
      setTimeout(() => {
        if (!this.isHovering) {
          this.targetScale.set(this.baseScale, this.baseScale, this.baseScale);
        }
        this.isClicking = false;
      }, 200);
    }, 200);
  }

  _animate() {
    // RAF loop
    this._raf = requestAnimationFrame(this._animate);

    if (this.object) {
      // Smoothly lerp towards targets
      this.object.rotation.x += (this.targetRotation.x - this.object.rotation.x) * this.rotationLerp;
      this.object.rotation.y += (this.targetRotation.y - this.object.rotation.y) * this.rotationLerp;
      this.object.scale.lerp(this.targetScale, this.scaleLerp);
    }

    this.renderer.render(this.scene, this.camera);
  }

  _containerSize() {
    // Fallback to 300×300 if not measurable yet
    const rect = this.container.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width || this.container.clientWidth || 300));
    const height = Math.max(1, Math.floor(rect.height || this.container.clientHeight || 300));
    return { width, height };
  }
}

export default FancyButton;
