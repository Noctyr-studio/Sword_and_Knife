

export class Entity {
  constructor(x, y, w, h, stats = null){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    // stats
    const defaultStats = { hp:100, maxHp:100, energy:50, maxEnergy:50, coins:0 };
    this.stats = {...defaultStats, ...stats};
    
    this.alive = true;

    this.dying = false;

    // ataque por tiempo (PRO)
    this.attacking = false;
    this.attackTimer = 0;

    this.attackData = {
      hitStart: 0.5,
      hitEnd: 0.6
    };

    this.hitDone = false;

    this.attackCooldown = 0;
    this.attackCooldownTime = 0.8; // ajustá a gusto
  
    this.showAttackBox = false;

    // animaciones
    this.animations = {};
    this.animationSettings = {};
    this.currentAnimation = "idle";
    this.spriteScale = 1;
    this.facing = 1;
    this.frameIndex = 0;
    this.frameCounter = 0;
    
    this.loop = true; // default
    this.animFPS = 16;  // default

    this.showHealthBar = false;

    // ataque
    this.attackBoxOffset = { x: 40, y: 0 , w: 40, h: 120, damage: 30 }; // default frontal
    this.attackBox = null;
  }

  // ------------------ HITBOX / ATAQUE ------------------
  isColliding(other){
    return this.x < other.x + other.w &&
           this.x + this.w > other.x &&
           this.y < other.y + other.h &&
           this.y + this.h > other.y;
  }


  update(dt){

  this.updateAnimation(dt);

  // 🔥 SIEMPRE actualizar para debug visual
  this.updateAttackBox();

  if(this.attackCooldown > 0){
    this.attackCooldown -= dt;
  }
}

  // calcular attackBox automático según facing y posición actual
  updateAttackBox(){

  const w = this.attackBoxOffset.w;
  const h = this.attackBoxOffset.h;

  const centerX = this.x + this.w/2;

  let attackX = centerX + this.attackBoxOffset.x * this.facing 
                - (this.facing < 0 ? w : 0);

  this.attackBox = {
    x: attackX,
    y: this.y + this.attackBoxOffset.y,
    w: w,
    h: h,
    damage: this.attackBoxOffset.damage
  };
}
  

  checkHit(target){
    if(!this.attackBox || !target.alive) return false;
    const a = this.attackBox;
    const b = target; // target usa x,y,w,h como hitbox de daño
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  }

  startAttack(){
  this.attacking = true;
  this.attackTimer = 0;
  this.hitDone = false;

  this.play("attack", false);

  const frames = this.animations["attack"].length;
  this.attackDuration = frames / this.animFPS;

  // 🔥 activar cooldown
  this.attackCooldown = this.attackCooldownTime;
}

  updateAttack(dt){

  if(!this.attacking) return;

  this.attackTimer += dt;

  this.updateAttackBox();

  const { hitStart, hitEnd } = this.attackData;

  this.attackBoxActive =
    this.attackTimer >= hitStart &&
    this.attackTimer <= hitEnd;

  if(this.attackTimer >= this.attackDuration){
    this.attacking = false;
    this.attackBoxActive = false;
  }
  }

  tryHit(target){

  if(this.hitDone) return;

  if(!this.attackBoxActive) return;

  if(this.dealDamage(target)){
    this.hitDone = true;
  }
  }

  dealDamage(target){

  if(this.checkHit(target)){

    target.stats.hp -= this.attackBox.damage;

    // clamp
    target.stats.hp = Math.max(target.stats.hp, 0);

    if(target.stats.hp === 0){
      target.die();
    }

    return true;
  }

  return false;
}

