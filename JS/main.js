

import { Scene } from "./scene.js";
import { AssetManager } from "./assetManager.js";
import { LoadingScreen } from "./loadingScreen.js";

// ==================== CONFIG ====================
export const canvas = document.getElementById("gameCanvas");
export const ctx = canvas.getContext("2d");

export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 576;

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

export const WORLD_WIDTH = 6000;
export const WORLD_HEIGHT = 2000;

export const keys = {};

const mobileButtons = {

  // ================= MOVEMENT =================
  left: {
    x: 40,
    y: GAME_HEIGHT - 120,
    w: 70,
    h: 70,
    key: "arrowleft"
  },

  right: {
    x: 130,
    y: GAME_HEIGHT - 120,
    w: 70,
    h: 70,
    key: "arrowright"
  },

  // ================= ACTIONS =================
  jump: {
    x: GAME_WIDTH - 260,
    y: GAME_HEIGHT - 120,
    w: 70,
    h: 70,
    key: "arrowup"
  },

  sword: {
    x: GAME_WIDTH - 170,
    y: GAME_HEIGHT - 120,
    w: 70,
    h: 70,
    key: "d"
  },

  kunai: {
    x: GAME_WIDTH - 80,
    y: GAME_HEIGHT - 120,
    w: 70,
    h: 70,
    key: "a"
  }
};

window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

// ==================== ESC ====================
const fullscreenButton = {
  x: GAME_WIDTH - 70,
  y: 20,
  size: 50
};

// ==================== STATE ====================
let scene = null;

let lastTime = 0;

let loadingStarted = false;
let assetsReady = false;

// ==================== LOADER ====================
const assets = new AssetManager();
const loader = new LoadingScreen(assets);

function drawFullscreenButton(){

  const x = fullscreenButton.x;
  const y = fullscreenButton.y;
  const size = fullscreenButton.size;

  // fondo
  ctx.fillStyle = "rgba(0,0,0,0.6)";

  ctx.fillRect(x, y, size, size);

  // borde
  ctx.strokeStyle = "white";
  ctx.lineWidth = 2;

  ctx.strokeRect(x, y, size, size);

  // icono
  ctx.beginPath();

  ctx.moveTo(x + 12, y + 20);
  ctx.lineTo(x + 12, y + 12);
  ctx.lineTo(x + 20, y + 12);

  ctx.moveTo(x + 30, y + 12);
  ctx.lineTo(x + 38, y + 12);
  ctx.lineTo(x + 38, y + 20);

  ctx.moveTo(x + 12, y + 30);
  ctx.lineTo(x + 12, y + 38);
  ctx.lineTo(x + 20, y + 38);

  ctx.moveTo(x + 30, y + 38);
  ctx.lineTo(x + 38, y + 38);
  ctx.lineTo(x + 38, y + 30);

  ctx.stroke();
}

// ==================== ESC BUTTON ====================

canvas.addEventListener("click", e => {

  const rect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const mouseX =
    (e.clientX - rect.left) * scaleX;

  const mouseY =
    (e.clientY - rect.top) * scaleY;

  // ================= FULLSCREEN =================
  const insideFullscreen =
    mouseX >= fullscreenButton.x &&
    mouseX <= fullscreenButton.x + fullscreenButton.size &&
    mouseY >= fullscreenButton.y &&
    mouseY <= fullscreenButton.y + fullscreenButton.size;

  if (insideFullscreen) {

    if (!document.fullscreenElement) {

      document.documentElement.requestFullscreen();

    } else {

      document.exitFullscreen();
    }
  }
});

//* ==================== MOBILE BUTTONS ====================
/*
canvas.addEventListener("touchstart", e => {

  const rect = canvas.getBoundingClientRect();

  for (const touch of e.touches) {

    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    for (const button of Object.values(mobileButtons)) {

      const inside =
        x >= button.x &&
        x <= button.x + button.w &&
        y >= button.y &&
        y <= button.y + button.h;

      if (inside) {
        keys[button.key] = true;
      }
    }
  }
}); */

/*

canvas.addEventListener("touchend", () => {

  for (const button of Object.values(mobileButtons)) {
    keys[button.key] = false;
  }
});*/

// ==================== CLICK ====================

if (loader.isDone()) {
    loader.waitingForInput = true;
  }


function drawMobileControls(){

  ctx.globalAlpha = 0.5;

  for (const [name, button] of Object.entries(mobileButtons)) {

    ctx.fillStyle = "white";

    ctx.fillRect(
      button.x,
      button.y,
      button.w,
      button.h
    );

    ctx.fillStyle = "black";
    ctx.font = "20px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
      name.toUpperCase(),
      button.x + button.w / 2,
      button.y + button.h / 2
    );
  }

  ctx.globalAlpha = 1;
}

// ==================== GAME LOOP ====================
function gameLoop(time) {

  const dt = (time - lastTime) / 1000;
  lastTime = time;

  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // ================= LOADING STATE =================
  if (!assetsReady) {

    // iniciar carga UNA sola vez
    if (!loadingStarted) {
      loader.load(); // NO await
      loadingStarted = true;
    }

    loader.update(dt);
    loader.draw(ctx, GAME_WIDTH, GAME_HEIGHT);
    drawFullscreenButton()

   if (loader.isDone()) {

    loader.waitingForInput = true;

    if (keys["enter"] && !scene) {

      scene = new Scene();
      assetsReady = true;

      keys["enter"] = false;
    }
}

    requestAnimationFrame(gameLoop);
    
    return;
  }

  // ================= GAME STATE =================
  if (keys["escape"] && scene) {
    scene.paused = !scene.paused;
    keys["escape"] = false;
  }

  if (scene) {

  scene.update(dt);
  scene.draw();
  drawFullscreenButton()
  //drawMobileControls();

  if (
    (scene.gameOver || scene.gameDone) &&
    keys["enter"]
  ) {

    scene = new Scene();

    keys["enter"] = false;
  }
}

  requestAnimationFrame(gameLoop);
}

// ==================== START ====================
requestAnimationFrame(gameLoop);