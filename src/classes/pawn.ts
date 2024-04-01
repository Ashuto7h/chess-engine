import { SCORE_MAP } from '../constants/score-card';
import { PieceId } from '../enums/piece-id.enum';
import { Move } from '../interfaces/move';
import { Position } from '../interfaces/position';
import { Board } from './board';
import { Piece } from './piece';

export class Pawn extends Piece {
  validMoves: Move[] = [];

  constructor(id: PieceId, color: 'white' | 'black') {
    super(id, color, 'pawn');
  }

  getValidMoves(currentPosition: Position, board: Board): Move[] {
    this.validMoves = [];
    const { x: currentX, y: currentY } = currentPosition;
    // Check if pawn can move one step forward
    if ((this.color === 'black' && currentX !== 7) || (this.color === 'white' && currentX !== 0)) {
      const moveX = currentX + (this.color === 'white' ? -1 : 1);
      const oneStepForwardPosition = { x: moveX, y: currentY };

      if (!board.state[oneStepForwardPosition.x][oneStepForwardPosition.y]) {
        this.addValidMove(currentPosition, oneStepForwardPosition, board);
      }
    }
    // Check if pawn can move two steps forward
    if (
      currentX === (this.color === 'white' ? 6 : 1) &&
      !board.state[currentX + (this.color === 'white' ? -1 : 1)][currentY]
    ) {
      const twoStepsForwardPosition = {
        x: currentX + (this.color === 'white' ? -2 : 2),
        y: currentY,
      };

      if (!board.state[twoStepsForwardPosition.x][twoStepsForwardPosition.y]) {
        this.addValidMove(currentPosition, twoStepsForwardPosition, board);
      }
    }

    // Check if pawn can capture diagonally
    let diagonalsToCheck: Position[] = [];
    if (this.color === 'white' && currentX > 0) {
      diagonalsToCheck = [
        { x: currentX - 1, y: currentY - 1 },
        { x: currentX - 1, y: currentY + 1 },
      ];
    }
    if (this.color === 'black' && currentX < 7) {
      diagonalsToCheck = [
        { x: currentX + 1, y: currentY - 1 },
        { x: currentX + 1, y: currentY + 1 },
      ];
    }

    diagonalsToCheck.forEach((movePosition) => {
      if (movePosition.y === 8 || movePosition.y === -1) {
        return;
      }
      const piece = board.state[movePosition.x][movePosition.y];
      console.log(piece, piece ? this.isEnemyPiece(piece) : false);
      if (piece && this.isEnemyPiece(piece)) {
        this.addValidMove(currentPosition, movePosition, board);
      }
    });

    return this.validMoves;
  }

  canMoveToPosition(currentPosition: Position, movePosition: Position, board: Board): boolean {
    const { x: currentX, y: currentY } = currentPosition;
    const { x: moveX, y: moveY } = movePosition;
    const piece = board.state[moveX][moveY];

    if (moveY === currentY && Math.abs(moveY - currentY) === 1) {
      return !piece;
    }

    if (
      Math.abs(moveY - currentY) === 1 &&
      piece &&
      this.isEnemyPiece(piece) &&
      ((this.color === 'white' && moveX - currentX === -1) ||
        (this.color === 'black' && moveX - currentX === 1))
    ) {
      return !board.isCheckOnMove(currentPosition, movePosition, board);
    }

    return false;
  }

  calculateMoveScore(currentPosition: Position, movePosition: Position, board: Board): number {
    let score = 0;
    const oppositionColor = this.color === 'white' ? 'black' : 'white';
    const piece = board.state[movePosition.x][movePosition.y];
    const type = piece?.type;
    const oppositeKingPosition = board.getKingPosition(oppositionColor);

    if (type) {
      score += SCORE_MAP[type];
    }

    // if it can give check to king +20
    if (oppositeKingPosition && this.canMoveToPosition(movePosition, oppositeKingPosition, board)) {
      score += 20;
    }

    const threats = board.getThreats(currentPosition, movePosition);
    score -= threats;
    score -= board.getNearestPieceDistance(movePosition, oppositionColor);

    if (this.isPromotable(movePosition.x)) {
      score += 20;
    }
    return parseFloat(score.toPrecision(2));
  }

  isPromotable(moveX: number) {
    if ((this.color === 'white' && moveX === 0) || (this.color === 'black' && moveX === 7)) {
      return true;
    }
    return false;
  }

  private addValidMove(currentPosition: Position, movePosition: Position, board: Board) {
    if (!board.isCheckOnMove(currentPosition, movePosition, board)) {
      this.validMoves.push({
        currentPosition,
        movePosition: movePosition,
        score: this.calculateMoveScore(currentPosition, movePosition, board),
      });
    }
  }
}
