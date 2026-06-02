
import { Entity } from "./entity.js";

export class Projectile extends Entity {

  constructor(x, y, dir){

    super(x, y, 40, 16);

    this.dir = dir;
    this.projectile = true
    this.speed = 400;

    this.alive = true;

    // ================= COMBAT =================

    this.attackBoxOffset = {
      x: -20,
      y: 0,
      w: this.w,
      h: this.h,
      damage: 50
    };

    this.showAttackBox = true;

    // el proyectil SIEMPRE puede pegar
    this.attackBoxActive = true;

    // evita multi-hit infinito
    this.hitDone = false;

    

    this.loadAnimations("ninja", ["kunai"], 1);
    this.scaleX = 0.5;
    this.scaleY = 1.25;
  }

 update(dt, enemies){

    // movimiento
    this.x += this.speed * this.dir * dt;

    // actualizar hitbox heredada
    this.updateAttackBox();

    // colisión
    for(const enemy of enemies){

      if(!enemy.alive) continue;

      if(this.dealDamage(enemy)){

        console.log("KUNAI HIT");

        this.hitDone = true;

        this.alive = false;

        break;
      }
    }

    // importante
    super.update(dt);
  }

  draw(ctx, cameraX, cameraY) {

    const drawX = this.x - cameraX;
    const drawY = this.y - cameraY;

    const img = this.animations["kunai"][0];

    const baseW = 40;
    const baseH = 40;

    const renderW = baseW * this.scaleX;
    const renderH = baseH * this.scaleY;


    ctx.save();

    ctx.translate(drawX +5 + renderW / 2, drawY -15 + renderH / 2);

    ctx.rotate(this.dir === 1 ? Math.PI / 2 : -Math.PI / 2);

    ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);

    ctx.restore();
    this.drawDebug(ctx, cameraX, cameraY);

  
  

  }
}