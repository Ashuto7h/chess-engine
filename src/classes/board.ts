import { openDB } from 'idb';
import { cloneDeep } from 'lodash';
import { INITIAL_PIECE_MAP } from '../constants/piece-map';
import { SCORE_MAP } from '../constants/score-card';
import { PieceId } from '../enums/piece-id.enum';
import { Move } from '../interfaces/move';
import { MoveHistory } from '../interfaces/move-history';
import { Position } from '../interfaces/position';
import { Bishop } from './bishop';
import { King } from './king';
import { Knight } from './knight';
import { Pawn } from './pawn';
import { Piece } from './piece';
import { Queen } from './queen';
import { Rook } from './rook';

export class Board {
  state: (Piece | null)[][];
  threatsMap: number[][][][];
  kingPosition: { white: Position | undefined; black: Position | undefined } = {
    white: undefined,
    black: undefined,
  };
  movesHistory: MoveHistory[] = [];

  constructor(state?: (Piece | null)[][], public isAITurn = false) {
    this.state = state ?? cloneDeep(INITIAL_PIECE_MAP);
    this.threatsMap = this.initThreatsMap();
    this.kingPosition = {
      white: this.getKingPosition('white'),
      black: this.getKingPosition('black'),
    };
  }

  public async initBoardState() {
    let cursor = await this.getMoveCursor('next');
    while (cursor) {
      const move = cursor.value as MoveHistory;
      this.state[move.movePosition.x][move.movePosition.y] =
        this.state[move.currentPosition.x][move.currentPosition.y];
      this.state[move.currentPosition.x][move.currentPosition.y] = null;
      cursor = await cursor.continue();
      console.log('inter');
      console.table(this.logState());
    }
    // this.state = cloneDeep(this.state);
    console.log('final', this.state);
  }