  heal(amount){
  this.stats.hp += amount;

  if(this.stats.hp > 0){
    this.alive = true; // 🔥 revive automáticamente
  }

  this.stats.hp = Math.min(this.stats.hp, this.stats.maxHp);
 }

die(){

  if(this.dying) return;

  this.dying = true;

  this.attacking = false;

  this.actionLocked = false;

  this.velocityY = 0;
  this.velocityX = 0;

  this.play("die", false);

}
  // ------------------ ANIMACIONES ------------------
  loadAnimations(baseFolder, animationNames, frameCount){
  for(let anim of animationNames){
    this.animations[anim] = [];
    for(let i=1; i<=frameCount; i++){
      const img = new Image();
      img.src = `./${baseFolder}/${anim}/frame_${i}.png`;
      this.animations[anim].push(img);
    }
  }
  // si existe la animación “idle” usarla como inicial
  this.currentAnimation = this.animations["idle"] ? "idle" : animationNames[0];
}

  setAnimationSettings(anim, settings){
    this.animationSettings[anim] = {
      scaleX: settings.scaleX ?? 1,
      scaleY: settings.scaleY ?? 1,
      offsetX: settings.offsetX ?? 0,
      offsetY: settings.offsetY ?? 0
    };
  }

  play(name, loop = true){
 
  if(this.currentAnimation !== name){
    this.currentAnimation = name;
    this.frameIndex = 0;
    this.frameCounter = 0;
    this.loop = loop;
  }
}

updateAnimation(dt){

  if(!this.currentAnimation) return;

  const frames = this.animations[this.currentAnimation];
  if(!frames || frames.length === 0) return;

  this.frameCounter += dt;

  const frameTime = 1 / this.animFPS;

  // 🔥 AVANZA TODOS LOS FRAMES NECESARIOS
  while(this.frameCounter >= frameTime){

    this.frameCounter -= frameTime;
    this.frameIndex++;

    if(this.frameIndex >= frames.length){

      if(this.loop){
        this.frameIndex = 0;
      } else {
        this.frameIndex = frames.length - 1;
        break; // 🔥 importante: frena el loop
      }

    }
  }
}

  

  // ------------------ DIBUJO ------------------
draw(ctx, cameraX, cameraY){
  const drawX = this.x - cameraX;
  const drawY = this.y - cameraY;

  // ================= SPRITE =================
  const frames = this.animations[this.currentAnimation];

  if(frames && frames.length > 0){

    const img = frames[this.frameIndex];
    const settings = this.animationSettings?.[this.currentAnimation] || {};

    const scaleX = settings.scaleX ?? this.spriteScale;
    const scaleY = settings.scaleY ?? this.spriteScale;

    const renderW = this.w * scaleX;
    const renderH = this.h * scaleY;

    ctx.save();

    // centrar
    ctx.translate(drawX + this.w/2, drawY + this.h/2);

    // flip horizontal
    ctx.scale(this.facing, 1);

    ctx.drawImage(
      img,
      -renderW/2,
      -renderH/2,
      renderW,
      renderH
    );

    ctx.restore();
  }

  // ================= HP BAR =================
  if(this.showHealthBar && this.stats){
    this.drawHealthBar(ctx, cameraX, cameraY);
  }

  // ================= DEBUG =================

  //  HITBOX CUERPO
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.strokeRect(drawX, drawY, this.w, this.h);

  //  HITBOX ATAQUE
  if(this.showAttackBox && this.attackBox){
    ctx.strokeStyle = "cyan";
    ctx.setLineDash([4,3]);

    ctx.strokeRect(
      this.attackBox.x - cameraX,
      this.attackBox.y - cameraY,
      this.attackBox.w,
      this.attackBox.h
    );

    ctx.setLineDash([]);
  }
}

  drawHealthBar(ctx, cameraX, cameraY){
    const barWidth = this.w;
    const barHeight = 12;
    const drawX = this.x - cameraX + (this.w - barWidth)/2;
    const drawY = this.y - cameraY - 70;
    ctx.fillStyle = "black";
    ctx.fillRect(drawX, drawY, barWidth, barHeight);
    ctx.fillStyle = "red";
    ctx.fillRect(drawX, drawY, (this.stats.hp / this.stats.maxHp) * barWidth, barHeight);
  }
}