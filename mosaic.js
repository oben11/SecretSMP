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

  zIndex=0;
  rowCounter=0;
  offsetY = 350;
  offsetX = 0;
  scaleFactor = 1;

  for (let i = 0; i < 180; i++) {

    rowCounter++;
    if (rowCounter == 13+(Math.round(Math.abs(zIndex)*1.2))) {
      zIndex--;
      rowCounter = 0;
      offsetX=0-(Math.abs(zIndex)*5);
      offsetY+=120;
      scaleFactor+=0.1;
    }


    const skinLink = `./skin.png`;
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
    imgElement.style.position = "absolute"; // Set position to absolute
    imgElement.style.left = offsetX / scaleFactor + "px"; // Set left offset
    imgElement.style.bottom = offsetY / scaleFactor + "px"; // Set top offset
    imgElement.style.zIndex = zIndex;
    imgElement.style.scale = 1.5 / (scaleFactor);

    imgElement.class = "Char";


    document.getElementById("mosaic").appendChild(imgElement);


    offsetX += 110; 
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