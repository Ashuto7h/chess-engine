import { Move } from '../interfaces/move';
import { Piece } from './piece';
import { Position } from '../interfaces/position';
import { Board } from './board';
import { SCORE_MAP } from '../constants/score-card';

export class Bishop extends Piece {
  constructor(public id: string, public color: 'white' | 'black') {
    super(id, color, 'bishop');
  }

  getValidMoves(currentPosition: Position, board: Board): Move[] {
    const { x: currentX, y: currentY } = currentPosition;
    const validMoves: Move[] = [];

    console.log('getting downright');
    // Check diagonally downward and to the right
    for (let x = currentX + 1, y = currentY + 1; x < 8 && y < 8; x++, y++) {
      const movePosition = { x, y };
      console.log({ movePosition });
      const piece = board.state[x][y].piece;
      const score = this.calculateMoveScore(currentPosition, movePosition, board);
      if (piece) {
        if (this.isEnemyPiece(piece)) {
          validMoves.push({ currentPosition, movePosition, score });
        }
        break;
      }
      validMoves.push({ currentPosition, movePosition, score });
    }

    console.log('getting downleft');
    // Check diagonally downward and to the left
    for (let x = currentX + 1, y = currentY - 1; x < 8 && y >= 0; x++, y--) {
      const movePosition = { x, y };
      const piece = board.state[x][y].piece;
      const score = this.calculateMoveScore(currentPosition, movePosition, board);
      if (piece) {
        if (this.isEnemyPiece(piece)) {
          validMoves.push({ currentPosition, movePosition, score });
        }
        break;
      }
      validMoves.push({ currentPosition, movePosition, score });
    }
    console.log('getting upright');

    // Check diagonally upward and to the right
    for (let x = currentX - 1, y = currentY + 1; x >= 0 && y < 8; x--, y++) {
      const piece = board.state[x][y].piece;
      const movePosition = { x, y };
      const score = this.calculateMoveScore(currentPosition, movePosition, board);
      if (piece) {
        if (this.isEnemyPiece(piece)) {
          validMoves.push({ currentPosition, movePosition, score });
        }
        break;
      }
      validMoves.push({ currentPosition, movePosition, score });
    }
    console.log('getting upleft');

    // Check diagonally upward and to the left
    for (let x = currentX - 1, y = currentY - 1; x >= 0 && y >= 0; x--, y--) {
      const movePosition = { x, y };
      const piece = board.state[x][y].piece;
      const score = this.calculateMoveScore(currentPosition, movePosition, board);
      if (piece) {
        if (this.isEnemyPiece(piece)) {
          validMoves.push({ currentPosition, movePosition, score });
        }
        break;
      }
      validMoves.push({ currentPosition, movePosition, score });
    }

    return validMoves;
  }

  canMoveToPosition(currentPosition: Position, movePosition: Position, board: Board): boolean {
    const { x: currentX, y: currentY } = currentPosition;
    const { x: moveX, y: moveY } = movePosition;
    const xDiff = Math.abs(currentX - moveX);
    const yDiff = Math.abs(currentY - moveY);

    if (xDiff === yDiff && xDiff !== 0 && yDiff !== 0) {
      const xDirection = currentX < moveX ? 1 : -1;
      const yDirection = currentY < moveY ? 1 : -1;

      for (
        let x = currentX + xDirection, y = currentY + yDirection;
        x !== moveX && y !== moveY;
        x += xDirection, y += yDirection
      ) {
        console.log({ x, y, moveX, moveY, xDirection, yDirection, currentX, currentY });
        if (board.state[x][y].piece) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  calculateMoveScore(currentPosition: Position, movePosition: Position, board: Board): number {
    let score = 0;
    const oppositionColor = this.color === 'white' ? 'black' : 'white';
    const targetPiece = board.state[movePosition.x][movePosition.y].piece;
    const oppositeKingPosition = board.getKingPosition(oppositionColor);

    if (targetPiece) {
      score += SCORE_MAP[targetPiece.type];
    }

    console.log({ oppositeKingPosition });
    if (
      oppositeKingPosition &&
      this.canMoveToPosition(currentPosition, oppositeKingPosition, board)
    ) {
      score += 20;
    }

    score -= board.getThreats(currentPosition, movePosition);
    score -= board.getNearestPieceDistance(movePosition, oppositionColor);
    return parseFloat(score.toFixed(2));
  }
}
