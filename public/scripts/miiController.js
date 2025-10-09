// main.js (ES Module)
import { MinecraftMii } from "./mii.js";
import FancyButton from "./Fancybutton.js";
import axios from "axios";
import { init as initZoomPanning } from './pan.js';



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

document.addEventListener("DOMContentLoaded", async function () {
  initZoomPanning();
  const maxMiis = 30;
  let counter = 0;
  let wander = false; // Control flag

  const res = await axios.get("/api/skins");
  for (const url of res.data) {
    if (counter >= maxMiis) break;

    const match = url.match(/\/skin\/([^/]+)/);
    const username = match ? match[1] : "unknown";
    const canvasId = `${username}`;
    console.log(`Creating Mii instance for ${username}`);

    const myMii = new MinecraftMii(canvasId, url);
    myMii.setSize(150, 200);
    //myMii.setZoom(1);

    // Layout logic
    const i = Object.keys(miiInstances).length;
    const row = Math.floor(i / Math.floor(window.innerWidth / 150));
    const col = i % Math.floor(window.innerWidth / 150);

    myMii.setStartPos(col * 150, row * 200);

    myMii.container.style.left = `${col * 150}px`;
    myMii.container.style.top = `${row * 200}px`;

    console.log(`Positioning Mii ${username} at (${col * 150}, ${row * 200})`);

    miiInstances[canvasId] = myMii;

    
    //

    counter++;
    await pause(100); // Add 20ms delay between each creation
    
    myMii.freezeMii(true); // Start frozen
    //myMii.wander(true);
  }

  wanderMiis();


});


async function wanderMiis() {
for (const canvasId in miiInstances) {
  if (Object.hasOwn(miiInstances, canvasId)) {
    await pause(200); // Stagger the start of wandering
    miiInstances[canvasId].wander(true);
    console.log(`Mii ${canvasId} started wandering`);
  }
}

}







const goathorn = new FancyButton({
  objPath: "../media/models/goathorn.obj",
  mtlPath: "../media/models/goathorn.mtl",
  id:"goathorn"
});
let goathornActive = false;
goathorn.setOnClick(() => {
    goathornActive = !goathornActive;
    if (goathornActive) {
      var audio = new Audio('../media/goathorn.mp3');
      returnToStartPosition(); // Call the function to return all Miis to their starting positions
      audio.play();
    } else {
      wanderMiis();
      // Stop the sound if needed
    }
});

const map = new FancyButton({
  objPath: "../media/models/3dmap.obj",
  mtlPath: "../media/models/3dmap.mtl",
  id: "map"
});
map.setOnClick(() => {
  //var audio = new Audio('../media/goathorn.mp3');
  //returnToStartPosition(); // Call the function to return all Miis to their starting positions
  //audio.play();
});


// Example exportable function to reset all Miis
async function returnToStartPosition() {
  for (const canvasId in miiInstances) {
    if (Object.hasOwn(miiInstances, canvasId)) {
      await pause(100); // Stagger the return
      miiInstances[canvasId].stopWander();
      miiInstances[canvasId].returnToStartPos();
    }
  }
};
