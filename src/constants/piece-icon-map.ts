import { Piece } from '../classes/piece';

export const PIECE_ICON_MAP: Record<Piece['color'], Record<Piece['type'], string>> = {
  white: {
    pawn: '♙',
    knight: '♘',
    bishop: '♗',
    rook: '♖',
    queen: '♕',
    king: '♔',
  },
  black: {
    pawn: '♟︎',
    knight: '♞',
    bishop: '♝',
    rook: '♜',
    queen: '♛',
    king: '♚',
  },
};
