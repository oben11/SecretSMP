import * as skinview3d from 'skinview3d';
import axios from 'axios';

(async function () {
  // --- This section remains the same ---
  const skinViewer = new skinview3d.SkinViewer({
    renderPaused: true,
    width:200,  // Explicitly set a render width
    height: 200, // Explicitly set a render height
  });
  skinViewer.zoom = 1;
  skinViewer.camera.position.y;;
  //skinViewer.camera.rotation.set(-0.1, 0, 0);

  

  let perRow = 15; // Initial Characters per row
  let rowIndex = 0;

  let skins = [];
  try {
    const response = await axios.get('/api/skins');
    skins = response.data || [];
    if (!Array.isArray(skins) || skins.length === 0) throw new Error('No skins returned');
  } catch (err) {
    console.error('Error loading skins list:', err);
    return;
  }
  // --- End of unchanged section ---

  // Get the main container ONCE.
  const host = document.getElementById('miiDisplay');
  if (!host) {
    console.error('#miiDisplay not found in DOM');
    return;
  }
  
  // Create the very first row container.
  let currentRow = document.createElement('div');
  currentRow.className = 'image-row';
  host.appendChild(currentRow);

for (let i = 0; i < 10; i++) {
  for (let i = 0; i < perRow; i++) {
    // Check if we need to start a NEW row.
    if (rowIndex === perRow) {
      rowIndex = 0;
      perRow += 1; // Increase the number of images for the next row.
      
      // Create a new div for the new row and append it.
      currentRow = document.createElement('div');
      currentRow.className = 'image-row';
      currentRow.style.zIndex = perRow;
      host.appendChild(currentRow);
    }

    const idx = Math.floor(Math.random() * skins.length);
    const skinLink = skins[idx];

    // Random Character Pose
     
    skinViewer.playerObject.skin.head.rotation.y = Math.random() * 0.9 - 0.6;
    skinViewer.playerObject.skin.head.rotation.x = Math.random() * 0.6 - 0.3;
    skinViewer.playerObject.skin.position.y = Math.random() * (5 - 0.8) + 0.5;
    
    await skinViewer.loadSkin(skinLink);
    skinViewer.render();

    const image = skinViewer.canvas.toDataURL();
    const imgContainer = document.createElement('div');
    const imgElement = document.createElement('img');
    imgElement.src = image;
    
    // We only need one class now! CSS handles the rest.
    imgElement.className = 'Mii';
    imgContainer.className = 'imgContainer'; // Container for each Mii image
    
    // Append the new image to the CURRENT row container.
    currentRow.appendChild(imgContainer);
    imgContainer.appendChild(imgElement);

    rowIndex++;
  }
}

  skinViewer.dispose();

  // Your animation code should work perfectly with this new structure.
  anime({
    targets: '.Mii',
    translateY: [
      { value: '1vh', duration: 500 },
      { value: 0, duration: 1000 }
    ],
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutSine',
    delay: (_, i) => Math.random() * 2000
  });

})();