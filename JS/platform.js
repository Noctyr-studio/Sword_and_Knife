

import { Entity } from "./entity.js";


export class Platform extends Entity {

  draw(ctx, cameraX, cameraY){

  ctx.fillStyle = "#6e6259";
  ctx.fillRect(this.x-cameraX, this.y-cameraY, this.w, this.h);

  ctx.strokeStyle = "#4a4039";
  ctx.strokeRect(this.x-cameraX, this.y-cameraY, this.w, this.h);

  }

}
