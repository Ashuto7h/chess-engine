import { SCORE_MAP } from '../constants/score-card';
import { PieceId } from '../enums/piece-id.enum';
import { Move } from '../interfaces/move';
import { Position } from '../interfaces/position';
import { Board } from './board';
import { Piece } from './piece';

export class Knight extends Piece {
  constructor(public id: PieceId, public color: 'white' | 'black') {
    super(id, color, 'knight');
  }

  getValidMoves(currentPosition: Position, board: Board): Move[] {
    const { x: currentX, y: currentY } = currentPosition;
    const validMoves: Move[] = [];

    const movements: Array<[number, number]> = [
      [1, 2],
      [1, -2],
      [2, 1],
      [2, -1],
      [-1, 2],
      [-1, -2],
      [-2, 1],
      [-2, -1],
    ];

    movements.forEach((move) => {
      const x = currentX + move[0];
      const y = currentY + move[1];
      if (x >= 0 && x < 8 && y >= 0 && y < 8) {
        const piece = board.state[x][y];
        const movePosition = { x, y };
        console.log(piece?.id, piece?.color, this.color);
        if (!piece || piece.color !== this.color) {
          validMoves.push({
            currentPosition,
            movePosition,
            score: this.calculateMoveScore(currentPosition, movePosition, board),
          });
        }
      }
    });

    return validMoves;
  }
  canMoveToPosition(currentPosition: Position, movePosition: Position, board: Board): boolean {
    const { x: currentX, y: currentY } = currentPosition;
    const { x: moveX, y: moveY } = movePosition;

    const dx = Math.abs(moveX - currentX);
    const dy = Math.abs(moveY - currentY);
    const piece = board.state[moveX][moveY];
    return (
      ((dx === 2 && dy === 1) || (dx === 1 && dy === 2)) && (!piece || this.isEnemyPiece(piece))
    );
  }

  calculateMoveScore(currentPosition: Position, movePosition: Position, board: Board): number {
    const { x: moveX, y: moveY } = movePosition;
    const targetPiece = board.state[moveX][moveY];
    const oppositeKingPosition = board.getKingPosition(this.color === 'white' ? 'black' : 'white');
    let score = 0;

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
    score -= board.getNearestPieceDistance(
      movePosition,
      this.color === 'black' ? 'white' : 'black',
    );

    return parseFloat(score.toFixed(2));
  }
}
