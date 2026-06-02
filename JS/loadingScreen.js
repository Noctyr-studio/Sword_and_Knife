

export class LoadingScreen {

  constructor(assetManager){

    this.assets = assetManager;

    this.progress = 0;
    this.fade = 0;
  
    this.done = false;

    this.logo = new Image();

    this.logo.src = "./logo/clean.png";

    this.waitingForInput = false;
  }

  
  async load(){

    await new Promise(resolve => {

    if (this.logo.complete) {
      resolve();
      return;
    }

    this.logo.onload = resolve;
     });

     
    await Promise.all([


      
      // ---------------- NINJA ----------------
    

      this.assets.loadAnimations(
        "ninja",
        [
          "idle",
          "run",
          "attack",
          "die",
          "jump",
          "slide",
          "throw",
          "jump_attack",
          "jump_throw"
        ],
        10
      ),

      // ---------------- KNIGHT ----------------

      this.assets.loadAnimations(
        "knight",
        [
          "idle",
          "run",
          "attack",
          "die"
        ],
        10
      )

    ]);

    this.done = true;
  }

  update(dt){

  
    // progreso REAL
    this.progress = this.assets.getProgress();

    // fade suave
    this.fade += dt * 2;  

    if(this.fade > 1){
      this.fade = 1;
    }
  }

  draw(ctx, width, height){

    // fondo
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    ctx.save();

    ctx.globalAlpha = this.fade;

    // ---------------- LOGO ----------------

    const logoSize = 200;

    ctx.drawImage(
      this.logo,
      width/2 - logoSize/2,
      height/2 - 200,
      logoSize,
      logoSize
    );

    // ---------------- FIRMA ----------------

    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "22px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
      "Noctyr Studio",
      width / 2,
      height / 2 + 30
    );


    // ---------------- BARRA ----------------

    const barWidth = 300;
    const barHeight = 30;

    const x = width/2 - barWidth/2;
    const y = height/2 + 50;

    // fondo barra
    ctx.fillStyle = "#222";

    ctx.fillRect(
      x,
      y,
      barWidth,
      barHeight
    );

    // progreso
    ctx.fillStyle = "purple";

    ctx.fillRect(
      x,
      y,
      barWidth * this.progress,
      barHeight
    );

    ctx.restore();


    // ---------------- TEXTO ----------------

    const percent =
    Math.floor(this.progress * 100);

    if (!this.waitingForInput) {

      ctx.fillStyle = "white";
      ctx.font = "18px Arial";
      ctx.textAlign = "center";

      ctx.fillText(
       `Loading... ${percent}%`,
        width / 2,
        height / 2 + 70
      );

    } else {

      const alpha =
      0.5 + Math.sin(performance.now() * 0.003) * 0.5;

      ctx.save();

      ctx.globalAlpha = alpha;

      ctx.fillStyle = "white";
      ctx.font = "18px Arial";
      ctx.textAlign = "center";

      ctx.fillText(
        "Press ENTER",
        width / 2,
        height / 2 + 70
      );

      ctx.globalAlpha = 1;

      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "20px monospace";
      ctx.textAlign = "center";

      ctx.fillText(
        "Sword & Knife - v0.1.0",
        width / 2,
        height - 150
      );

      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "20px monospace";
      ctx.textAlign = "center";

      ctx.fillText(
        "Movement = Arrow keys",
        width / 2,
        height - 100
      );
       ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "20px monospace";
      ctx.textAlign = "center";

      ctx.fillText(
        "Attack = D " ,
        width / 2,
        height - 70
        
      );
      ctx.fillText(
       "Throw = F",
        width / 2,
        height - 40
      );

      ctx.restore();
      
    }
  }

  isDone(){
    return this.done;
  }

}