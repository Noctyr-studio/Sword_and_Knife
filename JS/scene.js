
import { Player } from "./player.js";
import { Pickup } from "./pickup.js";
import { Platform } from "./platform.js";
import { Enemy } from "./enemy.js";
import { ctx, GAME_WIDTH, GAME_HEIGHT } from "./main.js";
import { Projectile } from "./projectile.js";
import { keys } from "./main.js";

export const bgImage = new Image();
bgImage.src = "bg/Background_01.png";


export class Scene {

constructor(){
this.player = new Player(800,0);

this.platforms=[
new Platform(0,500,4000,40),
new Platform(400,30,40,2000),
new Platform(2400,400,400,20),
new Platform(2600,250,400,20),
new Platform(3300,200,100,400)

];

this.enemies = [
  new Enemy(1500, 380),
  new Enemy(2800, 100)
];

this.projectiles = [];

this.pickups=[

new Pickup(1400,400,30,30,"hp",20),
new Pickup(1600,400,30,30,"energy",20),
new Pickup(3500,400,30,30,"coin",1)

];

this.cameraX=0;
this.cameraY=0;

this.coinIcon = new Image();
this.coinIcon.src = "./pickups/coin/frame_1.png";

}

reset(text,color){

  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.fillRect(0,0,GAME_WIDTH,GAME_HEIGHT);

  ctx.fillStyle = color;
  ctx.font = "60px monospace";

  ctx.fillText(text, 500, 220); 
  
  ctx.font = "28px monospace";

  ctx.fillText(
    `Coins: ${this.player.stats.coins}`,
    500,
    300
  );

  ctx.fillStyle = "white";
  ctx.font = "32px monospace";

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(
    "Press ENTER to RESTART",
    GAME_WIDTH / 2,
    390
  );

}


updateCamera(){

  const targetX = this.player.x + this.player.w / 2 - GAME_WIDTH / 2;
  const targetY = this.player.y + this.player.h / 2 - GAME_HEIGHT / 2;
  
  const lerp = 0.1;

  this.cameraX += (targetX - this.cameraX) * lerp;
  this.cameraY += (targetY - this.cameraY) * lerp;

  // límites del mundo (opcional pero PRO)
  this.cameraX = Math.max(0, Math.min(this.cameraX, 6000 - GAME_WIDTH));
  this.cameraY = Math.max(0, Math.min(this.cameraY, 2000 - GAME_HEIGHT));
}

update(deltaTime){
  
  if(this.paused || (this.gameOver || this.gameDone)){
  
    return;

}

  // =================
  // 1. UPDATE ENTIDADES
  // =================

  this.player.update(keys, this.platforms, deltaTime, this);

  this.enemies.forEach(e => 
    e.update(deltaTime, this.platforms, this.player)
  );

  for(const kunai of this.projectiles){
  kunai.update(deltaTime, this.enemies);
}

  this.projectiles = this.projectiles.filter(
  k => k.alive
);

  this.enemies = this.enemies.filter(e => e.alive);

  this.pickups.forEach(p => 
    p.update(deltaTime, this.player)
  );


  // =================
  // 2. COLISIONES
  // =================

  // 🔥 PLAYER vs ENEMIES
  this.enemies.forEach(enemy => {

    if (this.player.isColliding(enemy)) {

      if (this.player.x < enemy.x) {
        this.player.x = enemy.x - this.player.w;
      } else {
        this.player.x = enemy.x + enemy.w;
      }

    }

  });


  // 🔥 PLAYER vs PICKUPS
  for (let i = this.pickups.length - 1; i >= 0; i--) {

    if (this.player.isColliding(this.pickups[i])) {

      this.pickups[i].apply(this.player);
      this.pickups.splice(i, 1);

    }

  }


  // =================
  // 3. CÁMARA
  // =================

  this.updateCamera();
}

drawBackground(){

  const bgW = bgImage.width;
  const bgH = bgImage.height;

  if(bgW > 0 && bgH > 0){

    const parallax = 0.3;

    const startX = -Math.floor((this.cameraX * parallax) % bgW);

    for(let x = startX; x < GAME_WIDTH; x += bgW){
      ctx.drawImage(bgImage, x, 0, bgW + 1, GAME_HEIGHT);
      ctx.imageSmoothingEnabled = true;
    }

  }
}


draw(){



this.drawBackground();

this.platforms.forEach(p=>p.draw(ctx,this.cameraX,this.cameraY));
this.pickups.forEach(p=>p.draw(ctx,this.cameraX,this.cameraY));

for(const kunai of this.projectiles){
  kunai.draw(ctx, this.cameraX, this.cameraY);
}

this.player.draw(ctx,this.cameraX,this.cameraY);

this.enemies.forEach(e => e.draw(ctx, this.cameraX, this.cameraY));

this.drawUI(ctx)

if(this.paused){  // PAUSA //

  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0,0,GAME_WIDTH,GAME_HEIGHT);

  ctx.fillStyle = "white";
  ctx.font = "48px monospace";
  ctx.fillText("PAUSED", 500, 260);
}

if(this.gameOver){ // GAME OVER //

  this.reset("GAME OVER","red")

}

if(this.gameDone){   // JUEGO COMPLETADO //

 this.reset("YOU WON","green")

}






}
spawnKunai(x, y, dir) {
  
  if (this.player.stats.energy >0 ){
    this.player.stats.energy -= 20
    this.projectiles.push(new Projectile(x, y, dir));
  }
  else if (this.player.stats.energy <=0 ){
    this.player.stats.energy =0
    return

  }
  

  
}



drawUI(ctx){

  const barWidth = 125;
  const barHeight = 25;
  const margin = 50;
  const x = 400;
  const y = 30;

  const s = this.player.stats;

  // fondo
  ctx.fillStyle = "black";
  ctx.fillRect(x, y, barWidth, barHeight);

  // vida
  ctx.fillStyle = "red";
  const hpPercent = s.hp / s.maxHp;
  ctx.fillRect(x, y, barWidth * hpPercent, barHeight);

  // texto 
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(
    `${Math.floor(s.hp)} / ${s.maxHp}`,
    x + 50,
    y + 15
  );

    // fondo
  ctx.fillStyle = "black";
  ctx.fillRect(x, y+25, barWidth, barHeight);

  // vida
  ctx.fillStyle = "blue";
  const energyPercent = s.energy / s.maxEnergy;
  ctx.fillRect(x, y+ 25, barWidth * energyPercent, barHeight);

    // texto 
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(
    `${Math.floor(s.energy)} / ${s.maxEnergy}`,
    x + 50,
    y + 40
  );


 const size = 24;

  // dibuja la imagen
  ctx.drawImage(this.coinIcon, x, y+52, size, size);

  ctx.textBaseline = "middle";

  // dibuja el texto
  ctx.fillText(
    s.coins,
    x + 20 +size ,
    y +40 + size 
  );

  }
}