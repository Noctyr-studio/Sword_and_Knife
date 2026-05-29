import { Entity } from "./entity.js";


export class Pickup extends Entity {

  constructor(x, y, w, h, type, value){
    super(x, y, w, h);

    this.type = type;
    this.value = value;
    this.canAttack = false; // desactiva ataque
    this.collected = false;

    // 🔥 flotación base
    this.baseY = y;
    this.time = Math.random() * 100;

    // =================
    // ANIMACIONES
    // =================
    if(type === "coin"){
      this.loadAnimations("pickups", ["coin"], 6);
      this.play("coin");
      this.animFPS = 16; 
      
    }

    else if(type === "hp"){
      this.loadAnimations("pickups", ["hp"], 1);
      this.play("hp");
    }

    else if(type === "energy"){
      this.loadAnimations("pickups", ["energy"], 1);
      this.play("energy");
    }
  }

  // =================
  // UPDATE
  // =================
  update(dt, player){

    if(!player) {
      super.update(dt);
     
      return;
    }  

    // console.log("coin frame:", this.frameIndex);

    // flotación
    this.time += dt * 3;
    this.y = this.baseY + Math.sin(this.time) * 5;

    // imán
    const dx = (player.x + player.w / 2) - (this.x + this.w / 2);
    const dy = (player.y + player.h / 2) - (this.y + this.h / 2);

    const dist = Math.hypot(dx, dy);
    const range = 150;

    if(dist < range){
      const strength = Math.min(10, 300 / (dist + 0.01));

      this.x += dx * dt * strength;
      this.baseY += dy * dt * strength;
    }

    super.update(dt);

    // 🔥 DEBUG ACÁ
    if(this.type === "coin"){
      
    }
  }

  // =================
  // DRAW
  // =================
  draw(ctx, cameraX, cameraY){
    super.draw(ctx, cameraX, cameraY);
  }

  // =================
  // APPLY EFFECT
  // =================
  apply(entity){

    // 🔒 seguridad anti-crash
    if(!entity || !entity.stats){
      console.error("Pickup.apply() entidad inválida:", entity);
      return;
    }

    if(this.type === "hp"){
      entity.heal(20);
    }

    else if(this.type === "energy"){
      entity.stats.energy = Math.min(
        entity.stats.maxEnergy,
        entity.stats.energy + this.value
      );
    }

    else if(this.type === "coin"){
      entity.stats.coins += this.value;
    }
  }

}