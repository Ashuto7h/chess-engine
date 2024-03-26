import { Board } from "./board";
import { Move } from "../interfaces/move";
import { Position } from "../interfaces/position";

export abstract class Piece {
  constructor(
    public id: string,
    public color: "white" | "black",
    public type: "pawn" | "knight" | "bishop" | "rook" | "queen" | "king"
  ) {}
  abstract getValidMoves(currentPosition: Position, board: Board): Array<Move>;

  abstract canMoveToPosition(
    currentPosition: Position,
    movePosition: Position,
    board: Board
  ): boolean;

  abstract calculateMoveScore(
    currentPosition: Position,
    movePosition: Position,
    board: Board
  ): number;

  isEnemyPiece(piece: Piece) {
    return piece.color !== this.color;
  }
}
