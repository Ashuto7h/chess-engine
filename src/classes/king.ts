import { cloneDeep } from 'lodash';
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
        const piece = board.state[moveX][moveY];
        if (!piece || this.isEnemyPiece(piece)) {
          const score = this.calculateMoveScore(currentPosition, movePosition, board);
          if (!this.isCheckInPosition(currentPosition, movePosition, board)) {
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
      const piece = board.state[moveX][moveY];
      if (dx === dX && dy === dY && (!piece || this.isEnemyPiece(piece))) {
        return !this.isCheckInPosition(currentPosition, movePosition, board);
      }
    }

    return false;
  }

  calculateMoveScore(currentPosition: Position, movePosition: Position, board: Board): number {
    let score = 0;
    const oppositionColor = this.color === 'white' ? 'black' : 'white';
    const targetPiece = board.state[movePosition.x][movePosition.y];
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

  public isCheckInPosition(currentPosition: Position, movePosition: Position, board: Board) {
    const updateBoard = new Board(cloneDeep(board.state), board.isAITurn);
    updateBoard.state[movePosition.x][movePosition.y] =
      updateBoard.state[currentPosition.x][currentPosition.y];
    updateBoard.state[currentPosition.x][currentPosition.y] = null;

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = updateBoard.state[i][j];
        if (piece && this.isEnemyPiece(piece)) {
          const canCapture = piece.canMoveToPosition(
            { x: i, y: j },
            { x: movePosition.x, y: movePosition.y },
            updateBoard,
          );
          if (canCapture) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
