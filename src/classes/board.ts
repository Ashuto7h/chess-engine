import { cloneDeep } from 'lodash';
import { INITIAL_PIECE_MAP } from '../constants/piece-map';
import { SCORE_MAP } from '../constants/score-card';
import { Move } from '../interfaces/move';
import { Position } from '../interfaces/position';
import { Cell } from './cell';
export class Board {
  state: Cell[][];

  threatsMap: number[][][][];
  kingPosition: { white: Position | undefined; black: Position | undefined };

  constructor(state?: Cell[][], public isAITurn = false) {
    this.state = state ?? this.initBoard();
    this.threatsMap = this.initThreatsMap();
    this.kingPosition = { white: { x: 7, y: 3 }, black: { x: 0, y: 4 } };
  }

  private initThreatsMap = () =>
    Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () =>
        Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => Infinity)),
      ),
    );
  private initBoard() {
    const cells: Cell[][] = [[]];

    for (let i = 0; i < 8; i++) {
      cells[i] = [];
      for (let j = 0; j < 8; j++) {
        cells[i].push(new Cell(i, j, INITIAL_PIECE_MAP[i][j]));
      }
    }

    return cells;
  }

  getKingPosition(color: 'black' | 'white') {
    if (this.kingPosition[color]) {
      return this.kingPosition[color];
    }

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.state[i][j].piece?.type === 'king' && this.state[i][j].piece?.color === color) {
          this.kingPosition[color] = { x: i, y: j };
          return { x: i, y: j };
        }
      }
    }
  }

  getThreats(currentPosition: Position, movePosition: Position): number {
    if (
      this.threatsMap[currentPosition.x][currentPosition.y][movePosition.x][movePosition.y] !==
      Infinity
    ) {
      return this.threatsMap[currentPosition.x][currentPosition.y][movePosition.x][movePosition.y];
    }

    const newBoard = new Board(cloneDeep(this.state), this.isAITurn);
    const piece = newBoard.state[currentPosition.x][currentPosition.y].piece;
    let threats = 0;
    if (!piece) {
      return threats;
    }
    newBoard.state[movePosition.x][movePosition.y].piece = piece;
    newBoard.state[currentPosition.x][currentPosition.y].piece = null;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const enemyPiece = newBoard.state[i][j].piece;
        // check if it is enemyPiece
        if (enemyPiece && piece.color !== enemyPiece.color) {
          for (let k = 0; k < 8; k++) {
            for (let l = 0; l < 8; l++) {
              const ourPiece = newBoard.state[k][l].piece;
              //
              if (ourPiece) {
                if (piece.color !== ourPiece.color) {
                  continue;
                }
                const canCapture = enemyPiece.canMoveToPosition(
                  { x: i, y: j },
                  { x: k, y: l },
                  newBoard,
                );

                if (canCapture) {
                  threats += SCORE_MAP[ourPiece.type] + 10;
                }
              }
            }
          }
        }
      }
    }

    this.threatsMap[currentPosition.x][currentPosition.y][movePosition.x][movePosition.y] = threats;

    return threats;
  }

  getNearestPieceDistance(position: Position, oppositionColor: 'black' | 'white'): number {
    let distance = 8;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = this.state[i][j].piece;
        if (piece && piece.color === oppositionColor) {
          const nextDistance = Math.sqrt(
            Math.pow(Math.abs(i - position.x), 2) + Math.pow(Math.abs(j - position.y), 2),
          );
          distance = Math.min(distance, nextDistance);
        }
      }
    }
    return distance;
  }

  move({ currentPosition, movePosition }: Move) {
    this.state[movePosition.x][movePosition.y].piece =
      this.state[currentPosition.x][currentPosition.y].piece;
    this.state[currentPosition.x][currentPosition.y].piece = null;
    this.state = cloneDeep(this.state);
    this.isAITurn = !this.isAITurn;
    this.threatsMap = this.initThreatsMap();
    this.kingPosition = { white: undefined, black: undefined };
  }
}
