import { PieceId } from '../enums/piece-id.enum';
import { Position } from './position';

export interface MoveHistory {
  currentPosition: Position;
  movePosition: Position;
  currentPiece?: PieceId;
  movePiece?: PieceId;
}
