import { MinecraftMii } from "./mii.js";
import axios from "axios";

function pause(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

document.addEventListener("DOMContentLoaded", function () {
  let maxMiis = 5;
  let counter = 0;

  axios.get("/api/skins").then((res) => {
    const miiInstances = {};
    res.data.forEach((url) => {
      if (counter >= maxMiis) return; // Limit to maxMiis
      // Extract username from URL (e.g., https://minotar.net/skin/dithskii)
      const match = url.match(/\/skin\/([^/]+)/);
      const username = match ? match[1] : "unknown";
      const canvasId = `miiCanvas${username}`;
      console.log(`Creating Mii instance for ${username}`);

      const myMii = new MinecraftMii(canvasId);
      myMii.setSkin(url);
      myMii.setSize(150, 200);
      myMii.setZoom(1);

      // Layout logic (optional, adjust as needed)
      const i = Object.keys(miiInstances).length;
      const row = Math.floor(i / Math.floor(window.innerWidth / 150));
      const col = i % Math.floor(window.innerWidth / 150);

      myMii.canvas.style.position = "absolute";
      myMii.canvas.style.left = `${col * 150}px`;
      myMii.canvas.style.top = `${row * 200}px`;
      myMii.startingPosition(col * 150, row * 200);

      miiInstances[canvasId] = myMii;
      myMii.walk(1000, 500);
      counter++;
    });

    // Example: Accessing and manipulating individual Miis after creation
    setTimeout(() => {
      if (miiInstances["miiCanvasdithskii"]) {
        // Example: miiInstances["miiCanvasdithskii"].setSkin("...");
      }

      for (const canvasId in miiInstances) {
        if (miiInstances.hasOwnProperty(canvasId)) {
          console.log(canvasId);
          console.log(miiInstances[canvasId]);
          const myMii = miiInstances[canvasId];
          //myMii.returnHome(); // Make each Mii return to its starting position
        }
      }
    }, 2000);
  });

  function onMouseClick(event) {
    const targetDegrees = myMii.calculateRotation(event.clientX, event.clientY);
    myMii.walk(event.clientX, event.clientY);
    //myMii.animateCharacterRotation(targetDegrees, 100); // Animate over 500 milliseconds
    myMii.viewer.playerObject.rotation.y = targetDegrees;
  }
});