  getKingPosition(color: 'black' | 'white') {
    if (this.kingPosition[color]) {
      return this.kingPosition[color];
    }

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (this.state[i][j]?.type === 'king' && this.state[i][j]?.color === color) {
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
    const piece = newBoard.state[currentPosition.x][currentPosition.y];
    let threats = 0;
    if (!piece) {
      return threats;
    }
    newBoard.state[movePosition.x][movePosition.y] = piece;
    newBoard.state[currentPosition.x][currentPosition.y] = null;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const enemyPiece = newBoard.state[i][j];
        // check if it is enemyPiece
        if (enemyPiece && piece.color !== enemyPiece.color) {
          for (let k = 0; k < 8; k++) {
            for (let l = 0; l < 8; l++) {
              const ourPiece = newBoard.state[k][l];
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
        const piece = this.state[i][j];
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

  async newGame() {
    if (!('indexedDB' in window)) {
      console.error("This browser doesn't support IndexedDB");
      return;
    }
    await openDB('chess', Date.now(), {
      upgrade: (db) => {
        if (!db.objectStoreNames.contains('movesHistory')) {
          db.createObjectStore('movesHistory', { keyPath: 'id', autoIncrement: true });
        } else {
          db.deleteObjectStore('movesHistory');
          db.createObjectStore('movesHistory', { keyPath: 'id', autoIncrement: true });
        }
      },
    });

    console.table(this.logState());
    this.state = cloneDeep(INITIAL_PIECE_MAP);
    this.threatsMap = this.initThreatsMap();
    this.kingPosition = {
      white: undefined,
      black: undefined,
    };
    console.table(this.logState());
  }

  async move({ currentPosition, movePosition }: Move) {
    const currentPiece = this.state[currentPosition.x][currentPosition.y];
    const movePiece = this.state[movePosition.x][movePosition.y];
    await this.saveHistory({
      currentPosition,
      movePosition,
      currentPiece: currentPiece?.id,
      movePiece: movePiece?.id,
    });

    this.state[movePosition.x][movePosition.y] = currentPiece;
    this.state[currentPosition.x][currentPosition.y] = null;
    this.state = cloneDeep(this.state);
    this.isAITurn = !this.isAITurn;
    this.threatsMap = this.initThreatsMap();
    this.kingPosition = { white: undefined, black: undefined };
  }

  public isCheckOnMove(currentPosition: Position, movePosition: Position, board: Board) {
    const piece = board.state[currentPosition.x][currentPosition.y];
    if (piece) {
      const { x: kingX, y: kingY } =
        board.kingPosition[piece.color] ?? board.getKingPosition(piece.color) ?? {};
      if (kingX !== undefined && kingY !== undefined) {
        const king: King = board.state[kingX][kingY] as King;
        const updatedBoard = new Board(cloneDeep(board.state), board.isAITurn);
        updatedBoard.state[movePosition.x][movePosition.y] = piece;
        updatedBoard.state[currentPosition.x][currentPosition.y] = null;
        return king.isCheckInPosition(currentPosition, currentPosition, updatedBoard);
      }
    }
    return false;
  }

  public async undoLastMove() {
    const lastMoveCursor = await this.getMoveCursor('prev');
    if (lastMoveCursor) {
      const { movePosition, currentPosition, currentPiece, movePiece } = lastMoveCursor.value;
      this.state[currentPosition.x][currentPosition.y] = this.createPiece(currentPiece);
      this.state[movePosition.x][movePosition.y] = this.createPiece(movePiece);
      this.state = cloneDeep(this.state);
      this.isAITurn = !this.isAITurn;
      this.threatsMap = this.initThreatsMap();
      this.kingPosition = { white: undefined, black: undefined };
      await lastMoveCursor.delete();
    }
  }

  private createPiece(id: PieceId): Piece | null {
    switch (id) {
      case PieceId.BLACK_BISHOP_1:
        return new Bishop(PieceId.BLACK_BISHOP_1, 'black');
      case PieceId.BLACK_BISHOP_2:
        return new Bishop(PieceId.BLACK_BISHOP_2, 'black');
      case PieceId.WHITE_BISHOP_1:
        return new Bishop(PieceId.WHITE_BISHOP_1, 'white');
      case PieceId.WHITE_BISHOP_2:
        return new Bishop(PieceId.WHITE_BISHOP_2, 'white');
      case PieceId.BLACK_KNIGHT_1:
        return new Knight(PieceId.BLACK_KNIGHT_1, 'black');
      case PieceId.BLACK_KNIGHT_2:
        return new Knight(PieceId.BLACK_KNIGHT_2, 'black');
      case PieceId.WHITE_KNIGHT_1:
        return new Knight(PieceId.WHITE_KNIGHT_1, 'white');
      case PieceId.WHITE_KNIGHT_2:
        return new Knight(PieceId.WHITE_KNIGHT_2, 'white');
      case PieceId.BLACK_ROOK_1:
        return new Rook(PieceId.BLACK_ROOK_1, 'black');
      case PieceId.BLACK_ROOK_2:
        return new Rook(PieceId.BLACK_ROOK_2, 'black');
      case PieceId.WHITE_ROOK_1:
        return new Rook(PieceId.WHITE_ROOK_1, 'white');
      case PieceId.WHITE_ROOK_2:
        return new Rook(PieceId.WHITE_ROOK_2, 'white');
      case PieceId.BLACK_QUEEN:
        return new Queen(PieceId.BLACK_QUEEN, 'black');
      case PieceId.WHITE_QUEEN:
        return new Queen(PieceId.WHITE_QUEEN, 'white');
      case PieceId.BLACK_KING:
        return new King(PieceId.BLACK_KING, 'black');
      case PieceId.WHITE_KING:
        return new King(PieceId.WHITE_KING, 'white');
      case PieceId.BLACK_PAWN_1:
        return new Pawn(PieceId.BLACK_PAWN_1, 'black');
      case PieceId.BLACK_PAWN_2:
        return new Pawn(PieceId.BLACK_PAWN_2, 'black');
      case PieceId.BLACK_PAWN_3:
        return new Pawn(PieceId.BLACK_PAWN_3, 'black');
      case PieceId.BLACK_PAWN_4:
        return new Pawn(PieceId.BLACK_PAWN_4, 'black');
      case PieceId.BLACK_PAWN_5:
        return new Pawn(PieceId.BLACK_PAWN_5, 'black');
      case PieceId.BLACK_PAWN_6:
        return new Pawn(PieceId.BLACK_PAWN_6, 'black');
      case PieceId.BLACK_PAWN_7:
        return new Pawn(PieceId.BLACK_PAWN_7, 'black');
      case PieceId.BLACK_PAWN_8:
        return new Pawn(PieceId.BLACK_PAWN_8, 'black');
      case PieceId.WHITE_PAWN_1:
        return new Pawn(PieceId.WHITE_PAWN_1, 'white');
      case PieceId.WHITE_PAWN_2:
        return new Pawn(PieceId.WHITE_PAWN_2, 'white');
      case PieceId.WHITE_PAWN_3:
        return new Pawn(PieceId.WHITE_PAWN_3, 'white');
      case PieceId.WHITE_PAWN_4:
        return new Pawn(PieceId.WHITE_PAWN_4, 'white');
      case PieceId.WHITE_PAWN_5:
        return new Pawn(PieceId.WHITE_PAWN_5, 'white');
      case PieceId.WHITE_PAWN_6:
        return new Pawn(PieceId.WHITE_PAWN_6, 'white');
      case PieceId.WHITE_PAWN_7:
        return new Pawn(PieceId.WHITE_PAWN_7, 'white');
      case PieceId.WHITE_PAWN_8:
        return new Pawn(PieceId.WHITE_PAWN_8, 'white');
      default:
        return null;
    }
  }

  private async getDbTransaction() {
    if (!('indexedDB' in window)) {
      console.error("This browser doesn't support IndexedDB");
      return;
    }

    const db = await openDB('chess', undefined, {
      upgrade: (db) => {
        if (!db.objectStoreNames.contains('movesHistory')) {
          db.createObjectStore('movesHistory', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
    return db.transaction('movesHistory', 'readwrite');
  }

  private async saveHistory({ currentPosition, movePosition }: MoveHistory) {
    const piece = this.state[movePosition.x][movePosition.y]?.id;

    const transaction = await this.getDbTransaction();

    if (!transaction) {
      return;
    }

    await Promise.all([
      await transaction.store.add({ currentPosition, movePosition, piece }),
      transaction.done,
    ]);
  }

  private async getMoveCursor(direction: 'next' | 'prev') {
    const transaction = await this.getDbTransaction();

    if (!transaction) {
      return;
    }

    const cursor = await transaction.store.openCursor(null, direction);
    return cursor;
  }

  private initThreatsMap = () =>
    Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () =>
        Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => Infinity)),
      ),
    );

  logState = () => {
    return this.state.map((row) => row.map((item) => item?.id ?? '0'));
  };
}
