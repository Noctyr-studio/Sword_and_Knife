
import { Entity } from "./entity.js";


export class Player extends Entity {

constructor(x, y){
  super(x, y, 80, 120, {

    hp: 80,
    maxHp: 100,
    energy: 40,
    maxEnergy: 100,
    coins: 43
  });

   this.actionLocked = false;

   this.attackDamage = 20;

    this.attackBox = {
      x: this.x,
      y: this.y,
      w: 90,
      h: 80,
      damage: this.attackDamage
    };

    this.showAttackBox = true;

    this.hitDone = false;

    this.attackData = {
    hitStart: 0.4,
    hitEnd: 0.5
    };

    this.lastThrowPressed = false;

    this.velocityY = 0;
    this.jumping = false;

    this.spriteScale = 1;
    this.spriteOffsetY = 0;

    this.facing = 1;
    this.attacking = false;

   this.loadAnimations(
    "ninja",
    ["idle","run","jump","attack","throw","jump_attack","jump_throw","die"],
    10
  );

    this.state = "idle";

    this.setAnimationSettings("idle", { scaleX: 0.8, scaleY: 1 });
    this.setAnimationSettings("run", { scaleX: 1.1, scaleY: 1.05 });
    this.setAnimationSettings("attack", { scaleX: 1.55, scaleY: 1.2, offsetX: 20 });
    this.setAnimationSettings("jump_attack", { scaleX: 1.55, scaleY: 1.2, offsetX: 20, offsetY: 5 });
    this.setAnimationSettings("jump", { scaleX: 1.1, scaleY: 1.1 });
    this.setAnimationSettings("throw", { scaleX: 1.2, scaleY: 1 });
    this.setAnimationSettings("die", { scaleX: 1.55, scaleY: 1.1 });
}


update(keys, platforms, dt, scene) {

  if (this.stats.coins == 44){

     scene.gameDone = true;
   
  }
  else if(this.dying){

  super.update(dt);

  const frames = this.animations["die"];

  const finished =
    this.frameIndex === frames.length - 1;

  if(finished){; 
    //this.alive = false;
    scene.gameOver = true
   
  }

  return;
}

  if(this.attacking){

  this.updateAttack(dt);

  for(const enemy of scene.enemies){
    this.tryHit(enemy);
  }

}
  if(this.actionLocked){
  this.attackTimer += dt;
}

  // ================= HITBOX =================
  this.attackBox.x =
  this.facing === 1
    ? this.x + this.w - 10
    : this.x - this.attackBox.w + 10;

  this.attackBox.y = this.y + 20;

  // ================= INPUT =================
  const attackPressed = keys["d"];
  const throwPressed = keys["f"];
  const throwJustPressed = throwPressed && !this.lastThrowPressed;

  // ================= MOVIMIENTO HORIZONTAL =================
  let dx = 0;
  const speed = 400;

  if (!this.attacking && !this.actionLocked)  {
    if (keys["arrowleft"]) {
      dx = -speed * dt;
      this.facing = -1;
    }
    if (keys["arrowright"]) {
      dx = speed * dt;
      this.facing = 1;
    }
  }

  this.x += dx;

  // colisión horizontal
  for (let p of platforms) {
    if (this.isColliding(p)) {
      if (dx > 0) this.x = p.x - this.w;
      if (dx < 0) this.x = p.x + p.w;
    }
  }

  // ================= GRAVEDAD =================
  const gravity = 900;
  this.velocityY += gravity * dt;
  let nextY = this.y + this.velocityY * dt;

  // ================= COLISIÓN SUELO =================
  this.onGround = false;
  for (let p of platforms) {
    const playerBottom = nextY + this.h;
    const playerTop = nextY;
    const platformTop = p.y;
    const platformBottom = p.y + p.h;
    const horizontalOverlap =
      this.x + this.w > p.x && this.x < p.x + p.w;

    if (horizontalOverlap) {
      // aterrizaje
      if (this.velocityY > 0 && this.y + this.h <= platformTop && playerBottom >= platformTop) {
        nextY = platformTop - this.h;
        this.velocityY = 0;
        this.jumping = false;
        this.onGround = true;
      }
      // colisión techo
      if (this.velocityY < 0 && this.y >= platformBottom && playerTop <= platformBottom) {
        nextY = platformBottom;
        this.velocityY = 0;
      }
    }
  }
  this.y = nextY;

  // ================= SALTO =================
  if (!this.jumping && keys["arrowup"] && !this.attacking) {
    this.jumping = true;
    this.velocityY = -600;
    this.onGround = false;
  }

  // ================= INICIAR ACCIONES =================
  if (!this.attacking && !this.actionLocked)  {
    if (attackPressed && this.attackCooldown <= 0)  {

      this.startAttack();

      this.play(
        this.jumping ? "jump_attack" : "attack",
        false
      );

    }
   else if (throwJustPressed && this.attackCooldown <= 0) {

      this.actionLocked = true;

      this.attackTimer = 0;

      this.play(
        this.jumping ? "jump_throw" : "throw",
        false
      );

      const spawnX =
        this.facing === 1
          ? this.x + this.w
          : this.x - 20;

      const spawnY =
        this.y + this.h * 0.45;
      
      scene.spawnKunai(
        spawnX,
        spawnY,
        this.facing
      );
    }
  }

  // ================= ACTUALIZAR ACCIONES =================
  if (this.attacking || this.actionLocked) {
    const frames = this.animations[this.currentAnimation];
    const isLastFrame = frames && this.frameIndex === frames.length - 1;

    if (isLastFrame) {
      if (attackPressed) {
        if (this.currentAnimation !== (this.jumping ? "jump_attack" : "attack")) {
          this.play(this.jumping ? "jump_attack" : "attack", false);
        }
      } 
      else if (throwJustPressed ) {
        if (this.currentAnimation !== (this.jumping ? "jump_throw" : "throw")) {
          this.play(this.jumping ? "jump_throw" : "throw", false);

         
        }
      } 
      else {
        this.attacking = false;
        if (!this.onGround) this.play("jump");
        else this.play("idle");
      }
       this.actionLocked = false;
       this.attackTimer = 0;
    }
    
  }

  // ================= ANIMACIONES BASE =================
  if (!this.attacking && !this.actionLocked) {

    let nextAnim = "idle";

    if (!this.onGround) nextAnim = "jump";
    else if (keys["arrowleft"] || keys["arrowright"]) nextAnim = "run";

    this.play(nextAnim);
  }

  this.lastThrowPressed = throwPressed;
  
  // ================= UPDATE ENTITY =================
  super.update(dt);
}

// ================= DIBUJO =================



  draw(ctx, cameraX, cameraY){
    super.draw(ctx, cameraX, cameraY);

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
        this.y - cameraY - 40 - (i * 12)
      );
    });
    // Opcional: debug adicional
    // ctx.strokeStyle = "lime";
    // ctx.strokeRect(this.x - cameraX, this.y - cameraY, this.w, this.h);
  }
}