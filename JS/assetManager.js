
//const ROOT = "/2D_System_Demo";

export class AssetManager {

  constructor(){

    this.images = {};
    this.animations = {};

    this.total = 0;
    this.loaded = 0;
  }

  // ---------------- IMAGENES ----------------

  loadImage(name, src){

    this.total++;

    return new Promise((resolve, reject) => {

      const img = new Image();

      img.onload = () => {

        this.loaded++;

        this.images[name] = img;

        resolve(img);
      };

      img.onerror = reject;

      img.src = `${src}`;
        //${ROOT}/
    });
  }

  // ---------------- ANIMACIONES ----------------

  async loadAnimations(
    character,
    animationNames,
    frameCount
  ){

    this.animations[character] = {};

    const promises = [];

    for(const anim of animationNames){

      this.animations[character][anim] = [];

      for(let i = 1; i <= frameCount; i++){

        this.total++;

        const promise = new Promise((resolve, reject) => {

          const img = new Image();

          img.onload = () => {

            this.loaded++;

            resolve(img);
          };

          img.onerror = reject;

          img.src =
          `${character}/${anim}/frame_${i}.png`;
          //${ROOT}/

          this.animations[character][anim]
          .push(img);

        });

        promises.push(promise);

      }

    }

    await Promise.all(promises);

  }

  // ---------------- GETTERS ----------------

  getAnimation(character, anim){

    return this.animations[character][anim];
  }

  getProgress(){

    if(this.total === 0) return 0;

    return this.loaded / this.total;
  }

}