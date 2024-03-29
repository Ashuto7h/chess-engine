import { Rook } from '../classes/rook';
import { Piece } from '../classes/piece';
import { Bishop } from '../classes/bishop';
import { Knight } from '../classes/knight';
import { King } from '../classes/king';
import { Queen } from '../classes/queen';
import { Pawn } from '../classes/pawn';
import { PieceId } from '../enums/piece-id.enum';

export const INITIAL_PIECE_MAP: (null | Piece)[][] = [
  [
    new Rook(PieceId.BLACK_ROOK_1, 'black'),
    new Knight(PieceId.BLACK_KNIGHT_1, 'black'),
    new Bishop(PieceId.BLACK_BISHOP_1, 'black'),
    new Queen(PieceId.BLACK_QUEEN, 'black'),
    new King(PieceId.BLACK_KING, 'black'),
    new Bishop(PieceId.BLACK_BISHOP_2, 'black'),
    new Knight(PieceId.BLACK_KNIGHT_2, 'black'),
    new Rook(PieceId.BLACK_ROOK_2, 'black'),
  ],
  [
    new Pawn(PieceId.BLACK_PAWN_1, 'black'),
    new Pawn(PieceId.BLACK_PAWN_2, 'black'),
    new Pawn(PieceId.BLACK_PAWN_3, 'black'),
    new Pawn(PieceId.BLACK_PAWN_4, 'black'),
    new Pawn(PieceId.BLACK_PAWN_5, 'black'),
    new Pawn(PieceId.BLACK_PAWN_6, 'black'),
    new Pawn(PieceId.BLACK_PAWN_7, 'black'),
    new Pawn(PieceId.BLACK_PAWN_8, 'black'),
  ],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [
    new Pawn(PieceId.WHITE_PAWN_1, 'white'),
    new Pawn(PieceId.WHITE_PAWN_2, 'white'),
    new Pawn(PieceId.WHITE_PAWN_3, 'white'),
    new Pawn(PieceId.WHITE_PAWN_4, 'white'),
    new Pawn(PieceId.WHITE_PAWN_5, 'white'),
    new Pawn(PieceId.WHITE_PAWN_6, 'white'),
    new Pawn(PieceId.WHITE_PAWN_7, 'white'),
    new Pawn(PieceId.WHITE_PAWN_8, 'white'),
  ],
  [
    new Rook(PieceId.WHITE_ROOK_1, 'white'),
    new Knight(PieceId.WHITE_KNIGHT_1, 'white'),
    new Bishop(PieceId.WHITE_BISHOP_1, 'white'),
    new King(PieceId.WHITE_KING, 'white'),
    new Queen(PieceId.WHITE_QUEEN, 'white'),
    new Bishop(PieceId.WHITE_BISHOP_2, 'white'),
    new Knight(PieceId.WHITE_KNIGHT_2, 'white'),
    new Rook(PieceId.WHITE_ROOK_2, 'white'),
  ],
];
