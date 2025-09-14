// main.js (ES Module)
import { MinecraftMii } from "./mii.js";
import FancyButton from "./Fancybutton.js";
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

      //myMii.canvas.style.left = `${col * 150}px`;
      //myMii.canvas.style.top = `${row * 200}px`;
      myMii.setStartPos(col * 150, row * 200);

      myMii.container.style.left = `${col * 150}px`;
      myMii.container.style.top = `${row * 200}px`;

      console.log(`Positioning Mii ${username} at (${col * 150}, ${row * 200})`);

      miiInstances[canvasId] = myMii;
      //myMii.walk(500, 500);
      myMii.wander(true); // Enable wandering
      counter++;
    });
  });

});

const goathorn = new FancyButton({
  objPath: "../media/goathorn.obj",
  mtlPath: "../media/goathorn.mtl",
  id:"goathorn"
});
goathorn.setOnClick(() => {
  var audio = new Audio('../media/goathorn.mp3');
  returnToStartPosition(); // Call the function to return all Miis to their starting positions
  audio.play();
});

const map = new FancyButton({
  objPath: "../media/3dmap.obj",
  mtlPath: "../media/3dmap.mtl",
  id: "map"
});
map.setOnClick(() => {
  var audio = new Audio('../media/goathorn.mp3');
  returnToStartPosition(); // Call the function to return all Miis to their starting positions
  audio.play();
});


// Example exportable function to reset all Miis
function returnToStartPosition() {
  for (const canvasId in miiInstances) {
    if (Object.hasOwn(miiInstances, canvasId)) {
      miiInstances[canvasId].stopWander();
      miiInstances[canvasId].returnToStartPos();
    }
  }
};
