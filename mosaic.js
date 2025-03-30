(async function () {
  const skinViewer = new skinview3d.SkinViewer({
    width: 150,
    height: 200,
    renderPaused: true,
  });

  skinViewer.camera.position.y = 18;

  skinViewer.camera.rotation.x = -0.2;
  skinViewer.camera.rotation.y = 0;
  skinViewer.camera.rotation.z = 0;




  for (let i = 0; i < 5; i++) {
    const skinLink = `./skin.png`;
    skinViewer.playerObject.skin.head.rotation.y = Math.random() * 0.9 - 0.6;
    skinViewer.playerObject.skin.head.rotation.x = Math.random() * 0.6 - 0.3;



    await Promise.all([
      skinViewer.loadSkin(skinLink),
    ]);
    skinViewer.render();
    const image = skinViewer.canvas.toDataURL();

    const imgElement = document.createElement("img");
    imgElement.src = image;
    imgElement.width = skinViewer.width;
    imgElement.height = skinViewer.height;
    document.getElementById("mosaic").appendChild(imgElement);
  }

  skinViewer.dispose();
})();