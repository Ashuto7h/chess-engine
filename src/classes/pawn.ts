import { SCORE_MAP } from '../constants/score-card';
import { Move } from '../interfaces/move';
import { Position } from '../interfaces/position';
import { Board } from './board';
import { Piece } from './piece';

export class Pawn extends Piece {
  i = 0;
  constructor(id: string, color: 'white' | 'black') {
    super(id, color, 'pawn');
  }

  getValidMoves(currentPosition: Position, board: Board): Move[] {
    const { x: currentX, y: currentY } = currentPosition;
    const validMoves: Move[] = [];

    // Check if pawn can move one step forward
    const moveX = currentX + (this.color === 'white' ? -1 : 1);
    const oneStepForwardPosition = { x: moveX, y: currentY };

    if (!board.state[oneStepForwardPosition.x][oneStepForwardPosition.y].piece) {
      validMoves.push({
        currentPosition,
        movePosition: oneStepForwardPosition,
        score: this.calculateMoveScore(currentPosition, oneStepForwardPosition, board),
      });
    }

    // Check if pawn can move two steps forward
    if (
      currentX === (this.color === 'white' ? 6 : 1) &&
      !board.state[currentX + (this.color === 'white' ? -1 : 1)][currentY].piece
    ) {
      const twoStepsForwardPosition = {
        x: currentX + (this.color === 'white' ? -2 : 2),
        y: currentY,
      };

      if (!board.state[twoStepsForwardPosition.x][twoStepsForwardPosition.y].piece) {
        validMoves.push({
          currentPosition,
          movePosition: twoStepsForwardPosition,
          score: this.calculateMoveScore(currentPosition, twoStepsForwardPosition, board),
        });
      }
    }

    // Check if pawn can capture diagonally
    const diagonalsToCheck =
      this.color === 'white'
        ? [
            { x: currentX - 1, y: currentY - 1 },
            { x: currentX - 1, y: currentY + 1 },
          ]
        : [
            { x: currentX + 1, y: currentY - 1 },
            { x: currentX + 1, y: currentY + 1 },
          ];

    diagonalsToCheck.forEach((movePosition) => {
      if (movePosition.y === 8 || movePosition.y === -1) {
        return;
      }
      const piece = board.state[movePosition.x][movePosition.y].piece;
      if (piece && this.isEnemyPiece(piece)) {
        validMoves.push({
          currentPosition,
          movePosition,
          score: this.calculateMoveScore(currentPosition, movePosition, board),
        });
      }
    });

    return validMoves;
  }

  private isPromotable(x: number) {
    if ((this.color === 'white' && x === 7) || (this.color === 'black' && x === 0)) {
      return true;
    }
    return false;
  }

  canMoveToPosition(currentPosition: Position, movePosition: Position, board: Board): boolean {
    const { x: currentX, y: currentY } = currentPosition;
    const { x: moveX, y: moveY } = movePosition;
    const piece = board.state[moveX][moveY].piece;
    if (moveY === currentY) {
      return !piece;
    } else {
      if (
        Math.abs(moveY - currentY) === 1 &&
        piece &&
        this.isEnemyPiece(piece) &&
        ((this.color === 'white' && moveX - currentX === -1) ||
          (this.color === 'black' && moveX - currentX === 1))
      ) {
        return true;
      }
    }
    return false;
  }

  calculateMoveScore(currentPosition: Position, movePosition: Position, board: Board): number {
    let score = 0;
    const oppositionColor = this.color === 'white' ? 'black' : 'white';
    const cell = board.state[movePosition.x][movePosition.y];
    const type = cell.piece?.type;
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
}
