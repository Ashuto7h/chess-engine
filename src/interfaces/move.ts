import { Position } from "./position";

export interface Move {
  currentPosition: Position;
  movePosition: Position;
  score: number;
}
