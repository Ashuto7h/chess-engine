import { Piece } from "../classes/piece";

export const SCORE_MAP: Record<Piece["type"], number> = {
  pawn: 20,
  knight: 30,
  bishop: 30,
  rook: 30,
  queen: 40,
  king: 50,
};
