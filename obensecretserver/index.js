import * as skinview3d from "skinview3d";
const element = document.getElementById("canvas");

const viewer = new skinview3d.SkinViewer({
  canvas: element,
  width: 300,
  height: 400,
  skin: "skin.png",
  enableControls: true
});
