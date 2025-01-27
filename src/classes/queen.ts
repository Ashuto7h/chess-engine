import { SCORE_MAP } from '../constants/score-card';
import { PieceId } from '../enums/piece-id.enum';
import { Move } from '../interfaces/move';
import { Position } from '../interfaces/position';
import { Board } from './board';
import { Piece } from './piece';

export class Queen extends Piece {
  validMoves: Move[] = [];

  constructor(public id: PieceId, public color: 'white' | 'black') {
    super(id, color, 'queen');
  }

  getValidMoves(currentPosition: Position, board: Board): Move[] {
    const { x: currentX, y: currentY } = currentPosition;
    this.validMoves = [];

    // Check diagonally downward and to the right
    for (let x = currentX + 1, y = currentY + 1; x < 8 && y < 8; x++, y++) {
      const movePosition = { x, y };
      const piece = board.state[x][y];
      if (piece) {
        if (this.isEnemyPiece(piece)) {
          this.addValidMove(currentPosition, movePosition, board);
        }
        break;
      }
      this.addValidMove(currentPosition, movePosition, board);
    }

    // Check diagonally downward and to the left
    for (let x = currentX + 1, y = currentY - 1; x < 8 && y >= 0; x++, y--) {
      const movePosition = { x, y };
      const piece = board.state[x][y];
      if (piece) {
        if (this.isEnemyPiece(piece)) {
          this.addValidMove(currentPosition, movePosition, board);
        }
        break;
      }
      this.addValidMove(currentPosition, movePosition, board);
    }

    // Check diagonally upward and to the right
    for (let x = currentX - 1, y = currentY + 1; x >= 0 && y < 8; x--, y++) {
      const piece = board.state[x][y];
      const movePosition = { x, y };
      if (piece) {
        if (this.isEnemyPiece(piece)) {
          this.addValidMove(currentPosition, movePosition, board);
        }
        break;
      }
      this.addValidMove(currentPosition, movePosition, board);
    }

    // Check diagonally upward and to the left
    for (let x = currentX - 1, y = currentY - 1; x >= 0 && y >= 0; x--, y--) {
      const movePosition = { x, y };
      const piece = board.state[x][y];
      if (piece) {
        if (this.isEnemyPiece(piece)) {
          this.addValidMove(currentPosition, movePosition, board);
        }
        break;
      }
      this.addValidMove(currentPosition, movePosition, board);
    }
    // Check right movement
    for (let y = currentY + 1; y < 8; y++) {
      const piece = board.state[currentX][y];
      const movePosition = { x: currentX, y };
      if (piece) {
        if (this.isEnemyPiece(piece)) {
          this.addValidMove(currentPosition, movePosition, board);
        }
        break;
      }
      this.addValidMove(currentPosition, movePosition, board);
    }

    // check left movement
    for (let y = currentY - 1; y >= 0; y--) {
      const piece = board.state[currentX][y];
      const movePosition = { x: currentX, y };
      if (piece) {
        if (this.isEnemyPiece(piece)) {
          this.addValidMove(currentPosition, movePosition, board);
        }
        break;
      }
      this.addValidMove(currentPosition, movePosition, board);
    }

    // Check down movement
    for (let x = currentX + 1; x < 8; x++) {
      const piece = board.state[x][currentY];
      const movePosition = { x, y: currentY };
      if (piece) {
        if (this.isEnemyPiece(piece)) {
          this.addValidMove(currentPosition, movePosition, board);
        }
        break;
      }
      this.addValidMove(currentPosition, movePosition, board);
    }

    // check up movement
    for (let x = currentX - 1; x >= 0; x--) {
      const piece = board.state[x][currentY];
      const movePosition = { x, y: currentY };
      if (piece) {
        if (this.isEnemyPiece(piece)) {
          this.addValidMove(currentPosition, movePosition, board);
        }
        break;
      }
      this.addValidMove(currentPosition, movePosition, board);
    }

    return this.validMoves;
  }

  canMoveToPosition(currentPosition: Position, movePosition: Position, board: Board): boolean {
    if (currentPosition.x === movePosition.x) {
      const isRightMove = currentPosition.y < movePosition.y;
      for (
        let i = currentPosition.y + (isRightMove ? 1 : -1);
        isRightMove ? i < movePosition.y : i > movePosition.y;
        isRightMove ? i++ : i--
      ) {
        if (board.state[currentPosition.x][i]) {
          return false;
        }
      }
      return true;
    }

    if (currentPosition.y === movePosition.y) {
      const isUpMove = currentPosition.x < movePosition.x;
      for (
        let i = currentPosition.x + (isUpMove ? 1 : -1);
        isUpMove ? i < movePosition.x : i > movePosition.x;
        isUpMove ? i++ : i--
      ) {
        if (board.state[i][currentPosition.y]) {
          return false;
        }
      }
      return true;
    }

    const dx = Math.abs(currentPosition.x - movePosition.x);
    const dy = Math.abs(currentPosition.y - movePosition.y);
    if (dx === dy) {
      const xDirection = currentPosition.x < movePosition.x ? 1 : -1;
      const yDirection = currentPosition.y < movePosition.y ? 1 : -1;
      for (
        let x = currentPosition.x + xDirection, y = currentPosition.y + yDirection;
        x !== movePosition.x && y !== movePosition.y;
        x += xDirection, y += yDirection
      ) {
        if (board.state[x][y]) {
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
    const targetPiece = board.state[movePosition.x][movePosition.y];
    const oppositeKingPosition = board.getKingPosition(oppositionColor);

    if (targetPiece && this.isEnemyPiece(targetPiece)) {
      console.log(
        movePosition.x,
        movePosition.y,
        'capture score increased by',
        targetPiece.type,
        SCORE_MAP[targetPiece.type],
      );
      score += SCORE_MAP[targetPiece.type];
    }

    if (
      oppositeKingPosition &&
      this.canMoveToPosition(currentPosition, oppositeKingPosition, board)
    ) {
      console.log(movePosition.x, movePosition.y, 'king check increase by', 20);
      score += 20;
    }

    score -= board.getThreats(currentPosition, movePosition);
    score -= board.getNearestPieceDistance(movePosition, oppositionColor);

    return parseFloat(score.toFixed(2));
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
