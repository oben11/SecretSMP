// main.js (ES Module)
import { MinecraftMii } from "./mii.js";
import axios from "axios";

// Utility function
function pause(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let miiInstances = {}; // Needs to be in module scope for export to work
let returnToStartPosition = () => {}; // Declare now, define later

document.addEventListener("DOMContentLoaded", function () {
  const maxMiis = 5;
  let counter = 0;
  let wander = false; // Control flag

  axios.get("/api/skins").then((res) => {
    res.data.forEach((url) => {
      if (counter >= maxMiis) return;

      const match = url.match(/\/skin\/([^/]+)/);
      const username = match ? match[1] : "unknown";
      const canvasId = `miiCanvas-${username}`;
      console.log(`Creating Mii instance for ${username}`);

      const myMii = new MinecraftMii(canvasId);
      myMii.setSkin(url);
      myMii.setSize(150, 200);
      myMii.setZoom(1);

      // Layout logic
      const i = Object.keys(miiInstances).length;
      const row = Math.floor(i / Math.floor(window.innerWidth / 150));
      const col = i % Math.floor(window.innerWidth / 150);

      myMii.canvas.style.position = "absolute";
      myMii.canvas.style.left = `${col * 150}px`;
      myMii.canvas.style.top = `${row * 200}px`;
      myMii.setStartPos(col * 150, row * 200);

      miiInstances[canvasId] = myMii;
      myMii.walk(500, 500);
      counter++;
    });
    // Wander loop
    async function wanderLoop() {
      while (wander) {
        for (const canvasId in miiInstances) {
          if (getRandomInt(1,3) === 1) { // 33% chance to skip this Mii
          if (Object.hasOwn(miiInstances, canvasId)) {
            const mii = miiInstances[canvasId];
            const x = getRandomInt(0, window.innerWidth - 150);
            const y = getRandomInt(0, window.innerHeight - 200);
            mii.walk(x, y);
          }
          }
        }
        await pause(2000); // Wait 2 seconds between moves
      }
    }

    wanderLoop();
  });

});


// Example exportable function to reset all Miis
returnToStartPosition = () => {
  for (const canvasId in miiInstances) {
    if (Object.hasOwn(miiInstances, canvasId)) {
      this.wander = false; // Stop wandering
      miiInstances[canvasId].returnToStartPos();
    }
  }
};

export { returnToStartPosition };
