import { Piece } from "./piece";

export class Cell {
  constructor(public x: number, public y: number, public piece: Piece | null) {}

  get isWhite() {
    return !!((this.x + this.y) % 2);
  }
}
