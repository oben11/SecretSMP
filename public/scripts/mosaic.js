import * as skinview3d from 'https://cdn.jsdelivr.net/npm/skinview3d@3.1.0/+esm'
import axios from "../node_modules/axios/dist/esm/axios.js";
import { animate, stagger } from "../node_modules/animejs/lib/anime.esm.js";


(async function () {
  const skinViewer = new skinview3d.SkinViewer({
    width: 200,
    height: 300,
    renderPaused: true,
  });

  skinViewer.camera.position.y = 15;
  skinViewer.camera.rotation.x = -0.1;
  skinViewer.camera.rotation.y = 0;
  skinViewer.camera.rotation.z = 0;

  let zIndex = 0;
  let rows = 0;
  let rowIndex = 0;
  let perRow = 15;
  let offsetY = 20;
  let offsetX = 0;
  let scaleFactor = 1.7;

  for (let i = 0; i < 170; i++) {
    offsetX += 7;
    rowIndex++;
    if (rowIndex == Math.round(perRow)) {
      console.log("New row");
      console.log(perRow + "per row");

      rows += 1;
      rowIndex = 0;
      perRow += 2;
      zIndex -= 1;
      offsetY += 10;
      offsetX = 0;
      scaleFactor -= 0.2;
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
    imgElement.style.marginLeft = offsetX + "vw";
    imgElement.style.position = "absolute";
    imgElement.style.left = offsetX + "vw";
    imgElement.style.bottom = offsetY + "%";
    imgElement.style.zIndex = zIndex;
    imgElement.style.scale = scaleFactor;
    imgElement.className = "Char";

    document.getElementById("mosaic").appendChild(imgElement);
  }
  skinViewer.dispose();

animate('img', {
  // targets is now the first argument to animate(), so it's not needed as a property
  translateY: [
    { to: 2.5, duration: 500 }, // 'value' is now 'to' for property keyframes
    { to: 0, duration: 1000 }
  ],
  alternate: true, // 'direction: alternate' is now 'alternate: true'
  loop: true,
  ease: 'easeInOutSine', // 'easing' is now 'ease'
  delay: (el, i) => Math.random() * 2000 // Function-based delay remains similar
});
})();
