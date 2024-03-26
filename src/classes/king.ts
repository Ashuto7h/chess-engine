import { SCORE_MAP } from '../constants/score-card';
import { Move } from '../interfaces/move';
import { Position } from '../interfaces/position';
import { Board } from './board';
import { Piece } from './piece';

export class King extends Piece {
  constructor(id: string, color: 'white' | 'black') {
    super(id, color, 'king');
  }

  getValidMoves(currentPosition: Position, board: Board): Move[] {
    const { x: currentX, y: currentY } = currentPosition;
    const validMoves: Move[] = [];

    const moves: Array<[number, number]> = [
      [1, 0], // right
      [-1, 0], // left
      [0, 1], // down
      [0, -1], // up
      [1, 1], // right-down
      [-1, 1], // left-down
      [1, -1], // right-up
      [-1, -1], // left-up
    ];

    for (const [dx, dy] of moves) {
      const moveX = currentX + dx;
      const moveY = currentY + dy;
      if (moveX >= 0 && moveX < 8 && moveY >= 0 && moveY < 8) {
        const movePosition = { x: moveX, y: moveY };
        const piece = board.state[moveX][moveY].piece;
        if (!piece || this.isEnemyPiece(piece)) {
          const score = this.calculateMoveScore(currentPosition, movePosition, board);
          console.log('ischeck in position 2');

          if (!this.isCheckInPosition(movePosition, board)) {
            validMoves.push({ currentPosition, movePosition, score });
          }
        }
      }
    }

    return validMoves;
  }
  canMoveToPosition(currentPosition: Position, movePosition: Position, board: Board): boolean {
    const { x: currentX, y: currentY } = currentPosition;
    const { x: moveX, y: moveY } = movePosition;

    const dx = moveX - currentX;
    const dy = moveY - currentY;

    const moves: Array<[number, number]> = [
      [1, 0], // right
      [-1, 0], // left
      [0, 1], // down
      [0, -1], // up
      [1, 1], // right-down
      [-1, 1], // left-down
      [1, -1], // right-up
      [-1, -1], // left-up
    ];

    for (const [dX, dY] of moves) {
      const piece = board.state[moveX][moveY].piece;
      if (moveX === 6 && moveY === 2)
        console.log(
          dx,
          dy,
          dX,
          dY,
          moveX,
          moveY,
          !piece,
          piece ? this.isEnemyPiece(piece) : false,
          piece,
        );
      if (dx === dX && dy === dY && (!piece || this.isEnemyPiece(piece))) {
        console.log('ischeck in position 1');
        return !this.isCheckInPosition(movePosition, board);
      }
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

  private isCheckInPosition(position: Position, board: Board) {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board.state[i][j].piece;
        if (piece && this.isEnemyPiece(piece)) {
          console.log('from', { x: i, y: j }, 'to', { x: position.x, y: position.y });
          if (piece.canMoveToPosition({ x: i, y: j }, { x: position.x, y: position.y }, board)) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
