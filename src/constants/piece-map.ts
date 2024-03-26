import { Rook } from '../classes/rook';
import { Piece } from '../classes/piece';
import { Bishop } from '../classes/bishop';
import { Knight } from '../classes/knight';
import { King } from '../classes/king';
import { Queen } from '../classes/queen';
import { Pawn } from '../classes/pawn';

export const INITIAL_PIECE_MAP: (null | Piece)[][] = [
  [
    new Rook('black_rook_1', 'black'),
    new Knight('black_knight_1', 'black'),
    new Bishop('black_bishop_1', 'black'),
    new Queen('black_queen', 'black'),
    new King('black_king', 'black'),
    new Bishop('black_bishop_2', 'black'),
    new Knight('black_knight_2', 'black'),
    new Rook('black_rook_2', 'black'),
  ],
  [
    new Pawn('black_pawn_1', 'black'),
    new Pawn('black_pawn_2', 'black'),
    new Pawn('black_pawn_3', 'black'),
    new Pawn('black_pawn_4', 'black'),
    new Pawn('black_pawn_5', 'black'),
    new Pawn('black_pawn_6', 'black'),
    new Pawn('black_pawn_7', 'black'),
    new Pawn('black_pawn_8', 'black'),
  ],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [
    new Pawn('white_pawn_1', 'white'),
    new Pawn('white_pawn_2', 'white'),
    new Pawn('white_pawn_3', 'white'),
    new Pawn('white_pawn_4', 'white'),
    new Pawn('white_pawn_5', 'white'),
    new Pawn('white_pawn_6', 'white'),
    new Pawn('white_pawn_7', 'white'),
    new Pawn('white_pawn_8', 'white'),
  ],
  [
    new Rook('white_rook_1', 'white'),
    new Knight('white_knight_1', 'white'),
    new Bishop('white_bishop_1', 'white'),
    new King('white_king', 'white'),
    new Queen('white_queen', 'white'),
    new Bishop('white_bishop_2', 'white'),
    new Knight('white_knight_2', 'white'),
    new Rook('white_rook_2', 'white'),
  ],
];
