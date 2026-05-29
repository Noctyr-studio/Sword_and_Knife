

import { Entity } from "./entity.js";

export class Enemy extends Entity {

  constructor(x, y){
    super(x, y, 80, 120, {
    
    hp: 100,
    maxHp: 100

    });

    this.showHealthBar = true; 

    this.attackBox = {
      x: this.x,
      y: this.y + this.attackBoxOffset.y,
      w: this.w,
      h: this.h,
      damage: this.attackBoxOffset.damage // 🔥 CLAVE
    };

    this.attackBoxOffset.damage = 20
    
    this.dying= false;
    this.animFPS = 16; 

    this.velocityY = 0;
    this.jumping = true;

    this.speed = 200;

    this.aggroRange = 200;

    this.attackRange = 80;
    this.attackBuffer = 20;

    this.attackCooldown = 0;

    this.state = "idle";

    this.recoveryTimer = 0;
    
    this.showAttackBox = true;
   
  

    this.loadAnimations(
      "knight",
      ["idle","run","attack","die"],
      10
    );

    this.play("idle");

    this.setAnimationSettings("idle", { scaleX: 4, scaleY: 2.75 },);
    this.setAnimationSettings("run", { scaleX: 4, scaleY: 2.75});
    this.setAnimationSettings("attack", { scaleX: 4, scaleY: 2.75 });
    this.setAnimationSettings("die", { scaleX: 4, scaleY: 2.75 });
    this.setAnimationSettings("jump", { scaleX: 4, scaleY: 2.75 });


    
    
  }

update(dt, platforms, player){

  if(this.dying){

  super.update(dt);

  const frames = this.animations["die"];

  const finished =
    this.frameIndex === frames.length - 1;

  if(finished){; 
    //this.alive = false;
    
  }

  return;
}
  // =====================
  // GRAVEDAD
  // =====================
  const gravity = 900;

  this.velocityY += gravity * dt;

  let nextY = this.y + this.velocityY * dt;

  for (let p of platforms) {

    const horizontalOverlap =
      this.x + this.w > p.x &&
      this.x < p.x + p.w;

    if (horizontalOverlap) {

      if (
        this.velocityY > 0 &&
        this.y + this.h <= p.y &&
        nextY + this.h >= p.y
      ) {
        nextY = p.y - this.h;
        this.velocityY = 0;
        this.jumping = false;
      }
    }
  }

  this.y = nextY;

  // ================= IA =================

  // 🔥 DISTANCIAS
  const dx = (player.x + player.w/2) - (this.x + this.w/2);
  const dy = (player.y + player.h/2) - (this.y + this.h/2);
  const dist = Math.hypot(dx, dy);

  // 🔥 FACING
  this.facing = dx > 0 ? 1 : -1;

  // 🔥 COOLDOWN
  if(this.attackCooldown > 0){
    this.attackCooldown -= dt;
  }

  // 🔥 ZONA DE ATAQUE (CON BUFFER)
  const inAttackZone = dist < (this.attackRange + this.attackBuffer);

  // ================= STATE MACHINE =================

  switch(this.state){

    // ================= IDLE =================
    case "idle":
      this.play("idle");

      if(dist < this.aggroRange){
        this.state = "chase";

      }
      else if (this.hp === 0) {
        this.state = "die";

      }
    break;

    // ================= CHASE =================
    case "chase":

      // 🔥 PRIORIDAD: ATACAR ANTES DE MOVERSE
      if(inAttackZone && this.attackCooldown <= 0){
        this.startAttack();
        this.state = "attack";
        break;
      }

      // 🔥 MOVER SOLO SI NO ESTÁ CERCA
      if(dist > this.attackRange * 0.7){
        this.x += Math.sign(dx) * this.speed * dt;
      }

      this.play("run");

      // 🔥 PERDER AGGRO
      if(dist > this.aggroRange){
        this.state = "idle";
      }

    break;

    // ================= ATTACK =================
    case "attack":

      // 🔥 IMPORTANTE: no moverse acá
      this.updateAttack(dt);
      this.tryHit(player)

      if(!this.attacking){
        this.state = "recovery";
        this.recoveryTimer = 0.3;
      }

    break;

    // ================= RECOVERY =================
    case "recovery":

      this.play("idle");
      this.recoveryTimer -= dt;

      if(this.recoveryTimer <= 0){
        this.state = "chase";
      }

    break;


  }

  super.update(dt);
}
  
draw(ctx, cameraX, cameraY){
  super.draw(ctx, cameraX, cameraY);

  // ================= DEBUG AGGRO RANGE =================
  const centerX = this.x + this.w / 2 - cameraX;
  const centerY = this.y + this.h / 2 - cameraY;

  ctx.beginPath();
  ctx.arc(centerX, centerY, this.aggroRange, 0, Math.PI * 2);

  // color según estado
  if(this.state === "chase"){
  ctx.strokeStyle = "red";
  } else {
    ctx.strokeStyle = "lime";
  }
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = this.isAggro
    ? "rgba(255, 0, 0, 0.1)"
    : "rgba(0, 255, 0, 0.05)";
  ctx.fill();

    // ================= DEBUG STATE =================
  ctx.fillStyle = "white";
  ctx.font = "11px monospace";

  const debugText = [
    `state:${this.state.toUpperCase()}`,
    `anim:${this.currentAnimation}`,
    `frame:${this.frameIndex}`,
    `timer:${this.attackTimer?.toFixed(2) || 0}`,
    `hit:${this.hitDone}`
  ];

  debugText.forEach((line, i) => {
    ctx.fillText(
      line,
      this.x - cameraX + 40 ,
      this.y - cameraY - 80 - (i * 12)
    );
  });

}

}