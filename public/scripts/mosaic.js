
(async function () {
  const skinViewer = new skinview3d.SkinViewer({
    width: 200,
    height: 300,
    renderPaused: true,
  });

  skinViewer.camera.position.y = 18;

  skinViewer.camera.rotation.x = -0.2;
  skinViewer.camera.rotation.y = 0;
  skinViewer.camera.rotation.z = 0;

  zIndex = 0;
  rows = 0;
  rowIndex = 0;
  perRow = 15;
  offsetY = 20;
  offsetX = 0;
  scaleFactor = 1.7;

  for (let i = 0; i < 170; i++) {
    offsetX+=3;
    rowIndex++;
    if (rowIndex == Math.round(perRow)) {
      console.log("New row");
      console.log(perRow + "per row");

      
      rows+=1;
      rowIndex = 0;
      perRow+= 1 + (0.01* rows);
      zIndex-=1;
      offsetY+=10;
      offsetX = 0;
      scaleFactor-=0.2;
    }


let skinLink;
try {
  const response = await axios.get("/api/skins");
  const skins = response.data;
  const idx = Math.floor(Math.random() * skins.length);
  skinLink = skins[idx];
} catch (err) {
  console.error("Error loading skins:", err);
  continue; // skip this iteration if skin can't load
}



    skinViewer.playerObject.skin.head.rotation.y = Math.random() * 0.9 - 0.6;
    skinViewer.playerObject.skin.head.rotation.x = Math.random() * 0.6 - 0.3;
    skinViewer.playerObject.skin.position.y = Math.random() * (5 - 0.8) + 0.5;


    await Promise.all([
      skinViewer.loadSkin(skinLink),
    ]);
    skinViewer.render();
    const image = skinViewer.canvas.toDataURL();

    const imgElement = document.createElement("img");

    imgElement.src = image;
    imgElement.width = skinViewer.width;
    imgElement.height = skinViewer.height;
    imgElement.style.marginLeft = offsetX+"vw";
    imgElement.style.position = "absolute"; // Set position to absolute
    imgElement.style.left = offsetX + "vw"; // Set left offset
    imgElement.style.bottom = offsetY + "%"; // Set top offset
    imgElement.style.zIndex = zIndex;
    imgElement.style.scale = scaleFactor;

    imgElement.class = "Char";


    document.getElementById("mosaic").appendChild(imgElement);


  }
  skinViewer.dispose();

  anime({
    targets: "img",
    translateY: [
      { value: 2, duration: 1000 },
      { value: 0, duration: 1000 }
    ],
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutSine',
    delay: function(el, i) {
      return Math.random() * 2000; // Random delay up to 2 seconds
    }
  });

})();