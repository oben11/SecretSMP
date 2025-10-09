// pan.js

// --- Configuration (Read from CSS variables) ---
let ZOOM_LEVEL = 1.2;
let EDGE_SENSITIVITY = 500;
let DAMPING_FACTOR = 0.15;

// --- State ---
let contentContainer;
let currentPanX = 0;
let currentPanY = 0;
let targetPanX = 0;
let targetPanY = 0;
// NEW STATE: Flag to control mouse movement listening
let isMouseListenerActive = true; 

// --- DOM Status Elements (references will be set in init) ---
let statusZoom;
let statusPanX;
let statusPanY;

// --- Helper Functions ---

/**
 * Calculates the maximum permissible pan distance (in pixels).
 */
const getMaxPan = (viewportSize) => {
  // Half of the extra content size needs to be offset to reach the edge.
  return (viewportSize * (ZOOM_LEVEL - 1)) / 2;
};

/**
 * Maps a distance from the edge (0 to EDGE_SENSITIVITY) to a pan factor (-1.0 to 1.0).
 */
const calculatePanFactor = (distance, isNegativeEdge) => {
  let factor = 0;

  if (distance < EDGE_SENSITIVITY) {
    // Calculate normalized factor (0 at EDGE_SENSITIVITY, 1 at 0 distance)
    factor = 1 - distance / EDGE_SENSITIVITY;
  }

  // Determine direction: positive for left/top edge, negative for right/bottom edge
  return isNegativeEdge ? factor : -factor;
};

/**
 * The animation loop using requestAnimationFrame for smooth movement.
 */
const animate = () => {
  // Interpolate current pan towards target pan for smooth dampening effect
  currentPanX += (targetPanX - currentPanX) * DAMPING_FACTOR;
  currentPanY += (targetPanY - currentPanY) * DAMPING_FACTOR;

  // Apply the transform: scale and then translate
  const transformValue = `scale(${ZOOM_LEVEL}) translate3d(${currentPanX}px, ${currentPanY}px, 0)`;
  contentContainer.style.transform = transformValue;

  // Update status display for the currently rendered pan (smoother values)
  if (statusZoom) {
    statusZoom.textContent = ZOOM_LEVEL.toFixed(2);
    statusPanX.textContent = Math.round(currentPanX);
    statusPanY.textContent = Math.round(currentPanY);
  }

  // Request the next frame
  requestAnimationFrame(animate);
};

/**
 * Main mouse move handler to set the target pan position.
 */
const handleMouseMove = (e) => {
  // Conditional check to temporarily disable mouse control
  if (!isMouseListenerActive) {
    return;
  }
  
  const { clientX: mouseX, clientY: mouseY } = e;
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  const maxPanX = getMaxPan(viewportW);
  const maxPanY = getMaxPan(viewportH);

  // --- Calculate Horizontal Pan ---
  let panFactorX = 0;

  // Left Edge Proximity (positive pan)
  if (mouseX <= EDGE_SENSITIVITY) {
    panFactorX = calculatePanFactor(mouseX, true);
  }
  // Right Edge Proximity (negative pan)
  else if (mouseX >= viewportW - EDGE_SENSITIVITY) {
    panFactorX = calculatePanFactor(viewportW - mouseX, false);
  }
  targetPanX = panFactorX * maxPanX;

  // --- Calculate Vertical Pan ---
  let panFactorY = 0;

  // Top Edge Proximity (positive pan)
  if (mouseY <= EDGE_SENSITIVITY) {
    panFactorY = calculatePanFactor(mouseY, true);
  }
  // Bottom Edge Proximity (negative pan)
  else if (mouseY >= viewportH - EDGE_SENSITIVITY) {
    panFactorY = calculatePanFactor(viewportH - mouseY, false);
  }
  targetPanY = panFactorY * maxPanY;

  // Update status display
  if (statusPanX) {
    statusPanX.textContent = Math.round(targetPanX);
    statusPanY.textContent = Math.round(targetPanY);
  }
};

/**
 * Zooms into a specific element and centers it on the screen.
 * Also temporarily disables mouse-based panning.
 */
export const highlight = (elementId, zoom, sens) => {
  // 1. Temporarily disable mouse control
  isMouseListenerActive = false;
  
  // 2. Set new configuration values
  ZOOM_LEVEL = zoom;
  EDGE_SENSITIVITY = sens;

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with ID '${elementId}' not found for centering.`);
    return;
  }

  const rect = element.getBoundingClientRect();
  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;

  const elementCenterX = rect.left + rect.width / 2;
  const elementCenterY = rect.top + rect.height / 2;

  // Calculate the distance of the element's center from the viewport's center
  const distX = elementCenterX - viewportW / 2;
  const distY = elementCenterY - viewportH / 2;
  
  targetPanX = (-distX / ZOOM_LEVEL) + currentPanX * (ZOOM_LEVEL / 1.5);
  targetPanY = (-distY / ZOOM_LEVEL) + currentPanY * (ZOOM_LEVEL / 1.5);
};

// New function to re-enable mouse listening
/**
 * Re-enables the mouse listening for edge-based panning.
 */
export const unhighlight = () => {
    isMouseListenerActive = true;
    console.log("Mouse panning re-enabled.");
    ZOOM_LEVEL = 1.2;
    EDGE_SENSITIVITY = 500;
    // Optionally reset zoom/sensitivity to default here if needed, but not requested
};

/**
 * Public initialization function for the module.
 * It is exported so it can be imported and called.
 */
export const init = (
  containerId = "content-container",
  statusZoomId = "current-zoom",
  statusPanXId = "current-pan-x",
  statusPanYId = "current-pan-y"
) => {
  // Get DOM references
  contentContainer = document.getElementById(containerId);
  statusZoom = document.getElementById(statusZoomId);
  statusPanX = document.getElementById(statusPanXId);
  statusPanY = document.getElementById(statusPanYId);

  if (!contentContainer) {
    console.error(
      "Zoom Panning Module failed to initialize: Content container not found."
    );
    return;
  }

  // Initial scale setting to prevent CLS
  contentContainer.style.transform = `scale(${ZOOM_LEVEL}) translate3d(0, 0, 0)`;

  // Attach event listener
  document.addEventListener("mousemove", handleMouseMove);

  // Start the continuous animation loop
  requestAnimationFrame(animate);

  console.log("Zoom Panning Module initialized successfully.");
};