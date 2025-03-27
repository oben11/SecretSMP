

function pause(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

document.addEventListener("DOMContentLoaded", function() {
  const miiInstances = {}; // Store Mii instances in an object

  const numMiis = 5; // Number of Miis to create

  for (let i = 0; i < numMiis; i++) {
    const canvasId = `miiCanvas${i + 1}`;
    const myMii = new MinecraftMii(canvasId);

    // Generate random skin URLs or use a predefined list
    const skins = [
      "https://minotar.net/skin/steve",
      "https://minotar.net/skin/alex",
      "https://minotar.net/skin/notch",
      "https://minotar.net/skin/jeb_",
      // Add more skin URLs as needed
    ];
    const skinUrl = skins[Math.floor(Math.random() * skins.length)]; // Random skin selection

    myMii.setSkin(skinUrl);
    myMii.setSize(150, 200);
    myMii.setZoom(1);

    myMii.walk(Math.random() * 800, Math.random() * 600); // Random walk positions

    miiInstances[canvasId] = myMii; // Store the Mii instance with its canvas ID as the key
  }

  // Example: Accessing and manipulating individual Miis after creation
  setTimeout(() => {
    if (miiInstances["miiCanvas1"]) {
      miiInstances["miiCanvas1"].walk(100, 100); // Move the first Mii
    }

    if(miiInstances["miiCanvas3"]){
        miiInstances["miiCanvas3"].setSkin("https://minotar.net/skin/Dinnerbone");
    }

    // Example of looping through and doing something to all miis.
    for (const canvasId in miiInstances) {
      if (miiInstances.hasOwnProperty(canvasId)) {
        // do something to each mii.
        console.log(canvasId);
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

  