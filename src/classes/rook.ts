import { SCORE_MAP } from '../constants/score-card';
import { Move } from '../interfaces/move';
import { Piece } from './piece';
import { Position } from '../interfaces/position';
import { Board } from './board';

export class Rook extends Piece {
  constructor(public id: string, public color: 'white' | 'black') {
    super(id, color, 'rook');
  }

  getValidMoves(currentPosition: Position, board: Board): Move[] {
    const { x: currentX, y: currentY } = currentPosition;
    const validMoves: Move[] = [];

    // Check right movement
    for (let y = currentY + 1; y < 8; y++) {
      const piece = board.state[currentX][y];
      const movePosition = { x: currentX, y };
      const score = this.calculateMoveScore(currentPosition, movePosition, board);
      if (piece) {
        if (this.isEnemyPiece(piece)) {
          validMoves.push({ currentPosition, movePosition, score });
        }
        break;
      }
      validMoves.push({ currentPosition, movePosition, score });
    }

    // check left movement
    for (let y = currentY - 1; y >= 0; y--) {
      const piece = board.state[currentX][y];
      const movePosition = { x: currentX, y };
      const score = this.calculateMoveScore(currentPosition, movePosition, board);
      if (piece) {
        if (this.isEnemyPiece(piece)) {
          validMoves.push({ currentPosition, movePosition, score });
        }
        break;
      }
      validMoves.push({ currentPosition, movePosition, score });
    }

    // Check down movement
    for (let x = currentX + 1; x < 8; x++) {
      const piece = board.state[x][currentY];
      const movePosition = { x, y: currentY };
      const score = this.calculateMoveScore(currentPosition, movePosition, board);
      if (piece) {
        if (this.isEnemyPiece(piece)) {
          validMoves.push({ currentPosition, movePosition, score });
        }
        break;
      }
      validMoves.push({ currentPosition, movePosition, score });
    }

    // check up movement
    for (let x = currentX - 1; x >= 0; x--) {
      const piece = board.state[x][currentY];
      const movePosition = { x, y: currentY };
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

  calculateMoveScore(currentPosition: Position, movePosition: Position, board: Board) {
    let score = 0;
    const oppositionColor = this.color === 'white' ? 'black' : 'white';
    const piece = board.state[movePosition.x][movePosition.y];
    const type = piece?.type;
    const oppositeKingPosition = board.getKingPosition(oppositionColor);

    if (type) {
      score += SCORE_MAP[type];
    }

    // if it can give check to king +20
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

  canMoveToPosition(currentPosition: Position, movePosition: Position, board: Board): boolean {
    const { x, y } = currentPosition;
    const { x: moveX, y: moveY } = movePosition;
    const { state } = board;

    const isHorizontalMove = x === moveX;
    const isVerticalMove = y === moveY;

    if (!((isVerticalMove && !isHorizontalMove) || (isHorizontalMove && !isVerticalMove))) {
      return false;
    }

    if (isHorizontalMove) {
      const isRightMove = moveY > y;

      for (
        let col = isRightMove ? y + 1 : y - 1;
        isRightMove ? col < moveY : col > moveY;
        col += isRightMove ? 1 : -1
      ) {
        if (state[x][col]) {
          return false;
        }
      }
    } else if (isVerticalMove) {
      const isUpwardMove = moveX < x;
      for (
        let row = isUpwardMove ? x - 1 : x + 1;
        isUpwardMove ? row > moveX : row < moveX;
        row += isUpwardMove ? -1 : 1
      ) {
        if (state[row][y]) {
          return false;
        }
      }
    }

    return true;
  }
}
