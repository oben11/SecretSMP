function pause(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

document.addEventListener("DOMContentLoaded", function () {
  axios.get("/api/skins").then((res) => {
    const miiInstances = {};
    res.data.forEach((url) => {
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

      miiInstances[canvasId] = myMii;
      myMii.walk(1000, 500);
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
        }
      }
    }, 2000);
  });



  for (let i = 0; i < numMiis; i++) {
    console.log("Creating Mii instance");
    const canvasId = `miiCanvas${i + 1}`;
    const myMii = new MinecraftMii(canvasId);

    // Generate random skin URLs or use a predefined list
    const skins = axios.get("/api/skins");

    myMii.setSize(150, 200);
    myMii.setZoom(1);

    const row = Math.floor(i / Math.floor(window.innerWidth / 150));
    const col = i % Math.floor(window.innerWidth / 150);

    myMii.canvas.style.position = "absolute";
    myMii.canvas.style.left = `${col * 150}px`;
    myMii.canvas.style.top = `${row * 200}px`;

    //myMii.walk(Math.random() * 800, Math.random() * 600); // Random walk positions

    miiInstances[canvasId] = myMii; // Store the Mii instance with its canvas ID as the key
    myMii.walk(1000, 500);
  }

  // Example: Accessing and manipulating individual Miis after creation
  setTimeout(() => {
    if (miiInstances["miiCanvas1"]) {
    }

    if (miiInstances["miiCanvas3"]) {
      //miiInstances["miiCanvas3"].setSkin("https://minotar.net/skin/Dinnerbone");
    }

    // Example of looping through and doing something to all miis.
    for (const canvasId in miiInstances) {
      if (miiInstances.hasOwnProperty(canvasId)) {
        // do something to each mii.
        console.log(canvasId);
        console.log(miiInstances[canvasId]);
        //miiInstances[canvasId].walk(0, 0); // Move all miis to 0,0.
      }
    }
  }, 2000); // Delay to ensure Miis are created before accessing them

  function onMouseClick(event) {
    const targetDegrees = myMii.calculateRotation(event.clientX, event.clientY);
    myMii.walk(event.clientX, event.clientY);
    //myMii.animateCharacterRotation(targetDegrees, 100); // Animate over 500 milliseconds
    myMii.viewer.playerObject.rotation.y = targetDegrees;
  }
});
